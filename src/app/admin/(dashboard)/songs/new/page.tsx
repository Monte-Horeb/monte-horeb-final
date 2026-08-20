import { createClient } from '@/lib/supabase/server'
import SongForm from '@/components/admin/SongForm'

export const metadata = { title: 'Add Song - Admin | Iglesia Monte Horeb' }

export default async function NewSongPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('song_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Song</h1>
      <SongForm categories={categories || []} />
    </div>
  )
}
