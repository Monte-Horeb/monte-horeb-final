import type { Field } from '@/components/admin/ResourceForm'

export const sermonFields: Field[] = [
  { name: 'title_en', label: 'Title (English)', required: true },
  { name: 'title_es', label: 'Title (Spanish)' },
  { name: 'speaker', label: 'Speaker', required: true },
  { name: 'scripture_reference', label: 'Scripture reference', placeholder: 'John 3:16' },
  { name: 'sermon_date', label: 'Date', type: 'date' },
  { name: 'youtube_url', label: 'YouTube URL', type: 'url' },
  { name: 'facebook_url', label: 'Facebook URL', type: 'url' },
  {
    name: 'language',
    label: 'Language',
    type: 'select',
    defaultValue: 'es',
    options: [
      { value: 'es', label: 'Spanish' },
      { value: 'en', label: 'English' },
      { value: 'both', label: 'Both' },
    ],
  },
  { name: 'topic', label: 'Topic', help: 'Used to group foundational teaching.' },
  { name: 'is_foundational', label: 'Foundational teaching', type: 'checkbox' },
  { name: 'is_published', label: 'Published', type: 'checkbox', defaultValue: true },
]
