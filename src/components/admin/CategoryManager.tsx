'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { SongCategory } from '@/types'

interface CategoryManagerProps {
  initialCategories: SongCategory[]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ name_en: '', name_es: '' })

  const supabase = createClient()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name_en.trim() || !draft.name_es.trim()) return

    setAdding(true)
    setError('')

    const { data, error: insertError } = await supabase
      .from('song_categories')
      .insert({
        name_en: draft.name_en.trim(),
        name_es: draft.name_es.trim(),
        slug: slugify(draft.name_en),
        sort_order: categories.length + 1,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setAdding(false)
      return
    }

    setCategories((c) => [...c, data as SongCategory])
    setDraft({ name_en: '', name_es: '' })
    setAdding(false)
    router.refresh()
  }

  const handleRename = async (id: string, patch: Partial<SongCategory>) => {
    setCategories((c) => c.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat)))
  }

  const handleSave = async (cat: SongCategory) => {
    setBusyId(cat.id)
    setError('')
    const { error: updateError } = await supabase
      .from('song_categories')
      .update({ name_en: cat.name_en, name_es: cat.name_es, slug: slugify(cat.name_en) })
      .eq('id', cat.id)
    if (updateError) setError(updateError.message)
    setBusyId(null)
    router.refresh()
  }

  const handleDelete = async (cat: SongCategory) => {
    if (!window.confirm(`Delete "${cat.name_en}"? Songs in it will become uncategorised.`)) return
    setBusyId(cat.id)
    setError('')
    const { error: deleteError } = await supabase.from('song_categories').delete().eq('id', cat.id)
    if (deleteError) {
      setError(deleteError.message)
      setBusyId(null)
      return
    }
    setCategories((c) => c.filter((x) => x.id !== cat.id))
    setBusyId(null)
    router.refresh()
  }

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= categories.length) return

    const reordered = [...categories]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    const withOrder = reordered.map((c, i) => ({ ...c, sort_order: i + 1 }))
    setCategories(withOrder)

    setError('')
    for (const cat of withOrder) {
      const { error: updateError } = await supabase
        .from('song_categories')
        .update({ sort_order: cat.sort_order })
        .eq('id', cat.id)
      if (updateError) {
        setError(updateError.message)
        break
      }
    }
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Add new */}
      <form onSubmit={handleAdd} className="card card-body">
        <h2 className="font-bold mb-4">Add a category</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="new_en" className="label">Name (English) *</label>
            <input
              id="new_en"
              className="input"
              value={draft.name_en}
              onChange={(e) => setDraft((d) => ({ ...d, name_en: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="new_es" className="label">Name (Spanish) *</label>
            <input
              id="new_es"
              className="input"
              value={draft.name_es}
              onChange={(e) => setDraft((d) => ({ ...d, name_es: e.target.value }))}
              required
            />
          </div>
        </div>
        <button type="submit" disabled={adding} className="btn btn-primary btn-sm w-fit">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Category
        </button>
      </form>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
      )}

      {/* Existing */}
      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">English</th>
              <th className="px-4 py-3">Spanish</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(i, -1)}
                      disabled={i === 0}
                      className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(i, 1)}
                      disabled={i === categories.length - 1}
                      className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    className="input py-2 min-h-0 text-sm"
                    value={cat.name_en}
                    onChange={(e) => handleRename(cat.id, { name_en: e.target.value })}
                    aria-label={`English name for ${cat.name_en}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    className="input py-2 min-h-0 text-sm"
                    value={cat.name_es}
                    onChange={(e) => handleRename(cat.id, { name_es: e.target.value })}
                    aria-label={`Spanish name for ${cat.name_en}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleSave(cat)}
                      disabled={busyId === cat.id}
                      className="p-2 rounded text-neutral-600 hover:text-primary-700 hover:bg-primary-50"
                      aria-label="Save"
                    >
                      {busyId === cat.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      disabled={busyId === cat.id}
                      className="p-2 rounded text-neutral-600 hover:text-red-600 hover:bg-red-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-neutral-500">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
