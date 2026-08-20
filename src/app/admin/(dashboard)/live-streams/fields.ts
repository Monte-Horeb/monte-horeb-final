import type { Field } from '@/components/admin/ResourceForm'

export const streamFields: Field[] = [
  { name: 'title_en', label: 'Title (English)', required: true },
  { name: 'title_es', label: 'Title (Spanish)' },
  { name: 'description_en', label: 'Description (English)', type: 'textarea' },
  { name: 'description_es', label: 'Description (Spanish)', type: 'textarea' },
  { name: 'youtube_url', label: 'YouTube URL', type: 'url', required: true },
  { name: 'scheduled_at', label: 'Scheduled for', type: 'datetime' },
  { name: 'is_live', label: 'Live right now', type: 'checkbox' },
]
