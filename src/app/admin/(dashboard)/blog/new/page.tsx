import { createClient } from '@/lib/supabase/server'
import BlogForm from '@/components/admin/BlogForm'

export const metadata = { title: 'New Post - Admin | Iglesia Monte Horeb' }

export default async function NewBlogPostPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      <BlogForm categories={categories || []} />
    </div>
  )
}
