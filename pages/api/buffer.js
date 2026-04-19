const BUFFER_API = "https://api.buffer.com";

const CHANNEL_MAP = {
  facebook: ["facebook"],
  linkedin: ["linkedin"],
  instagram: ["instagram"],
};

const PLATFORM_METADATA = {
  facebook: 'metadata: { facebook: { type: post } },',
  instagram: 'metadata: { instagram: { type: post, shouldShareToFeed: true } },',
  linkedin: '',
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text, imageUrl, imageUrls, videoUrl, scheduledAt, platforms } = req.body;

  if (!text) return res.status(400).json({ error: "Caption text is required" });
  if (!scheduledAt) return res.status(400).json({ error: "Scheduled time is required" });
  if (!platforms || platforms.length === 0) return res.status(400).json({ error: "At least one platform is required" });

  const token = process.env.BUFFER_ACCESS_TOKEN;
  const orgId = process.env.BUFFER_ORG_ID;
  if (!token) return res.status(500).json({ error: "Buffer access token not configured" });
  if (!orgId) return res.status(500).json({ error: "Buffer organization ID not configured" });

  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  try {
    // Fetch channels
    const channelsRes = await fetch(BUFFER_API, {
      method: "POST", headers,
      body: JSON.stringify({
        query: `query GetChannels { channels(input: { organizationId: "${orgId}" }) { id name service } }`,
      }),
    });
    const channelsData = await channelsRes.json();
    if (channelsData.errors) return res.status(500).json({ error: channelsData.errors[0]?.message });

    const allChannels = channelsData.data?.channels || [];
    const selectedChannels = allChannels.filter(c =>
      platforms.some(p => CHANNEL_MAP[p]?.includes((c.service || "").toLowerCase()))
    );

    if (selectedChannels.length === 0) {
      return res.status(400).json({
        error: `No channels matched for: ${platforms.join(", ")}`,
        available: allChannels.map(c => `${c.name} (${c.service})`).join(", "),
      });
    }

    const dueAt = new Date(scheduledAt).toISOString();
    const results = [];

    for (const channel of selectedChannels) {
      // Build assets block - supports video, single image, or carousel
      let assetsBlock = "";
      if (videoUrl) {
        assetsBlock = `, assets: { videos: [{ url: ${JSON.stringify(videoUrl)} }] }`;
      } else if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
        const imgList = imageUrls.map(u => `{ url: ${JSON.stringify(u)} }`).join(", ");
        assetsBlock = `, assets: { images: [${imgList}] }`;
      } else if (imageUrl) {
        assetsBlock = `, assets: { images: [{ url: ${JSON.stringify(imageUrl)} }] }`;
      }

      const service = (channel.service || "").toLowerCase();
      const isFacebook = service === "facebook";
      const isInstagram = service === "instagram";
      const scheduleMode = (isFacebook || isInstagram) ? "addToQueue" : "customScheduled";
      const dueAtField = (isFacebook || isInstagram) ? "" : `dueAt: "${dueAt}",`;

      // For video posts on Instagram use reel type, Facebook use post type
      let metadataField = PLATFORM_METADATA[service] || "";
      if (videoUrl && isInstagram) {
        metadataField = 'metadata: { instagram: { type: reel, shouldShareToFeed: true } },';
      } else if (videoUrl && isFacebook) {
        metadataField = 'metadata: { facebook: { type: reel } },';
      }

      const mutation = `
        mutation CreatePost {
          createPost(input: {
            channelId: "${channel.id}",
            text: ${JSON.stringify(text)},
            schedulingType: automatic,
            mode: ${scheduleMode},
            ${dueAtField}
            ${metadataField}
            ${assetsBlock}
          }) {
            ... on PostActionSuccess { post { id dueAt status } }
            ... on MutationError { message }
          }
        }
      `;

      const postRes = await fetch(BUFFER_API, { method: "POST", headers, body: JSON.stringify({ query: mutation }) });
      const postData = await postRes.json();

      if (postData.errors || postData.data?.createPost?.message) {
        const errMsg = postData.errors?.[0]?.message || postData.data?.createPost?.message;

        // Retry without image if image caused the failure
        if (imageUrl && errMsg) {
          const mutationNoImg = `
            mutation CreatePost {
              createPost(input: {
                channelId: "${channel.id}",
                text: ${JSON.stringify(text)},
                schedulingType: automatic,
                mode: ${scheduleMode},
                ${dueAtField}
                ${metadataField}
              }) {
                ... on PostActionSuccess { post { id dueAt status } }
                ... on MutationError { message }
              }
            }
          `;
          const retryRes = await fetch(BUFFER_API, { method: "POST", headers, body: JSON.stringify({ query: mutationNoImg }) });
          const retryData = await retryRes.json();
          if (retryData.data?.createPost?.post) {
            results.push({ channel: channel.name, success: true, note: "text only" });
          } else {
            results.push({ channel: channel.name, success: false, error: errMsg });
          }
        } else {
          results.push({ channel: channel.name, success: false, error: errMsg });
        }
      } else if (postData.data?.createPost?.post) {
        results.push({ channel: channel.name, success: true, hasImage: !!imageUrl, postId: postData.data.createPost.post.id });
      } else {
        // Log full response for debugging
        console.error(`Unexpected response for ${channel.name}:`, JSON.stringify(postData));
        results.push({ channel: channel.name, success: false, error: "Unexpected response", raw: JSON.stringify(postData).substring(0, 400) });
      }
    }

    const successes = results.filter(r => r.success);
    if (successes.length === 0) {
      return res.status(500).json({
        error: "Failed to schedule on any platform",
        details: results.map(r => `${r.channel}: ${r.error}`).join(". "),
        results,
      });
    }

    // Even on partial success, include failures in response for visibility
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.error("Some channels failed:", JSON.stringify(failures));
    }
    // Include failure detail in success response for visibility
    if (failures.length > 0) {
      return res.status(200).json({
        success: true,
        message: `Scheduled for ${new Date(scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`,
        platforms: successes.map(s => s.channel),
        failures: failures.map(f => ({ channel: f.channel, error: f.error, raw: f.raw })),
        results,
      });
    }

    const withImage = successes.some(r => r.hasImage);
    return res.status(200).json({
      success: true,
      message: `Scheduled for ${new Date(scheduledAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}${withImage ? " with image" : ""}`,
      platforms: successes.map(s => s.channel),
      results,
    });

  } catch (error) {
    return res.status(500).json({ error: "Scheduling failed", details: error.message });
  }
}
