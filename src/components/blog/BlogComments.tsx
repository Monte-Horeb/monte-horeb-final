'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Lang } from '@/types'

const schema = z.object({
  author_name: z.string().min(2, 'Name is required'),
  author_email: z.string().email('Valid email required'),
  content: z.string().min(10, 'Comment must be at least 10 characters'),
  honeypot: z.string().max(0),
})

type FormData = z.infer<typeof schema>

interface BlogCommentsProps {
  postId: string
  lang: Lang
  t: {
    comments_title?: string
    comment_form_title?: string
    comment_placeholder?: string
    comment_submit?: string
    comment_success?: string
    comment_error?: string
  }
}

export default function BlogComments({ postId, lang, t }: BlogCommentsProps) {
  const router = useRouter()
  const [comments, setComments] = useState<any[]>([])
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Load approved comments on mount.
  // NOTE: this was previously written as useState(fn, [postId]) which ran the
  // fetch during render, ignored the dependency array and never re-ran.
  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setComments(data || [])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [postId])

  const onSubmit = async (data: FormData) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          author_name: data.author_name,
          author_email: data.author_email,
          content: data.content,
        })

      if (error) throw error

      setStatus('success')
      reset()
      // Refresh after 2 seconds
      setTimeout(() => router.refresh(), 2000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-primary-700" />
        {lang === 'es' ? 'Comentarios' : 'Comments'}
      </h2>

      {/* Comments list */}
      {!loading && comments.length > 0 && (
        <div className="mb-10 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-neutral-900">{comment.author_name}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(comment.created_at).toLocaleDateString(
                    lang === 'es' ? 'es-MX' : 'en-US'
                  )}
                </p>
              </div>
              <p className="text-neutral-600 text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-neutral-500 text-sm mb-8">
          {lang === 'es'
            ? 'No hay comentarios aún. ¡Sé el primero en comentar!'
            : 'No comments yet. Be the first to comment!'}
        </p>
      )}

      {/* Comment form */}
      <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
        <h3 className="font-bold text-lg mb-4">
          {lang === 'es' ? 'Dejar un comentario' : 'Leave a comment'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Honeypot */}
          <input
            {...register('honeypot')}
            type="text"
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: 'none' }}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="author_name" className="label text-sm">
                {lang === 'es' ? 'Nombre' : 'Name'} *
              </label>
              <input
                id="author_name"
                {...register('author_name')}
                className="input text-sm"
                autoComplete="name"
              />
              {errors.author_name && (
                <p className="text-red-500 text-xs mt-1">{errors.author_name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="author_email" className="label text-sm">
                {lang === 'es' ? 'Correo' : 'Email'} *
              </label>
              <input
                id="author_email"
                type="email"
                {...register('author_email')}
                className="input text-sm"
                autoComplete="email"
              />
              {errors.author_email && (
                <p className="text-red-500 text-xs mt-1">{errors.author_email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="content" className="label text-sm">
              {lang === 'es' ? 'Comentario' : 'Comment'} *
            </label>
            <textarea
              id="content"
              {...register('content')}
              className="input text-sm min-h-[100px] resize-y"
              placeholder={lang === 'es' ? 'Tu comentario...' : 'Your comment...'}
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              {lang === 'es'
                ? 'Los comentarios son revisados antes de ser publicados.'
                : 'Comments are reviewed before being published.'}
            </p>
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                {lang === 'es'
                  ? 'Comentario enviado. Será publicado después de revisión.'
                  : 'Comment submitted. It will be published after review.'}
              </p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                {lang === 'es' ? 'Error al enviar. Intenta de nuevo.' : 'Error sending. Try again.'}
              </p>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm w-full">
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {lang === 'es' ? 'Enviando...' : 'Sending...'}</>
            ) : (
              lang === 'es' ? 'Enviar Comentario' : 'Post Comment'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
