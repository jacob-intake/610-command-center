const BUFFER_API = "https://api.buffer.com";

export default async function handler(req, res) {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: "Missing token" });

  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  // Introspect PostInputMetaData to see Facebook-specific fields
  const introspectRes = await fetch(BUFFER_API, {
    method: "POST", headers,
    body: JSON.stringify({
      query: `
        query {
          postInputMetaData: __type(name: "PostInputMetaData") {
            name
            inputFields {
              name
              type { name kind ofType { name kind } }
              description
            }
          }
          facebookMetaData: __type(name: "FacebookPostMetadataInput") {
            name
            inputFields {
              name
              type { name kind ofType { name kind } }
              description
            }
          }
        }
      `,
    }),
  });

  const data = await introspectRes.json();
  return res.status(200).json(data);
}
