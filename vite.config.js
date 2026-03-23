import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const tokenUrl = new URL(env.VITE_DM_TOKEN_URL)
  const dmUrl    = new URL(env.VITE_DM_ENDPOINT_URL)

  // Browser calls /proxy/token and /proxy/dm (same origin = no CORS).
  // Vite server rewrites and forwards the request to FICO server-side.
  // Server-to-server calls have no CORS restrictions.
  const proxy = {
    '/proxy/token': {
      target:      tokenUrl.origin,           // https://iam-svc.dms.uset2.ficoanalyticcloud.com
      changeOrigin: true,
      rewrite:     () => tokenUrl.pathname,   // /registration/rest/client/token
    },
    '/proxy/dm': {
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
