export const locales = ['it', 'en', 'ru'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'it'

export const isLocale = (value: string): value is Locale => {
  return locales.includes(value as Locale)
}

export const dictionary = {
  it: {
    brand: 'DOB — Department of Beauty',
    nav: {
      story: 'Our Story',
      shop: 'Shop',
      journal: 'Journal',
      location: 'Location',
      services: 'Services',
    },
    cta: {
      whatsapp: 'Prenota via WhatsApp',
      call: 'Prenota via telefono',
      appointment: 'Prenota appuntamento',
    },
    hero: {
      title: 'Estetica avanzata nel cuore di Milano',
      subtitle:
        'Trattamenti su misura, tecnologia e rituali di bellezza pensati per risultati visibili e duraturi.',
      eyebrow: 'Salone di estetica avanzata',
    },
    story: {
      title: 'Our Story',
      lead: 'Una visione di bellezza contemporanea, cura del dettaglio e risultati reali.',
      body:
        'DOB nasce in Via Giovanni Rasori 9 per offrire percorsi personalizzati, con protocolli innovativi e una relazione continua con ogni cliente.',
    },
    shop: {
      title: 'Shop',
      lead: 'La selezione di prodotti professionali, disponibili online.',
      note: 'E-commerce in fase di configurazione con pagamenti Stripe.',
    },
    journal: {
      title: 'Journal',
      lead: 'Editoriali, promozioni stagionali ed eventi speciali.',
    },
    location: {
      title: 'Location',
      lead: 'Via Giovanni Rasori 9, Milano.',
      hours: 'Orari su appuntamento.',
    },
    services: {
      title: 'Services',
      lead: 'Listino servizi e trattamenti avanzati.',
      note: 'Prenotazioni via WhatsApp o telefono.',
    },
    common: {
      discover: 'Scopri di piu',
      viewList: 'Vedi il listino',
      goToShop: 'Vai allo shop',
      scroll: 'Scorri per esplorare',
    },
    placeholders: {
      productName: 'Prodotto',
      serviceName: 'Servizio',
      journalTitle: 'Journal',
      journalExcerpt: 'Anteprima editoriale in arrivo.',
      readMore: 'Leggi di piu',
      addressLabel: 'Indirizzo',
      hoursLabel: 'Orari',
      contactLabel: 'Contatti',
      weekdayLabel: 'Lun - Sab',
      cityLine: 'Milano, Italia',
      durationExample: '60 min',
    },
  },
  en: {
    brand: 'DOB — Department of Beauty',
    nav: {
      story: 'Our Story',
      shop: 'Shop',
      journal: 'Journal',
      location: 'Location',
      services: 'Services',
    },
    cta: {
      whatsapp: 'Schedule via WhatsApp',
      call: 'Schedule via call',
      appointment: 'Make an appointment',
    },
    hero: {
      title: 'Advanced aesthetics in the heart of Milan',
      subtitle:
        'Tailored treatments, technology, and rituals designed for visible, lasting results.',
      eyebrow: 'Advanced aesthetics studio',
    },
    story: {
      title: 'Our Story',
      lead: 'A contemporary vision of beauty, with precision and real results.',
      body:
        'DOB was born at Via Giovanni Rasori 9 to offer personalized journeys with innovative protocols and a continuous relationship with every client.',
    },
    shop: {
      title: 'Shop',
      lead: 'A curated selection of professional products, available online.',
      note: 'E-commerce setup in progress with Stripe payments.',
    },
    journal: {
      title: 'Journal',
      lead: 'Editorials, seasonal promotions, and special events.',
    },
    location: {
      title: 'Location',
      lead: 'Via Giovanni Rasori 9, Milan.',
      hours: 'By appointment only.',
    },
    services: {
      title: 'Services',
      lead: 'Service list and advanced treatments.',
      note: 'Bookings via WhatsApp or phone.',
    },
    common: {
      discover: 'Discover more',
      viewList: 'View the list',
      goToShop: 'Go to shop',
      scroll: 'Scroll to explore',
    },
    placeholders: {
      productName: 'Product',
      serviceName: 'Service',
      journalTitle: 'Journal',
      journalExcerpt: 'Editorial preview coming soon.',
      readMore: 'Read more',
      addressLabel: 'Address',
      hoursLabel: 'Hours',
      contactLabel: 'Contact',
      weekdayLabel: 'Mon - Sat',
      cityLine: 'Milan, Italy',
      durationExample: '60 min',
    },
  },
  ru: {
    brand: 'DOB — Department of Beauty',
    nav: {
      story: 'Our Story',
      shop: 'Shop',
      journal: 'Journal',
      location: 'Location',
      services: 'Services',
    },
    cta: {
      whatsapp: 'Записаться через WhatsApp',
      call: 'Записаться по телефону',
      appointment: 'Записаться на прием',
    },
    hero: {
      title: 'Продвинутая эстетика в самом сердце Милана',
      subtitle:
        'Индивидуальные процедуры, технологии и ритуалы красоты для заметных и стойких результатов.',
      eyebrow: 'Студия продвинутой эстетики',
    },
    story: {
      title: 'Our Story',
      lead: 'Современное видение красоты, внимание к деталям и реальный результат.',
      body:
        'DOB находится на Via Giovanni Rasori 9 и предлагает персональные программы с инновационными протоколами и постоянной заботой о клиенте.',
    },
    shop: {
      title: 'Shop',
      lead: 'Подборка профессиональных продуктов, доступных онлайн.',
      note: 'Настройка e-commerce и платежей Stripe в процессе.',
    },
    journal: {
      title: 'Journal',
      lead: 'Редакционные материалы, сезонные акции и специальные события.',
    },
    location: {
      title: 'Location',
      lead: 'Via Giovanni Rasori 9, Милан.',
      hours: 'Только по записи.',
    },
    services: {
      title: 'Services',
      lead: 'Список услуг и передовые процедуры.',
      note: 'Запись через WhatsApp или по телефону.',
    },
    common: {
      discover: 'Узнать больше',
      viewList: 'Смотреть прайс',
      goToShop: 'Перейти в магазин',
      scroll: 'Прокрутите вниз',
    },
    placeholders: {
      productName: 'Продукт',
      serviceName: 'Услуга',
      journalTitle: 'Journal',
      journalExcerpt: 'Скоро появится редакционная подборка.',
      readMore: 'Подробнее',
      addressLabel: 'Адрес',
      hoursLabel: 'Часы',
      contactLabel: 'Контакты',
      weekdayLabel: 'Пн - Сб',
      cityLine: 'Милан, Италия',
      durationExample: '60 мин',
    },
  },
} as const

export const getDictionary = (locale: Locale) => dictionary[locale]
