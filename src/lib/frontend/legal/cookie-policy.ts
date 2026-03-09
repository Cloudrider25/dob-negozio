import { cache } from 'react'

import type { Locale } from '@/lib/i18n/core'
import type { Page } from '@/payload/generated/payload-types'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

export type CookiePolicySection = {
  title: string
  body: string
}

export type CookiePolicyPageContent = {
  title: string
  intro: string
  sections: CookiePolicySection[]
}

export type CookiePolicyBannerContent = {
  title: string
  body: string
  cookiePolicyLabel: string
  privacyPolicyLabel: string
  storagePreferencesLabel: string
  essentialLabel: string
  essentialDescription: string
  advertisingLabel: string
  advertisingDescription: string
  personalizationLabel: string
  personalizationDescription: string
  analyticsLabel: string
  analyticsDescription: string
  saveLabel: string
  acceptAllLabel: string
  rejectOptionalLabel: string
  closeLabel: string
}

export type CookiePolicyConfig = {
  seo: Page['seo'] | null
  page: CookiePolicyPageContent
  banner: CookiePolicyBannerContent
}

const fallbackByLocale: Record<Locale, Omit<CookiePolicyConfig, 'seo'>> = {
  it: {
    page: {
      title: 'Cookie Policy',
      intro:
        'Questa pagina descrive in modo operativo quali categorie di cookie utilizza DOB Milano, per quali finalita e come puoi gestire il consenso.',
      sections: [
        {
          title: 'Cookie essenziali',
          body:
            'Sono necessari per il funzionamento tecnico del sito, per la sicurezza, per il carrello, per il checkout e per mantenere le preferenze strettamente necessarie alla navigazione.',
        },
        {
          title: 'Cookie analitici',
          body:
            "Ci aiutano a capire come viene utilizzato il sito, quali pagine performano meglio e dove migliorare l'esperienza utente.",
        },
        {
          title: 'Cookie di personalizzazione',
          body:
            'Consentono di adattare contenuti, percorsi e interazioni in base alle preferenze espresse o al comportamento di navigazione.',
        },
        {
          title: 'Cookie pubblicitari',
          body:
            'Possono essere usati per attivita di marketing e comunicazione mirata, inclusa la misurazione delle campagne e la personalizzazione dei messaggi promozionali.',
        },
        {
          title: 'Gestione del consenso',
          body:
            'Puoi accettare tutte le categorie opzionali, rifiutare tutto cio che non e essenziale oppure salvare selezioni personalizzate tramite il banner cookie o il link nel footer.',
        },
      ],
    },
    banner: {
      title: 'Cookie',
      body:
        'Questo sito web utilizza tecnologie come i cookie per abilitare le funzionalita essenziali del sito, nonche per analitici, personalizzazione e pubblicita mirata. Puoi accettare le impostazioni predefinite oppure modificare le impostazioni in qualunque momento. Puoi chiudere questo banner per continuare con solo i cookie essenziali.',
      cookiePolicyLabel: "Politica sull'uso dei cookie",
      privacyPolicyLabel: 'Politica sulla riservatezza',
      storagePreferencesLabel: 'Preferenze di archiviazione',
      essentialLabel: 'Essenziali',
      essentialDescription:
        'Necessari per abilitare le funzionalita di base del sito. Non possono essere disattivati.',
      advertisingLabel: 'Pubblicita mirata',
      advertisingDescription:
        'Utilizzati per comunicazioni promozionali piu rilevanti e per la misurazione delle campagne marketing.',
      personalizationLabel: 'Personalizzazione',
      personalizationDescription:
        'Consentono al sito di ricordare le scelte effettuate e adattare parti dell esperienza in base alle preferenze.',
      analyticsLabel: 'Analitici',
      analyticsDescription:
        'Aiutano a capire come viene utilizzato il sito, quali contenuti performano meglio e dove migliorare.',
      saveLabel: 'Salva',
      acceptAllLabel: 'Accetta tutto',
      rejectOptionalLabel: "Rifiutare cio che non e essenziale",
      closeLabel: 'Chiudi banner cookie',
    },
  },
  en: {
    page: {
      title: 'Cookie Policy',
      intro:
        'This page outlines which cookie categories DOB Milano uses, for what purposes, and how you can manage consent.',
      sections: [
        {
          title: 'Essential cookies',
          body:
            'These are required for technical site operation, security, cart functionality, checkout, and strictly necessary navigation preferences.',
        },
        {
          title: 'Analytics cookies',
          body:
            'They help us understand how the site is used, which pages perform best, and where the user experience can be improved.',
        },
        {
          title: 'Personalization cookies',
          body:
            'They allow us to adapt content, journeys, and interactions based on stated preferences or browsing behavior.',
        },
        {
          title: 'Advertising cookies',
          body:
            'They may be used for marketing and targeted communication, including campaign measurement and promotional personalization.',
        },
        {
          title: 'Consent management',
          body:
            'You can accept all optional categories, reject all non-essential ones, or save custom selections through the cookie banner or the footer link.',
        },
      ],
    },
    banner: {
      title: 'Cookie',
      body:
        'This website uses technologies such as cookies to enable essential site functionality, as well as analytics, personalization, and targeted advertising. You can accept the default settings or change them at any time. You can close this banner to continue with essential cookies only.',
      cookiePolicyLabel: 'Cookie policy',
      privacyPolicyLabel: 'Privacy policy',
      storagePreferencesLabel: 'Storage preferences',
      essentialLabel: 'Essential',
      essentialDescription:
        'Required to enable core site functionality. Essential cookies cannot be disabled.',
      advertisingLabel: 'Targeted advertising',
      advertisingDescription:
        'Used to deliver more relevant promotional communication and to measure marketing campaign performance.',
      personalizationLabel: 'Personalization',
      personalizationDescription:
        'Allows the site to remember your choices and adapt parts of the experience to your preferences.',
      analyticsLabel: 'Analytics',
      analyticsDescription:
        'Helps us understand how the site is used, which content performs best, and where to improve.',
      saveLabel: 'Save',
      acceptAllLabel: 'Accept all',
      rejectOptionalLabel: 'Reject non-essential',
      closeLabel: 'Close cookie banner',
    },
  },
  ru: {
    page: {
      title: 'Cookie Policy',
      intro:
        'На этой странице описаны категории cookie, которые использует DOB Milano, их цели и способы управления согласием.',
      sections: [
        {
          title: 'Обязательные cookie',
          body:
            'Они необходимы для технической работы сайта, безопасности, корзины, checkout и строго необходимых настроек навигации.',
        },
        {
          title: 'Аналитические cookie',
          body:
            'Они помогают понять, как используется сайт, какие страницы работают лучше и где нужно улучшить пользовательский опыт.',
        },
        {
          title: 'Cookie персонализации',
          body:
            'Они позволяют адаптировать контент, сценарии и взаимодействия в соответствии с предпочтениями пользователя и его поведением на сайте.',
        },
        {
          title: 'Рекламные cookie',
          body:
            'Они могут использоваться для маркетинга и таргетированной коммуникации, включая измерение кампаний и персонализацию рекламных сообщений.',
        },
        {
          title: 'Управление согласием',
          body:
            'Вы можете принять все необязательные категории, отклонить все необязательные или сохранить собственные настройки через cookie-баннер или ссылку в footer.',
        },
      ],
    },
    banner: {
      title: 'Cookie',
      body:
        'Этот сайт использует технологии, такие как cookie, для обеспечения основных функций сайта, а также для аналитики, персонализации и таргетированной рекламы. Вы можете принять стандартные настройки или изменить их в любое время. Вы можете закрыть этот баннер и продолжить только с обязательными cookie.',
      cookiePolicyLabel: 'Политика cookie',
      privacyPolicyLabel: 'Политика конфиденциальности',
      storagePreferencesLabel: 'Настройки хранения',
      essentialLabel: 'Обязательные',
      essentialDescription:
        'Необходимы для работы основных функций сайта. Обязательные cookie нельзя отключить.',
      advertisingLabel: 'Таргетированная реклама',
      advertisingDescription:
        'Используются для более релевантной рекламной коммуникации и измерения эффективности маркетинговых кампаний.',
      personalizationLabel: 'Персонализация',
      personalizationDescription:
        'Позволяют сайту запоминать ваши выборы и адаптировать части пользовательского опыта под ваши предпочтения.',
      analyticsLabel: 'Аналитика',
      analyticsDescription:
        'Помогают понять, как используется сайт, какой контент работает лучше и где требуется улучшение.',
      saveLabel: 'Сохранить',
      acceptAllLabel: 'Принять все',
      rejectOptionalLabel: 'Отклонить необязательное',
      closeLabel: 'Закрыть баннер cookie',
    },
  },
}

