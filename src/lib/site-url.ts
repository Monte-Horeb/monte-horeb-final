// ============================================================
// Defensive NEXT_PUBLIC_SITE_URL reader
// ============================================================
//
// Root cause of the Aug 2026 build outage: NEXT_PUBLIC_SITE_URL was set in
// Vercel to `` `https://sdcmontehoreb.com` `` - backticks included, almost
// certainly pasted straight from a code snippet. `new URL()` doesn't accept
// that, and because src/app/[lang]/layout.tsx calls `new URL(...)` inside
// generateMetadata (which every single page under [lang] inherits), one bad
// env var value failed the static export for all 69 pages at once.
//
// This file exists so a stray backtick, quote, or trailing slash in that
// env var degrades gracefully instead of taking the whole build down - and
// so the same mistake doesn't repeat itself every time this codebase is
// cloned for a new church.

const FALLBACK_SITE_URL = 'https://sdcmontehoreb.com'

/** Strips wrapping backticks/quotes and whitespace, then validates the
 *  result is actually a URL. Returns undefined (not the fallback) when the
 *  env var is unset or unusable, so callers can chain their own fallback
 *  (e.g. the request's own origin) ahead of a hardcoded default. */
export function sanitizeSiteUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  const cleaned = raw.trim().replace(/^[`'"]+|[`'"]+$/g, '').replace(/\/+$/, '')
  if (!cleaned) return undefined
  try {
    return new URL(cleaned).toString().replace(/\/$/, '')
  } catch {
    return undefined
  }
}

/** Always returns a usable absolute URL: the cleaned env var if it's valid,
 *  otherwise the hardcoded production default. Use this anywhere a value is
 *  required unconditionally (metadataBase, structured data, share links) -
 *  never use `new URL(process.env.NEXT_PUBLIC_SITE_URL)` directly. */
export function getSiteUrl(): string {
  return sanitizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? FALLBACK_SITE_URL
}
