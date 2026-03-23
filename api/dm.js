/**
 * Vercel serverless function: /api/dm
 * Proxies the FICO Decision Manager POST request server-side to avoid CORS.
 * Equivalent to the Vite dev proxy for production deployments.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const dmUrl = process.env.VITE_DM_ENDPOINT_URL
  if (!dmUrl) {
    return res.status(500).json({ error: 'VITE_DM_ENDPOINT_URL not configured' })
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const upstream = await fetch(dmUrl, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        'Authorization': req.headers.authorization || '',
      },
      body,
    })
    const text = await upstream.text()
    res.status(upstream.status).send(text)
  } catch (err) {
    res.status(502).json({ error: `Upstream error: ${err.message}` })
  }
}
