import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteSongButton'
import MarkReadButton from '@/components/admin/MarkReadButton'

export const metadata = { title: 'Messages - Admin | Iglesia Monte Horeb' }

export default async function AdminMessagesPage() {
  const supabase = createClient()
  const { data: messages } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const unread = messages?.filter((m) => !m.read).length || 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {unread} unread - {messages?.length || 0} total
        </p>
      </div>

      {messages?.length ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`card card-body ${message.read ? '' : 'border-l-4 border-l-primary-600'}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-bold text-neutral-900">{message.name}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-neutral-500 mt-0.5">
                    <a href={`mailto:${message.email}`} className="hover:underline">{message.email}</a>
                    {message.phone && <a href={`tel:${message.phone}`} className="hover:underline">{message.phone}</a>}
                    <span className="badge badge-blue text-xs uppercase">{message.language}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-neutral-400 whitespace-nowrap">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                  <MarkReadButton id={message.id} isRead={message.read} />
                  <DeleteButton id={message.id} table="contact_submissions" label={`message from ${message.name}`} />
                </div>
              </div>
              <p className="text-neutral-700 whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card card-body text-center py-16">
          <Mail className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No messages yet.</p>
        </div>
      )}
    </div>
  )
}
