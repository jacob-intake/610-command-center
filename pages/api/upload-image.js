export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "imageUrl required" });

  const wpUrl = process.env.WORDPRESS_URL;
  const wpUser = process.env.WORDPRESS_USERNAME;
  const wpPass = process.env.WORDPRESS_APP_PASSWORD;

  if (!wpUrl || !wpUser || !wpPass) {
    return res.status(200).json({ success: false, error: "WordPress not configured" });
  }

  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return res.status(200).json({ success: false, error: `Failed to fetch image: ${imgRes.status}` });
    }

    const imgBuffer = await imgRes.arrayBuffer();
    const credentials = Buffer.from(`${wpUser}:${wpPass}`).toString("base64");
    const filename = `610-social-${Date.now()}.jpg`;

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
      const errText = await uploadRes.text();
      return res.status(200).json({ success: false, error: `WordPress upload failed: ${uploadRes.status} ${errText.substring(0, 100)}` });
    }

    const uploadData = await uploadRes.json();
    const permanentUrl = uploadData.source_url;

    if (!permanentUrl) {
      return res.status(200).json({ success: false, error: "No source_url in WordPress response" });
    }

    return res.status(200).json({ success: true, permanentUrl });

  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
}
