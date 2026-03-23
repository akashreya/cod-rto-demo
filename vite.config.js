import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const tokenUrl = new URL(env.VITE_DM_TOKEN_URL)
  const dmUrl    = new URL(env.VITE_DM_ENDPOINT_URL)

  // Browser calls /api/token and /api/dm (same origin = no CORS).
  // In dev: Vite proxies these to FICO server-side (server-to-server, no CORS).
  // In Vercel: api/token.js and api/dm.js serverless functions handle them.
  const proxy = {
    '/api/token': {
      target:      tokenUrl.origin,           // https://iam-svc.dms.uset2.ficoanalyticcloud.com
      changeOrigin: true,
      rewrite:     () => tokenUrl.pathname,   // /registration/rest/client/token
    },
    '/api/dm': {
      target:      dmUrl.origin,              // https://app.dms.uset2.ficoanalyticcloud.com
      changeOrigin: true,
      rewrite:     () => dmUrl.pathname + dmUrl.search,  // /qr0nt2pjqj/.../processWithDecisionFlow?solutionID=...
    },
  }

  return {
    plugins: [react()],
    server:  { proxy },
    preview: { proxy },
  }
})
