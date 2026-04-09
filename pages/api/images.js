export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { captions, primaryTopic, secondaryTopic } = req.body;

  if (!captions || !Array.isArray(captions)) {
    return res.status(400).json({ error: "Captions array is required" });
  }

  const typeStyles = {
    "Educational tip": "clean infographic style, professional business illustration, minimal design, navy blue and white palette",
    "Thought leadership": "bold editorial style, modern professional photography aesthetic, dark dramatic tones",
    "AI and automation": "futuristic tech illustration, clean circuit and flow diagram aesthetic, blue and silver tones",
    "San Diego local": "bright California coastal photography style, warm sunlight, San Diego skyline or beach aesthetic",
    "610 services": "professional marketing agency aesthetic, bold typography focused, clean modern brand design",
  };

  const results = [];

  for (const caption of captions) {
    const styleGuide = typeStyles[caption.type] || "professional business photography, clean modern aesthetic";
    const prompt = `Social media post image for a digital marketing agency. Topic: ${primaryTopic}. Content type: ${caption.type}. Style: ${styleGuide}. The image should work as a square social media graphic. No text overlays. Professional, modern, and on-brand for a marketing agency serving small businesses in San Diego. High quality.`;

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
        results.push({ number: caption.number, imageUrl: data.data[0].url, success: true });
      } else {
        results.push({ number: caption.number, imageUrl: null, success: false, error: data.error?.message });
      }
    } catch (err) {
      results.push({ number: caption.number, imageUrl: null, success: false, error: err.message });
    }
  }

  return res.status(200).json({ success: true, images: results });
}
