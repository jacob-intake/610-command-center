import { getClient } from "../../lib/clients";

// Photography brief templates per post type
// Each entry is a specific scenario described as a photographer would brief a shoot
const PHOTO_BRIEFS = {
  "Educational tip": [
    "Candid photograph of a business professional in their late 30s seated at a clean oak desk, reviewing printed documents with genuine concentration. Left hand rests on the page, right hand holds a pen mid-thought. Natural window light from the left casting soft directional shadows across the desk surface. Shot on 85mm lens at f/2.0, eye level, medium close-up. Warm neutral color grade, subtle film grain, realistic skin texture with natural pores. Papers have slight curl from handling. Coffee mug slightly out of focus in foreground.",
    "Overhead documentary photograph looking straight down at a working desk. Open laptop showing a spreadsheet, handwritten notes on a yellow legal pad with coffee ring stain from earlier in the day, reading glasses folded beside it. Two pens, one uncapped. Shot from directly above on 35mm equivalent, even soft daylight from a nearby window. Matte surfaces, realistic paper texture, subtle shadows. Color grade: clean daylight white balance.",
    "Candid medium shot of two professionals in a genuine working conversation at a modern conference table. One is leaning forward making a point, the other listening with a slight nod. Neither is looking at the camera. Authentic body language, real expressions. Shot at f/2.8 on 50mm, shallow depth of field with background office details softly blurred. Overhead diffused office lighting with a warm tone. Realistic fabric texture on clothing.",
    "Close-up documentary photograph of a person's hands typing on a laptop keyboard. Fingers mid-keystroke, natural hand position. Laptop screen glow provides cool ambient fill light from above. Dark background with one warm desk lamp creating a pool of light. Shot at f/1.8, very shallow depth of field. Keyboard keys show real wear. Slight motion blur on fingertips suggesting active typing.",
    "Editorial photograph of a solo professional standing in a modern open office space, looking out a large floor-to-ceiling window at a city view. Seen from the side at medium distance. Contemplative posture, weight shifted to one leg, arms loosely crossed. Late afternoon backlighting creating a warm rim light silhouette. Shot on 35mm at f/4, clean background exposure, subject slightly underexposed for mood.",
  ],
  "Thought leadership": [
    "Candid photograph of a woman in her 40s sitting cross-legged on a modern sofa in a bright creative studio, laptop open beside her, looking directly at camera with a calm knowing expression. Natural window light. Shot on 85mm at f/2.0. Warm tones, casual but authoritative.",
    "Atmospheric photograph of an empty modern boardroom at night. Long conference table reflects overhead pendant lighting. City lights visible through glass walls. Shot on wide 24mm lens at f/8. No people. Moody blue-grey color grade.",
    "Documentary photograph of a man in his 30s writing in a leather notebook at a standing desk in a minimalist home office. Bookshelves behind him, afternoon light slanting through blinds. Candid, not aware of camera. Shot on 50mm at f/2.8.",
    "Wide shot of a single woman standing at the edge of a rooftop terrace, city skyline behind her, golden hour light, arms relaxed at sides, looking at the horizon. Shot on 28mm at f/5.6. Aspirational, forward-looking, warm amber tones.",
    "Close-up documentary portrait of a person's hands and face together, chin resting on folded hands, deep in thought, slight smile. Shallow depth of field on 85mm at f/1.8. Dark neutral background, single soft window light. Intimate and genuine.",
  ],
  "AI and automation": [
    "Close documentary photograph of a developer's hands resting on a laptop keyboard, screen reflecting in their glasses. Multiple monitor setup visible out of focus in background showing code and data. Shot at f/2.0 on 50mm, shallow depth of field. Cool blue ambient light from screens, one warm desk lamp. Dark moody workspace, cables and peripherals visible suggesting real working environment.",
    "Editorial photograph of a clean modern desk with a tablet displaying a simple data dashboard. Stylus resting beside it, small succulent plant to one side, espresso cup with residue. Shot overhead on 35mm, soft directional natural light from a window at angle. Matte concrete desk surface, realistic object shadows. Minimal but lived-in feel.",
    "Candid medium shot of a professional leaning back in an ergonomic chair studying multiple monitors. Thoughtful expression, chin resting on one hand. Screen light provides cool ambient fill. Shot from the side at f/2.8 on 85mm, monitors visible but not readable. Dark background, high contrast between screen glow and shadow areas. Real office clutter at desk edges.",
    "Close-up photograph of fingers on a glass tablet surface, a simple clean interface visible beneath. Very shallow depth of field at f/1.4, only the fingertip and screen in focus. Soft diffused light from above, tablet on a dark matte surface. Cool color temperature, minimal composition, negative space around subject.",
    "Wide editorial shot of a modern open-plan tech workspace during working hours. Four or five people visible at various distances, all genuinely working, none posing. Natural overhead lighting, some areas in shadow. Shot on 24mm at f/5.6, everything sharp. Exposed brick and cable management visible. Plants, whiteboards with marker. Authentic working environment texture.",
  ],
  "Explanatory": [
    "Documentary photograph of someone writing on a large whiteboard filled with a simple diagram. Back three-quarters to camera, marker in hand mid-stroke. Office daylight from windows on one side, whiteboard well-lit. Shot at f/2.8 on 50mm from medium distance. Shirt sleeves rolled up, casual professional. Board shows real handwriting not perfect typography.",
    "Overhead flat lay photograph of an organized workspace in active use. Open notebook with handwritten notes and diagrams, laptop trackpad visible at edge, three printed pages with yellow highlights and margin notes, a working pen. Shot directly overhead on 35mm, even soft daylight, no harsh shadows. Real paper textures, ink visible, pages not perfectly aligned.",
    "Candid photograph of two people side by side looking at a laptop screen together, both genuinely engaged. One pointing at something on screen. Shot from slightly behind and to the side at f/2.0, faces in three-quarter view. Warm office ambient light. Natural expressions, real body language, neither aware of camera.",
    "Close editorial photograph of a person's hands holding printed materials, clearly reading and thinking. One finger tracing a line of text. Shot at f/1.8 on 85mm, hands and document sharp, body soft behind. Warm natural light from above, desk surface visible at bottom of frame. Paper shows real texture and slight handling wear.",
    "Medium shot of a professional standing at a standing desk reviewing work on a large monitor, pen and notepad beside keyboard. Side profile, fully concentrated on screen. Clean modern office, natural light from behind creating subtle rim. Shot on 50mm at f/3.5, monitor not readable. Genuine posture and focus.",
  ],
  "610 services": [
    "Candid documentary photograph of a client meeting in a modern conference room. Four people around a glass table, one presenting from a laptop. Genuine engaged expressions, varied body language. Shot on 35mm at f/4 from a corner, everyone in frame. Overhead diffused lighting, city view through glass wall. Notebooks and water glasses on table. Authentic interaction not staged.",
    "Editorial photograph of a professional handshake outside a modern glass office building. Framed from waist up, both parties mid-shake with genuine expressions. Slight backlight from afternoon sun creating rim light on shoulders. Shot on 85mm at f/2.0, building and street softly blurred behind. Real clothing texture, skin detail, natural shadows.",
    "Wide shot of a small team in a casual working meeting, seated in a mix of chairs around a low table. Laptop open, coffee cups, some people leaning forward, one sitting back listening. Candid moment, no one performing for camera. Shot on 24mm at f/5.6, warm natural light from large windows. Plants and bookshelves visible in background.",
    "Documentary portrait of a business owner standing in their own space, relaxed and confident. Arms loosely at sides, genuine expression looking slightly off-camera. Shot on 85mm at f/1.8, beautiful soft background separation. Their environment visible behind them giving context. Natural window light, realistic skin texture.",
    "Candid photograph of someone on a work call, laptop open, notes beside them, mid-conversation gesture with one hand. Home office or modern workspace. Shot at f/2.0 from medium distance, natural existing light. Slightly messy desk suggesting real work in progress. Authentic focused expression.",
  ],
};

