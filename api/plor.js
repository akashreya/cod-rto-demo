/**
 * Vercel serverless function: /api/plor
 * Proxies the FICO PLOR main process POST request server-side to avoid CORS.
 * Equivalent to the Vite dev proxy for production deployments.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const plorUrl = process.env.VITE_PLOR_PROCESS_URL
  if (!plorUrl) {
    return res.status(500).json({ error: 'VITE_PLOR_PROCESS_URL not configured' })
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const upstream = await fetch(plorUrl, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Accept':        'application/vnd.com.fico.platform.orchestration.v1_0+json',
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
