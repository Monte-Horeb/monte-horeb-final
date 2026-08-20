// Blog post type
export interface BlogPost {
  id: string
  title_en: string
  title_es: string | null
  slug: string
  excerpt_en: string | null
  excerpt_es: string | null
  content_en: string
  content_es: string | null
  author_id: string | null
  category_id: string | null
  featured_image_url: string | null
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
  published_at: string | null
  category?: BlogCategory
}

export interface BlogCategory {
  id: string
  name_en: string
  name_es: string
  slug: string
  sort_order: number
  created_at: string
}

export interface BlogComment {
  id: string
  post_id: string
  author_name: string
  author_email: string
  content: string
  is_approved: boolean
  created_at: string
}
