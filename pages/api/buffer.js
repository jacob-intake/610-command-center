const BUFFER_API = "https://api.buffer.com";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, scheduledAt, platforms } = req.body;

  if (!text) return res.status(400).json({ error: "Caption text is required" });
  if (!scheduledAt) return res.status(400).json({ error: "Scheduled time is required" });
  if (!platforms || platforms.length === 0) return res.status(400).json({ error: "At least one platform is required" });

  const token = process.env.BUFFER_ACCESS_TOKEN;
  const orgId = process.env.BUFFER_ORG_ID;

  if (!token) return res.status(500).json({ error: "Buffer access token not configured" });
  if (!orgId) return res.status(500).json({ error: "Buffer organization ID not configured" });

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  try {
    // Step 1: Fetch channels for this organization
    const channelsRes = await fetch(BUFFER_API, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: `
          query GetChannels($input: ChannelsInput!) {
            channels(input: $input) {
              id
              name
              service
              serviceType
            }
          }
        `,
        variables: {
          input: { organizationId: orgId },
        },
      }),
    });

    if (!channelsRes.ok) {
      const errText = await channelsRes.text();
      return res.status(500).json({ error: `Buffer channels fetch failed: ${channelsRes.status}`, details: errText });
    }

    const channelsData = await channelsRes.json();

    if (channelsData.errors) {
      return res.status(500).json({
        error: "Buffer channels error",
        details: channelsData.errors[0]?.message,
      });
    }

    const allChannels = channelsData.data?.channels || [];

    if (allChannels.length === 0) {
      return res.status(400).json({ error: "No channels found in your Buffer account" });
    }

    // Step 2: Match channels to requested platforms
    const platformKeywords = {
      facebook: ["facebook"],
      linkedin: ["linkedin"],
    };

    const selectedChannels = allChannels.filter(c => {
      const serviceStr = ((c.service || "") + " " + (c.serviceType || "")).toLowerCase();
      return platforms.some(p =>
        platformKeywords[p]?.some(keyword => serviceStr.includes(keyword))
      );
    });

    if (selectedChannels.length === 0) {
      const available = allChannels.map(c => `${c.name} (${c.service || c.serviceType})`).join(", ");
      return res.status(400).json({
        error: `No matching channels found for: ${platforms.join(", ")}. Available: ${available}`,
      });
    }

    // Step 3: Schedule post to each matched channel
    const dueAt = new Date(scheduledAt).toISOString();
    const results = [];

    for (const channel of selectedChannels) {
      const postRes = await fetch(BUFFER_API, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: `
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                ... on PostActionSuccess {
                  post {
                    id
                    dueAt
                    status
                  }
                }
                ... on MutationError {
                  message
                }
              }
            }
          `,
          variables: {
            input: {
              channelId: channel.id,
              text,
              schedulingType: "automatic",
              mode: "customScheduled",
              dueAt,
            },
          },
        }),
      });

      const postData = await postRes.json();

      if (postData.errors) {
        results.push({ channel: channel.name, success: false, error: postData.errors[0]?.message });
      } else if (postData.data?.createPost?.message) {
        results.push({ channel: channel.name, success: false, error: postData.data.createPost.message });
      } else if (postData.data?.createPost?.post) {
        results.push({ channel: channel.name, success: true, postId: postData.data.createPost.post.id });
      } else {
        results.push({ channel: channel.name, success: false, error: "Unexpected response", raw: JSON.stringify(postData) });
      }
    }

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    if (successes.length === 0) {
      return res.status(500).json({
        error: "Failed to schedule on any platform",
        details: failures.map(f => `${f.channel}: ${f.error}`).join(". "),
      });
    }

    return res.status(200).json({
      success: true,
      message: `Scheduled for ${new Date(scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`,
      platforms: successes.map(s => s.channel),
      results,
    });

  } catch (error) {
    console.error("Buffer error:", error);
    return res.status(500).json({ error: "Scheduling failed", details: error.message });
  }
}
