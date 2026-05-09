export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { blogTitle, primaryTopic, clientId, blogNumber } = req.body;
  if (!blogTitle) return res.status(400).json({ error: "Blog title required" });

  const prompt = `Professional editorial photography for a blog post header image. The blog is titled: "${blogTitle}". 

Create a wide cinematic landscape photograph that visually represents this topic. Shot on Sony A7R IV, 35mm lens, f/4, natural light. Deep navy blues, clean whites, dark charcoal tones. No text anywhere in the image. No logos. No watermarks. No words or signs of any kind. Must look exactly like a photograph taken by a professional commercial photographer. High dynamic range. Landscape format optimized for a blog featured image header.`;

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
        size: "1536x1024",
        quality: "high",
        output_format: "url",
      }),
    });

    const data = await response.json();
    if (!data.data?.[0]?.url) {
      return res.status(500).json({ error: data.error?.message || "No image returned" });
    }

    const dalleUrl = data.data[0].url;

    // Upload to WordPress with SEO filename
    const wpUrl = process.env.WORDPRESS_URL;
    const wpUser = process.env.WORDPRESS_USERNAME;
    const wpPass = process.env.WORDPRESS_APP_PASSWORD;

    if (!wpUrl || !wpUser || !wpPass) {
      return res.status(200).json({ success: true, imageUrl: dalleUrl, permanentUrl: null });
    }

    const topicSlug = (primaryTopic || blogTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);
    const filename = `${topicSlug}_610-marketing_digital-marketing-and-AI-consulting-agency-near-me_blog-${blogNumber || 1}.jpg`;

    const imgRes = await fetch(dalleUrl);
    if (!imgRes.ok) return res.status(200).json({ success: true, imageUrl: dalleUrl, permanentUrl: null });

    const imgBuffer = await imgRes.arrayBuffer();
    const credentials = Buffer.from(`${wpUser}:${wpPass}`).toString("base64");

    const uploadRes = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "image/jpeg",
      },
      body: imgBuffer,
    });

    if (!uploadRes.ok) {
      return res.status(200).json({ success: true, imageUrl: dalleUrl, permanentUrl: null });
    }

    const uploadData = await uploadRes.json();
    return res.status(200).json({
      success: true,
      imageUrl: dalleUrl,
      permanentUrl: uploadData.source_url,
      mediaId: uploadData.id,
      filename,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
