'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getPath, setPath } from '@/lib/dotpath'
import type { ContentField } from '@/content/editable-schema'
import type { EditablePageKey } from '@/lib/content'

interface PageContentFormProps {
  pageKey: EditablePageKey
  pageLabel: string
  fields: ContentField[]
  /** What's actually saved as an override right now (may be partial/empty). */
  savedEn: Record<string, any>
  savedEs: Record<string, any>
  /** Compiled-in fallback text, used to prefill anything not overridden. */
  defaultsEn: Record<string, any>
  defaultsEs: Record<string, any>
}

type FieldValues = Record<string, { en: string; es: string }>

function buildInitialValues(
  fields: ContentField[],
  savedEn: Record<string, any>,
  savedEs: Record<string, any>,
  defaultsEn: Record<string, any>,
  defaultsEs: Record<string, any>
): FieldValues {
  const values: FieldValues = {}
  for (const field of fields) {
    const en = getPath(savedEn, field.path) ?? getPath(defaultsEn, field.path) ?? ''
    const es = getPath(savedEs, field.path) ?? getPath(defaultsEs, field.path) ?? ''
    values[field.path] = { en: String(en), es: String(es) }
  }
  return values
}

/**
 * Editor for one page's worth of copy in both languages at once. Unlike
 * ResourceForm (one flat DB row per record), this writes a JSON blob per
 * language into page_content, addressed by dot-path - see
 * src/lib/dotpath.ts and src/lib/content.ts for how that's resolved back
 * into the shape the public pages expect.
 */
export default function PageContentForm({
  pageKey,
  pageLabel,
  fields,
  savedEn,
  savedEs,
  defaultsEn,
  defaultsEs,
}: PageContentFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<FieldValues>(() =>
    buildInitialValues(fields, savedEn, savedEs, defaultsEn, defaultsEs)
  )
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const set = (path: string, lang: 'en' | 'es', value: string) =>
    setValues((v) => ({ ...v, [path]: { ...v[path], [lang]: value } }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const content_en: Record<string, any> = {}
    const content_es: Record<string, any> = {}
    for (const field of fields) {
      setPath(content_en, field.path, values[field.path]?.en ?? '')
      setPath(content_es, field.path, values[field.path]?.es ?? '')
    }

    const supabase = createClient()
    const { error: saveError } = await supabase
      .from('page_content')
      .upsert({ page_key: pageKey, content_en, content_es }, { onConflict: 'page_key' })

    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }
    setSavedAt(Date.now())
    router.refresh()
  }

  const handleReset = async () => {
    if (!confirm(`Reset every field on ${pageLabel} back to the default text? This cannot be undone.`)) return
    setResetting(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase
      .from('page_content')
      .upsert({ page_key: pageKey, content_en: {}, content_es: {} }, { onConflict: 'page_key' })

    setResetting(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setValues(buildInitialValues(fields, {}, {}, defaultsEn, defaultsEs))
    setSavedAt(Date.now())
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 px-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
        <span>Field</span>
        <span>English</span>
        <span>Español</span>
      </div>

      <div className="space-y-4">
        {fields.map((field) => {
          const Comp = field.type === 'textarea' ? 'textarea' : 'input'
          return (
            <div key={field.path} className="card card-body grid sm:grid-cols-[1fr_1fr_1fr] gap-4 items-start">
              <label className="text-sm font-semibold text-neutral-700 pt-2">{field.label}</label>
              <Comp
                className={`input ${field.type === 'textarea' ? 'min-h-[90px] resize-y' : ''}`}
                value={values[field.path]?.en ?? ''}
                onChange={(e) => set(field.path, 'en', e.target.value)}
              />
              <Comp
                className={`input ${field.type === 'textarea' ? 'min-h-[90px] resize-y' : ''}`}
                value={values[field.path]?.es ?? ''}
                onChange={(e) => set(field.path, 'es', e.target.value)}
              />
            </div>
          )
        })}
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2 sticky bottom-4">
        <button type="submit" disabled={saving || resetting} className="btn btn-primary shadow-lg">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving || resetting}
          className="btn btn-outline"
        >
          {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          Reset page to defaults
        </button>
        {savedAt && !saving && (
          <span className="text-sm text-green-700">Saved - live on the site now.</span>
        )}
      </div>
    </form>
  )
}
