export const config = { api: { responseLimit: "10mb" } };

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "url required" });

  const decodedUrl = decodeURIComponent(url);

  const attemptFetch = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(decodedUrl, { signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  };

  try {
    let response;
    try {
      response = await attemptFetch();
    } catch {
      // Retry once
      await new Promise(r => setTimeout(r, 500));
      response = await attemptFetch();
    }

    if (!response.ok) {
      return res.status(400).json({ error: `Source returned ${response.status}` });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
