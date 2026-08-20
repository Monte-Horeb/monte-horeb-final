import type { Field } from '@/components/admin/ResourceForm'

export const productFields: Field[] = [
  { name: 'name_en', label: 'Name (English)', required: true },
  { name: 'name_es', label: 'Name (Spanish)' },
  { name: 'slug', label: 'URL slug', required: true, help: 'Lowercase words separated by hyphens.' },
  { name: 'description_en', label: 'Description (English)', type: 'textarea' },
  { name: 'description_es', label: 'Description (Spanish)', type: 'textarea' },
  { name: 'price_usd', label: 'Price (USD)', type: 'number', required: true },
  { name: 'cost_usd', label: 'Cost (USD)', type: 'number' },
  { name: 'sku', label: 'SKU' },
  { name: 'category', label: 'Category', placeholder: 'Books, Journals, Apparel, Gifts' },
  { name: 'image_url', label: 'Main image URL', type: 'url' },
  { name: 'stock_quantity', label: 'Stock quantity', type: 'number', defaultValue: 0 },
  { name: 'sort_order', label: 'Sort order', type: 'number', defaultValue: 0 },
  { name: 'is_active', label: 'Active (visible in store)', type: 'checkbox', defaultValue: true },
]
