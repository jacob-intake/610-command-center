export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { images } = req.body;
  if (!images || images.length === 0) return res.status(400).json({ error: "No images provided" });

  try {
    const imageMessages = images.map(dataUrl => ({
      type: "image",
      source: {
        type: "base64",
        media_type: dataUrl.split(";")[0].split(":")[1],
        data: dataUrl.split(",")[1],
      },
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: [
            ...imageMessages,
            {
              type: "text",
              text: "Analyze these reference images for a social media content brief. In 2-3 sentences describe the visual aesthetic, color palette, mood, composition style, and what kind of photography or content would match this look. Be specific and actionable for a content creator generating social media images.",
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    const analysis = data.content?.[0]?.text?.trim() || "";
    return res.status(200).json({ success: true, analysis });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
