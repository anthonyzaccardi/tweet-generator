// Vercel serverless function — proxies tweet posting to Twitter API v2

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Safely parse body (handles both pre-parsed objects and raw strings)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { text, access_token } = body || {};

  if (!access_token) {
    return res.status(400).json({ error: 'No access token — please disconnect and reconnect your X account.' });
  }

  if (!text) {
    return res.status(400).json({ error: 'No tweet text provided.' });
  }

  if (text.length > 280) {
    return res.status(400).json({ error: 'Tweet exceeds 280 characters.' });
  }

  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + access_token
      },
      body: JSON.stringify({ text })
    });

    // Read raw text first so we never crash on empty/non-JSON bodies
    const raw = await response.text();
    let data = {};
    try { data = JSON.parse(raw); } catch (e) { data = { raw }; }

    // Always return a readable error message
    if (!response.ok) {
      const reason =
        data.detail ||
        data.title ||
        (data.errors && data.errors[0]?.message) ||
        raw ||
        `HTTP ${response.status}`;
      return res.status(response.status).json({ error: reason, debug: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
