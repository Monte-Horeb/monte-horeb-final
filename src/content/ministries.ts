import type { Ministry } from '@/types'

/**
 * Ministry listings. These are edited here in code rather than in the
 * admin panel - update the copy and redeploy.
 */
export const ministries: Ministry[] = [
  {
    id: 'prayer',
    name_en: 'Prayer Ministry',
    name_es: 'Ministerio de Oración',
    description_en:
      'Wednesday night is built around prayer. We gather to intercede for our families, our church and our community.',
    description_es:
      'La noche del miércoles está centrada en la oración. Nos reunimos para interceder por nuestras familias, nuestra iglesia y nuestra comunidad.',
    who_en: 'Everyone - no experience needed',
    who_es: 'Todos - no se necesita experiencia',
    when_en: 'Wednesdays, 7:30 PM – 9:00 PM',
    when_es: 'Miércoles, 7:30 PM – 9:00 PM',
    where_en: '7910 Seville Ave, Huntington Park, CA 90255',
    where_es: '7910 Seville Ave, Huntington Park, CA 90255',
    contact_person: 'Hermano Oswaldo',
    contact_email: 'sdcmontehoreb@gmail.com',
  },
  {
    id: 'worship',
    name_en: 'Worship and Music',
    name_es: 'Alabanza y Música',
    description_en:
      'Our worship team leads the congregation in Spanish and English. Musicians and singers are always welcome.',
    description_es:
      'Nuestro equipo de alabanza guía a la congregación en español e inglés. Músicos y cantantes siempre son bienvenidos.',
    who_en: 'Musicians, singers and sound technicians',
    who_es: 'Músicos, cantantes y técnicos de sonido',
    when_en: 'Rehearsals before each service',
    when_es: 'Ensayos antes de cada servicio',
    where_en: 'Main sanctuary',
    where_es: 'Santuario principal',
    contact_person: 'Pastor Alex',
    contact_email: 'sdcmontehoreb@gmail.com',
  },
  {
    id: 'youth',
    name_en: 'Youth and Teens',
    name_es: 'Jóvenes y Adolescentes',
    description_en:
      'A space for teenagers to ask honest questions, build friendships and grow in faith. Meets alongside the Friday service.',
    description_es:
      'Un espacio para que los adolescentes hagan preguntas sinceras, construyan amistades y crezcan en la fe. Se reúne junto al servicio del viernes.',
    who_en: 'Ages 12 – 18',
    who_es: 'De 12 a 18 años',
    when_en: 'Fridays, 7:30 PM',
    when_es: 'Viernes, 7:30 PM',
    where_en: '7910 Seville Ave, Huntington Park, CA 90255',
    where_es: '7910 Seville Ave, Huntington Park, CA 90255',
    contact_person: 'Hermano Ruben Hernandez',
    contact_email: 'sdcmontehoreb@gmail.com',
  },
  {
    id: 'new-believers',
    name_en: 'New Believers',
    name_es: 'Nuevos Creyentes',
    description_en:
      'Video courses and personal follow-up for anyone starting out in faith. Work through it at your own pace.',
    description_es:
      'Cursos en video y seguimiento personal para quienes comienzan en la fe. Avanza a tu propio ritmo.',
    who_en: 'New believers and anyone exploring faith',
    who_es: 'Nuevos creyentes y quienes exploran la fe',
    when_en: 'Online, any time',
    when_es: 'En línea, en cualquier momento',
    where_en: 'Online course library',
    where_es: 'Biblioteca de cursos en línea',
    contact_person: 'Pastor Frank Alvarado',
    contact_email: 'sdcmontehoreb@gmail.com',
  },
]
