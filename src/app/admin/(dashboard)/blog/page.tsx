import Link from 'next/link'
import { Plus, Pencil, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteSongButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata = { title: 'Blog - Admin | Iglesia Monte Horeb' }

export default async function AdminBlogPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*, category:blog_categories(name_en)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-neutral-500 text-sm mt-1">{posts?.length || 0} posts</p>
        </div>
        <Link href="/admin/blog/new" className="btn btn-primary btn-sm no-underline">
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">Post</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Views</th>
              <th className="px-6 py-4">Published</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts?.map((post: any) => (
              <tr key={post.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900">{post.title_en}</p>
                  <p className="text-xs text-neutral-400">/{post.slug}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="badge badge-blue text-xs">{post.category?.name_en || '-'}</span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{post.view_count ?? 0}</td>
                <td className="px-6 py-4 text-xs text-neutral-500">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <TogglePublishButton id={post.id} table="blog_posts" isPublished={post.is_published} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {post.is_published && (
                      <Link href={`/en/blog/${post.slug}`} target="_blank" className="p-2 rounded text-neutral-600 hover:text-primary-700 no-underline" title="View live">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <Link href={`/admin/blog/${post.id}/edit`} className="p-2 rounded text-neutral-600 hover:text-primary-700 no-underline">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={post.id} table="blog_posts" label={post.title_en} />
                  </div>
                </td>
              </tr>
            ))}
            {!posts?.length && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-500">No posts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
