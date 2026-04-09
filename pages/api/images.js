import { getClient } from "../../lib/clients";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { caption, primaryTopic, clientId } = req.body;

  if (!caption) return res.status(400).json({ error: "Caption is required" });

  const client = getClient(clientId || "610-marketing");
  if (!client) return res.status(400).json({ error: "Invalid client" });

  const typeSubjects = {
    "Educational tip": `a business professional studying analytics on a laptop in a modern office, clean workspace`,
    "Thought leadership": `a confident business person presenting to a small group in a sleek modern conference room`,
    "AI and automation": `abstract visualization of connected digital workflows, glowing data streams on dark background, no text`,
    "San Diego local": `San Diego cityscape or waterfront at golden hour, professional and vibrant`,
    "610 services": `a marketing team collaborating around a bright monitor showing campaign results`,
  };

  const subject = typeSubjects[caption.type] || "professional business setting, modern office environment";
  const prompt = `${client.imageStyle} Subject: ${subject}. The image relates to the topic: ${primaryTopic}. Square format. No text. No words. No logos. No watermarks. Professional quality photography only.`;

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      }),
    });

    const data = await response.json();

    if (data.data && data.data[0]) {
      return res.status(200).json({ success: true, imageUrl: data.data[0].url, number: caption.number });
    } else {
      return res.status(200).json({ success: false, error: data.error?.message || "No image returned", number: caption.number });
    }
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message, number: caption.number });
  }
}
