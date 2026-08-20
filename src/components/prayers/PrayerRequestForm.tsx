'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle, AlertCircle, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Lang } from '@/types'

const schema = z.object({
  requester_name: z.string().min(2, 'Name required'),
  requester_email: z.string().email('Valid email required'),
  prayer_title: z.string().min(1, 'Prayer title required'),
  prayer_request: z.string().min(10, 'Please share more details'),
  preferred_lang: z.enum(['en', 'es']),
  is_public: z.boolean().optional(),
  honeypot: z.string().max(0),
})

type FormData = z.infer<typeof schema>

interface PrayerRequestFormProps {
  lang: Lang
  t: {
    prayer_button?: string
    prayer_success?: string
    prayer_error?: string
  }
}

export default function PrayerRequestForm({ lang, t }: PrayerRequestFormProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_lang: lang, is_public: false },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          requester_name: data.requester_name,
          requester_email: data.requester_email,
          prayer_title: data.prayer_title,
          prayer_request: data.prayer_request,
          preferred_lang: data.preferred_lang,
          is_public: data.is_public ?? false,
        })

      if (error) throw error

      setStatus('success')
      reset()
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input {...register('honeypot')} type="text" tabIndex={-1} aria-hidden style={{ display: 'none' }} />

      <div>
        <label htmlFor="requester_name" className="label text-sm">
          {lang === 'es' ? 'Tu Nombre *' : 'Your Name *'}
        </label>
        <input {...register('requester_name')} id="requester_name" className="input" autoComplete="name" />
        {errors.requester_name && <p className="text-red-500 text-xs mt-1">{errors.requester_name.message}</p>}
      </div>

      <div>
        <label htmlFor="requester_email" className="label text-sm">
          {lang === 'es' ? 'Tu Correo *' : 'Your Email *'}
        </label>
        <input {...register('requester_email')} id="requester_email" type="email" className="input" autoComplete="email" />
        {errors.requester_email && <p className="text-red-500 text-xs mt-1">{errors.requester_email.message}</p>}
      </div>

      <div>
        <label htmlFor="prayer_title" className="label text-sm">
          {lang === 'es' ? 'Asunto de Oración *' : 'Prayer Title *'}
        </label>
        <input {...register('prayer_title')} id="prayer_title" className="input" placeholder={lang === 'es' ? 'Ej: Salud, Trabajo, Familia' : 'E.g. Health, Job, Family'} />
        {errors.prayer_title && <p className="text-red-500 text-xs mt-1">{errors.prayer_title.message}</p>}
      </div>

      <div>
        <label htmlFor="prayer_request" className="label text-sm">
          {lang === 'es' ? 'Tu Solicitud de Oración *' : 'Prayer Request *'}
        </label>
        <textarea {...register('prayer_request')} id="prayer_request" className="input min-h-[120px] resize-y" placeholder={lang === 'es' ? 'Comparte tu petición...' : 'Share your prayer request...'} />
        {errors.prayer_request && <p className="text-red-500 text-xs mt-1">{errors.prayer_request.message}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input {...register('is_public')} type="checkbox" id="is_public" className="w-4 h-4 rounded border-neutral-300 cursor-pointer" />
        <label htmlFor="is_public" className="text-xs text-neutral-600 cursor-pointer">
          {lang === 'es'
            ? 'Permitir que otros en la comunidad vean mi solicitud y oren'
            : 'Let the community see my prayer request (anonymous)'}
        </label>
      </div>

      <input {...register('preferred_lang')} type="hidden" value={lang} />

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
        {isSubmitting ? (lang === 'es' ? 'Enviando...' : 'Submitting...') : (t.prayer_button || (lang === 'es' ? 'Enviar Solicitud' : 'Submit Prayer Request'))}
      </button>

      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{t.prayer_success || (lang === 'es' ? '¡Solicitud enviada! Estamos orando.' : 'Prayer request submitted. We\'re praying!')}</p>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{t.prayer_error || (lang === 'es' ? 'Error. Intenta de nuevo.' : 'Error. Try again.')}</p>
        </div>
      )}
    </form>
  )
}
