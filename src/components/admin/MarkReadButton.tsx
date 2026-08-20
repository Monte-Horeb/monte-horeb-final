'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function MarkReadButton({ id, isRead }: { id: string; isRead: boolean }) {
  const router = useRouter()
  const [read, setRead] = useState(isRead)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('contact_submissions')
      .update({ read: !read })
      .eq('id', id)
    if (!error) {
      setRead(!read)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={read ? 'Mark as unread' : 'Mark as read'}
      aria-label={read ? 'Mark as unread' : 'Mark as read'}
      className={`p-2 rounded transition-colors ${
        read
          ? 'text-neutral-400 hover:bg-neutral-100'
          : 'text-primary-700 bg-primary-50 hover:bg-primary-100'
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : read ? (
        <Mail className="w-4 h-4" />
      ) : (
        <Check className="w-4 h-4" />
      )}
    </button>
  )
}
