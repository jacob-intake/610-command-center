import { getClient } from "../../lib/clients";

const UNIQUE_CONCEPTS = [
  "a business professional in a tailored navy suit standing confidently by floor-to-ceiling windows with a city skyline at dusk behind them, shallow depth of field",
  "close-up of weathered hands resting on a polished oak desk with a leather notebook and pen, warm window light from the left, bokeh background",
  "a small team of three professionals in animated conversation around a glass conference table, candid moment, natural overhead light",
  "aerial perspective looking straight down at a spotless minimalist desk with a laptop, espresso cup, and small succulent plant, cool morning light",
  "a confident woman in her 40s behind the counter of a clean modern retail boutique, warm interior lighting, slight smile, direct eye contact",
  "late afternoon sunlight streaming through venetian blinds casting stripes across a tidy home office desk with a MacBook and notepad",
  "two professionals in a relaxed side-by-side posture looking at a laptop screen together in a bright co-working space, candid and natural",
  "exterior street-level shot of a clean modern San Diego storefront with palm trees reflected in the glass window, golden hour",
  "close macro shot of a stylus touching a tablet screen showing clean data visualization, very shallow depth of field, dark background",
  "a man in his early 30s standing at a whiteboard covered in clean marker diagrams, sleeves rolled up, relaxed and focused",
  "downtown San Diego waterfront at magic hour, warm orange and pink sky reflecting off the bay, one business professional silhouette in foreground",
  "overhead flat lay of a dark marble desk surface with a journal, reading glasses, wireless earbuds, and a coffee mug casting a long shadow",
  "a woman reviewing documents at a kitchen island with morning light flooding through large windows, casual professional attire",
  "close-up portrait of a business owner in their 50s with silver hair, looking thoughtfully off camera, soft natural window light, shallow focus",
  "empty modern boardroom at night with the city glowing through glass walls, long exposure light trails from traffic below",
  "person's hands cupping a ceramic mug with steam rising, laptop open in the soft-focus background, warm cozy light",
  "two entrepreneurs doing a professional handshake outside a glass office building, slightly backlit by afternoon sun, candid moment",
  "close-up of a laptop keyboard with one finger pressing a key, very shallow focus, soft blue ambient light from the screen",
  "a diverse group of four colleagues walking down a bright modern office hallway, mid-stride, candid photojournalism style",
  "rooftop terrace of a modern San Diego office building, one person on a call with panoramic city view behind them, late afternoon",
  "clean product shot style: a smartphone face-up on a matte concrete surface with soft directional light, minimal composition",
  "a graphic designer leaning back in an ergonomic chair studying a large monitor showing clean design work, rim-lit from behind",
  "macro close-up of a pen writing the word STRATEGY on a white legal pad, warm desk lamp light, paper texture visible",
  "professional woman in smart casual attire walking purposefully through a sun-drenched modern lobby, motion blur on background",
  "interior of a stylish San Diego coffee shop with one person working on a laptop, warm ambient light, brick walls, green plants",
];

const TYPE_MOODS = {
  "Educational tip": "approachable, informative, clean and professional. Warm neutral tones.",
  "Thought leadership": "authoritative, cinematic, slightly dramatic. Deep shadows and strong directional light.",
  "AI and automation": "modern, precise, slightly cool-toned. Clean lines and technology present but not overwhelming.",
  "San Diego local": "warm California light, coastal or urban San Diego setting, vibrant and sunny.",
  "610 services": "collaborative, results-oriented, polished. Professional but not stiff.",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { caption, primaryTopic, clientId, forceNew } = req.body;
  if (!caption) return res.status(400).json({ error: "Caption is required" });

  const client = getClient(clientId || "610-marketing");
  if (!client) return res.status(400).json({ error: "Invalid client" });

  // forceNew rotates to a different concept on re-render
  const baseIndex = (caption.number - 1) % UNIQUE_CONCEPTS.length;
  const offset = forceNew ? Math.floor(Math.random() * UNIQUE_CONCEPTS.length) : 0;
  const conceptIndex = (baseIndex + offset) % UNIQUE_CONCEPTS.length;
  const concept = UNIQUE_CONCEPTS[conceptIndex];
  const mood = TYPE_MOODS[caption.type] || "professional, clean, modern business photography.";

  const prompt = `Commercial editorial photography for a premium marketing agency. ${concept}. Mood: ${mood} Shot on a Sony A7R IV with a 50mm f/1.4 Zeiss lens. Shallow depth of field. No text anywhere in the image. No logos. No watermarks. No signs with words. No overlaid graphics. Absolutely no text of any kind. The image must look exactly like a photograph taken by a professional commercial photographer, not generated by AI. High dynamic range. Sharp subject, creamy bokeh background. Square crop optimized for social media.`;

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
