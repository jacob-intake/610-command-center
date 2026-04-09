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

  const prompt = `${client.brandVoice}

You are writing a complete 2000 word blog post for ${client.name} based on the following outline. Write the full post, not a summary or shortened version. Exactly 2000 words.

OUTLINE:
${outlineText}

WRITING RULES:
- Write in the brand voice described above
- No markdown formatting, no asterisks, no pound signs
- Use clear section headers followed by a colon
- Each section should be 2 to 4 paragraphs
- Short paragraphs, plain language, active voice
- Practical and specific. Every section should give the reader something useful
- End with a clear takeaway or call to action
- Do not pad with fluff. Every sentence should earn its place
- Target audience: small business owners who are skeptical and time-pressed
- Total length: approximately 2000 words

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
            content: `You are a professional content writer for ${client.name}. Write in their brand voice: confident, direct, plain spoken, no corporate buzzwords. Write for small business owners.`,
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
    const content = data.choices?.[0]?.message?.content || "";
    const clean = content.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#{1,6}\s/gm, "").trim();

    return res.status(200).json({ success: true, content: clean, title: blog.title });

  } catch (error) {
    console.error("Blog generation error:", error);
    return res.status(500).json({ error: "Blog generation failed", details: error.message });
  }
}
