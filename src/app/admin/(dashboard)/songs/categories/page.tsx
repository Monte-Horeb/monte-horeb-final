import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import CategoryManager from '@/components/admin/CategoryManager'

export const metadata = { title: 'Song Categories - Admin | Iglesia Monte Horeb' }

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('song_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/songs" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Songs
        </Link>
        <h1 className="text-2xl font-bold">Song Categories</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Add, edit, reorder, or remove categories. Changes appear immediately on the public site.
        </p>
      </div>

      <CategoryManager initialCategories={categories || []} />
    </div>
  )
}
