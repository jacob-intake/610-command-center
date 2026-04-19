export const config = {
  api: {
    bodyParser: false,
    responseLimit: "150mb",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const wpUrl = process.env.WORDPRESS_URL;
  const wpUser = process.env.WORDPRESS_USERNAME;
  const wpPass = process.env.WORDPRESS_APP_PASSWORD;

  if (!wpUrl || !wpUser || !wpPass) {
    return res.status(500).json({ error: "WordPress not configured" });
  }

  try {
    // Read raw body
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const filename = req.headers["x-filename"] || `610-video-${Date.now()}.mp4`;
    const credentials = Buffer.from(`${wpUser}:${wpPass}`).toString("base64");

    const uploadRes = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "video/mp4",
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return res.status(500).json({ error: `WordPress upload failed: ${uploadRes.status}`, details: errText.substring(0, 200) });
    }

    const uploadData = await uploadRes.json();
    return res.status(200).json({
      success: true,
      videoUrl: uploadData.source_url,
      mediaId: uploadData.id,
      filename,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
