const BUFFER_API = "https://api.buffer.com";

export default async function handler(req, res) {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  const orgId = process.env.BUFFER_ORG_ID;

  if (!token || !orgId) return res.status(500).json({ error: "Missing credentials" });

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  // Step 1: Get channels
  const channelsRes = await fetch(BUFFER_API, {
    method: "POST", headers,
    body: JSON.stringify({
      query: `query { channels(input: { organizationId: "${orgId}" }) { id name service } }`,
    }),
  });
  const channelsData = await channelsRes.json();
  const fbChannel = channelsData.data?.channels?.find(c => c.service?.toLowerCase() === "facebook");

  if (!fbChannel) {
    return res.status(200).json({ error: "Facebook channel not found", channels: channelsData });
  }

  // Step 2: Try addToQueue - simplest possible post
  const testMutation = `
    mutation CreatePost {
      createPost(input: {
        channelId: "${fbChannel.id}",
        text: "Test post from 610 Command Center",
        schedulingType: automatic,
        mode: addToQueue
      }) {
        ... on PostActionSuccess { post { id status dueAt } }
        ... on MutationError { message }
      }
    }
  `;

  const postRes = await fetch(BUFFER_API, { method: "POST", headers, body: JSON.stringify({ query: testMutation }) });
  const postData = await postRes.json();

  return res.status(200).json({
    fbChannel,
    bufferHttpStatus: postRes.status,
    bufferResponse: postData,
  });
}
