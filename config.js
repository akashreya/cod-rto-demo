// COD/RTO Demo - reads all configuration from .env (VITE_* variables).
// Never hardcode credentials here.
//
// The browser calls /proxy/dm and /proxy/token (relative paths, same origin).
// Vite dev/preview server proxies these to FICO externally - no CORS issues.

export const DM_ENDPOINT_URL          = import.meta.env.VITE_DM_PROXY_URL
export const DM_TOKEN_URL             = import.meta.env.VITE_DM_TOKEN_PROXY_URL
export const DM_CLIENT_ID             = import.meta.env.VITE_DM_CLIENT_ID
export const DM_CLIENT_SECRET         = import.meta.env.VITE_DM_CLIENT_SECRET
export const EVALUATION_LOADING_MIN_MS = Number(import.meta.env.VITE_EVALUATION_LOADING_MIN_MS) || 1500
export const SOURCE_PLATFORM          = import.meta.env.VITE_SOURCE_PLATFORM || 'MYNTRA'
