const VERTICALS = [
  "AI agents for small business",
  "digital marketing trends",
  "SEO and AEO strategies",
  "GEO generative engine optimization",
  "content creation and marketing",
  "AI automation for business workflows",
  "website development and design",
  "podcast production and marketing",
];

async function getGoogleAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !rawKey) throw new Error("Google credentials not configured");

  // Normalize the private key - handle all Vercel storage formats
  let privateKey = rawKey;
  // Replace escaped newlines with real newlines
  privateKey = privateKey.replace(/\\n/g, "\n");
  // Remove any surrounding quotes that might have been included
  privateKey = privateKey.replace(/^["']|["']$/g, "");
  privateKey = privateKey.trim();
  // Force correct PEM structure - ensure newline after header and before footer
  privateKey = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
    .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----")
    .replace(/\n\n/g, "\n");
  // Break the base64 body into 64-char lines if it is one long string
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
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const header = { alg: "RS256", typ: "JWT" };

  function base64url(str) {
    return Buffer.from(str).toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const { createSign } = await import("crypto");

  let signature;
  try {
    const sign = createSign("RSA-SHA256");
    sign.update(signingInput);
    signature = sign.sign({ key: privateKey, format: "pem" }, "base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } catch (keyErr) {
    throw new Error(`Private key error: ${keyErr.message}. Key starts with: ${privateKey.substring(0, 50)}`);
  }

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

async function researchTrendingTopics() {
  const currentDate = new Date();
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  const monthName = nextMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const prompt = `You are a content strategist for 610 Marketing and PR, a boutique digital marketing and AI implementation agency in San Diego.

Research and identify the top trending topics for ${monthName} content across these verticals:
${VERTICALS.map((v, i) => `${i + 1}. ${v}`).join("\n")}

Based on current industry momentum, recent developments, and what small business owners are actively searching for, identify the single best primary topic and secondary topic for a month of content.

Return ONLY a valid JSON object with no other text:
{
  "month": "${monthName}",
  "primaryTopic": "the single best primary topic as a short phrase",
  "secondaryTopic": "the best complementary secondary topic as a short phrase",
  "contentNotes": "2-3 sentences explaining why these topics are trending now, what angle to take, and any specific hooks or news hooks to leverage. Written as instructions for a content creator.",
  "trendingTopics": [
    "topic 1",
    "topic 2",
    "topic 3",
    "topic 4",
    "topic 5"
  ]
}

Return only the JSON. Nothing else.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const textContent = data.content?.find(c => c.type === "text");
  if (!textContent) throw new Error("No text response from research");

  let raw = textContent.text.trim();
  raw = raw.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();

  // Extract JSON object even if there is text before or after it
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    raw = raw.substring(jsonStart, jsonEnd + 1);
  }

  return JSON.parse(raw);
}

async function writeToGoogleSheet(topics) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("Google Sheet ID not configured");

  const accessToken = await getGoogleAccessToken();

  // First get existing rows to find the next empty row
  const getRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:A`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const getData = await getRes.json();
  const existingRows = getData.values?.length || 1;
  const nextRow = existingRows + 1;

  const values = [[
    topics.month,
    topics.primaryTopic,
    topics.secondaryTopic,
    topics.contentNotes,
    "Ready",
  ]];

  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A${nextRow}:E${nextRow}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!writeRes.ok) {
    const errText = await writeRes.text();
    throw new Error(`Sheet write error: ${writeRes.status} ${errText}`);
  }

  return await writeRes.json();
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // POST from the frontend UI is always allowed (user is already authenticated via ACCESS_PASSWORD)
  // GET requests from cron jobs require the CRON_SECRET
  if (req.method === "GET") {
    const cronSecret = req.headers["x-cron-secret"] || req.query.secret;
    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret && cronSecret !== expectedSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    console.log("Starting trending topics research...");
    const topics = await researchTrendingTopics();
    console.log("Topics researched:", topics.primaryTopic, "/", topics.secondaryTopic);

    await writeToGoogleSheet(topics);
    console.log("Written to Google Sheet successfully");

    return res.status(200).json({
      success: true,
      message: `Trending topics for ${topics.month} written to Google Sheet`,
      month: topics.month,
      primaryTopic: topics.primaryTopic,
      secondaryTopic: topics.secondaryTopic,
      contentNotes: topics.contentNotes,
      trendingTopics: topics.trendingTopics,
    });

  } catch (error) {
    console.error("Trending topics error:", error);
    return res.status(500).json({ error: error.message });
  }
}