const LOCAL_PHOTO_BRIEFS = {
  default: [
    "Street-level documentary photograph on a city sidewalk during morning business hours. Professionals walking past modern storefronts, one person in foreground checking phone, natural candid moment. Shot on 35mm at f/5.6, everything sharp. Morning light angle casting long shadows. City textures, real signage, genuine street life.",
    "Editorial photograph looking through a coffee shop window from outside. Interior warm and inviting, people working on laptops visible through glass. Morning light reflecting partially on window. Shot on 50mm at f/4, depth through glass creating layered planes of focus. Authentic local business atmosphere.",
  ],
};


// Visual Style Library - 4 curated styles built from reference analysis
const VISUAL_STYLE_LIBRARY = {
  "Nike Energy": {
    brief: "Single subject in an aspirational professional or urban environment with dominant negative space. Real unposed human moment of quiet determination or confident focus, never staged. Subject is a business professional or entrepreneur, well dressed, caught in a genuine moment of purpose. Wide cinematic framing with the subject occupying one third of the frame, the rest open sky, clean architecture, city street at golden hour, or modern office corridor stretching away. Natural existing light, warm golden hour or clean daylight, never flat or grey. Color palette has one strong warm anchor, deep blue sky, warm amber light, or clean white architecture. High contrast between subject and open space around them. No clutter. Composition breathes with intent. Shot on 24mm to 35mm wide lens, f/5.6 to f/8, everything sharp. Feels aspirational, confident, and forward-moving. The image should feel like the cover of a business magazine, not a film noir still.",
    override: true,
  },
  "Authoritative": {
    brief: "Dark navy or near-black background dominates the frame. If a person appears they are real, candid, slightly underexposed, never posed or smiling at camera, used as background texture not subject. Wide shot if photography is present, 24mm to 35mm, figures small in frame, environment dominant. The overall image feels like something you would stop scrolling to read, not an ad you would skip. Heavy negative space in upper portion for text placement. Monumental, serious, credible. No decorative flourishes, clean grid structure. One strong tonal accent if color is present, deep red, gold, or electric blue, used as a single element only.",
    override: true,
  },
  "Blended World": {
    brief: "Real photorealistic human subject, never model-perfect, genuine relatable expression, surprise, curiosity, focused concentration, or delight. Subject centered or slightly off-center against a single bold flat color background, no gradients, no naturalistic environments, no location context. Background color is warm and saturated, amber orange, coral, teal, or electric blue. High contrast between skin tones and background. Shot on 50mm to 85mm, medium close-up, subject sharp. Energy is upbeat, modern, and slightly playful without being juvenile. Feels like a human living inside a digital interface, two worlds coexisting naturally.",
    override: true,
  },
  "Tech-centered": {
    brief: "Pure white, soft grey, or deep black background with zero environmental context or location detail. Single subject composition with no competing visual elements. Either an extreme close crop of a real human face or hands showing genuine skin texture, pores, natural imperfections, never retouched or model-perfect, or a device in isolation treated with portrait-level reverence. If hands appear they are mid-use, natural grip, fingers interacting with a device in a real moment not a posed product shot. Lighting is technically precise, single soft key light, minimal shadow, clean separation from background. Color palette is monochrome or uses one deliberate accent color with restraint. No decorative elements. Shot on 85mm to 100mm, medium to extreme close-up. Energy is quiet, confident, and inevitable. Feels like the future arrived without announcing itself.",
    override: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { caption, primaryTopic, clientId, forceNew, inspirationContext, serviceLocation, visualStyle } = req.body;
  if (!caption) return res.status(400).json({ error: "Caption is required" });

  const client = getClient(clientId || "610-marketing");
  if (!client) return res.status(400).json({ error: "Invalid client" });

  const captionType = caption.type || "Educational tip";
  const city = serviceLocation && serviceLocation !== "National"
    ? serviceLocation.split(",")[0].trim()
    : null;

  // Check for visual style override
  let selectedBrief;
  const styleEntry = visualStyle && VISUAL_STYLE_LIBRARY[visualStyle];

  if (styleEntry && styleEntry.override) {
    // Use the curated style brief, inject topic context
    selectedBrief = styleEntry.brief + ` Topic context for this image: ${primaryTopic}.`;
    if (city && captionType.toLowerCase().includes("local")) {
      selectedBrief += ` Set in ${city}.`;
    }
  } else {
    // Use default photo brief pool
    let briefPool;
    if (captionType.toLowerCase().includes("local") && city) {
      briefPool = LOCAL_PHOTO_BRIEFS.default;
    } else {
      briefPool = PHOTO_BRIEFS[captionType] || PHOTO_BRIEFS["Educational tip"];
    }

    const baseIndex = (caption.number - 1) % briefPool.length;
    const briefIndex = forceNew
      ? Math.floor(Math.random() * briefPool.length)
      : baseIndex;

    selectedBrief = briefPool[briefIndex];

    if (captionType.toLowerCase().includes("local") && city) {
      selectedBrief = selectedBrief.replace(/city/g, city);
    }
  }

  // Parse creative direction from inspiration context
  let creativeLayer = "";
  if (inspirationContext && inspirationContext.trim()) {
    const lines = inspirationContext.trim().split("\n").filter(l => l.includes(":"));
    const energy = lines.find(l => l.includes("Energy:"))?.split(":")[1]?.trim();
    const visualStyle = lines.find(l => l.includes("Visual Style:"))?.split(":")[1]?.trim();
    const colorMood = lines.find(l => l.includes("Color Mood:"))?.split(":")[1]?.trim();

    const energyMap = {
      "High": "high energy, dynamic composition, slight motion feel",
      "Chill": "relaxed unhurried mood, quiet moment, gentle light",
      "Professional": "polished professional environment, composed framing",
      "Funny": "lighthearted moment, slight smile, casual energy",
      "Inspirational": "aspirational mood, strong light, forward-looking",
      "Urgent": "focused intense mood, tight framing, purposeful",
    };

    const styleMap = {
      "Cinematic": "cinematic color grade, strong directional light, film-like quality",
      "Editorial": "editorial magazine photography style, clean composition",
      "Minimal": "minimal composition, significant negative space, clean lines",
      "Bold": "bold high contrast lighting, strong graphic composition",
      "Warm and Lifestyle": "warm tones, lifestyle photography feel, inviting atmosphere",
      "Dark and Moody": "dark moody atmosphere, low key lighting, deep shadows",
      "Bright and Airy": "bright airy feel, overexposed highlights, light and fresh",
    };

    const colorMap = {
      "Navy and White (610 Default)": "navy blue and white color palette, cool professional tones",
      "Warm Earth Tones": "warm earth tones, amber and brown palette",
      "Black and Minimal": "black and white or near-monochrome, minimal color",
      "Vibrant and Bold": "vibrant saturated colors, bold palette",
      "Soft Neutrals": "soft neutral palette, muted tones, understated",
    };

    const parts = [];
    if (energy && energyMap[energy]) parts.push(energyMap[energy]);
    if (visualStyle && styleMap[visualStyle]) parts.push(styleMap[visualStyle]);
    if (colorMood && colorMap[colorMood]) parts.push(colorMap[colorMood]);
    if (parts.length > 0) creativeLayer = " Additional direction: " + parts.join(", ") + ".";
  }

  // Build the final prompt as a photography brief
  // Add caption-number-based uniqueness seed to prevent repetition
const uniqueSeeds = [
  "warm morning light, indoor setting",
  "golden hour, outdoor urban environment",
  "overcast soft light, modern workspace",
  "late afternoon, open architectural space",
  "cool blue ambient light, evening indoor",
  "bright midday natural light, minimal setting",
  "dramatic side lighting, interior space",
  "diffused cloudy daylight, street level",
];
const uniqueSeed = uniqueSeeds[(caption.number - 1) % uniqueSeeds.length];

const prompt = `Photorealistic photograph. ${selectedBrief}${creativeLayer} Lighting and time of day: ${uniqueSeed}.

Critical requirements: This must look exactly like a real photograph taken by a professional photographer, not AI-generated. Real skin texture with visible pores. Natural fabric wrinkles and wear. Authentic imperfections. Genuine candid expressions not posed. No text, words, logos, watermarks, or readable signage anywhere in the image. Square 1:1 composition. This image must look completely different from any other image in this batch. Vary the subject demographics, environment, and composition significantly.`;

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
      }),
    });

    const data = await response.json();

    if (data.data?.[0]?.url) {
      return res.status(200).json({
        success: true,
        imageUrl: data.data[0].url,
        number: caption.number,
      });
    } else if (data.data?.[0]?.b64_json) {
      // gpt-image-1 sometimes returns base64
      const imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
      return res.status(200).json({
        success: true,
        imageUrl,
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
