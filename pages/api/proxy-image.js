export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "url required" });

  try {
    const response = await fetch(decodeURIComponent(url));
    if (!response.ok) return res.status(400).json({ error: "Failed to fetch image" });

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
