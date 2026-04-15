const BUFFER_API = "https://api.buffer.com";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  const token = process.env.BUFFER_ACCESS_TOKEN;
  const orgId = process.env.BUFFER_ORG_ID;

  if (!token || !orgId) return res.status(500).json({ error: "Missing credentials" });

  const response = await fetch(BUFFER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
      query: `
        query GetChannels {
          channels(input: { organizationId: "${orgId}" }) {
            id
            name
            displayName
            service
            serviceId
          }
        }
      `,
    }),
  });

  const data = await response.json();
  return res.status(200).json(data);
}
