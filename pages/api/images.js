import { getClient } from "../../lib/clients";

const TYPE_STYLES = {
  "Educational tip": "warm professional office environment, approachable and informative mood, shallow depth of field, natural window light",
  "Thought leadership": "cinematic dramatic lighting, strong shadows, authoritative composition, editorial magazine style",
  "AI and automation": "modern tech workspace, cool blue ambient light, clean minimal surfaces, futuristic but grounded",
  "Explanatory": "clean bright workspace, clear educational mood, organized and professional, good natural light",
  "610 services": "collaborative agency environment, results-driven energy, modern professional setting",
};

const TYPE_SUBJECTS = {
  "Educational tip": ["business professional reviewing work at a clean desk", "person in focused concentration with laptop and coffee", "two colleagues in a candid discussion over documents", "hands writing notes in a leather journal on a dark desk", "professional standing confidently by large windows with city view"],
  "Thought leadership": ["confident executive in deep thought by floor-to-ceiling windows at dusk", "lone professional silhouetted against glowing city skyline", "close portrait of a silver-haired business leader looking off camera", "person standing at a whiteboard with clean diagrams, sleeves rolled up", "aerial view of a single person at a large minimalist conference table"],
  "AI and automation": ["close macro shot of hands on a modern keyboard with soft blue screen glow", "clean desk setup with multiple monitors showing data visualizations", "person reviewing tablet analytics in a dark modern office", "empty server room corridor with cool blue lighting", "graphic designer studying a large monitor in a dim creative studio"],
  "Explanatory": ["overhead flat lay of organized workspace with notebook pen and laptop", "person pointing to a clean diagram on a glass whiteboard", "close up of an open notebook with structured notes and a coffee mug", "two professionals looking at a tablet screen together in bright office", "clean product shot of laptop on concrete surface with soft light"],
  "610 services": ["marketing team in casual discussion around a bright conference table", "person presenting confidently to a small engaged group", "close up of hands exchanging business cards in professional setting", "creative agency office with plants exposed brick and natural light", "professional shaking hands outside a modern glass office building"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { caption, primaryTopic, clientId, forceNew, inspirationContext, serviceLocation } = req.body;
  if (!caption) return res.status(400).json({ error: "Caption is required" });

  const client = getClient(clientId || "610-marketing");
  if (!client) return res.status(400).json({ error: "Invalid client" });

  const captionType = caption.type || "Educational tip";
  const style = TYPE_STYLES[captionType] || TYPE_STYLES["Educational tip"];
  const subjects = TYPE_SUBJECTS[captionType] || TYPE_SUBJECTS["Educational tip"];

  // Pick subject based on caption number with forceNew randomization
  const baseIndex = (caption.number - 1) % subjects.length;
  const subjectIndex = forceNew
    ? Math.floor(Math.random() * subjects.length)
    : baseIndex;
  const subject = subjects[subjectIndex];

  // Build location context
  const city = serviceLocation && serviceLocation !== "National"
    ? serviceLocation.split(",")[0].trim()
    : null;
  const locationContext = city && captionType.toLowerCase().includes("local")
    ? `Set in ${city}. Include subtle ${city} visual references if natural.`
    : "";

  // Build inspiration context
  let inspirationDirective = "";
  if (inspirationContext && inspirationContext.trim()) {
    const lines = inspirationContext.trim().split("\n").filter(l => l.trim());
    const relevant = lines.filter(l =>
      l.includes("Energy:") || l.includes("Visual Style:") || l.includes("Color Mood:")
    ).join(". ");
    if (relevant) inspirationDirective = `Creative direction: ${relevant}.`;
  }

  const prompt = `Commercial editorial photography. ${subject}. ${style}. ${locationContext} ${inspirationDirective}

Topic context: ${primaryTopic}.

Technical requirements:
- Shot on Sony A7R IV, 50mm f/1.4, shallow depth of field
- Professional commercial photographer quality
- High dynamic range, sharp subject, creamy bokeh background  
- Square 1:1 composition for social media
- NO text, words, signs, logos, watermarks, or readable content anywhere in the image
- NOT a stock photo cliche, NOT generic business imagery
- Must look like a real photograph, not AI generated`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "high",
        output_format: "url",
      }),
    });

    const data = await response.json();

    if (data.data?.[0]?.url) {
      return res.status(200).json({
        success: true,
        imageUrl: data.data[0].url,
        number: caption.number,
      });
    } else {
      return res.status(200).json({
        success: false,
        error: data.error?.message || "No image returned",
        number: caption.number,
      });
    }
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message, number: caption.number });
  }
}
