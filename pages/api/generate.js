import { getClient } from "../../lib/clients";

const CAPTION_TYPES = [
  // Batch 0 (posts 1-5)
  [
    { type: "Educational tip",   carousel: false },
    { type: "Educational tip",   carousel: true  },
    { type: "Educational tip",   carousel: false },
    { type: "Thought leadership", carousel: false },
    { type: "Thought leadership", carousel: false },
  ],
  // Batch 1 (posts 6-10)
  [
    { type: "Explanatory",       carousel: true  },
    { type: "Educational tip",   carousel: false },
    { type: "Thought leadership", carousel: false },
    { type: "Thought leadership", carousel: false },
    { type: "AI and automation", carousel: false },
  ],
  // Batch 2 (posts 11-15)
  [
    { type: "AI and automation", carousel: false },
    { type: "AI and automation", carousel: false },
    { type: "Explanatory",       carousel: true  },
    { type: "Thought leadership", carousel: false },
    { type: "AI and automation", carousel: false },
  ],
  // Batch 3 (posts 16-20)
  [
    { type: "Educational tip",   carousel: true  },
    { type: "Local",             carousel: false },
    { type: "Local",             carousel: false },
    { type: "Explanatory",       carousel: false },
    { type: "610 services",      carousel: false },
  ],
  // Batch 4 (posts 21-25)
  [
    { type: "610 services",      carousel: false },
    { type: "610 services",      carousel: false },
    { type: "Local",             carousel: false },
    { type: "Explanatory",       carousel: true  },
    { type: "Educational tip",   carousel: false },
  ],
];

const HASHTAG_SETS = {
  "Educational tip": "#digitalmarketing #smallbusiness #marketingtips #AItools #businessgrowth",
  "Thought leadership": "#digitalmarketing #AIstrategy #businessleadership #futureofbusiness #610marketing",
  "AI and automation": "#AIautomation #artificialintelligence #AIbusiness #businessautomation #610marketing",
  "610 services": "#610marketing #digitalmarketing #AIagency #SEO #marketingagency",
  "Explanatory": "#digitalmarketing #educationalcontent #businesstips #AItools #610marketing",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { primaryTopic, secondaryTopic, contentNotes, month, batch, clientId, serviceLocation } = req.body;

  if (!primaryTopic) return res.status(400).json({ error: "Primary topic is required" });
  if (batch === undefined || batch === null) return res.status(400).json({ error: "Batch number is required" });

  const client = getClient(clientId || "610-marketing");
  if (!client) return res.status(400).json({ error: "Invalid client" });

  const locationLabel = serviceLocation && serviceLocation !== "National" ? serviceLocation : null;
  const city = locationLabel ? locationLabel.split(",")[0].trim() : "San Diego";
  const localPostType = city + " local";
  const localHashtags = "#" + city.replace(/ /g, "") + " #" + city.replace(/ /g, "") + "Business #localSEO #digitalmarketing #610marketing";

  const context = `Month: ${month}
Primary Topic: ${primaryTopic}
Secondary Topic: ${secondaryTopic || "None"}
Service Location: ${serviceLocation || "San Diego, CA"}
Special Instructions: ${contentNotes || "None"}`;

  let prompt = "";

  if (batch >= 0 && batch <= 4) {
    const batchDefs = CAPTION_TYPES[batch].map(def =>
      def.type === "Local" ? { ...def, type: localPostType } : def
    );
    const startNum = batch * 5 + 1;

    const captionInstructions = batchDefs.map((def, i) => {
      const num = startNum + i;
      const hashtags = def.type === localPostType ? localHashtags : (HASHTAG_SETS[def.type] || HASHTAG_SETS["Educational tip"]);

      if (def.carousel) {
        return `Caption ${num}: type "${def.type}" - CAROUSEL FORMAT
  - Write a hook caption that teases 4 slides of content without giving it all away
  - Example hook style: "3 things most businesses get wrong about [topic]. Swipe to see if you are making these mistakes."
  - 1-3 sentences maximum for the main caption text
  - End with "Swipe to see all [X]" or similar swipe prompt
  - Then on a new line add exactly 3 dots on separate lines then the hashtags
  - isCarousel: true
  - Also write 4 slide texts (slide_1 through slide_4):
    * slide_1: Hook or title slide - bold statement or question (1 sentence)
    * slide_2: First key point or insight (2-3 sentences)
    * slide_3: Second key point or insight (2-3 sentences)
    * slide_4: Takeaway or CTA - what to do next (2-3 sentences)
  - Hashtags to append: ${hashtags}`;
      } else {
        return `Caption ${num}: type "${def.type}"
  - 2 to 5 sentences
  - End with a question or conversation prompt
  - Then on a new line add exactly 3 dots on separate lines then the hashtags
  - Hashtags to append: ${hashtags}`;
      }
    }).join("\n\n");

    prompt = `${client.brandVoice}

${context}

Generate exactly 5 social media captions for Facebook and LinkedIn. Return ONLY a valid JSON array with no other text before or after it.

${captionInstructions}

Return this exact JSON structure (include slide_1 through slide_4 only for carousel posts):
[
  {
    "number": ${startNum},
    "type": "${batchDefs[0].type}",
    "isCarousel": ${batchDefs[0].carousel},
    "text": "caption text here\\n.\\n.\\n.\\n#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5",
    "slide_1": "slide text (carousel only)",
    "slide_2": "slide text (carousel only)",
    "slide_3": "slide text (carousel only)",
    "slide_4": "slide text (carousel only)"
  }
]

Rules:
- Plain text only, no markdown, no asterisks
- Write in the client brand voice
- Make it relevant to: ${primaryTopic}
- Location context: ${serviceLocation || "San Diego, CA"} - reference this city naturally when appropriate
- Every caption must end with the 3 dots on separate lines then hashtags
- Carousel captions must include all 4 slide texts
- Non-carousel posts: omit slide fields entirely
- No two captions in this batch should use the same opening word or same visual concept
- Each caption must feel distinct from the others

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
        max_tokens: 5000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `API error ${response.status}`, details: errText });
    }

    const data = await response.json();
    let raw = data.content?.[0]?.text || "";
    raw = raw.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    if (jsonStart !== -1 && jsonEnd !== -1) raw = raw.substring(jsonStart, jsonEnd + 1);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Failed to parse response. Please try again." });
    }

    const clean = (text) => (text || "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#{1,6}\s/gm, "").trim();

    if (batch <= 4) {
      const captions = parsed.map(c => ({
        number: c.number,
        type: c.type,
        isCarousel: c.isCarousel || false,
        text: clean(c.text),
        ...(c.isCarousel && {
          slide_1: clean(c.slide_1),
          slide_2: clean(c.slide_2),
          slide_3: clean(c.slide_3),
          slide_4: clean(c.slide_4),
        }),
      }));
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
    return res.status(500).json({ error: "Generation failed", details: error.message });
  }
}
