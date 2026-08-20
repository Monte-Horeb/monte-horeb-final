'use client'

import { useState, useTransition } from 'react'
import { PackageCheck, Loader2 } from 'lucide-react'
import { markOrderPickedUp } from '@/app/admin/(dashboard)/orders/actions'

export default function MarkPickedUpButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleClick = () => {
    setError('')
    startTransition(async () => {
      const result = await markOrderPickedUp(id)
      if (!result.ok) setError(result.error || 'Failed')
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={error || 'Mark as collected'}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors
        ${error
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
        }`}
    >
      {pending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <PackageCheck className="w-3 h-3" />
      )}
      Collected
    </button>
  )
}
