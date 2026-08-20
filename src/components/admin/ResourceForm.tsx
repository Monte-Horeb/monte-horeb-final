'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'datetime'
  | 'checkbox'
  | 'select'

export interface Field {
  name: string
  label: string
  type?: FieldType
  required?: boolean
  placeholder?: string
  help?: string
  /** Grid width: 'full' spans both columns. */
  width?: 'half' | 'full'
  options?: { value: string; label: string }[]
  defaultValue?: string | number | boolean
}

interface ResourceFormProps {
  table: string
  fields: Field[]
  /** Existing row when editing; omit to create. */
  record?: Record<string, any>
  /** Where to send the user after a successful save. */
  redirectTo: string
  submitLabel?: string
}

function initialValue(field: Field, record?: Record<string, any>) {
  const existing = record?.[field.name]
  if (existing !== undefined && existing !== null) {
    if (field.type === 'datetime' && typeof existing === 'string') {
      // <input type="datetime-local"> wants 'YYYY-MM-DDTHH:mm'
      return existing.slice(0, 16)
    }
    return existing
  }
  if (field.defaultValue !== undefined) return field.defaultValue
  return field.type === 'checkbox' ? false : ''
}

/**
 * Schema-driven create/edit form for the simple admin resources.
 * Keeps every admin screen consistent instead of duplicating the same
 * ~200 lines of form markup per table.
 */
export default function ResourceForm({
  table,
  fields,
  record,
  redirectTo,
  submitLabel,
}: ResourceFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [values, setValues] = useState<Record<string, any>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, initialValue(f, record)]))
  )

  const set = (name: string, value: any) =>
    setValues((v) => ({ ...v, [name]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload: Record<string, any> = {}
    for (const field of fields) {
      const raw = values[field.name]

      if (field.type === 'checkbox') {
        payload[field.name] = Boolean(raw)
      } else if (field.type === 'number') {
        payload[field.name] = raw === '' || raw === null ? null : Number(raw)
      } else if (field.type === 'datetime') {
        payload[field.name] = raw ? new Date(raw).toISOString() : null
      } else if (typeof raw === 'string') {
        payload[field.name] = raw.trim() === '' ? null : raw.trim()
      } else {
        payload[field.name] = raw ?? null
      }
    }

    const supabase = createClient()
    const { error: saveError } = record?.id
      ? await supabase.from(table).update(payload).eq('id', record.id)
      : await supabase.from(table).insert(payload)

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card card-body max-w-3xl space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map((field) => {
          const type = field.type ?? 'text'
          const spanFull =
            field.width === 'full' || type === 'textarea' || type === 'checkbox'

          return (
            <div key={field.name} className={spanFull ? 'sm:col-span-2' : ''}>
              {type === 'checkbox' ? (
                <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={Boolean(values[field.name])}
                    onChange={(e) => set(field.name, e.target.checked)}
                  />
                  <span className="text-sm font-medium text-neutral-700">{field.label}</span>
                </label>
              ) : (
                <>
                  <label htmlFor={field.name} className="label">
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>

                  {type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      className="input min-h-[120px] resize-y"
                      value={values[field.name] ?? ''}
                      placeholder={field.placeholder}
                      required={field.required}
                      onChange={(e) => set(field.name, e.target.value)}
                    />
                  ) : type === 'select' ? (
                    <select
                      id={field.name}
                      className="input"
                      value={values[field.name] ?? ''}
                      required={field.required}
                      onChange={(e) => set(field.name, e.target.value)}
                    >
                      <option value="">-</option>
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.name}
                      type={
                        type === 'datetime'
                          ? 'datetime-local'
                          : type === 'url'
                            ? 'url'
                            : type
                      }
                      className="input"
                      value={values[field.name] ?? ''}
                      placeholder={field.placeholder}
                      required={field.required}
                      onChange={(e) => set(field.name, e.target.value)}
                    />
                  )}

                  {field.help && (
                    <p className="text-xs text-neutral-500 mt-1">{field.help}</p>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : submitLabel || (record ? 'Save Changes' : 'Create')}
        </button>
        <button type="button" onClick={() => router.back()} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  )
}
