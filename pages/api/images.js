import { getClient } from "../../lib/clients";

const UNIQUE_CONCEPTS = [
  "wide establishing shot of a modern city office building exterior at dawn",
  "close-up of hands typing on a laptop with a coffee cup nearby on a wooden desk",
  "overhead aerial view of a business professional's organized desk workspace",
  "side profile of a person looking at colorful data charts on a large monitor",
  "two colleagues having a standing conversation near floor-to-ceiling windows",
  "empty modern conference room with a long table and city view in background",
  "close-up of a smartphone screen showing analytics graphs held in one hand",
  "small business owner behind a counter looking confident in a bright retail space",
  "professional woman walking through a modern open-plan office with purpose",
  "man in a blazer reviewing printed documents at a minimalist desk",
  "team of three people gathered around a laptop looking at results together",
  "exterior of a modern small business storefront on a sunny San Diego street",
  "close-up of a notebook with handwritten notes next to a laptop keyboard",
  "person presenting to a small attentive group using a wall-mounted screen",
  "aerial drone view of downtown San Diego waterfront during golden hour",
  "professional at a standing desk in a bright home office with plants nearby",
  "two business owners shaking hands outside a glass office building entrance",
  "close-up of a digital tablet showing a clean website design on screen",
  "diverse team of four professionals in a casual brainstorming session",
  "person reviewing their phone with a focused expression in a cafe setting",
  "modern marketing agency interior with exposed brick and creative workstations",
  "close-up of fingers scrolling through social media content on a smartphone",
  "business owner looking out large windows at a city skyline thoughtfully",
  "clean flat-lay of business tools including phone, notebook, pen, and laptop",
  "professional couple reviewing documents together at a bright kitchen table",
];

const TYPE_SUBJECTS = {
  "Educational tip": "informative and approachable business setting, learning and discovery atmosphere",
  "Thought leadership": "confident professional environment, leadership and vision atmosphere",
  "AI and automation": "modern technology and digital innovation setting, clean and forward-looking",
  "San Diego local": "San Diego California setting, warm coastal or urban professional environment",
  "610 services": "marketing and digital strategy environment, collaborative and results-focused",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { caption, primaryTopic, clientId } = req.body;
  if (!caption) return res.status(400).json({ error: "Caption is required" });

  const client = getClient(clientId || "610-marketing");
  if (!client) return res.status(400).json({ error: "Invalid client" });

  const conceptIndex = (caption.number - 1) % UNIQUE_CONCEPTS.length;
  const uniqueConcept = UNIQUE_CONCEPTS[conceptIndex];
  const typeSubject = TYPE_SUBJECTS[caption.type] || "professional business setting";

  const prompt = `Photorealistic photography. Canon 5D Mark IV, 35mm lens, f/2.8 aperture, natural light with subtle fill. ${uniqueConcept}. Atmosphere: ${typeSubject}. Color grade: deep navy blues, clean whites, dark charcoal shadows. Cinematic depth of field. No text. No words. No logos. No watermarks. No AI-generated looking elements. Must look like a real photograph taken by a professional commercial photographer. The scene relates to: ${primaryTopic}. Square composition, social media format.`;

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
      return res.status(200).json({ success: true, imageUrl: data.data[0].url, number: caption.number });
    } else {
      return res.status(200).json({ success: false, error: data.error?.message || "No image returned", number: caption.number });
    }
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message, number: caption.number });
  }
}
