import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const tokenUrl = new URL(env.VITE_DM_TOKEN_URL)
  const plorUrl  = new URL(env.VITE_PLOR_PROCESS_URL)

  // Browser calls /api/token and /api/plor (same origin = no CORS).
  // In dev: Vite proxies these to FICO server-side (server-to-server, no CORS).
  // In Vercel: api/token.js and api/plor.js serverless functions handle them.
  const proxy = {
    '/api/token': {
      target:      tokenUrl.origin,           // https://iam-svc.dms.uset2.ficoanalyticcloud.com
      changeOrigin: true,
      rewrite:     () => tokenUrl.pathname,   // /registration/rest/client/token
    },
    '/api/plor': {
      target:      plorUrl.origin,            // https://app.dms.uset2.ficoanalyticcloud.com
      changeOrigin: true,
      rewrite:     () => plorUrl.pathname + plorUrl.search,  // /5drwqhwxfl2/process/{uuid}?solutionID=...
      configure: (proxy) => {
        // PLOR has strict CORS validation - strip browser origin headers so it
        // sees a clean server-to-server request (same as Postman / Vercel function)
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.removeHeader('origin')
          proxyReq.removeHeader('referer')
          proxyReq.removeHeader('sec-fetch-site')
          proxyReq.removeHeader('sec-fetch-mode')
          proxyReq.removeHeader('sec-fetch-dest')
        })
      },
    },
  }

  return {
    plugins: [react()],
    server:  { proxy },
    preview: { proxy },
  }
})
