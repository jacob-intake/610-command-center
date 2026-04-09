export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 100,
        messages: [{ role: "user", content: "Say hello in one sentence." }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `API error ${response.status}`, details: errText });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "No response";
    return res.status(200).json({ success: true, test: text, apiKey: process.env.ANTHROPIC_API_KEY ? "present" : "MISSING" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
