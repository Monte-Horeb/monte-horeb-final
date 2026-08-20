import type { ChurchInfo } from '@/types'

export const churchInfo: ChurchInfo = {
  name: 'Iglesia Monte Horeb',
  ministry: 'Servidores de Cristo',

  address: '7910 Seville Ave',
  city: 'Huntington Park',
  state: 'CA',
  zip: '90255',
  fullAddress: '7910 Seville Ave, Huntington Park, CA 90255',

  phone: '+1 323-496-6815',
  email: 'sdcmontehoreb@gmail.com',
  adminEmail: 'robinsonramos96@gmail.com',

  serviceTimes: [
    {
      id: 'wednesday-prayer',
      day: 'Wednesday',
      day_es: 'Miércoles',
      time: '7:30 PM',
      endTime: '9:00 PM',
      label_en: 'Wednesday Prayer Night',
      label_es: 'Noche de Oración',
      notes_en: 'Bilingual service (English & Spanish)',
      notes_es: 'Servicio bilingüe (inglés y español)',
      location: '7910 Seville Ave, Huntington Park, CA 90255',
      location_es: '7910 Seville Ave, Huntington Park, CA 90255',
    },
    {
      id: 'friday-service',
      day: 'Friday',
      day_es: 'Viernes',
      time: '7:30 PM',
      endTime: '9:00 PM',
      label_en: 'Friday Service',
      label_es: 'Servicio del Viernes',
      notes_en:
        'Spanish congregation service + English meeting (also teens class). Bilingual translation available.',
      notes_es:
        'Servicio de la congregación en español + reunión en inglés (también clase de jóvenes). Traducción bilingüe disponible.',
      location: '7910 Seville Ave, Huntington Park, CA 90255',
      location_es: '7910 Seville Ave, Huntington Park, CA 90255',
    },
    {
      id: 'sunday-first',
      day: 'Sunday',
      day_es: 'Domingo',
      time: '10:00 AM',
      endTime: '12:00 PM',
      label_en: 'Sunday Morning Service',
      label_es: 'Servicio Dominical de la Mañana',
      notes_en: 'Main Sunday service - all welcome',
      notes_es: 'Servicio principal del domingo - todos bienvenidos',
      location: '7910 Seville Ave, Huntington Park, CA 90255',
      location_es: '7910 Seville Ave, Huntington Park, CA 90255',
    },
    {
      id: 'sunday-second',
      day: 'Sunday',
      day_es: 'Domingo',
      time: 'TBA',
      endTime: 'TBA',
      label_en: 'Sunday Service - Lincoln Heights',
      label_es: 'Servicio Dominical - Lincoln Heights',
      notes_en: 'Location address coming soon',
      notes_es: 'Dirección próximamente',
      location: 'Lincoln Heights, CA (address coming soon)',
      location_es: 'Lincoln Heights, CA (dirección próximamente)',
    },
    {
      id: 'sunday-evening',
      day: 'Sunday',
      day_es: 'Domingo',
      time: '6:00 PM',
      endTime: '8:00 PM',
      label_en: 'Sunday Evening Service',
      label_es: 'Servicio Dominical de la Tarde',
      notes_en: 'Evening worship and teaching',
      notes_es: 'Adoración y enseñanza vespertina',
      location: '7910 Seville Ave, Huntington Park, CA 90255',
      location_es: '7910 Seville Ave, Huntington Park, CA 90255',
    },
  ],

  social: {
    facebook: 'https://www.facebook.com/servidoresdecristomh/',
    youtube: 'https://www.youtube.com/@montehorebtv/',
    whatsapp: 'https://wa.me/13234966815',
  },

  giving: {
    zelle_phone: '+1 323-496-6815',           // Confirm with church
    zelle_email: 'sdcmontehoreb@gmail.com',   // Confirm with church
    inPerson: 'Offering envelopes available at each service',
    mail: '7910 Seville Ave, Huntington Park, CA 90255',
  },

  logo: '/images/logo.jpg',
  heroImage: '/images/hero.jpg',             // [REPLACE with real photo]
  taxExempt: false,                          // Update when 501(c)(3) confirmed
}
