import { getClient } from "../../lib/clients";

const TYPE_MOODS = {
  "Educational tip": "approachable and informative. Warm, professional light. The scene should feel like learning something useful.",
  "Thought leadership": "authoritative and cinematic. Strong directional light, deep shadows. Confident and forward-thinking.",
  "AI and automation": "modern and precise. Cool blue tones, clean lines, technology present but not overwhelming. Futuristic but grounded.",
  "San Diego local": "warm California sunshine, coastal or urban San Diego energy. Vibrant and local.",
  "610 services": "collaborative and results-driven. Professional but approachable. Marketing agency energy.",
  "Explanatory": "clear and educational. Clean composition, good light. Feels like a tutorial or explainer.",
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
  let typeMood = TYPE_MOODS[captionType] || "professional business photography, clean and modern.";
  // Override local post mood with actual selected location
  if (captionType.includes("local") || captionType === "San Diego local") {
    const city = (serviceLocation || "San Diego, CA").split(",")[0];
    typeMood = `warm ${city} city energy. Local ${city} landmarks, streets, or authentic local settings. Vibrant and community-focused.`;
  }

  // Parse inspiration settings if provided
  let inspirationDirective = "";
  if (inspirationContext && inspirationContext.trim()) {
    inspirationDirective = `\n\nCREATIVE DIRECTION FROM CLIENT:\n${inspirationContext.trim()}`;
  }

  // Step 1: Ask Claude to generate a unique visual concept for this specific caption
  const conceptPrompt = `You are a creative director briefing a commercial photographer for a social media post.

The post caption is: "${caption.text.substring(0, 200)}"
Post type: ${caption.type}
Monthly topic: ${primaryTopic}
Service location: ${serviceLocation || "San Diego, CA"}
Post number in batch: ${caption.number}
Mood required: ${typeMood}${inspirationDirective}

Generate ONE specific, unique photographic scene for this post. It must be completely different from a generic business stock photo.

Rules:
- Be hyper-specific. Name the exact subject, setting, lighting, angle, and mood.
- The scene must directly relate to the caption topic: "${primaryTopic}"
- No office clichés unless truly relevant and described with specificity
- No people pointing at screens, no generic handshakes, no generic laptops
- Think like a high-end editorial photographer choosing a scene
- The scene must feel fresh and distinct from posts ${Math.max(1, caption.number - 3)} through ${caption.number - 1} in this batch
- ${forceNew ? "Make this COMPLETELY different from any typical business photo. Be unexpected." : ""}

Return ONLY a single sentence describing the exact photographic scene. Nothing else. No preamble.`;

  try {
    const conceptRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 150,
        messages: [{ role: "user", content: conceptPrompt }],
      }),
    });

    const conceptData = await conceptRes.json();
    const visualConcept = conceptData.content?.[0]?.text?.trim() || `A professional business scene related to ${primaryTopic}`;

    // Step 2: Build the DALL-E prompt from the dynamic concept
    const dallePrompt = `Commercial editorial photography. ${visualConcept}

Technical specs: Sony A7R IV, 50mm f/1.4 lens, shallow depth of field, professional lighting. ${typeMood}

Critical requirements:
- Must look exactly like a real photograph taken by a professional commercial photographer
- Absolutely NO text, words, numbers, signs, or readable content anywhere in the image
- No logos, watermarks, or branded elements
- No AI-generated artifacts or uncanny valley elements
- High dynamic range, sharp subject, creamy bokeh background
- Square 1:1 composition optimized for social media
- Color grade should feel premium and editorial`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: dallePrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        response_format: "url",
      }),
    });

    const data = await response.json();

    if (data.data && data.data[0]) {
      return res.status(200).json({
        success: true,
        imageUrl: data.data[0].url,
        number: caption.number,
        concept: visualConcept,
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
