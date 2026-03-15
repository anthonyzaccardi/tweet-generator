// Vercel serverless function — proxies tweet posting to Twitter API v2
// This runs server-side so it avoids browser CORS restrictions

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, access_token } = req.body;

  if (!text || !access_token) {
    return res.status(400).json({ error: 'Missing text or access_token' });
  }

  if (text.length > 280) {
    return res.status(400).json({ error: 'Tweet exceeds 280 characters' });
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

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
