// ============================================================
// Monte Horeb - TypeScript Types
// ============================================================
//
// This file is the single import surface for types: everything
// is re-exported here so app code can always use `@/types`.

export * from './blog'
export * from './gallery-subscriptions-analytics'
export * from './merch'

export type Lang = 'en' | 'es'

// ─── Church Info ────────────────────────────────────────────
export interface ServiceTime {
  id: string
  day: 'Wednesday' | 'Friday' | 'Sunday'
  day_es: string
  time: string
  endTime: string
  label_en: string
  label_es: string
  notes_en?: string
  notes_es?: string
  location?: string
  location_es?: string
}

export interface ChurchInfo {
  name: string
  ministry: string
  address: string
  city: string
  state: string
  zip: string
  fullAddress: string
  phone: string
  email: string
  adminEmail: string
  serviceTimes: ServiceTime[]
  social: {
    facebook: string
    youtube: string
    whatsapp: string
  }
  giving: {
    zelle_phone: string
    zelle_email: string
    inPerson: string
    mail: string
  }
  logo: string
  heroImage: string
  taxExempt: boolean
}

// ─── Songs ──────────────────────────────────────────────────
export interface SongCategory {
  id: string
  name_en: string
  name_es: string
  slug: string
  sort_order: number
  created_at: string
}

export interface Song {
  id: string
  title_en: string
  title_es: string | null
  artist: string | null
  musical_key: string | null
  category_id: string | null
  category?: SongCategory
  youtube_url_en: string | null
  youtube_url_es: string | null
  file_url: string | null
  file_type: 'pdf' | 'pptx' | null
  language: 'en' | 'es' | 'both'
  is_published: boolean
  sort_order: number
  view_count: number
  created_at: string
  updated_at: string
}

// ─── Courses ────────────────────────────────────────────────
export interface Course {
  id: string
  title_en: string
  title_es: string
  description_en: string | null
  description_es: string | null
  thumbnail_url: string | null
  is_published: boolean
  sort_order: number
  videos?: CourseVideo[]
  created_at: string
  updated_at: string
}

export interface CourseVideo {
  id: string
  course_id: string
  title_en: string
  title_es: string
  description_en: string | null
  description_es: string | null
  youtube_url_en: string | null
  youtube_url_es: string | null
  duration_seconds: number | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface VideoProgress {
  id: string
  session_id: string
  video_id: string
  course_id: string
  watched_seconds: number
  completed: boolean
  lang: Lang
  last_watched_at: string
}

// ─── Sermons ────────────────────────────────────────────────
export interface Sermon {
  id: string
  title_en: string
  title_es: string | null
  speaker: string
  scripture_reference: string | null
  sermon_date: string | null
  youtube_url: string | null
  facebook_url: string | null
  language: 'en' | 'es' | 'both'
  is_foundational: boolean
  topic: string | null
  is_published: boolean
  created_at: string
}

// ─── Events ─────────────────────────────────────────────────
export interface ChurchEvent {
  id: string
  title_en: string
  title_es: string
  description_en: string | null
  description_es: string | null
  start_at: string
  end_at: string | null
  location_en: string | null
  location_es: string | null
  contact_person: string | null
  contact_email: string | null
  ministry_tag: string | null
  audience_tag: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  is_published: boolean
}

// ─── Leadership ─────────────────────────────────────────────
export interface Leader {
  id: string
  name: string
  role_en: string
  role_es: string
  bio_en: string
  bio_es: string
  contact?: string
  image: string
}

// ─── Ministry ───────────────────────────────────────────────
export interface Ministry {
  id: string
  name_en: string
  name_es: string
  description_en: string
  description_es: string
  who_en: string
  who_es: string
  when_en: string
  when_es: string
  where_en: string
  where_es: string
  contact_person: string
  contact_email?: string
}

// ─── Contact Form ───────────────────────────────────────────
export interface ContactFormData {
  name: string
  email: string
  phone?: string
  language: Lang
  message: string
}

// ─── Analytics ──────────────────────────────────────────────
export interface CourseAnalytics {
  course_id: string
  course: string
  video_id: string
  video: string
  unique_viewers: number
  completions: number
  avg_watch_seconds: number
  lang: Lang
}
