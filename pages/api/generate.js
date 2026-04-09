import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BRAND_VOICE = `
You are the content generation engine for 610 Marketing and PR, a boutique digital marketing and AI implementation agency based in San Diego, California.

ABOUT 610:
610 Marketing and PR works with small to mid-size businesses that need real marketing expertise without the overhead of a large agency. Core services include web design, SEO, AEO (Answer Engine Optimization), social media management, PR, and AI agent design and business workflow automation.

What makes 610 distinct is that we do not separate marketing from operations. We help businesses grow their audience and we help them run smarter.

VOICE AND TONE:
- Confident but not arrogant. We know what we are talking about and we do not oversell it.
- Plain spoken, active voice, short sentences. No corporate filler. No buzzwords.
- We have a point of view and we share it without unnecessary hedging.
- Approachable and direct. Like a smart industry friend giving real advice, not a pitch deck.
- Light humor is welcome when it fits naturally. Forced humor never appears.
- We respect the reader's intelligence and their time.

AUDIENCE:
Small business owners who are busy and skeptical of agencies after getting burned before. Local service businesses, law firms, medical practices, contractors, restaurants, and professional services. They want results they can see and explanations they can understand.

CONTENT PILLARS:
1. Digital marketing education: SEO, AEO, social media strategy, web design tips written for business owners
2. AI and automation for business: practical workflow examples, real outcomes, plain English
3. Industry news translated: Google updates, AI search changes, platform shifts explained simply
4. Results and social proof: client outcomes, wins we can share
5. Local San Diego business community content
6. Thought leadership on where search and AI are heading

LANGUAGE WE USE:
- Plain direct sentences that say exactly what they mean
- Active voice throughout
- Specific over vague in every instance
- Short paragraphs especially on social

LANGUAGE WE NEVER USE:
- Game-changer, synergy, holistic, seamless, leverage as a verb
- Cutting-edge without substance behind it
- Comprehensive solutions or full-service anything
- Exclamation points more than once per piece
- Anything that sounds like a press release template

FORMAT RULES:
- Social posts: 2 to 5 sentences. End with a question or conversation prompt.
- Every piece should feel like only 610 could have written it. Generic is the enemy.
- Return clean plain text only. No asterisks, no markdown, no pound signs, no bold formatting of any kind.
`;

function cleanText(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#{1,6}\s/gm, "")
    .replace(/^-{3,}$/gm, "")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { primaryTopic, secondaryTopic, contentNotes, month } = req.body;

  if (!primaryTopic) {
    return res.status(400).json({ error: "Primary topic is required" });
  }

  const prompt = `${BRAND_VOICE}

This month's content focus:
Month: ${month}
Primary Topic: ${primaryTopic}
Secondary Topic: ${secondaryTopic || "None"}
Special Instructions: ${contentNotes || "None"}

Generate the following content in strict JSON format. Return ONLY valid JSON with no other text before or after it.

{
  "captions": [
    {
      "number": 1,
      "type": "Educational tip",
      "text": "caption text here"
    }
  ],
  "blogs": [
    {
      "number": 1,
      "title": "Working title here",
      "summary": "One paragraph summary here",
      "sections": [
        {
          "header": "Section header",
          "description": "Two sentence description of what this section covers"
        }
      ]
    }
  ]
}

CAPTIONS REQUIREMENTS:
Generate exactly 25 captions with this mix:
- Educational tips: 8 posts (type: "Educational tip")
- Thought leadership: 6 posts (type: "Thought leadership")
- AI and workflow automation: 5 posts (type: "AI and automation")
- Local San Diego angle: 3 posts (type: "San Diego local")
- Promotional: 3 posts (type: "610 services")

Each caption: 2 to 5 sentences. End with a question or conversation prompt. Plain text only, no markdown.

BLOG REQUIREMENTS:
Generate exactly 4 blog outlines. Each blog must have 6 to 8 sections.
Plain text only in all fields, no markdown, no asterisks.

Return only the JSON object. Nothing else.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
    });

    let raw = message.content[0].text.trim();
    raw = raw.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Failed to parse content. Please try again.", raw });
    }

    const captions = (parsed.captions || []).map(c => ({
      ...c,
      text: cleanText(c.text || ""),
    }));

    const blogs = (parsed.blogs || []).map(b => ({
      ...b,
      title: cleanText(b.title || ""),
      summary: cleanText(b.summary || ""),
      sections: (b.sections || []).map(s => ({
        header: cleanText(s.header || ""),
        description: cleanText(s.description || ""),
      })),
    }));

    return res.status(200).json({
      success: true,
      captions,
      blogs,
      month,
      primaryTopic,
      secondaryTopic,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generation error:", error);
    return res.status(500).json({ error: "Content generation failed", details: error.message });
  }
}
