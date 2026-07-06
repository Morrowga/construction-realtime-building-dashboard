// src/lib/auth.ts
import type { AuthTokens } from '@/types/api'

const ACCESS_KEY = 'cd_access_token'
const REFRESH_KEY = 'cd_refresh_token'

export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_KEY, tokens.access_token)
  if (tokens.refresh_token) localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_KEY)
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// ── JWT expiry ──────────────────────────────────────────────────────────────
// Client-side only, no signature verification — we're not trusting this for
// security, just reading the `exp` claim so the UI can react to an expired
// token without waiting for an API call to fail first.

interface DecodedJwt {
  exp?: number // seconds since epoch
  [key: string]: unknown
}

function decodeJwt(token: string): DecodedJwt | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    // base64url → base64
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = typeof window !== 'undefined'
      ? atob(b64)
      : Buffer.from(b64, 'base64').toString('utf8')
    return JSON.parse(json) as DecodedJwt
  } catch {
    return null
  }
}

/**
 * Returns true if the token is missing, malformed, or expired.
 * `skewSeconds` treats a token as "expired" slightly before its real
 * expiry so we react before a request would actually get a 401.
 */
export function isTokenExpired(token: string | null | undefined, skewSeconds = 10): boolean {
  if (!token) return true
  const decoded = decodeJwt(token)
  if (!decoded?.exp) return true
  const nowSeconds = Date.now() / 1000
  return decoded.exp - skewSeconds <= nowSeconds
}