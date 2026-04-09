export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { caption, primaryTopic } = req.body;

  if (!caption) {
    return res.status(400).json({ error: "Caption is required" });
  }

  const typeStyles = {
    "Educational tip":    "clean professional business illustration, minimal design, navy blue and white palette, modern infographic style",
    "Thought leadership": "bold editorial photography style, dark dramatic professional tones, modern business aesthetic",
    "AI and automation":  "futuristic technology illustration, clean circuit and data flow aesthetic, blue and silver tones, professional",
    "San Diego local":    "bright California coastal photography style, warm golden sunlight, San Diego skyline or waterfront, vibrant",
    "610 services":       "professional marketing agency aesthetic, bold clean modern brand design, confident business imagery",
  };

  const styleGuide = typeStyles[caption.type] || "professional business photography, clean modern aesthetic";

  const prompt = `Social media post image for a boutique digital marketing agency called 610 Marketing. Topic: ${primaryTopic}. Content type: ${caption.type}. Visual style: ${styleGuide}. Square format social media graphic. No text overlays. No words in the image. Professional, modern, clean. High quality photography or illustration.`;

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
