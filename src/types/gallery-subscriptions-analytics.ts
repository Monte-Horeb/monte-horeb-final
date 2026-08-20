// Gallery
export interface GalleryAlbum {
  id: string
  title_en: string
  title_es: string | null
  slug: string
  description_en: string | null
  description_es: string | null
  thumbnail_url: string | null
  sort_order: number
  is_published: boolean
  created_at: string
}

export interface GalleryPhoto {
  id: string
  album_id: string
  image_url: string
  caption_en: string | null
  caption_es: string | null
  sort_order: number
  created_at: string
}

// Email Subscriptions
export interface EmailSubscriber {
  id: string
  email: string
  name: string | null
  preferred_lang: string
  is_active: boolean
  subscribed_at: string
  verified_at: string | null
  unsubscribed_at: string | null
}

// Prayer Requests
export interface PrayerRequest {
  id: string
  requester_name: string
  requester_email: string
  prayer_title: string
  prayer_request: string
  preferred_lang: string
  is_public: boolean
  prayer_count: number
  created_at: string
}

// Live Streaming
export interface LiveStream {
  id: string
  title_en: string
  title_es: string | null
  description_en: string | null
  description_es: string | null
  youtube_url: string
  is_live: boolean
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  viewer_count: number
  created_at: string
}

// Staff Directory
export interface StaffMember {
  id: string
  user_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role_en: string
  role_es: string
  bio_en: string | null
  bio_es: string | null
  photo_url: string | null
  social_facebook: string | null
  social_instagram: string | null
  sort_order: number
  is_public: boolean
  created_at: string
}

// Analytics
export interface AnalyticsEvent {
  id: string
  event_type: string
  event_data: Record<string, any> | null
  session_id: string | null
  user_agent: string | null
  ip_address: string | null
  referrer: string | null
  created_at: string
}

export interface AnalyticsDaily {
  id: string
  date: string
  page_views: number
  unique_visitors: number
  new_subscribers: number
  prayer_requests: number
  blog_views: number
  song_library_views: number
  course_views: number
  avg_session_duration: number | null
  bounce_rate: number | null
  created_at: string
}
