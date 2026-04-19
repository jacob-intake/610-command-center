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

export default async function handler(req, res) {
  try {
    const accessToken = await getGoogleAccessToken();

    // Get all accounts
    const accountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!accountsRes.ok) {
      const errText = await accountsRes.text();
      return res.status(500).json({ error: `Accounts API error: ${accountsRes.status}`, details: errText });
    }

    const accountsData = await accountsRes.json();
    const accounts = accountsData.accounts || [];

    if (accounts.length === 0) {
      return res.status(200).json({ message: "No GMB accounts found", accounts: [] });
    }

    // Get locations for each account
    const allLocations = [];
    for (const account of accounts) {
      const locRes = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (locRes.ok) {
        const locData = await locRes.json();
        const locations = (locData.locations || []).map(l => ({
          accountName: account.name,
          locationName: l.name,
          title: l.title,
          city: l.storefrontAddress?.locality,
          state: l.storefrontAddress?.administrativeArea,
        }));
        allLocations.push(...locations);
      }
    }

    return res.status(200).json({ accounts, locations: allLocations });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
