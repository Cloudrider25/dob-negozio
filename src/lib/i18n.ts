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
      protocol: 'DOB Protocol',
      shop: 'Shop',
      journal: 'Journal',
      location: 'Location',
      services: 'Services',
    },
    cta: {
      whatsapp: 'Prenota via WhatsApp',
      call: 'Prenota via telefono',
      appointment: 'Prenota ora',
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
      note: 'Acquista online con checkout sicuro e conferma ordine immediata.',
    },
    productDetail: {
      lineHeadlineFallback: 'Formula clinicamente testata.',
      lineDetails: {
        goodFor: 'Good for',
        goodForFallback: 'Pelli normali e secche',
        feelsLike: 'Feels like',
        feelsLikeFallback: 'Texture morbida e avvolgente che si fonde sulla pelle.',
        smellsLike: 'Smells like',
        smellsLikeFallback: 'Senza profumo',
        award: 'Award',
        awardFallback: 'Dermatologicamente testato.',
        fyi: 'FYI',
        fyiFallback: 'Cruelty-free • Vegan • Gluten-free',
      },
      crossSell: {
        title: 'Aggiungi',
        meta: 'Selezione consigliata',
        cta: 'Scopri',
      },
      accordion: {
        benefits: 'Benefici',
        usage: "Modo d'uso",
        ingredients: 'Principi attivi',
      },
      videoPlaceholder: 'Video placeholder',
      whatsInside: {
        title: "what's inside",
        fallbackWithProduct: 'Scopri cosa rende speciale {{product}}.',
        fallback: 'Scopri cosa rende speciale questo prodotto.',
      },
      faq: {
        titleFallback: 'FAQ',
        subtitleWithProduct: 'Scopri di più su {{product}}.',
        subtitleFallback: 'Scopri di più su questo prodotto.',
        fallbackItems: [
          {
            question: 'Come si applica?',
            answer: 'Usa il prodotto come indicato nella routine consigliata.',
          },
          {
            question: 'Per che tipo di pelle è indicato?',
            answer: 'Adatto a più tipi di pelle. Se hai dubbi chiedi una consulenza.',
          },
          {
            question: 'Ogni quanto si usa?',
            answer: 'Consigliato 1-2 volte al giorno in base alle esigenze personali.',
          },
        ],
      },
      treatment: {
        primaryTitleFallback: 'Protocol overview',
        secondaryTitle: 'Prodotti alternativi',
        railTop: 'Click here',
        railBottom: 'Prodotti alternativi',
        alternativesAria: 'Alternative products carousel',
        noAlternatives: 'Il prodotto scelto è unico nel suo genere e non ha alternative.',
        carouselEmpty: 'Nessun prodotto disponibile.',
        shopCarouselAria: 'Shop carousel',
      },
      aria: {
        productVideo: 'Product video',
        productLine: 'Linea prodotto',
        whatsInside: 'Cosa contiene',
        faq: 'FAQ',
        moreProducts: 'Altri prodotti',
      },
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
    cart: {
      title: 'Carrello',
      lead: 'Riepilogo dei prodotti selezionati.',
      note: 'Controlla i prodotti e completa l\'ordine in pochi passaggi.',
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
      protocol: 'DOB Protocol',
      shop: 'Shop',
      journal: 'Journal',
      location: 'Location',
      services: 'Services',
    },
    cta: {
      whatsapp: 'Schedule via WhatsApp',
      call: 'Schedule via call',
      appointment: 'Book now',
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
      note: 'Shop online with secure checkout and immediate order confirmation.',
    },
    productDetail: {
      lineHeadlineFallback: 'Clinically tested formula.',
      lineDetails: {
        goodFor: 'Good for',
        goodForFallback: 'Normal and dry skin',
        feelsLike: 'Feels like',
        feelsLikeFallback: 'Soft, cocooning texture that melts into the skin.',
        smellsLike: 'Smells like',
        smellsLikeFallback: 'Fragrance free',
        award: 'Award',
        awardFallback: 'Dermatologically tested.',
        fyi: 'FYI',
        fyiFallback: 'Cruelty-free • Vegan • Gluten-free',
      },
      crossSell: {
        title: 'Add',
        meta: 'Recommended selection',
        cta: 'Discover',
      },
      accordion: {
        benefits: 'Benefits',
        usage: 'How to use',
        ingredients: 'Active ingredients',
      },
      videoPlaceholder: 'Video placeholder',
      whatsInside: {
        title: "what's inside",
        fallbackWithProduct: 'Discover what makes {{product}} special.',
        fallback: 'Discover what makes this product special.',
      },
      faq: {
        titleFallback: 'FAQ',
        subtitleWithProduct: 'Discover more about {{product}}.',
        subtitleFallback: 'Discover more about this product.',
        fallbackItems: [
          {
            question: 'How do I apply it?',
            answer: 'Use the product as indicated in the recommended routine.',
          },
          {
            question: 'Which skin type is it for?',
            answer: 'Suitable for multiple skin types. If in doubt, ask for a consultation.',
          },
          {
            question: 'How often should I use it?',
            answer: 'Recommended 1-2 times per day according to personal needs.',
          },
        ],
      },
      treatment: {
        primaryTitleFallback: 'Protocol overview',
        secondaryTitle: 'Alternative products',
        railTop: 'Click here',
        railBottom: 'Alternative products',
        alternativesAria: 'Alternative products carousel',
        noAlternatives: 'This product is one of a kind and has no alternatives.',
        carouselEmpty: 'No products available.',
        shopCarouselAria: 'Shop carousel',
      },
      aria: {
        productVideo: 'Product video',
        productLine: 'Product line',
        whatsInside: "What's inside",
        faq: 'FAQ',
        moreProducts: 'More products',
      },
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
    cart: {
      title: 'Cart',
      lead: 'Review the products you have selected.',
      note: 'Review items and complete your order in a few steps.',
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
      protocol: 'DOB Protocol',
      shop: 'Shop',
      journal: 'Journal',
      location: 'Location',
      services: 'Services',
    },
    cta: {
      whatsapp: 'Записаться через WhatsApp',
      call: 'Записаться по телефону',
      appointment: 'Записаться сейчас',
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
      note: 'Покупайте онлайн с безопасным оформлением и моментальным подтверждением заказа.',
    },
    productDetail: {
      lineHeadlineFallback: 'Клинически протестированная формула.',
      lineDetails: {
        goodFor: 'Подходит для',
        goodForFallback: 'Нормальной и сухой кожи',
        feelsLike: 'Ощущение',
        feelsLikeFallback: 'Мягкая обволакивающая текстура, тающая на коже.',
        smellsLike: 'Аромат',
        smellsLikeFallback: 'Без отдушки',
        award: 'Сертификация',
        awardFallback: 'Дерматологически протестировано.',
        fyi: 'Важно',
        fyiFallback: 'Cruelty-free • Vegan • Gluten-free',
      },
      crossSell: {
        title: 'Добавить',
        meta: 'Рекомендуемый выбор',
        cta: 'Подробнее',
      },
      accordion: {
        benefits: 'Преимущества',
        usage: 'Способ применения',
        ingredients: 'Активные ингредиенты',
      },
      videoPlaceholder: 'Видео',
      whatsInside: {
        title: 'что внутри',
        fallbackWithProduct: 'Узнайте, что делает {{product}} особенным.',
        fallback: 'Узнайте, что делает этот продукт особенным.',
      },
      faq: {
        titleFallback: 'FAQ',
        subtitleWithProduct: 'Узнайте больше о {{product}}.',
        subtitleFallback: 'Узнайте больше об этом продукте.',
        fallbackItems: [
          {
            question: 'Как применять?',
            answer: 'Используйте продукт согласно рекомендованному протоколу.',
          },
          {
            question: 'Для какого типа кожи подходит?',
            answer: 'Подходит для разных типов кожи. При сомнениях запросите консультацию.',
          },
          {
            question: 'Как часто использовать?',
            answer: 'Рекомендуется 1-2 раза в день в зависимости от потребностей.',
          },
        ],
      },
      treatment: {
        primaryTitleFallback: 'Обзор протокола',
        secondaryTitle: 'Альтернативные продукты',
        railTop: 'Нажмите',
        railBottom: 'Альтернативные продукты',
        alternativesAria: 'Карусель альтернативных продуктов',
        noAlternatives: 'Выбранный продукт уникален и не имеет альтернатив.',
        carouselEmpty: 'Нет доступных продуктов.',
        shopCarouselAria: 'Карусель магазина',
      },
      aria: {
        productVideo: 'Видео продукта',
        productLine: 'Линейка продукта',
        whatsInside: 'Что внутри',
        faq: 'FAQ',
        moreProducts: 'Другие продукты',
      },
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
    cart: {
      title: 'Корзина',
      lead: 'Просмотр выбранных товаров.',
      note: 'Проверьте товары и завершите оформление в несколько шагов.',
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

type JourneyCopy = {
  checkout: {
    stepper: {
      cart: string
      information: string
      shipping: string
      payment: string
    }
    expressCheckout: string
    orDivider: string
    contact: string
    shippingAddress: string
    placeholders: {
      email: string
      firstName: string
      lastName: string
      address: string
      postalCode: string
      city: string
      province: string
      phoneOptional: string
      discountCode: string
    }
    actions: {
      returnToCart: string
      goToShipping: string
      returnToInformation: string
      continueToPayment: string
      returnToShipping: string
      payNow: string
      processing: string
      apply: string
      change: string
      add: string
    }
    sections: {
      shippingMethod: string
      payment: string
      billingAddress: string
      recommendations: string
    }
    summary: {
      subtotal: string
      shipping: string
      total: string
    }
    messages: {
      secureTransactions: string
      billingAddressDescription: string
      sameAsShipping: string
      useDifferentBilling: string
      shippingCalculatedNextStep: string
      shippingCalculating: string
      shippingLoadingMethods: string
      shippingNoMethods: string
      loadingRecommendations: string
      noRecommendations: string
      loadingPaymentElement: string
      paymentElementLoadErrorPrefix: string
      cartEmpty: string
      defaultProductLabel: string
      includingTaxes: string
      completeRequiredFields: string
      cartEmptyError: string
      unavailableProducts: string
      insufficientAvailability: string
      checkoutFailed: string
      paymentConfigIncomplete: string
      checkoutResponseInvalid: string
      paymentFailedRetry: string
      paymentIncomplete: string
    }
    footer: {
      refundPolicy: string
      shipping: string
      privacyPolicy: string
      termsOfService: string
      contact: string
    }
    country: string
  }
  cartDrawer: {
    itemsLabel: string
    freeShippingUnlocked: string
    cartEmpty: string
    decreaseQuantityAria: string
    increaseQuantityAria: string
    remove: string
    completeRoutine: string
    recommendedSelection: string
    add: string
    subtotal: string
    summaryNote: string
    checkout: string
  }
  cartPage: {
    home: string
    cart: string
    returnToShopping: string
    product: string
    price: string
    quantity: string
    subtotal: string
    empty: string
    checkoutCta: string
    completeOrder: string
    steps: {
      login: string
      addresses: string
      shipping: string
      payment: string
      confirmation: string
    }
    guestBox: {
      title: string
      description: string
      selectOption: string
      guest: string
      login: string
      register: string
    }
    discount: {
      title: string
      description: string
      placeholder: string
      apply: string
    }
    summary: {
      title: string
      taxesIncluded: string
      shipping: string
      country: string
      total: string
    }
  }
  shop: {
    addToCart: string
  }
  checkoutSuccess: {
    orderCompleted: string
    thankYou: string
    processingOrder: string
    orderReference: string
    backToShop: string
    goHome: string
  }
  shopFilters: {
    sectionNavigator: string
    sectionRoutine: string
    sectionConsultation: string
    sectionShopAll: string
    filters: string
    removeAll: string
    needs: string
    texture: string
    productAreas: string
    timing: string
    skinTypes: string
    brand: string
    brandLine: string
    noOptions: string
    orderBy: string
    orderRecent: string
    orderPriceAsc: string
    orderPriceDesc: string
    orderTitle: string
  }
}

export const journeyDictionary: Record<Locale, JourneyCopy> = {
  it: {
    checkout: {
      stepper: {
        cart: 'Cart',
        information: 'Information',
        shipping: 'Shipping',
        payment: 'Payment',
      },
      expressCheckout: 'Express checkout',
      orDivider: 'or',
      contact: 'Contatto',
      shippingAddress: 'Indirizzo di spedizione',
      placeholders: {
        email: 'Email',
        firstName: 'Nome',
        lastName: 'Cognome',
        address: 'Indirizzo',
        postalCode: 'CAP',
        city: 'Città',
        province: 'Provincia',
        phoneOptional: 'Telefono (opzionale)',
        discountCode: 'Codice sconto o gift card',
      },
      actions: {
        returnToCart: 'Torna al carrello',
        goToShipping: 'Vai alla spedizione',
        returnToInformation: 'Torna alle informazioni',
        continueToPayment: 'Continua al pagamento',
        returnToShipping: 'Torna alla spedizione',
        payNow: 'Paga ora',
        processing: 'Elaborazione...',
        apply: 'Applica',
        change: 'Modifica',
        add: 'Aggiungi',
      },
      sections: {
        shippingMethod: 'Metodo di spedizione',
        payment: 'Pagamento',
        billingAddress: 'Indirizzo di fatturazione',
        recommendations: 'Just one more thing',
      },
      summary: {
        subtotal: 'Subtotale',
        shipping: 'Spedizione',
        total: 'Totale',
      },
      messages: {
        secureTransactions: 'Tutte le transazioni sono sicure e crittografate.',
        billingAddressDescription: 'Seleziona l’indirizzo che corrisponde alla carta o al metodo di pagamento.',
        sameAsShipping: 'Uguale all’indirizzo di spedizione',
        useDifferentBilling: 'Usa un indirizzo di fatturazione diverso',
        shippingCalculatedNextStep: 'Calcolata al prossimo step',
        shippingCalculating: 'Calcolo spedizione...',
        shippingLoadingMethods: 'Calcolo opzioni di spedizione...',
        shippingNoMethods: 'Nessun metodo disponibile per questo indirizzo.',
        loadingRecommendations: 'Caricamento suggerimenti...',
        noRecommendations: 'Nessun suggerimento disponibile.',
        loadingPaymentElement: 'Inizializzazione Stripe Payment Element...',
        paymentElementLoadErrorPrefix: 'Impossibile caricare Stripe Payment Element:',
        cartEmpty: 'Il carrello è vuoto.',
        defaultProductLabel: 'Prodotto',
        includingTaxes: 'Tasse incluse',
        completeRequiredFields: 'Compila tutti i campi obbligatori prima di continuare.',
        cartEmptyError: 'Il carrello è vuoto.',
        unavailableProducts: 'Alcuni prodotti nel carrello non sono più disponibili. Aggiorna il carrello.',
        insufficientAvailability: 'Disponibilità insufficiente.',
        checkoutFailed: 'Checkout non riuscito.',
        paymentConfigIncomplete: 'Configurazione Stripe Payment Element incompleta.',
        checkoutResponseInvalid: 'Risposta checkout non valida.',
        paymentFailedRetry: 'Pagamento non riuscito. Riprova.',
        paymentIncomplete: 'Pagamento non completato. Verifica i dati e riprova.',
      },
      footer: {
        refundPolicy: 'Refund policy',
        shipping: 'Shipping',
        privacyPolicy: 'Privacy policy',
        termsOfService: 'Terms of service',
        contact: 'Contact',
      },
      country: 'Italia',
    },
    cartDrawer: {
      itemsLabel: 'articoli',
      freeShippingUnlocked: 'Spedizione standard gratuita sbloccata',
      cartEmpty: 'Il carrello è vuoto.',
      decreaseQuantityAria: 'Diminuisci quantità',
      increaseQuantityAria: 'Aumenta quantità',
      remove: 'Rimuovi',
      completeRoutine: 'Completa la tua routine',
      recommendedSelection: 'Selezione consigliata',
      add: 'Aggiungi',
      subtotal: 'Subtotale',
      summaryNote: '*spedizione, tasse e sconti calcolati al checkout.',
      checkout: 'Checkout',
    },
    cartPage: {
      home: 'Home',
      cart: 'Carrello',
      returnToShopping: 'Torna allo shopping',
      product: 'Prodotto',
      price: 'Prezzo',
      quantity: 'Quantità',
      subtotal: 'Subtotale',
      empty: 'Il carrello è vuoto.',
      checkoutCta: 'Procedi al checkout',
      completeOrder: 'Completa ordine',
      steps: {
        login: 'Login',
        addresses: 'Indirizzi',
        shipping: 'Spedizione',
        payment: 'Pagamento',
        confirmation: 'Conferma',
      },
      guestBox: {
        title: 'Accedi, registrati o acquista come ospite',
        description:
          'Acquista come ospite, accedi con le tue credenziali, oppure registrati e in seguito ti verranno richiesti email e password.',
        selectOption: 'Seleziona un’opzione:',
        guest: 'Acquista come ospite',
        login: 'Accedi',
        register: 'Registrati',
      },
      discount: {
        title: 'Codice sconto',
        description: 'Se possiedi un codice sconto inseriscilo nel campo seguente.',
        placeholder: 'Codice',
        apply: 'Applica',
      },
      summary: {
        title: 'Riepilogo ordine',
        taxesIncluded: 'Tasse incluse',
        shipping: 'Spedizione',
        country: 'Italia',
        total: 'Totale',
      },
    },
    shop: {
      addToCart: 'Aggiungi al carrello',
    },
    checkoutSuccess: {
      orderCompleted: 'Ordine completato',
      thankYou: 'Grazie per il tuo acquisto',
      processingOrder: 'Abbiamo ricevuto il tuo ordine e lo stiamo elaborando.',
      orderReference: 'Riferimento ordine',
      backToShop: 'Torna allo shop',
      goHome: 'Vai alla home',
    },
    shopFilters: {
      sectionNavigator: 'Shop Navigator',
      sectionRoutine: 'Routine Builder',
      sectionConsultation: 'Consulenza',
      sectionShopAll: 'Shop all',
      filters: 'Filtri',
      removeAll: 'Rimuovi tutti',
      needs: 'Esigenze',
      texture: 'Texture',
      productAreas: 'Aree prodotto',
      timing: 'Timing',
      skinTypes: 'Tipi di pelle',
      brand: 'Brand',
      brandLine: 'Linea',
      noOptions: 'Nessuna opzione',
      orderBy: 'Ordina per',
      orderRecent: 'Più recenti',
      orderPriceAsc: 'Prezzo crescente',
      orderPriceDesc: 'Prezzo decrescente',
      orderTitle: 'Titolo A-Z',
    },
  },
  en: {
    checkout: {
      stepper: {
        cart: 'Cart',
        information: 'Information',
        shipping: 'Shipping',
        payment: 'Payment',
      },
      expressCheckout: 'Express checkout',
      orDivider: 'or',
      contact: 'Contact',
      shippingAddress: 'Shipping address',
      placeholders: {
        email: 'Email',
        firstName: 'First name',
        lastName: 'Last name',
        address: 'Address',
        postalCode: 'Postal code',
        city: 'City',
        province: 'Province',
        phoneOptional: 'Phone (optional)',
        discountCode: 'Discount code or gift card',
      },
      actions: {
        returnToCart: 'Return to cart',
        goToShipping: 'Go to shipping',
        returnToInformation: 'Return to information',
        continueToPayment: 'Continue to payment',
        returnToShipping: 'Return to shipping',
        payNow: 'Pay now',
        processing: 'Processing...',
        apply: 'Apply',
        change: 'Change',
        add: 'Add',
      },
      sections: {
        shippingMethod: 'Shipping method',
        payment: 'Payment',
        billingAddress: 'Billing address',
        recommendations: 'Just one more thing',
      },
      summary: {
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        total: 'Total',
      },
      messages: {
        secureTransactions: 'All transactions are secure and encrypted.',
        billingAddressDescription: 'Select the address that matches your card or payment method.',
        sameAsShipping: 'Same as shipping address',
        useDifferentBilling: 'Use a different billing address',
        shippingCalculatedNextStep: 'Calculated at next step',
        shippingCalculating: 'Calculating shipping...',
        shippingLoadingMethods: 'Calculating shipping options...',
        shippingNoMethods: 'No shipping methods available for this address.',
        loadingRecommendations: 'Loading recommendations...',
        noRecommendations: 'No recommendations available.',
        loadingPaymentElement: 'Initializing Stripe Payment Element...',
        paymentElementLoadErrorPrefix: 'Unable to load Stripe Payment Element:',
        cartEmpty: 'Your cart is empty.',
        defaultProductLabel: 'Product',
        includingTaxes: 'Including taxes',
        completeRequiredFields: 'Complete all required fields before continuing.',
        cartEmptyError: 'Your cart is empty.',
        unavailableProducts: 'Some products are no longer available. Update your cart.',
        insufficientAvailability: 'Insufficient availability.',
        checkoutFailed: 'Checkout failed.',
        paymentConfigIncomplete: 'Incomplete Stripe Payment Element configuration.',
        checkoutResponseInvalid: 'Invalid checkout response.',
        paymentFailedRetry: 'Payment failed. Please try again.',
        paymentIncomplete: 'Payment not completed. Verify your data and try again.',
      },
      footer: {
        refundPolicy: 'Refund policy',
        shipping: 'Shipping',
        privacyPolicy: 'Privacy policy',
        termsOfService: 'Terms of service',
        contact: 'Contact',
      },
      country: 'Italy',
    },
    cartDrawer: {
      itemsLabel: 'items',
      freeShippingUnlocked: 'Free standard shipping unlocked',
      cartEmpty: 'Your cart is empty.',
      decreaseQuantityAria: 'Decrease quantity',
      increaseQuantityAria: 'Increase quantity',
      remove: 'Remove',
      completeRoutine: 'Complete your routine',
      recommendedSelection: 'Recommended selection',
      add: 'Add',
      subtotal: 'Subtotal',
      summaryNote: '*shipping, taxes, and discounts calculated at checkout.',
      checkout: 'Checkout',
    },
    cartPage: {
      home: 'Home',
      cart: 'Cart',
      returnToShopping: 'Return to shopping',
      product: 'Product',
      price: 'Price',
      quantity: 'Quantity',
      subtotal: 'Subtotal',
      empty: 'Your cart is empty.',
      checkoutCta: 'Proceed to checkout',
      completeOrder: 'Complete order',
      steps: {
        login: 'Login',
        addresses: 'Addresses',
        shipping: 'Shipping',
        payment: 'Payment',
        confirmation: 'Confirmation',
      },
      guestBox: {
        title: 'Login, register or continue as guest',
        description:
          'Checkout as guest, login with your credentials, or register to continue with your email and password.',
        selectOption: 'Choose an option:',
        guest: 'Checkout as guest',
        login: 'Login',
        register: 'Register',
      },
      discount: {
        title: 'Discount code',
        description: 'If you have a discount code, enter it below.',
        placeholder: 'Code',
        apply: 'Apply',
      },
      summary: {
        title: 'Order summary',
        taxesIncluded: 'Taxes included',
        shipping: 'Shipping',
        country: 'Italy',
        total: 'Total',
      },
    },
    shop: {
      addToCart: 'Add to cart',
    },
    checkoutSuccess: {
      orderCompleted: 'Order completed',
      thankYou: 'Thank you for your purchase',
      processingOrder: 'We received your order and we are processing it.',
      orderReference: 'Order reference',
      backToShop: 'Back to shop',
      goHome: 'Go to home',
    },
    shopFilters: {
      sectionNavigator: 'Shop Navigator',
      sectionRoutine: 'Routine Builder',
      sectionConsultation: 'Consultation',
      sectionShopAll: 'Shop all',
      filters: 'Filters',
      removeAll: 'Remove all',
      needs: 'Needs',
      texture: 'Texture',
      productAreas: 'Product areas',
      timing: 'Timing',
      skinTypes: 'Skin types',
      brand: 'Brand',
      brandLine: 'Brand line',
      noOptions: 'No options',
      orderBy: 'Order by',
      orderRecent: 'Recent',
      orderPriceAsc: 'Price ascending',
      orderPriceDesc: 'Price descending',
      orderTitle: 'Title A-Z',
    },
  },
  ru: {
    checkout: {
      stepper: {
        cart: 'Cart',
        information: 'Information',
        shipping: 'Shipping',
        payment: 'Payment',
      },
      expressCheckout: 'Express checkout',
      orDivider: 'or',
      contact: 'Контакт',
      shippingAddress: 'Адрес доставки',
      placeholders: {
        email: 'Email',
        firstName: 'Имя',
        lastName: 'Фамилия',
        address: 'Адрес',
        postalCode: 'Почтовый индекс',
        city: 'Город',
        province: 'Область',
        phoneOptional: 'Телефон (необязательно)',
        discountCode: 'Промокод или gift card',
      },
      actions: {
        returnToCart: 'Вернуться в корзину',
        goToShipping: 'К доставке',
        returnToInformation: 'Вернуться к данным',
        continueToPayment: 'Перейти к оплате',
        returnToShipping: 'Вернуться к доставке',
        payNow: 'Оплатить',
        processing: 'Обработка...',
        apply: 'Применить',
        change: 'Изменить',
        add: 'Добавить',
      },
      sections: {
        shippingMethod: 'Способ доставки',
        payment: 'Оплата',
        billingAddress: 'Адрес для счета',
        recommendations: 'Just one more thing',
      },
      summary: {
        subtotal: 'Промежуточный итог',
        shipping: 'Доставка',
        total: 'Итого',
      },
      messages: {
        secureTransactions: 'Все транзакции защищены и зашифрованы.',
        billingAddressDescription: 'Выберите адрес, который соответствует вашей карте или способу оплаты.',
        sameAsShipping: 'Как адрес доставки',
        useDifferentBilling: 'Использовать другой адрес для счета',
        shippingCalculatedNextStep: 'Рассчитается на следующем шаге',
        shippingCalculating: 'Рассчитываем доставку...',
        shippingLoadingMethods: 'Рассчитываем варианты доставки...',
        shippingNoMethods: 'Для этого адреса нет доступных способов доставки.',
        loadingRecommendations: 'Загрузка рекомендаций...',
        noRecommendations: 'Рекомендации недоступны.',
        loadingPaymentElement: 'Инициализация Stripe Payment Element...',
        paymentElementLoadErrorPrefix: 'Не удалось загрузить Stripe Payment Element:',
        cartEmpty: 'Корзина пуста.',
        defaultProductLabel: 'Товар',
        includingTaxes: 'Налоги включены',
        completeRequiredFields: 'Заполните все обязательные поля перед продолжением.',
        cartEmptyError: 'Корзина пуста.',
        unavailableProducts: 'Некоторые товары больше недоступны. Обновите корзину.',
        insufficientAvailability: 'Недостаточно доступного количества.',
        checkoutFailed: 'Ошибка checkout.',
        paymentConfigIncomplete: 'Неполная конфигурация Stripe Payment Element.',
        checkoutResponseInvalid: 'Некорректный ответ checkout.',
        paymentFailedRetry: 'Оплата не удалась. Повторите попытку.',
        paymentIncomplete: 'Оплата не завершена. Проверьте данные и попробуйте снова.',
      },
      footer: {
        refundPolicy: 'Refund policy',
        shipping: 'Shipping',
        privacyPolicy: 'Privacy policy',
        termsOfService: 'Terms of service',
        contact: 'Contact',
      },
      country: 'Italy',
    },
    cartDrawer: {
      itemsLabel: 'товаров',
      freeShippingUnlocked: 'Бесплатная стандартная доставка доступна',
      cartEmpty: 'Корзина пуста.',
      decreaseQuantityAria: 'Уменьшить количество',
      increaseQuantityAria: 'Увеличить количество',
      remove: 'Удалить',
      completeRoutine: 'Дополните вашу рутину',
      recommendedSelection: 'Рекомендуемая подборка',
      add: 'Добавить',
      subtotal: 'Промежуточный итог',
      summaryNote: '*доставка, налоги и скидки рассчитываются при checkout.',
      checkout: 'Checkout',
    },
    cartPage: {
      home: 'Home',
      cart: 'Корзина',
      returnToShopping: 'Вернуться к покупкам',
      product: 'Товар',
      price: 'Цена',
      quantity: 'Количество',
      subtotal: 'Промежуточный итог',
      empty: 'Корзина пуста.',
      checkoutCta: 'Перейти к checkout',
      completeOrder: 'Оформление заказа',
      steps: {
        login: 'Вход',
        addresses: 'Адреса',
        shipping: 'Доставка',
        payment: 'Оплата',
        confirmation: 'Подтверждение',
      },
      guestBox: {
        title: 'Войдите, зарегистрируйтесь или оформите как гость',
        description:
          'Оформите заказ как гость, войдите в аккаунт или зарегистрируйтесь, чтобы продолжить с email и паролем.',
        selectOption: 'Выберите вариант:',
        guest: 'Оформить как гость',
        login: 'Войти',
        register: 'Регистрация',
      },
      discount: {
        title: 'Промокод',
        description: 'Если у вас есть промокод, введите его ниже.',
        placeholder: 'Код',
        apply: 'Применить',
      },
      summary: {
        title: 'Сводка заказа',
        taxesIncluded: 'Налоги включены',
        shipping: 'Доставка',
        country: 'Италия',
        total: 'Итого',
      },
    },
    shop: {
      addToCart: 'Добавить в корзину',
    },
    checkoutSuccess: {
      orderCompleted: 'Заказ оформлен',
      thankYou: 'Спасибо за покупку',
      processingOrder: 'Мы получили ваш заказ и обрабатываем его.',
      orderReference: 'Номер заказа',
      backToShop: 'Вернуться в магазин',
      goHome: 'На главную',
    },
    shopFilters: {
      sectionNavigator: 'Shop Navigator',
      sectionRoutine: 'Routine Builder',
      sectionConsultation: 'Консультация',
      sectionShopAll: 'Shop all',
      filters: 'Фильтры',
      removeAll: 'Сбросить все',
      needs: 'Потребности',
      texture: 'Текстура',
      productAreas: 'Зоны продукта',
      timing: 'Время',
      skinTypes: 'Типы кожи',
      brand: 'Бренд',
      brandLine: 'Линия бренда',
      noOptions: 'Нет опций',
      orderBy: 'Сортировать',
      orderRecent: 'Сначала новые',
      orderPriceAsc: 'Цена по возрастанию',
      orderPriceDesc: 'Цена по убыванию',
      orderTitle: 'Название А-Я',
    },
  },
}

export const getJourneyDictionary = (locale: Locale) => journeyDictionary[locale]
