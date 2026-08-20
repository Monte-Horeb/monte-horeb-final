import type { Field } from '@/components/admin/ResourceForm'

export const staffFields: Field[] = [
  { name: 'first_name', label: 'First name', required: true },
  { name: 'last_name', label: 'Last name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'role_en', label: 'Role (English)', required: true },
  { name: 'role_es', label: 'Role (Spanish)', required: true },
  { name: 'bio_en', label: 'Bio (English)', type: 'textarea' },
  { name: 'bio_es', label: 'Bio (Spanish)', type: 'textarea' },
  { name: 'photo_url', label: 'Photo URL', type: 'url' },
  { name: 'social_facebook', label: 'Facebook URL', type: 'url' },
  { name: 'social_instagram', label: 'Instagram URL', type: 'url' },
  { name: 'sort_order', label: 'Sort order', type: 'number', defaultValue: 0 },
  { name: 'is_public', label: 'Visible on the public site', type: 'checkbox', defaultValue: true },
]
