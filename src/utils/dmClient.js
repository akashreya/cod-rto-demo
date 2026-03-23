import {
  DM_ENDPOINT_URL,
  DM_TOKEN_URL,
  DM_CLIENT_ID,
  DM_CLIENT_SECRET,
  EVALUATION_LOADING_MIN_MS,
} from '../../config.js'

// In-memory token cache - persists for the browser session
let _token = null
let _tokenFetchedAt = 0
const TOKEN_TTL_MS = 50 * 60 * 1000  // 50 min (FICO tokens expire after 60 min)

async function fetchFreshToken() {
  const resp = await fetch(DM_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: DM_CLIENT_ID, secret: DM_CLIENT_SECRET }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!resp.ok) throw new Error(`Token fetch failed (HTTP ${resp.status})`)
  // FICO IAM returns the raw token string as the response body (not JSON)
  return (await resp.text()).trim()
}

async function getToken() {
  const now = Date.now()
  if (_token && (now - _tokenFetchedAt) < TOKEN_TTL_MS) return _token
  _token = await fetchFreshToken()
  _tokenFetchedAt = Date.now()
  return _token
}

/**
 * Calls FICO Decision Manager and returns the parsed JSON response.
 * Automatically fetches and caches the bearer token - no manual token needed.
 * Enforces a minimum display time so the loading screen is readable.
 *
 * Throws an Error on non-2xx HTTP status or network timeout (10s).
 */
export async function callDM(payload) {
  const start = Date.now()

  let token
  try {
    token = await getToken()
  } catch (err) {
    await _enforceMinDelay(start)
    throw new Error(`Could not obtain auth token: ${err.message}`)
  }

  const doRequest = (t) => fetch(DM_ENDPOINT_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Accept':        'application/json',
      'Authorization': `Bearer ${t}`,
    },
    body:   JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  })

  let resp
  try {
    resp = await doRequest(token)
  } catch (err) {
    await _enforceMinDelay(start)
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('Request timed out after 10 seconds. Check your network or retry.')
    }
    throw new Error(err.message || 'Network error contacting Decision Manager')
  }

  // Token expired mid-session - clear cache and retry once with a fresh token
  if (resp.status === 401) {
    _token = null
    _tokenFetchedAt = 0
    try {
      token = await getToken()
      resp = await doRequest(token)
    } catch (err) {
      await _enforceMinDelay(start)
      throw new Error(`Auth failed on retry: ${err.message}`)
    }
  }

  await _enforceMinDelay(start)

  if (!resp.ok) {
    const body = await resp.text().catch(() => '')
    throw new Error(`DM returned HTTP ${resp.status}${body ? ': ' + body.slice(0, 200) : ''}`)
  }

  return resp.json()
}

async function _enforceMinDelay(startMs) {
  const elapsed = Date.now() - startMs
  const minMs   = typeof EVALUATION_LOADING_MIN_MS === 'number' ? EVALUATION_LOADING_MIN_MS : 1500
  if (elapsed < minMs) {
    await new Promise(r => setTimeout(r, minMs - elapsed))
  }
}
