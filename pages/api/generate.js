import { getClient } from "../../lib/clients";

const CAPTION_TYPES = [
  ["Educational tip", "Educational tip", "Educational tip", "Educational tip", "Educational tip"],
  ["Educational tip", "Educational tip", "Educational tip", "Thought leadership", "Thought leadership"],
  ["Thought leadership", "Thought leadership", "Thought leadership", "Thought leadership", "AI and automation"],
  ["AI and automation", "AI and automation", "AI and automation", "AI and automation", "San Diego local"],
  ["San Diego local", "San Diego local", "610 services", "610 services", "610 services"],
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { primaryTopic, secondaryTopic, contentNotes, month, batch, clientId } = req.body;

  if (!primaryTopic) return res.status(400).json({ error: "Primary topic is required" });
  if (batch === undefined || batch === null) return res.status(400).json({ error: "Batch number is required" });

  const client = getClient(clientId || "610-marketing");
  if (!client) return res.status(400).json({ error: "Invalid client" });

  const context = `Month: ${month}
Primary Topic: ${primaryTopic}
Secondary Topic: ${secondaryTopic || "None"}
Special Instructions: ${contentNotes || "None"}`;

  let prompt = "";

  if (batch >= 0 && batch <= 4) {
    const batchTypes = CAPTION_TYPES[batch];
    const startNum = batch * 5 + 1;

    prompt = `${client.brandVoice}

${context}

Generate exactly 5 social media captions for Facebook and LinkedIn. Return ONLY a valid JSON array with no other text before or after it.

The captions must use these content types in this exact order:
${batchTypes.map((t, i) => `Caption ${startNum + i}: type "${t}"`).join("\n")}

Return this exact JSON structure:
[
  { "number": ${startNum}, "type": "${batchTypes[0]}", "text": "caption text here" },
  { "number": ${startNum + 1}, "type": "${batchTypes[1]}", "text": "caption text here" },
  { "number": ${startNum + 2}, "type": "${batchTypes[2]}", "text": "caption text here" },
  { "number": ${startNum + 3}, "type": "${batchTypes[3]}", "text": "caption text here" },
  { "number": ${startNum + 4}, "type": "${batchTypes[4]}", "text": "caption text here" }
]

Rules for each caption:
- 2 to 5 sentences
- End with a question or conversation prompt
- Plain text only, no markdown, no asterisks
- Write in the client brand voice
- Make it relevant to: ${primaryTopic}

Return only the JSON array. Nothing else.`;

  } else if (batch === 5) {
    prompt = `${client.brandVoice}

${context}

Generate exactly 4 blog outlines for a small business owner audience. Return ONLY a valid JSON array with no other text before or after it.

Return this exact JSON structure:
[
  {
    "number": 1,
    "title": "Working title here",
    "summary": "One paragraph summary of the post angle and why it matters to the reader",
    "sections": [
      { "header": "Section header", "description": "Two sentence description of what this section covers" }
    ]
  }
]

Rules:
- Each blog must have exactly 6 sections
- Titles should be specific and compelling for small business owners
- Summaries should be one solid paragraph
- Plain text only, no markdown, no asterisks
- Topics should relate to: ${primaryTopic} and ${secondaryTopic || primaryTopic}

Return only the JSON array. Nothing else.`;

  } else {
    return res.status(400).json({ error: "Invalid batch number. Must be 0 to 5." });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return res.status(500).json({ error: `API error ${response.status}`, details: errText });
    }

    const data = await response.json();
    let raw = data.content?.[0]?.text || "";
    raw = raw.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message, "Raw:", raw.substring(0, 300));
      return res.status(500).json({ error: "Failed to parse response. Please try again." });
    }

    const clean = (text) => (text || "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#{1,6}\s/gm, "").trim();

    if (batch <= 4) {
      const captions = parsed.map(c => ({ ...c, text: clean(c.text) }));
      return res.status(200).json({ success: true, batch, type: "captions", captions });
    } else {
      const blogs = parsed.map(b => ({
        ...b,
        title: clean(b.title),
        summary: clean(b.summary),
        sections: (b.sections || []).map(s => ({
          header: clean(s.header),
          description: clean(s.description),
        })),
      }));
      return res.status(200).json({ success: true, batch, type: "blogs", blogs });
    }

  } catch (error) {
    console.error("Generation error:", error);
    return res.status(500).json({ error: "Generation failed", details: error.message });
  }
}
