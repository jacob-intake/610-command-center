const BUFFER_API = "https://api.buffer.com";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { blogTitle, blogContent, blogUrl, scheduledAt, primaryTopic } = req.body;
  if (!blogTitle || !blogUrl) return res.status(400).json({ error: "Blog title and URL required" });

  const token = process.env.BUFFER_ACCESS_TOKEN;
  const orgId = process.env.BUFFER_ORG_ID;
  if (!token || !orgId) return res.status(500).json({ error: "Buffer not configured" });

  try {
    // Step 1: Generate LinkedIn post teaser from blog content
    const teaserPrompt = `You are writing a LinkedIn post for 610 Marketing and PR to promote a new blog article.

Blog Title: "${blogTitle}"
Blog Opening: "${(blogContent || "").substring(0, 500)}"

Write a compelling LinkedIn post that:
- Opens with a hook that makes professionals want to read more
- 2-3 sentences maximum before the link
- Teases the value without giving everything away
- Ends with "Read the full post:" on its own line (do not include the URL, that will be added automatically)
- Then 3 dots on separate lines
- Then exactly these hashtags on one line based on the topic: #digitalmarketing #${(primaryTopic || "marketing").toLowerCase().replace(/\s+/g, "")} #AIstrategy #610marketing #smallbusiness

Plain text only. No asterisks. No markdown. No emojis.`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: teaserPrompt }],
      }),
    });

    const claudeData = await claudeRes.json();
    const teaser = claudeData.content?.[0]?.text?.trim() || "";

    // Combine teaser with blog URL
    const fullPostText = `${teaser}\n\n${blogUrl}`;

    // Step 2: Get LinkedIn channel
    const channelsRes = await fetch(BUFFER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({
        query: `query { channels(input: { organizationId: "${orgId}" }) { id name service } }`,
      }),
    });
    const channelsData = await channelsRes.json();
    const linkedInChannel = channelsData.data?.channels?.find(c =>
      c.service?.toLowerCase() === "linkedin"
    );

    if (!linkedInChannel) {
      return res.status(400).json({ error: "LinkedIn channel not found in Buffer" });
    }

    // Step 3: Schedule or post immediately
    const dueAt = scheduledAt ? new Date(scheduledAt).toISOString() : null;
    const mode = dueAt ? "customScheduled" : "addToQueue";
    const dueAtField = dueAt ? `dueAt: "${dueAt}",` : "";

    const mutation = `
      mutation CreatePost {
        createPost(input: {
          channelId: "${linkedInChannel.id}",
          text: ${JSON.stringify(fullPostText)},
          schedulingType: automatic,
          mode: ${mode},
          ${dueAtField}
        }) {
          ... on PostActionSuccess { post { id dueAt status } }
          ... on MutationError { message }
        }
      }
    `;

    const postRes = await fetch(BUFFER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ query: mutation }),
    });

    const postData = await postRes.json();

    if (postData.errors || postData.data?.createPost?.message) {
      const err = postData.errors?.[0]?.message || postData.data?.createPost?.message;
      return res.status(500).json({ error: err });
    }

    if (postData.data?.createPost?.post) {
      return res.status(200).json({
        success: true,
        postId: postData.data.createPost.post.id,
        scheduledAt: postData.data.createPost.post.dueAt,
        teaser,
        message: dueAt
          ? `LinkedIn post scheduled for ${new Date(dueAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`
          : "LinkedIn post added to Buffer queue",
      });
    }

    return res.status(500).json({ error: "Unexpected Buffer response", raw: JSON.stringify(postData).substring(0, 200) });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
