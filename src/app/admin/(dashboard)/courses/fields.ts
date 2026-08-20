import type { Field } from '@/components/admin/ResourceForm'

export const courseFields: Field[] = [
  { name: 'title_en', label: 'Title (English)', required: true },
  { name: 'title_es', label: 'Title (Spanish)', required: true },
  { name: 'description_en', label: 'Description (English)', type: 'textarea' },
  { name: 'description_es', label: 'Description (Spanish)', type: 'textarea' },
  { name: 'thumbnail_url', label: 'Thumbnail URL', type: 'url' },
  { name: 'sort_order', label: 'Sort order', type: 'number', defaultValue: 0 },
  { name: 'is_published', label: 'Published', type: 'checkbox' },
]

export const courseVideoFields: Field[] = [
  { name: 'title_en', label: 'Title (English)', required: true },
  { name: 'title_es', label: 'Title (Spanish)', required: true },
  { name: 'description_en', label: 'Description (English)', type: 'textarea' },
  { name: 'description_es', label: 'Description (Spanish)', type: 'textarea' },
  { name: 'youtube_url_en', label: 'YouTube URL (English)', type: 'url' },
  { name: 'youtube_url_es', label: 'YouTube URL (Spanish)', type: 'url' },
  { name: 'duration_seconds', label: 'Duration (seconds)', type: 'number' },
  { name: 'sort_order', label: 'Sort order', type: 'number', defaultValue: 0 },
  { name: 'is_published', label: 'Published', type: 'checkbox', defaultValue: true },
]
