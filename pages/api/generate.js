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
- Blogs: substantive, practical, specific. Headers, short paragraphs, clear takeaway at the end.
- Every piece should feel like only 610 could have written it. Generic is the enemy.
`;

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

Generate the following content. Use the 610 brand voice throughout. Everything should feel specific, credible, and worth reading.

---

SECTION 1: SOCIAL MEDIA CAPTIONS

Write 25 social media captions suitable for Facebook and LinkedIn. Mix the following content types across the 25 posts:
- Educational tips (8 posts): practical advice the reader can use immediately
- Thought leadership and opinion (6 posts): 610's point of view on industry trends
- AI and workflow automation insights (5 posts): practical AI for small business
- Local San Diego business angle (3 posts): local community and market relevance
- Promotional posts about 610 services (3 posts): specific, credible, never salesy

Each caption must be 2 to 5 sentences. End each one with a question or conversation prompt. Number each caption 1 through 25. Label each one with its content type in brackets before the caption.

---

SECTION 2: BLOG OUTLINES

Write 4 detailed blog outlines. Each blog should be built around the primary or secondary topic and written for a small business owner audience.

For each blog provide:
- Working title
- One paragraph summary of the post angle and why it matters to the reader
- 6 to 8 section headers, each with a two sentence description of what that section covers

Label these Blog 1 through Blog 4.

---

Format everything cleanly. Section 1 captions first, Section 2 blog outlines second. Use the numbering and labels described above.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].text;

    // Split captions and blogs
    const section1Match = content.indexOf("SECTION 1:");
    const section2Match = content.indexOf("SECTION 2:");

    let captions = "";
    let blogs = "";

    if (section1Match !== -1 && section2Match !== -1) {
      captions = content.substring(section1Match, section2Match).trim();
      blogs = content.substring(section2Match).trim();
    } else {
      captions = content;
      blogs = "";
    }

    return res.status(200).json({
      success: true,
      captions,
      blogs,
      fullContent: content,
      month,
      primaryTopic,
      secondaryTopic,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generation error:", error);
    return res.status(500).json({
      error: "Content generation failed",
      details: error.message,
    });
  }
}
