import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ResourceForm from '@/components/admin/ResourceForm'
import { productFields } from '../../fields'

export const metadata = { title: 'Edit Product - Admin | Iglesia Monte Horeb' }

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: record } = await supabase.from('merch_products').select('*').eq('id', params.id).single()

  if (!record) notFound()

  return (
    <div>
      <Link href="/admin/bookstore" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ResourceForm table="merch_products" fields={productFields} record={record} redirectTo="/admin/bookstore" />
    </div>
  )
}
