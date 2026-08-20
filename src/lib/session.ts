/**
 * Anonymous session id, shared by course progress tracking and the
 * book store cart. Both features previously used different localStorage
 * keys, so a cart written by one was invisible to the other.
 *
 * Browser-only: returns '' during SSR so callers can guard.
 */
const SESSION_KEY = 'monte_session_id'

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = window.localStorage.getItem(SESSION_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(SESSION_KEY, id)
  }
  return id
}
