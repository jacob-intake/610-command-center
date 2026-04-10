const BUFFER_API = "https://api.buffer.com/graphql";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, imageDataUrl, scheduledAt, platforms } = req.body;

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
    // Step 1: Get all channels for this organization
    const channelsQuery = {
      query: `
        query GetChannels($orgId: String!) {
          channels(organizationId: $orgId) {
            id
            name
            service
            serviceType
          }
        }
      `,
      variables: { orgId },
    };

    const channelsRes = await fetch(BUFFER_API, {
      method: "POST",
      headers,
      body: JSON.stringify(channelsQuery),
    });

    if (!channelsRes.ok) {
      const errText = await channelsRes.text();
      console.error("Buffer channels error:", channelsRes.status, errText);
      return res.status(500).json({ error: `Buffer API error ${channelsRes.status}`, details: errText });
    }

    const channelsData = await channelsRes.json();

    if (channelsData.errors) {
      console.error("Buffer GraphQL errors:", JSON.stringify(channelsData.errors));
      return res.status(500).json({ error: "Buffer GraphQL error", details: channelsData.errors[0]?.message });
    }

    const allChannels = channelsData.data?.channels || [];

    // Step 2: Filter channels by requested platforms
    const platformMap = {
      facebook: ["facebook", "facebook_page", "facebookPage"],
      linkedin: ["linkedin", "linkedinPage"],
    };

    const selectedChannels = allChannels.filter(c => {
      const service = (c.service || c.serviceType || "").toLowerCase();
      return platforms.some(platform =>
        platformMap[platform]?.some(p => service.includes(p.toLowerCase()))
      );
    });

    if (selectedChannels.length === 0) {
      return res.status(400).json({
        error: "No matching channels found. Available channels: " + allChannels.map(c => `${c.name} (${c.service || c.serviceType})`).join(", "),
      });
    }

    // Step 3: Schedule post to each selected channel
    const scheduledResults = [];
    const scheduledTime = new Date(scheduledAt).toISOString();

    for (const channel of selectedChannels) {
      const createMutation = {
        query: `
          mutation CreatePost($input: CreatePostInput!) {
            createPost(input: $input) {
              post {
                id
                status
                scheduledAt
              }
              errors {
                message
              }
            }
          }
        `,
        variables: {
          input: {
            organizationId: orgId,
            channelId: channel.id,
            text,
            scheduledAt: scheduledTime,
          },
        },
      };

      const postRes = await fetch(BUFFER_API, {
        method: "POST",
        headers,
        body: JSON.stringify(createMutation),
      });

      const postData = await postRes.json();

      if (postData.errors || postData.data?.createPost?.errors?.length > 0) {
        const errMsg = postData.errors?.[0]?.message || postData.data?.createPost?.errors?.[0]?.message;
        console.error(`Buffer post error for ${channel.name}:`, errMsg);
        scheduledResults.push({ channel: channel.name, success: false, error: errMsg });
      } else {
        scheduledResults.push({ channel: channel.name, success: true, postId: postData.data?.createPost?.post?.id });
      }
    }

    const successCount = scheduledResults.filter(r => r.success).length;
    const successChannels = scheduledResults.filter(r => r.success).map(r => r.channel);

    if (successCount === 0) {
      return res.status(500).json({
        error: "Failed to schedule on any platform",
        details: scheduledResults,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Post scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      platforms: successChannels,
      results: scheduledResults,
    });

  } catch (error) {
    console.error("Buffer error:", error);
    return res.status(500).json({ error: "Scheduling failed", details: error.message });
  }
}
