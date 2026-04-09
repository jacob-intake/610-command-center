import { getClient } from "../../lib/clients";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { blog, primaryTopic, clientId } = req.body;
  if (!blog) return res.status(400).json({ error: "Blog outline is required" });

  const client = getClient(clientId || "610-marketing");
  if (!client) return res.status(400).json({ error: "Invalid client" });

  const outlineText = `Title: ${blog.title}

Summary: ${blog.summary}

Sections:
${(blog.sections || []).map((s, i) => `${i + 1}. ${s.header}: ${s.description}`).join("\n")}`;

  const closingParagraph = `About 610 Marketing and PR:

610 Marketing and PR is a boutique digital marketing and AI implementation agency based in San Diego, California. We help small and mid-size businesses grow their audience, rank higher in search and AI-powered results, and run smarter with custom AI agents and workflow automation. Our services include SEO, AEO, GEO, web design, social media management, PR, and AI workflow design. If you are ready to get more from your marketing and your operations, we would love to talk. Reach out to us at info@610marketing.com.`;

  const prompt = `${client.brandVoice}

You are writing a complete 2000 word blog post for ${client.name} based on the following outline. Write the full post, not a summary or shortened version.

OUTLINE:
${outlineText}

WRITING RULES:
- Write in the brand voice described above
- No markdown formatting, no asterisks, no pound signs
- No emojis anywhere in the post, not a single one
- Use clear section headers followed by a colon on their own line
- Each section should be 2 to 4 paragraphs
- Short paragraphs, plain language, active voice
- Practical and specific. Every section should give the reader something useful
- Do not pad with fluff. Every sentence should earn its place
- Target audience: small business owners who are skeptical and time-pressed
- Total length: approximately 2000 words not including the closing paragraph

SEO AND SEARCH OPTIMIZATION:
- Naturally weave in relevant keyword phrases throughout the post without forcing them
- Include a mix of: primary keywords directly related to the topic, long-tail keyword phrases that match how small business owners search, AEO-focused phrases structured as questions and direct answers, GEO phrases that reference local search and location-based discovery
- Keywords should feel like natural language, never stuffed or awkward
- Structure at least two sections so the opening sentence directly answers a question a reader might search for
- Use the blog title keyword phrase at least twice in the body naturally

Do not add a closing section. End the post after the final section content. I will append the closing paragraph separately.

Write the complete blog post now.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 4000,
        messages: [
          {
            role: "system",
            content: `You are a professional SEO content writer for ${client.name}. Write in their brand voice: confident, direct, plain spoken, no corporate buzzwords, no emojis. Write for small business owners. Always optimize naturally for SEO, AEO, and GEO without keyword stuffing.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);
      return res.status(500).json({ error: `OpenAI API error ${response.status}`, details: errText });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";
    const cleaned = rawContent
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^#{1,6}\s/gm, "")
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .trim();

    const fullContent = `${cleaned}\n\n---\n\n${closingParagraph}`;

    return res.status(200).json({ success: true, content: fullContent, title: blog.title });

  } catch (error) {
    console.error("Blog generation error:", error);
    return res.status(500).json({ error: "Blog generation failed", details: error.message });
  }
}
