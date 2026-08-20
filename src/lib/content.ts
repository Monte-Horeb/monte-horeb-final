// ============================================================
// Editable page content resolver
// ============================================================
//
// Home, Visit, About, Ministries, Give and Contact are otherwise
// static: their copy lives in src/content/{en,es}/pages.ts and
// shipping a wording change meant editing code and waiting on a
// deploy. This resolver lets the admin panel (see
// /admin/content) override any of that copy at request time via
// the `page_content` table, while keeping the compiled-in text
// as the fallback for anything not overridden. If the table is
// empty, missing a row, or the database is briefly unreachable,
// pages render exactly as they did before this existed.
//
// Overrides are shallow-merged onto the defaults one key deep:
// a page whose default shape is `{ headline, arrival: { title,
// body } }` gets an override for `arrival` by supplying the
// whole `{ title, body }` object, not by patching just `title`.
// The admin form always writes complete objects, so this is not
// a limitation in practice - it just keeps the merge logic (and
// the SQL) simple.

import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import type { Lang } from '@/types'

const DEFAULTS = { en, es } as const

/** Page keys backed by the page_content table. Keep in sync with
 *  src/content/editable-schema.ts, which drives the admin form. */
export type EditablePageKey =
  | 'home'
  | 'visit'
  | 'about'
  | 'ministries'
  | 'give'
  | 'contact'

function shallowMergeOverrides<T extends Record<string, any>>(
  defaults: T,
  overrides: Record<string, any> | null | undefined
): T {
  if (!overrides || typeof overrides !== 'object') return defaults
  const merged: Record<string, any> = { ...defaults }
  for (const key of Object.keys(overrides)) {
    const value = overrides[key]
    // Ignore empty-string/null overrides so a field an admin never
    // touched (or cleared back out) falls through to the default
    // instead of rendering blank.
    if (value === null || value === undefined) continue
    if (typeof value === 'string' && value.trim() === '') continue
    merged[key] = value
  }
  return merged as T
}

/**
 * Resolve the live copy for one page in one language: compiled-in
 * defaults with any admin overrides layered on top.
 */
export async function getPageContent<K extends EditablePageKey>(
  pageKey: K,
  lang: Lang
): Promise<(typeof en)[K]> {
  const defaults = DEFAULTS[lang][pageKey]

  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('page_content')
      .select('content_en, content_es')
      .eq('page_key', pageKey)
      .maybeSingle()

    const overrides = data ? (lang === 'es' ? data.content_es : data.content_en) : null
    return shallowMergeOverrides(defaults as Record<string, any>, overrides) as (typeof en)[K]
  } catch {
    // No page_content table yet (migration not run), no database
    // configured, or a transient error - the static copy still works.
    return defaults
  }
}

/** Raw current override JSON for both languages, used by the admin
 *  editor to prefill the form. Unlike getPageContent this does NOT
 *  merge in defaults for missing keys - the caller does that so it
 *  can tell "using the default" apart from "admin set it to this". */
export async function getPageContentOverrides(pageKey: EditablePageKey) {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('page_content')
      .select('content_en, content_es')
      .eq('page_key', pageKey)
      .maybeSingle()
    return {
      content_en: (data?.content_en as Record<string, any>) ?? {},
      content_es: (data?.content_es as Record<string, any>) ?? {},
    }
  } catch {
    return { content_en: {}, content_es: {} }
  }
}
