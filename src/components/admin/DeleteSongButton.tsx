'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DeleteButtonProps {
  id: string
  table: string
  /** Optional label shown in the confirmation prompt. */
  label?: string
}

/**
 * Generic "delete a row" button used across the admin tables.
 * Named DeleteSongButton for historical reasons - it is table-agnostic.
 */
export default function DeleteSongButton({ id, table, label }: DeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    const what = label ? `"${label}"` : 'this item'
    if (!window.confirm(`Delete ${what}? This cannot be undone.`)) return

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: deleteError } = await supabase.from(table).delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      setLoading(false)
      return
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title={error || 'Delete'}
      aria-label="Delete"
      className={`p-2 rounded transition-colors disabled:opacity-40 ${
        error ? 'text-red-700 bg-red-50' : 'text-neutral-600 hover:text-red-600 hover:bg-red-50'
      }`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
