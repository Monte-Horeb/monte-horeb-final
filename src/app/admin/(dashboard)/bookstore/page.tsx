import Link from 'next/link'
import { Plus, Pencil, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteSongButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata = { title: 'Book Store - Admin | Iglesia Monte Horeb' }

export default async function AdminBookstorePage() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('merch_products')
    .select('*')
    .order('sort_order', { ascending: true })

  const lowStock = products?.filter((p) => p.stock_quantity <= 3).length || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Book Store</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {products?.length || 0} products
            {lowStock > 0 && <span className="text-red-600"> - {lowStock} low on stock</span>}
          </p>
        </div>
        <Link href="/admin/bookstore/new" className="btn btn-primary btn-sm no-underline">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-neutral-100 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-neutral-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-neutral-900">{product.name_en}</p>
                      <p className="text-xs text-neutral-400">/{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{product.category || '-'}</td>
                <td className="px-6 py-4 text-sm font-medium">${Number(product.price_usd).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={product.stock_quantity <= 3 ? 'text-red-600 font-semibold' : ''}>
                    {product.stock_quantity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <TogglePublishButton
                    id={product.id}
                    table="merch_products"
                    column="is_active"
                    isPublished={product.is_active}
                    labels={{ on: 'Active', off: 'Hidden' }}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/bookstore/${product.id}/edit`} className="p-2 rounded text-neutral-600 hover:text-primary-700 no-underline">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={product.id} table="merch_products" label={product.name_en} />
                  </div>
                </td>
              </tr>
            ))}
            {!products?.length && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-500">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