const readString = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

const readSections = (value: unknown, fallback: CookiePolicySection[]) => {
  if (!Array.isArray(value)) return fallback

  const sections = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as { title?: unknown; body?: unknown }
      const title = typeof record.title === 'string' ? record.title.trim() : ''
      const body = typeof record.body === 'string' ? record.body.trim() : ''
      if (!title || !body) return null
      return { title, body } satisfies CookiePolicySection
    })
    .filter(Boolean) as CookiePolicySection[]

  return sections.length > 0 ? sections : fallback
}

export const getCookiePolicyConfig = cache(async (locale: Locale): Promise<CookiePolicyConfig> => {
  const fallback = fallbackByLocale[locale]

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'pages',
      locale,
      fallbackLocale: 'it',
      overrideAccess: false,
      limit: 1,
      depth: 0,
      where: {
        pageKey: {
          equals: 'cookie-policy',
        },
      },
      select: {
        seo: true,
        cookiePolicyPageTitle: true,
        cookiePolicyPageIntro: true,
        cookiePolicySections: true,
        cookiePolicyBanner: true,
      },
    })

    const doc = result.docs[0]
    const banner = doc?.cookiePolicyBanner

    return {
      seo: doc?.seo ?? null,
      page: {
        title: readString(doc?.cookiePolicyPageTitle, fallback.page.title),
        intro: readString(doc?.cookiePolicyPageIntro, fallback.page.intro),
        sections: readSections(doc?.cookiePolicySections, fallback.page.sections),
      },
      banner: {
        title: readString(
          banner && typeof banner === 'object' ? (banner as { title?: unknown }).title : null,
          fallback.banner.title,
        ),
        body: readString(
          banner && typeof banner === 'object' ? (banner as { body?: unknown }).body : null,
          fallback.banner.body,
        ),
        cookiePolicyLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { cookiePolicyLabel?: unknown }).cookiePolicyLabel
            : null,
          fallback.banner.cookiePolicyLabel,
        ),
        privacyPolicyLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { privacyPolicyLabel?: unknown }).privacyPolicyLabel
            : null,
          fallback.banner.privacyPolicyLabel,
        ),
        storagePreferencesLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { storagePreferencesLabel?: unknown }).storagePreferencesLabel
            : null,
          fallback.banner.storagePreferencesLabel,
        ),
        essentialLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { essentialLabel?: unknown }).essentialLabel
            : null,
          fallback.banner.essentialLabel,
        ),
        essentialDescription: readString(
          banner && typeof banner === 'object'
            ? (banner as { essentialDescription?: unknown }).essentialDescription
            : null,
          fallback.banner.essentialDescription,
        ),
        advertisingLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { advertisingLabel?: unknown }).advertisingLabel
            : null,
          fallback.banner.advertisingLabel,
        ),
        advertisingDescription: readString(
          banner && typeof banner === 'object'
            ? (banner as { advertisingDescription?: unknown }).advertisingDescription
            : null,
          fallback.banner.advertisingDescription,
        ),
        personalizationLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { personalizationLabel?: unknown }).personalizationLabel
            : null,
          fallback.banner.personalizationLabel,
        ),
        personalizationDescription: readString(
          banner && typeof banner === 'object'
            ? (banner as { personalizationDescription?: unknown }).personalizationDescription
            : null,
          fallback.banner.personalizationDescription,
        ),
        analyticsLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { analyticsLabel?: unknown }).analyticsLabel
            : null,
          fallback.banner.analyticsLabel,
        ),
        analyticsDescription: readString(
          banner && typeof banner === 'object'
            ? (banner as { analyticsDescription?: unknown }).analyticsDescription
            : null,
          fallback.banner.analyticsDescription,
        ),
        saveLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { saveLabel?: unknown }).saveLabel
            : null,
          fallback.banner.saveLabel,
        ),
        acceptAllLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { acceptAllLabel?: unknown }).acceptAllLabel
            : null,
          fallback.banner.acceptAllLabel,
        ),
        rejectOptionalLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { rejectOptionalLabel?: unknown }).rejectOptionalLabel
            : null,
          fallback.banner.rejectOptionalLabel,
        ),
        closeLabel: readString(
          banner && typeof banner === 'object'
            ? (banner as { closeLabel?: unknown }).closeLabel
            : null,
          fallback.banner.closeLabel,
        ),
      },
    }
  } catch (error) {
    console.error(`[cookie-policy] Failed to load page config for locale "${locale}".`, error)
    return {
      seo: null,
      page: fallback.page,
      banner: fallback.banner,
    }
  }
})
