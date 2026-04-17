const BUFFER_API = "https://api.buffer.com";

export default async function handler(req, res) {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  const orgId = process.env.BUFFER_ORG_ID;
  if (!token || !orgId) return res.status(500).json({ error: "Missing credentials" });

  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  // Introspect CreatePostInput to see exact accepted fields
  const introspectRes = await fetch(BUFFER_API, {
    method: "POST", headers,
    body: JSON.stringify({
      query: `
        query {
          __type(name: "CreatePostInput") {
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

  const introspectData = await introspectRes.json();

  return res.status(200).json({
    createPostInputFields: introspectData.data?.__type?.inputFields || [],
    raw: introspectData,
  });
}
