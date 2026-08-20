import type { Field } from '@/components/admin/ResourceForm'

export const albumFields: Field[] = [
  { name: 'title_en', label: 'Title (English)', required: true },
  { name: 'title_es', label: 'Title (Spanish)' },
  { name: 'slug', label: 'URL slug', required: true, help: 'Lowercase words separated by hyphens.' },
  { name: 'description_en', label: 'Description (English)', type: 'textarea' },
  { name: 'description_es', label: 'Description (Spanish)', type: 'textarea' },
  { name: 'thumbnail_url', label: 'Thumbnail URL', type: 'url' },
  { name: 'sort_order', label: 'Sort order', type: 'number', defaultValue: 0 },
  { name: 'is_published', label: 'Published', type: 'checkbox' },
]
