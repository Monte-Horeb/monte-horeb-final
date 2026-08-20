// ============================================================
// Schema for the admin "Page Content" editor
// ============================================================
//
// Drives /admin/content: which pages are editable, which fields
// on each page show up in the form, what to label them, and
// whether a field needs a single-line input or a textarea.
//
// `path` is a dot path into the page's content object (matching
// the shape in src/content/{en,es}/pages.ts) so nested fields
// like visit.arrival.title or about.beliefs.0.title can be
// edited without a bespoke form per page. See src/lib/content.ts
// for how overrides saved from this schema get merged back onto
// the compiled-in defaults at request time.
//
// Deliberately NOT included here: button labels, form-field
// labels (e.g. "Your Name"), nav items and footer links. Those
// are UI chrome that stays consistent across redesigns rather
// than church-specific content - see FIXES.md if that scope
// ever needs to grow.

import type { EditablePageKey } from '@/lib/content'

export interface ContentField {
  path: string
  label: string
  type?: 'text' | 'textarea'
}

export interface ContentPageSchema {
  key: EditablePageKey
  label: string
  description: string
  fields: ContentField[]
}

export const editableSchema: ContentPageSchema[] = [
  {
    key: 'home',
    label: 'Home',
    description: 'The hero, welcome message and section headings on the homepage.',
    fields: [
      { path: 'meta_title', label: 'Browser tab / SEO title' },
      { path: 'meta_description', label: 'SEO description', type: 'textarea' },
      { path: 'hero_headline', label: 'Hero headline' },
      { path: 'hero_subheadline', label: 'Hero subheadline', type: 'textarea' },
      { path: 'give_button', label: '"Give" button text' },
      { path: 'contact_button', label: '"Contact" button text' },
      { path: 'service_times_heading', label: 'Service times heading' },
      { path: 'welcome_title', label: 'Welcome section heading' },
      { path: 'welcome_body', label: 'Welcome section text', type: 'textarea' },
      { path: 'new_here_link', label: '"Plan your visit" link text' },
      { path: 'address_heading', label: 'Map section heading' },
      { path: 'latest_sermon', label: '"Latest Sermon" heading' },
      { path: 'upcoming_events', label: '"Upcoming Events" heading' },
      { path: 'no_events', label: 'Text shown when no events are scheduled' },
      { path: 'our_ministries', label: '"Our Ministries" heading' },
    ],
  },
  {
    key: 'visit',
    label: 'Plan Your Visit',
    description: 'The visit-page headline and every FAQ question and answer.',
    fields: [
      { path: 'meta_title', label: 'Browser tab / SEO title' },
      { path: 'meta_description', label: 'SEO description', type: 'textarea' },
      { path: 'headline', label: 'Headline' },
      { path: 'subheadline', label: 'Subheadline', type: 'textarea' },
      { path: 'arrival.title', label: 'FAQ 1 - question' },
      { path: 'arrival.body', label: 'FAQ 1 - answer', type: 'textarea' },
      { path: 'parking.title', label: 'FAQ 2 - question' },
      { path: 'parking.body', label: 'FAQ 2 - answer', type: 'textarea' },
      { path: 'attire.title', label: 'FAQ 3 - question' },
      { path: 'attire.body', label: 'FAQ 3 - answer', type: 'textarea' },
      { path: 'children.title', label: 'FAQ 4 - question' },
      { path: 'children.body', label: 'FAQ 4 - answer', type: 'textarea' },
      { path: 'duration.title', label: 'FAQ 5 - question' },
      { path: 'duration.body', label: 'FAQ 5 - answer', type: 'textarea' },
      { path: 'first_ten.title', label: 'FAQ 6 - question' },
      { path: 'first_ten.body', label: 'FAQ 6 - answer', type: 'textarea' },
      { path: 'language.title', label: 'FAQ 7 - question' },
      { path: 'language.body', label: 'FAQ 7 - answer', type: 'textarea' },
      { path: 'accessibility.title', label: 'FAQ 8 - question' },
      { path: 'accessibility.body', label: 'FAQ 8 - answer', type: 'textarea' },
      { path: 'cta', label: 'Closing line' },
    ],
  },
  {
    key: 'about',
    label: 'About Us',
    description: 'Who We Are, Our History, What We Believe, and the leadership intro.',
    fields: [
      { path: 'meta_title', label: 'Browser tab / SEO title' },
      { path: 'meta_description', label: 'SEO description', type: 'textarea' },
      { path: 'headline', label: 'Headline' },
      { path: 'who_title', label: '"Who We Are" heading' },
      { path: 'who_body', label: '"Who We Are" text', type: 'textarea' },
      { path: 'history_title', label: '"Our History" heading' },
      { path: 'history_body', label: '"Our History" text', type: 'textarea' },
      { path: 'beliefs_title', label: '"What We Believe" heading' },
      { path: 'beliefs.0.title', label: 'Belief 1 - title' },
      { path: 'beliefs.0.body', label: 'Belief 1 - text', type: 'textarea' },
      { path: 'beliefs.1.title', label: 'Belief 2 - title' },
      { path: 'beliefs.1.body', label: 'Belief 2 - text', type: 'textarea' },
      { path: 'beliefs.2.title', label: 'Belief 3 - title' },
      { path: 'beliefs.2.body', label: 'Belief 3 - text', type: 'textarea' },
      { path: 'beliefs.3.title', label: 'Belief 4 - title' },
      { path: 'beliefs.3.body', label: 'Belief 4 - text', type: 'textarea' },
      { path: 'beliefs.4.title', label: 'Belief 5 - title' },
      { path: 'beliefs.4.body', label: 'Belief 5 - text', type: 'textarea' },
      { path: 'leadership_title', label: '"Our Leadership" heading' },
      { path: 'leadership_body', label: '"Our Leadership" text', type: 'textarea' },
      { path: 'contact_leadership', label: 'Contact-a-pastor line', type: 'textarea' },
    ],
  },
  {
    key: 'ministries',
    label: 'Ministries',
    description: 'The ministries-page headline. (Individual ministry listings are managed elsewhere, in the code content files - ask about converting those too.)',
    fields: [
      { path: 'meta_title', label: 'Browser tab / SEO title' },
      { path: 'meta_description', label: 'SEO description', type: 'textarea' },
      { path: 'headline', label: 'Headline' },
      { path: 'subheadline', label: 'Subheadline', type: 'textarea' },
    ],
  },
  {
    key: 'give',
    label: 'Give',
    description: 'The giving page: Zelle, in-person and mail-in instructions.',
    fields: [
      { path: 'meta_title', label: 'Browser tab / SEO title' },
      { path: 'meta_description', label: 'SEO description', type: 'textarea' },
      { path: 'headline', label: 'Headline' },
      { path: 'stewardship', label: 'Subheadline', type: 'textarea' },
      { path: 'ways_title', label: '"Ways to Give" heading' },
      { path: 'zelle_title', label: 'Zelle card - title' },
      { path: 'zelle_body', label: 'Zelle card - text', type: 'textarea' },
      { path: 'zelle_coming', label: 'Zelle card - note', type: 'textarea' },
      { path: 'in_person_title', label: 'In-person card - title' },
      { path: 'in_person_body', label: 'In-person card - text', type: 'textarea' },
      { path: 'mail_title', label: 'Mail card - title' },
      { path: 'mail_body', label: 'Mail card - text', type: 'textarea' },
      { path: 'non_pressure', label: 'Closing quote', type: 'textarea' },
      { path: 'tax_note', label: 'Tax note', type: 'textarea' },
    ],
  },
  {
    key: 'contact',
    label: 'Contact',
    description: 'The contact page headline and the prayer-request note.',
    fields: [
      { path: 'meta_title', label: 'Browser tab / SEO title' },
      { path: 'meta_description', label: 'SEO description', type: 'textarea' },
      { path: 'headline', label: 'Headline' },
      { path: 'subheadline', label: 'Subheadline', type: 'textarea' },
      { path: 'form_title', label: '"Send Us a Message" heading' },
      { path: 'prayer_note', label: 'Prayer-request note', type: 'textarea' },
    ],
  },
]

export function getPageSchema(key: EditablePageKey): ContentPageSchema | undefined {
  return editableSchema.find((p) => p.key === key)
}
