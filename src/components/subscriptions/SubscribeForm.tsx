'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Lang } from '@/types'

const schema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().optional(),
  preferred_lang: z.enum(['en', 'es']),
  honeypot: z.string().max(0),
})

type FormData = z.infer<typeof schema>

interface SubscribeFormProps {
  lang: Lang
  t: {
    subscribe_button?: string
    subscribe_success?: string
    subscribe_error?: string
  }
}

export default function SubscribeForm({ lang, t }: SubscribeFormProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_lang: lang },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('email_subscribers')
        .insert({
          email: data.email,
          name: data.name || null,
          preferred_lang: data.preferred_lang,
        })

      if (error && error.code !== '23505') throw error // 23505 = unique violation (already subscribed)

      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input {...register('honeypot')} type="text" tabIndex={-1} aria-hidden style={{ display: 'none' }} />

      <div>
        <label htmlFor="name" className="label text-sm">
          {lang === 'es' ? 'Nombre (opcional)' : 'Name (optional)'}
        </label>
        <input {...register('name')} id="name" className="input" autoComplete="name" />
      </div>

      <div>
        <label htmlFor="email" className="label text-sm">
          {lang === 'es' ? 'Correo *' : 'Email *'}
        </label>
        <input {...register('email')} id="email" type="email" className="input" autoComplete="email" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <input {...register('preferred_lang')} type="hidden" value={lang} />

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        {isSubmitting ? (lang === 'es' ? 'Suscribiendo...' : 'Subscribing...') : (t.subscribe_button || (lang === 'es' ? 'Suscribirse' : 'Subscribe'))}
      </button>

      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{t.subscribe_success || (lang === 'es' ? '¡Suscripción exitosa!' : 'Successfully subscribed!')}</p>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{t.subscribe_error || (lang === 'es' ? 'Error. Intenta de nuevo.' : 'Error. Try again.')}</p>
        </div>
      )}
    </form>
  )
}
