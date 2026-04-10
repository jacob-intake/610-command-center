export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, imageDataUrl, scheduledAt, platforms } = req.body;

  if (!text) return res.status(400).json({ error: "Caption text is required" });
  if (!scheduledAt) return res.status(400).json({ error: "Scheduled time is required" });
  if (!platforms || platforms.length === 0) return res.status(400).json({ error: "At least one platform is required" });

  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: "Buffer access token not configured" });

  try {
    // Step 1: Get connected profiles from Buffer
    const profilesRes = await fetch("https://api.bufferapp.com/1/profiles.json", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!profilesRes.ok) {
      const errText = await profilesRes.text();
      console.error("Buffer profiles error:", profilesRes.status, errText);
      return res.status(500).json({ error: `Buffer API error ${profilesRes.status}`, details: errText });
    }

    const profiles = await profilesRes.json();

    // Step 2: Filter profiles by requested platforms
    const platformMap = {
      facebook: ["facebook", "facebook_page"],
      linkedin: ["linkedin"],
    };

    const selectedProfiles = profiles.filter(p => {
      const service = p.service?.toLowerCase();
      return platforms.some(platform => platformMap[platform]?.includes(service));
    });

    if (selectedProfiles.length === 0) {
      return res.status(400).json({ error: "No matching Buffer profiles found for selected platforms" });
    }

    const profileIds = selectedProfiles.map(p => p.id);

    // Step 3: Handle image upload if provided
    let mediaParams = {};
    if (imageDataUrl) {
      try {
        const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        const uploadRes = await fetch("https://api.bufferapp.com/1/media/upload.json", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: base64Data,
            type: "image/jpeg",
          }),
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.media_id) {
            mediaParams = { media: { photo: uploadData.id || uploadData.media_id } };
          }
        }
      } catch (imgErr) {
        console.error("Image upload error:", imgErr.message);
      }
    }

    // Step 4: Schedule the post
    // Buffer requires Unix timestamp for scheduled_at
    const scheduledTimestamp = Math.floor(new Date(scheduledAt).getTime() / 1000);

    const updateBody = new URLSearchParams({
      text,
      scheduled_at: scheduledTimestamp.toString(),
      now: "false",
    });

    profileIds.forEach(id => updateBody.append("profile_ids[]", id));

    if (mediaParams.media?.photo) {
      updateBody.append("media[photo]", mediaParams.media.photo);
    }

    const scheduleRes = await fetch("https://api.bufferapp.com/1/updates/create.json", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: updateBody.toString(),
    });

    if (!scheduleRes.ok) {
      const errText = await scheduleRes.text();
      console.error("Buffer schedule error:", scheduleRes.status, errText);
      return res.status(500).json({ error: `Buffer scheduling error ${scheduleRes.status}`, details: errText });
    }

    const scheduleData = await scheduleRes.json();

    return res.status(200).json({
      success: true,
      message: `Post scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      platforms: selectedProfiles.map(p => p.formatted_service),
      bufferId: scheduleData.updates?.[0]?.id,
    });

  } catch (error) {
    console.error("Buffer error:", error);
    return res.status(500).json({ error: "Scheduling failed", details: error.message });
  }
}
