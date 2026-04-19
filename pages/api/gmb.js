async function getGoogleAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) throw new Error("Google credentials not configured");

  let privateKey = rawKey.replace(/\\n/g, "\n").replace(/^["']|["']$/g, "").trim();
  const pemLines = privateKey.split("\n");
  const pemHeader = pemLines[0];
  const pemFooter = pemLines[pemLines.length - 1];
  const pemBody = pemLines.slice(1, pemLines.length - 1).join("");
  if (pemBody.length > 64 && !pemBody.includes(" ")) {
    const chunks = pemBody.match(/.{1,64}/g) || [];
    privateKey = [pemHeader, ...chunks, pemFooter].join("\n") + "\n";
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/business.manage",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const header = { alg: "RS256", typ: "JWT" };
  function base64url(str) {
    return Buffer.from(str).toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign({ key: privateKey, format: "pem" }, "base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const jwt = `${signingInput}.${signature}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error(`Token error: ${JSON.stringify(tokenData)}`);
  return tokenData.access_token;
}

async function createGmbPost(accessToken, locationName, postData) {
  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${locationName}/localPosts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    }
  );
  return res.json();
}

async function getReviews(accessToken, locationName) {
  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${locationName}/reviews?orderBy=updateTime+desc&pageSize=10`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.json();
}

async function replyToReview(accessToken, reviewName, comment) {
  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment }),
    }
  );
  return res.json();
}

async function generateReviewResponse(review, locationCity) {
  const starRating = review.starRating;
  const reviewText = review.comment || "";
  const reviewerName = review.reviewer?.displayName || "valued customer";

  const prompt = `You are responding to a Google review for 610 Marketing and PR, a digital marketing and AI consulting agency in ${locationCity}.

Reviewer: ${reviewerName}
Star Rating: ${starRating} out of 5
Review: "${reviewText}"

Write a professional, genuine, and personalized response to this review. 

Rules:
- 2-4 sentences maximum
- Thank them by first name if available
- For 4-5 star reviews: express genuine gratitude, reference something specific from their review if possible, invite them back
- For 3 star reviews: thank them, acknowledge their feedback, offer to make it right with contact info (info@610marketing.com)
- For 1-2 star reviews: apologize sincerely, take responsibility, provide contact info to resolve (info@610marketing.com), do not be defensive
- No marketing speak, no hashtags, no emojis
- Sound human, not like a template
- Sign off as "The 610 Marketing Team"

Return only the response text. Nothing else.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  return data.content?.[0]?.text?.trim() || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, locationName, locationCity, post, reviewName, autoReply } = req.body;

  try {
    const accessToken = await getGoogleAccessToken();

    if (action === "createPost") {
      const postData = {
        languageCode: "en-US",
        summary: post.text,
        callToAction: post.ctaType ? {
          actionType: post.ctaType,
          url: post.ctaUrl || "https://610marketing.com",
        } : undefined,
        topicType: "STANDARD",
      };

      const result = await createGmbPost(accessToken, locationName, postData);
      return res.status(200).json({ success: !result.error, result });
    }

    if (action === "getReviews") {
      const reviews = await getReviews(accessToken, locationName);
      return res.status(200).json({ success: true, reviews: reviews.reviews || [], totalReviewCount: reviews.totalReviewCount });
    }

    if (action === "generateResponse") {
      const response = await generateReviewResponse({ starRating: req.body.starRating, comment: req.body.reviewText, reviewer: { displayName: req.body.reviewerName } }, locationCity);
      return res.status(200).json({ success: true, response });
    }

    if (action === "replyToReview") {
      const result = await replyToReview(accessToken, reviewName, req.body.comment);
      return res.status(200).json({ success: !result.error, result });
    }

    if (action === "processReviews") {
      // Auto-process all unanswered reviews for a location
      const reviewsData = await getReviews(accessToken, locationName);
      const reviews = reviewsData.reviews || [];
      const unanswered = reviews.filter(r => !r.reviewReply);

      const processed = [];
      for (const review of unanswered) {
        const stars = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[review.starRating] || 3;
        const response = await generateReviewResponse({ starRating: stars, comment: review.comment, reviewer: review.reviewer }, locationCity);

        if (autoReply && stars >= 3) {
          // Auto-post responses for 3+ star reviews
          await replyToReview(accessToken, review.name, response);
          processed.push({ reviewName: review.name, stars, response, autoPosted: true });
        } else {
          // Queue for approval on 1-2 star reviews
          processed.push({ reviewName: review.name, stars, response, autoPosted: false, needsApproval: stars < 3 });
        }
      }

      return res.status(200).json({ success: true, processed, total: unanswered.length });
    }

    return res.status(400).json({ error: "Invalid action" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
