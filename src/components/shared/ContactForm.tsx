'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { Lang } from '@/types'

const schema = z.object({
  name:      z.string().min(2, 'Name is required'),
  email:     z.string().email('Valid email required'),
  phone:     z.string().optional(),
  language:  z.enum(['en', 'es']),
  message:   z.string().min(10, 'Message must be at least 10 characters'),
  honeypot:  z.string().max(0), // spam trap
})

type FormData = z.infer<typeof schema>

interface ContactFormProps {
  lang: Lang
  t: {
    name_label: string
    email_label: string
    phone_label: string
    language_label: string
    message_label: string
    submit_button: string
    success: string
    error: string
  }
}

export default function ContactForm({ lang, t }: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { language: lang },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot - hidden spam trap */}
      <input
        {...register('honeypot')}
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: 'none' }}
      />

      {/* Name */}
      <div>
        <label htmlFor="name" className="label">{t.name_label} *</label>
        <input id="name" type="text" {...register('name')} className="input" autoComplete="name" />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="label">{t.email_label} *</label>
        <input id="email" type="email" {...register('email')} className="input" autoComplete="email" />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="label">{t.phone_label}</label>
        <input id="phone" type="tel" {...register('phone')} className="input" autoComplete="tel" />
      </div>

      {/* Language preference */}
      <div>
        <label htmlFor="language" className="label">{t.language_label}</label>
        <select id="language" {...register('language')} className="input">
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="label">{t.message_label} *</label>
        <textarea
          id="message"
          {...register('message')}
          className="input min-h-[160px] resize-y"
          rows={5}
        />
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full"
      >
        {isSubmitting ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> {lang === 'es' ? 'Enviando...' : 'Sending...'}</>
        ) : t.submit_button}
      </button>

      {/* Status messages */}
      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{t.success}</p>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{t.error}</p>
        </div>
      )}
    </form>
  )
}
