'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface TogglePublishButtonProps {
  id: string
  table: string
  isPublished: boolean
  /**
   * Column holding the visibility flag. Not every table calls it
   * `is_published` - staff_directory uses `is_public`, and writing the
   * wrong column silently did nothing.
   */
  column?: string
  labels?: { on: string; off: string }
}

export default function TogglePublishButton({
  id,
  table,
  isPublished,
  column = 'is_published',
  labels = { on: 'Live', off: 'Draft' },
}: TogglePublishButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(isPublished)
  const [error, setError] = useState('')

  const handleToggle = async () => {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from(table)
      .update({ [column]: !published })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setPublished(!published)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={error || undefined}
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors
        ${error
          ? 'bg-red-50 text-red-700 border-red-200'
          : published
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
        }`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : published ? (
        <Eye className="w-3 h-3" />
      ) : (
        <EyeOff className="w-3 h-3" />
      )}
      {published ? labels.on : labels.off}
    </button>
  )
}
