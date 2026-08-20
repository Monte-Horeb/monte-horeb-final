/** Tiny dot-path helpers so the page-content editor can address nested
 *  fields (e.g. `arrival.title`, `beliefs.0.body`) without a bespoke form
 *  per page. Array indices are just numeric path segments. */

export function getPath(obj: any, path: string): any {
  if (obj == null) return undefined
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

export function setPath(obj: Record<string, any>, path: string, value: any): void {
  const keys = path.split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const nextIsIndex = /^\d+$/.test(keys[i + 1])
    if (cur[key] == null || typeof cur[key] !== 'object') {
      cur[key] = nextIsIndex ? [] : {}
    }
    cur = cur[key]
  }
  cur[keys[keys.length - 1]] = value
}
