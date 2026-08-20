// ============================================================
// Monte Horeb - English Page Copy
// ============================================================
//
// `en` is the single English copy object consumed by the app.
// Section files (blog / bookstore / additional-pages) are folded
// in here so callers can always do `en.blog`, `en.staff`, etc.
// The Spanish side mirrors this exact shape in ../es/pages.ts.

import { blog } from './blog'
import { bookstore } from './bookstore'
import { gallery, community, live, staff } from './additional-pages'

export const en = {
  nav: {
    home: 'Home',
    visit: 'Visit',
    about: 'About',
    sermons: 'Sermons',
    events: 'Events',
    ministries: 'Ministries',
    give: 'Give',
    contact: 'Contact',
    songs: 'Song Library',
    newBelievers: 'New Believers',
    language: 'Español',
  },

  home: {
    meta_title: 'Iglesia Monte Horeb - Huntington Park, CA',
    meta_description:
      'Iglesia Monte Horeb is a bilingual church in Huntington Park, CA. Services Wednesday, Friday and Sunday. Everyone is welcome.',
    hero_headline: 'You Are Welcome Here',
    hero_subheadline:
      'Iglesia Monte Horeb - Servidores de Cristo. A place of prayer, worship and community in Huntington Park, CA.',
    service_times_heading: 'Service Times',
    address_heading: 'Find Us',
    give_button: 'Support the Ministry',
    contact_button: 'Contact Us',
    welcome_title: 'Welcome to Monte Horeb',
    welcome_body:
      'We are Servidores de Cristo, a family of faith grounded in biblical teaching and genuine worship. Whether you are visiting for the first time or looking for a spiritual home - you belong here.',
    new_here_prompt: 'First time here? Find out what to expect on your first visit.',
    new_here_link: 'Plan Your Visit →',
    upcoming_events: 'Upcoming Events',
    latest_sermon: 'Latest Sermon',
    our_ministries: 'Our Ministries',
    no_events: 'No upcoming events. Check back soon!',
  },

  visit: {
    meta_title: 'Plan Your Visit - Iglesia Monte Horeb',
    meta_description:
      'Everything you need to know before visiting Iglesia Monte Horeb in Huntington Park, CA.',
    headline: 'Plan Your Visit',
    subheadline:
      'We are glad you are thinking about visiting. Here is everything you need to know.',
    arrival: {
      title: 'What time should I arrive?',
      body: 'Arrive 10 to 15 minutes before the service starts. That gives you time to park, find a seat and meet someone at the door who can answer your questions.',
    },
    parking: {
      title: 'Where do I park?',
      body: 'Free street parking is available around 7910 Seville Ave. Come a few minutes early for the best spot.',
    },
    attire: {
      title: 'What should I wear?',
      body: 'Come as you are. Some people dress up, others come casual - both are welcome. We care that you are here, not what you are wearing.',
    },
    children: {
      title: 'What about my kids?',
      body: 'Children are welcome in every service. We have a warm, family-friendly environment. Ask at the door about programs available by age.',
    },
    duration: {
      title: 'How long is the service?',
      body: 'Services run about 1.5 to 2 hours, including worship, prayer and the biblical message.',
    },
    first_ten: {
      title: 'What happens in the first 10 minutes?',
      body: 'You will be greeted as you walk in. The service usually opens with worship music, followed by prayer and then a message from God’s Word. Participate as much or as little as you like - there is no pressure.',
    },
    language: {
      title: 'What language are the services in?',
      body: 'Wednesday Prayer Night and Sunday services include bilingual elements. The Friday service has Spanish-language congregational worship plus an English meeting (also a teens class), with bilingual translation available.',
    },
    accessibility: {
      title: 'Accessibility',
      body: 'Our building is accessible. If you have specific needs or questions, contact us ahead of time and we will do everything we can to make you comfortable.',
    },
    cta: 'We would love to meet you! See you Sunday.',
  },

  about: {
    meta_title: 'About Us - Iglesia Monte Horeb',
    meta_description:
      'Learn about Iglesia Monte Horeb, our beliefs, history and leadership in Huntington Park, CA.',
    headline: 'About Iglesia Monte Horeb',
    who_title: 'Who We Are',
    who_body:
      'Iglesia Monte Horeb is part of the worldwide Servidores de Cristo ministry. We are a bilingual community of faith in Huntington Park, California, grounded in biblical teaching, genuine worship and honest fellowship. Our congregation spans generations and backgrounds, united by faith in Jesus Christ.',
    history_title: 'Our History',
    history_body:
      'Monte Horeb has served the Huntington Park community with faithful ministry and a passion for God’s Word. What began as a small gathering of believers has grown into a congregation with multiple services and locations, reaching families across the region.',
    beliefs_title: 'What We Believe',
    beliefs: [
      {
        title: 'The Bible',
        body: 'We believe the Bible is the inspired Word of God - our foundation for faith and life.',
      },
      {
        title: 'Salvation',
        body: 'We believe in salvation through Jesus Christ alone - his death and resurrection make eternal life possible for everyone who believes.',
      },
      {
        title: 'The Holy Spirit',
        body: 'We believe in the present work of the Holy Spirit - transforming lives, empowering ministry and building the church.',
      },
      {
        title: 'The Church',
        body: 'We believe the church is the body of Christ - called to love, serve, worship and grow together.',
      },
      {
        title: 'Prayer',
        body: 'We believe prayer is the heartbeat of the church - Wednesday nights exist because of this conviction.',
      },
    ],
    leadership_title: 'Our Leadership',
    leadership_body:
      'Our pastors and leaders are committed to serving Christ and caring for our congregation.',
    contact_leadership:
      'Want to connect with a pastor? Email us at sdcmontehoreb@gmail.com or call (323) 496-6815.',
  },

  sermons: {
    meta_title: 'Sermons - Iglesia Monte Horeb',
    meta_description:
      'Watch recent sermons and foundational teaching from Iglesia Monte Horeb.',
    headline: 'Sermons',
    recent_title: 'Recent Sermons',
    recent_subtitle: 'Recent messages from our pastors and teachers',
    foundations_title: 'Foundations',
    foundations_subtitle:
      'Key teaching organized by topic - timeless truth for every stage of faith',
    search_placeholder: 'Search by title, speaker or scripture...',
    filter_all: 'All Topics',
    no_results: 'No sermons found. Try a different search.',
    speaker_label: 'Speaker',
    scripture_label: 'Scripture',
    watch_button: 'Watch Sermon',
    youtube_channel: 'View the full YouTube channel →',
  },

  events: {
    meta_title: 'Events - Iglesia Monte Horeb',
    meta_description: 'Upcoming events at Iglesia Monte Horeb.',
    headline: 'Events',
    calendar_view: 'Calendar',
    list_view: 'List',
    no_events: 'No upcoming events. Check back soon!',
    filter_all: 'All Ministries',
    contact_label: 'Contact',
    recurring_label: 'Recurring event',
  },

  ministries: {
    meta_title: 'Ministries - Iglesia Monte Horeb',
    meta_description:
      'Discover the ministries and groups at Iglesia Monte Horeb.',
    headline: 'Ministries and Groups',
    subheadline:
      'There is a place for you here. Find where you belong and where you can serve.',
    who_label: 'Who It Is For',
    when_label: 'When and Where',
    contact_label: 'Contact',
  },

  give: {
    meta_title: 'Give - Iglesia Monte Horeb',
    meta_description:
      'Support the ministry of Iglesia Monte Horeb with your generous giving.',
    headline: 'Support the Ministry',
    stewardship:
      'Every gift, large or small, sustains our services, outreach and community ministry. Thank you for your faithfulness.',
    ways_title: 'Ways to Give',
    zelle_title: 'Give by Zelle',
    zelle_body: 'Send directly to our Zelle account - fast, free and secure.',
    zelle_coming: 'Zelle details coming soon. Contact us to give today.',
    in_person_title: 'Give in Person',
    in_person_body:
      'Offering envelopes are available at every service. Place your gift in the offering during any service.',
    mail_title: 'Give by Mail',
    mail_body: 'Send a check payable to "Iglesia Monte Horeb" to:',
    tax_note:
      'Please check with us regarding tax-deductible status. We are grateful for your generosity.',
    non_pressure:
      'Giving is an act of worship - never an obligation. We trust God to provide through the willing hearts of his people.',
  },

  contact: {
    meta_title: 'Contact - Iglesia Monte Horeb',
    meta_description:
      'Get in touch with Iglesia Monte Horeb in Huntington Park, CA.',
    headline: 'Contact Us',
    subheadline:
      'We would love to hear from you - whether you have a question, a prayer request or simply want to connect.',
    form_title: 'Send Us a Message',
    name_label: 'Your Name',
    email_label: 'Email Address',
    phone_label: 'Phone Number (optional)',
    language_label: 'Preferred Language',
    message_label: 'Message',
    submit_button: 'Send Message',
    success: 'Message sent! We will get back to you soon.',
    error: 'Something went wrong. Please try again or email us directly.',
    staff_title: 'Our Team',
    office_hours: 'Office Hours',
    prayer_note: 'Have a prayer request? We take it seriously. Tell us about it.',
  },

  songs: {
    meta_title: 'Song Library - Iglesia Monte Horeb',
    meta_description:
      'Browse and view the worship song library of Iglesia Monte Horeb.',
    headline: 'Song Library',
    subheadline:
      'Browse our worship songs - view sheet music, chords and videos.',
    search_placeholder: 'Search songs by title or artist...',
    filter_all: 'All Categories',
    no_results: 'No songs found. Try a different search.',
    view_pdf: 'View PDF',
    view_ppt: 'View Slides',
    watch_en: 'Watch (English)',
    watch_es: 'Watch (Spanish)',
    back_to_library: '← Back to Song Library',
    file_viewer_title: 'Song File',
    youtube_section: 'Watch This Song',
    no_file: 'No file available for this song.',
    no_video: 'No video available for this song.',
  },

  newBelievers: {
    meta_title: 'New Believers - Iglesia Monte Horeb',
    meta_description:
      'Start your faith journey with our new believers course series at Iglesia Monte Horeb.',
    headline: 'New Believers',
    subheadline:
      'Whether you just said yes to Jesus or you are exploring faith for the first time - this is your starting point.',
    welcome_body:
      'These video courses are designed to help you understand your new faith, grow in your relationship with God and connect with our church family. Take your time. There is no rush.',
    courses_title: 'Choose a Course',
    videos_count: (n: number) => `${n} lesson${n === 1 ? '' : 's'}`,
    start_course: 'Start Course',
    continue_course: 'Continue',
    completed: 'Completed',
    progress_label: (watched: number, total: number) =>
      `${watched} of ${total} lessons watched`,
    video_title: 'Lesson',
    next_lesson: 'Next Lesson →',
    prev_lesson: '← Previous',
    back_to_course: '← Back to Course',
    back_to_courses: '← All Courses',
    mark_watched: 'Mark as Watched',
    watched_badge: '✓ Watched',
    no_video_en: 'English video coming soon.',
    no_video_es: 'Spanish video coming soon.',
  },

  blog,
  bookstore,
  gallery,
  community,
  live,
  staff,

  footer: {
    service_times: 'Service Times',
    address: 'Address',
    connect: 'Follow Us',
    quick_links: 'Quick Links',
    song_library: 'Song Library',
    copyright: (year: number) =>
      `© ${year} Iglesia Monte Horeb - Servidores de Cristo. All rights reserved.`,
  },
}
