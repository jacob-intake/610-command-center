// Runs on schedule via cron-job.org
// Processes unanswered reviews across all 610 locations
// Auto-replies to 3-5 star reviews, queues 1-2 star for approval

const GMB_LOCATIONS = [
  { id: "san-diego", city: "San Diego, CA", locationName: null },
  { id: "houston", city: "Houston, TX", locationName: null },
  { id: "mcallen", city: "McAllen, TX", locationName: null },
  { id: "austin", city: "Austin, TX", locationName: null },
  { id: "stafford", city: "Stafford, VA", locationName: null },
];

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cronSecret = req.headers["x-cron-secret"] || req.query.secret;
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const results = [];

  for (const location of GMB_LOCATIONS) {
    if (!location.locationName) {
      results.push({ location: location.city, skipped: true, reason: "Location ID not configured" });
      continue;
    }

    try {
      const res2 = await fetch(`${process.env.VERCEL_URL || "https://610-command-center.vercel.app"}/api/gmb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "processReviews",
          locationName: location.locationName,
          locationCity: location.city,
          autoReply: true,
        }),
      });

      const data = await res2.json();
      results.push({ location: location.city, ...data });
    } catch (err) {
      results.push({ location: location.city, error: err.message });
    }
  }

  return res.status(200).json({ success: true, processedAt: new Date().toISOString(), results });
}
