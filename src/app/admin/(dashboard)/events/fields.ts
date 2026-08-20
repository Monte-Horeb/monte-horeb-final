import type { Field } from '@/components/admin/ResourceForm'

export const eventFields: Field[] = [
  { name: 'title_en', label: 'Title (English)', required: true },
  { name: 'title_es', label: 'Title (Spanish)', required: true },
  { name: 'description_en', label: 'Description (English)', type: 'textarea' },
  { name: 'description_es', label: 'Description (Spanish)', type: 'textarea' },
  { name: 'start_at', label: 'Starts', type: 'datetime', required: true },
  { name: 'end_at', label: 'Ends', type: 'datetime' },
  { name: 'location_en', label: 'Location (English)' },
  { name: 'location_es', label: 'Location (Spanish)' },
  { name: 'contact_person', label: 'Contact person' },
  { name: 'contact_email', label: 'Contact email', type: 'email' },
  { name: 'ministry_tag', label: 'Ministry tag' },
  { name: 'audience_tag', label: 'Audience tag' },
  { name: 'is_published', label: 'Published', type: 'checkbox', defaultValue: true },
]
