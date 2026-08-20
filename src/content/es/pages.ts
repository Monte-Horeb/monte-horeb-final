// ============================================================
// Monte Horeb - Spanish Page Copy (Mexican variety)
// ============================================================
//
// Mirrors the shape of ../en/pages.ts exactly. Section files
// (blog / bookstore / additional-pages) are folded in below so
// callers can always do `es.blog`, `es.staff`, etc.

import { blog } from './blog'
import { bookstore } from './bookstore'
import { gallery, community, live, staff } from './additional-pages'

export const es = {
  nav: {
    home: 'Inicio',
    visit: 'Visitar',
    about: 'Nosotros',
    sermons: 'Prédicas',
    events: 'Eventos',
    ministries: 'Ministerios',
    give: 'Ofrendar',
    contact: 'Contacto',
    songs: 'Himnario',
    newBelievers: 'Nuevos Creyentes',
    language: 'English',
  },

  home: {
    meta_title: 'Iglesia Monte Horeb - Huntington Park, CA',
    meta_description:
      'Iglesia Monte Horeb es una iglesia bilingüe en Huntington Park, CA. Servicios miércoles, viernes y domingo. Todos son bienvenidos.',
    hero_headline: 'Aquí Eres Bienvenido',
    hero_subheadline:
      'Iglesia Monte Horeb - Servidores de Cristo. Un lugar de oración, adoración y comunidad en Huntington Park, CA.',
    service_times_heading: 'Horarios de Servicio',
    address_heading: 'Encuéntranos',
    give_button: 'Apoya el Ministerio',
    contact_button: 'Contáctanos',
    welcome_title: 'Bienvenidos a Monte Horeb',
    welcome_body:
      'Somos Servidores de Cristo, una familia de fe fundamentada en la enseñanza bíblica y la adoración genuina. Ya sea que estés visitando por primera vez o buscando un hogar espiritual - aquí perteneces.',
    new_here_prompt: '¿Es tu primera vez? Descubre qué esperar en tu primera visita.',
    new_here_link: 'Planea tu Visita →',
    upcoming_events: 'Próximos Eventos',
    latest_sermon: 'Última Prédica',
    our_ministries: 'Nuestros Ministerios',
    no_events: 'No hay eventos próximos. ¡Vuelve pronto!',
  },

  visit: {
    meta_title: 'Planea tu Visita - Iglesia Monte Horeb',
    meta_description:
      'Todo lo que necesitas saber antes de visitar Iglesia Monte Horeb en Huntington Park, CA.',
    headline: 'Planea tu Visita',
    subheadline:
      'Nos alegra que estés pensando en visitarnos. Aquí tienes todo lo que necesitas saber.',
    arrival: {
      title: '¿A qué hora debo llegar?',
      body: 'Llega 10 a 15 minutos antes de que comience el servicio. Así tendrás tiempo para estacionar, encontrar un asiento y conocer a alguien en la puerta que pueda responder tus preguntas.',
    },
    parking: {
      title: '¿Dónde estaciono?',
      body: 'Hay estacionamiento gratuito en la calle alrededor de 7910 Seville Ave. Llega unos minutos antes para conseguir el mejor lugar.',
    },
    attire: {
      title: '¿Cómo debo vestirme?',
      body: 'Ven como eres. Algunos se visten formalmente, otros vienen casual - ambas opciones están bien. Nos importa que estés aquí, no cómo estás vestido.',
    },
    children: {
      title: '¿Y mis hijos?',
      body: 'Los niños son bienvenidos en todos los servicios. Tenemos un ambiente cálido y amigable para las familias. Pregunta en la puerta sobre programas disponibles según la edad.',
    },
    duration: {
      title: '¿Cuánto dura el servicio?',
      body: 'Los servicios duran aproximadamente de 1.5 a 2 horas, incluyendo adoración, oración y mensaje bíblico.',
    },
    first_ten: {
      title: '¿Qué pasa en los primeros 10 minutos?',
      body: 'Serás recibido al entrar. El servicio generalmente comienza con música de adoración, seguida de oración y luego un mensaje de la Palabra de Dios. Participa tanto o tan poco como desees - no hay presión.',
    },
    language: {
      title: '¿En qué idioma son los servicios?',
      body: 'La Noche de Oración del miércoles y los servicios del domingo incluyen elementos bilingües. El servicio del viernes tiene adoración para la congregación en español y una reunión en inglés (también clase de jóvenes), con traducción bilingüe disponible.',
    },
    accessibility: {
      title: 'Accesibilidad',
      body: 'Nuestro edificio es accesible. Si tienes necesidades específicas o preguntas, contáctanos con anticipación y haremos todo lo posible para que te sientas cómodo.',
    },
    cta: '¡Nos encantaría conocerte! Te esperamos el domingo.',
  },

  about: {
    meta_title: 'Nosotros - Iglesia Monte Horeb',
    meta_description:
      'Conoce la Iglesia Monte Horeb, nuestras creencias, historia y liderazgo en Huntington Park, CA.',
    headline: 'Sobre la Iglesia Monte Horeb',
    who_title: 'Quiénes Somos',
    who_body:
      'La Iglesia Monte Horeb es parte del ministerio mundial Servidores de Cristo. Somos una comunidad bilingüe de fe en Huntington Park, California, fundamentada en la enseñanza bíblica, la adoración genuina y la comunión sincera. Nuestra congregación abarca generaciones y orígenes distintos, unidos por la fe en Jesucristo.',
    history_title: 'Nuestra Historia',
    history_body:
      'Monte Horeb ha servido a la comunidad de Huntington Park con ministerio fiel y pasión por la Palabra de Dios. Lo que comenzó como una pequeña reunión de creyentes ha crecido hasta convertirse en una congregación con múltiples servicios y ubicaciones, alcanzando familias en toda la región.',
    beliefs_title: 'Lo Que Creemos',
    beliefs: [
      {
        title: 'La Biblia',
        body: 'Creemos que la Biblia es la Palabra inspirada de Dios - nuestro fundamento para la fe y la vida.',
      },
      {
        title: 'La Salvación',
        body: 'Creemos en la salvación solamente a través de Jesucristo - su muerte y resurrección hacen posible la vida eterna para todo el que cree.',
      },
      {
        title: 'El Espíritu Santo',
        body: 'Creemos en la obra presente del Espíritu Santo - transformando vidas, capacitando para el ministerio y edificando la iglesia.',
      },
      {
        title: 'La Iglesia',
        body: 'Creemos que la iglesia es el cuerpo de Cristo - llamada a amarse, servirse, adorar y crecer juntos.',
      },
      {
        title: 'La Oración',
        body: 'Creemos que la oración es el latido de la iglesia - las noches del miércoles existen por esta convicción.',
      },
    ],
    leadership_title: 'Nuestro Liderazgo',
    leadership_body:
      'Nuestros pastores y líderes están comprometidos a servir a Cristo y cuidar de nuestra congregación.',
    contact_leadership:
      '¿Quieres conectarte con un pastor? Escríbenos a sdcmontehoreb@gmail.com o llama al (323) 496-6815.',
  },

  sermons: {
    meta_title: 'Prédicas - Iglesia Monte Horeb',
    meta_description:
      'Mira las prédicas recientes y enseñanzas fundamentales de la Iglesia Monte Horeb.',
    headline: 'Prédicas',
    recent_title: 'Prédicas Recientes',
    recent_subtitle: 'Mensajes recientes de nuestros pastores y maestros',
    foundations_title: 'Fundamentos',
    foundations_subtitle:
      'Enseñanzas clave organizadas por tema - verdad atemporal para cada etapa de la fe',
    search_placeholder: 'Buscar por título, predicador o texto bíblico...',
    filter_all: 'Todos los Temas',
    no_results: 'No se encontraron prédicas. Intenta con otra búsqueda.',
    speaker_label: 'Predicador',
    scripture_label: 'Texto Bíblico',
    watch_button: 'Ver Prédica',
    youtube_channel: 'Ver canal de YouTube completo →',
  },

  events: {
    meta_title: 'Eventos - Iglesia Monte Horeb',
    meta_description: 'Próximos eventos en la Iglesia Monte Horeb.',
    headline: 'Eventos',
    calendar_view: 'Calendario',
    list_view: 'Lista',
    no_events: 'No hay eventos próximos. ¡Vuelve pronto!',
    filter_all: 'Todos los Ministerios',
    contact_label: 'Contacto',
    recurring_label: 'Evento recurrente',
  },

  ministries: {
    meta_title: 'Ministerios - Iglesia Monte Horeb',
    meta_description:
      'Descubre los ministerios y grupos en la Iglesia Monte Horeb.',
    headline: 'Ministerios y Grupos',
    subheadline:
      'Hay un lugar para ti aquí. Encuentra dónde perteneces y dónde puedes servir.',
    who_label: 'Para Quién Es',
    when_label: 'Cuándo y Dónde',
    contact_label: 'Contacto',
  },

  give: {
    meta_title: 'Ofrendar - Iglesia Monte Horeb',
    meta_description:
      'Apoya el ministerio de la Iglesia Monte Horeb con tu ofrenda generosa.',
    headline: 'Apoya el Ministerio',
    stewardship:
      'Cada ofrenda, grande o pequeña, sostiene nuestros servicios, el alcance y el ministerio comunitario. Gracias por tu fidelidad.',
    ways_title: 'Formas de Ofrendar',
    zelle_title: 'Ofrendar por Zelle',
    zelle_body: 'Envía directamente a nuestra cuenta de Zelle - rápido, gratis y seguro.',
    zelle_coming: 'Detalles de Zelle próximamente. Contáctanos para ofrendar ahora.',
    in_person_title: 'Ofrendar en Persona',
    in_person_body:
      'Hay sobres de ofrenda disponibles en cada servicio. Deposita tu ofrenda durante cualquier servicio.',
    mail_title: 'Ofrendar por Correo',
    mail_body: 'Envía un cheque a nombre de "Iglesia Monte Horeb" a:',
    tax_note:
      'Por favor consulta con nosotros sobre el estado de deducibilidad fiscal. Agradecemos tu generosidad.',
    non_pressure:
      'Dar es un acto de adoración - nunca una obligación. Confiamos en que Dios provee a través de los corazones dispuestos de su pueblo.',
  },

  contact: {
    meta_title: 'Contacto - Iglesia Monte Horeb',
    meta_description:
      'Comunícate con la Iglesia Monte Horeb en Huntington Park, CA.',
    headline: 'Contáctanos',
    subheadline:
      'Nos encantaría saber de ti - ya sea que tengas una pregunta, un pedido de oración o simplemente quieras conectarte.',
    form_title: 'Envíanos un Mensaje',
    name_label: 'Tu Nombre',
    email_label: 'Correo Electrónico',
    phone_label: 'Número de Teléfono (opcional)',
    language_label: 'Idioma Preferido',
    message_label: 'Mensaje',
    submit_button: 'Enviar Mensaje',
    success: '¡Mensaje enviado! Nos comunicaremos contigo pronto.',
    error: 'Algo salió mal. Intenta de nuevo o escríbenos directamente.',
    staff_title: 'Nuestro Equipo',
    office_hours: 'Horario de Oficina',
    prayer_note: '¿Tienes un pedido de oración? Lo tomamos en serio. Cuéntanos.',
  },

  songs: {
    meta_title: 'Himnario - Iglesia Monte Horeb',
    meta_description:
      'Explora y visualiza el himnario de adoración de la Iglesia Monte Horeb.',
    headline: 'Himnario',
    subheadline:
      'Explora nuestras canciones de adoración - visualiza partituras, acordes y videos.',
    search_placeholder: 'Buscar canciones por título o artista...',
    filter_all: 'Todas las Categorías',
    no_results: 'No se encontraron canciones. Intenta con otra búsqueda.',
    view_pdf: 'Ver PDF',
    view_ppt: 'Ver Diapositivas',
    watch_en: 'Ver (Inglés)',
    watch_es: 'Ver (Español)',
    back_to_library: '← Volver al Himnario',
    file_viewer_title: 'Archivo de Canción',
    youtube_section: 'Ver esta Canción',
    no_file: 'No hay archivo disponible para esta canción.',
    no_video: 'No hay video disponible para esta canción.',
  },

  newBelievers: {
    meta_title: 'Nuevos Creyentes - Iglesia Monte Horeb',
    meta_description:
      'Comienza tu camino de fe con nuestra serie de cursos para nuevos creyentes en la Iglesia Monte Horeb.',
    headline: 'Nuevos Creyentes',
    subheadline:
      'Ya sea que acabas de decir sí a Jesús o estás explorando la fe por primera vez - este es tu punto de partida.',
    welcome_body:
      'Estos cursos en video están diseñados para ayudarte a entender tu nueva fe, crecer en tu relación con Dios y conectarte con nuestra familia de la iglesia. Tómate tu tiempo. No hay prisa.',
    courses_title: 'Elige un Curso',
    videos_count: (n: number) => `${n} lección${n === 1 ? '' : 'es'}`,
    start_course: 'Comenzar Curso',
    continue_course: 'Continuar',
    completed: 'Completado',
    progress_label: (watched: number, total: number) =>
      `${watched} de ${total} lecciones vistas`,
    video_title: 'Lección',
    next_lesson: 'Siguiente Lección →',
    prev_lesson: '← Anterior',
    back_to_course: '← Volver al Curso',
    back_to_courses: '← Todos los Cursos',
    mark_watched: 'Marcar como Visto',
    watched_badge: '✓ Visto',
    no_video_en: 'Video en inglés próximamente.',
    no_video_es: 'Video en español próximamente.',
  },

  blog,
  bookstore,
  gallery,
  community,
  live,
  staff,

  footer: {
    service_times: 'Horarios',
    address: 'Dirección',
    connect: 'Síguenos',
    quick_links: 'Accesos Rápidos',
    song_library: 'Himnario',
    copyright: (year: number) =>
      `© ${year} Iglesia Monte Horeb - Servidores de Cristo. Todos los derechos reservados.`,
  },
}
