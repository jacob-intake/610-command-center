import { getClient } from "../../lib/clients";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, content, clientId } = req.body;

  if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

  const client = getClient(clientId || "610-marketing");
  if (!client) return res.status(400).json({ error: "Invalid client" });

  if (!client.wordpressUrl || !client.wordpressUsername || !client.wordpressPassword) {
    return res.status(400).json({ error: "WordPress credentials not configured for this client" });
  }

  const credentials = Buffer.from(`${client.wordpressUsername}:${client.wordpressPassword}`).toString("base64");

  try {
    const response = await fetch(`${client.wordpressUrl}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        title,
        content,
        status: "draft",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("WordPress API error:", response.status, errText);
      return res.status(500).json({ error: `WordPress error ${response.status}`, details: errText });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      postId: data.id,
      postUrl: data.link,
      editUrl: `${client.wordpressUrl}/wp-admin/post.php?post=${data.id}&action=edit`,
    });

  } catch (error) {
    console.error("WordPress publish error:", error);
    return res.status(500).json({ error: "WordPress publish failed", details: error.message });
  }
}
