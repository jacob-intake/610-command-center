const BUFFER_API = "https://api.buffer.com";

export default async function handler(req, res) {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: "Missing token" });

  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  const introspectRes = await fetch(BUFFER_API, {
    method: "POST", headers,
    body: JSON.stringify({
      query: `
        query {
          instagramMetaData: __type(name: "InstagramPostMetadataInput") {
            name
            inputFields {
              name
              type { name kind ofType { name kind } }
              description
            }
          }
          postTypeInstagram: __type(name: "PostTypeInstagram") {
            name
            enumValues { name description }
          }
        }
      `,
    }),
  });

  const data = await introspectRes.json();
  return res.status(200).json(data);
}
