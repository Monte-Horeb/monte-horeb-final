import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ResourceForm from '@/components/admin/ResourceForm'
import { productFields } from '../fields'

export const metadata = { title: 'New Product - Admin | Iglesia Monte Horeb' }

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/bookstore" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">New Product</h1>
      <ResourceForm table="merch_products" fields={productFields} redirectTo="/admin/bookstore" />
    </div>
  )
}
