/**
 * Vercel serverless function: /api/token
 * Proxies the FICO IAM token request server-side to avoid CORS.
 * Equivalent to the Vite dev proxy for production deployments.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const tokenUrl = process.env.VITE_DM_TOKEN_URL
  if (!tokenUrl) {
    return res.status(500).json({ error: 'VITE_DM_TOKEN_URL not configured' })
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const upstream = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    const text = await upstream.text()
    res.status(upstream.status).send(text)
  } catch (err) {
    res.status(502).json({ error: `Upstream error: ${err.message}` })
  }
}
