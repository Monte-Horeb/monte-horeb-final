import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SongForm from '@/components/admin/SongForm'

export const metadata = { title: 'Edit Song - Admin | Iglesia Monte Horeb' }

export default async function EditSongPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: song }, { data: categories }] = await Promise.all([
    supabase.from('songs').select('*').eq('id', params.id).single(),
    supabase.from('song_categories').select('*').order('sort_order', { ascending: true }),
  ])

  if (!song) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Song</h1>
      <SongForm song={song} categories={categories || []} />
    </div>
  )
}
