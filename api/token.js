// Vercel serverless function — proxies the Twitter OAuth token exchange
// Uses Basic Auth with client_secret (required for confidential clients on X)

const CLIENT_ID     = 'VlBzdVhzNDU1Q0tXWjRDbmFzS3E6MTpjaQ';
const CLIENT_SECRET = 'YZZzTfS7o701z3za4j-690HlTxRdJXaBdy1Jef-bD01TYn77pt';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { code, code_verifier, redirect_uri } = body || {};

  if (!code || !code_verifier || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // X treats apps with a client_secret as confidential clients.
  // Confidential clients must authenticate via HTTP Basic Auth.
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  try {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri,
        code_verifier
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
