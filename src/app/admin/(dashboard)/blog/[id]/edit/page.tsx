import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BlogForm from '@/components/admin/BlogForm'

export const metadata = { title: 'Edit Post - Admin | Iglesia Monte Horeb' }

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from('blog_posts').select('*').eq('id', params.id).single(),
    supabase.from('blog_categories').select('*').order('sort_order', { ascending: true }),
  ])

  if (!post) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <BlogForm post={post} categories={categories || []} />
    </div>
  )
}
