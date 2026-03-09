import { notFound } from 'next/navigation'

import { isLocale } from '@/lib/i18n/core'
import styles from './CookiePolicyPage.module.css'

const copyByLocale = {
  it: {
    title: 'Cookie Policy',
    subtitle:
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
  en: {
    title: 'Cookie Policy',
    subtitle:
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
  ru: {
    title: 'Cookie Policy',
    subtitle:
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
} as const

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const copy = copyByLocale[locale]

  return (
    <main className={styles.page}>
      <h1 className={`typo-h1 ${styles.title}`}>{copy.title}</h1>
      <p className={`typo-body ${styles.subtitle}`}>{copy.subtitle}</p>

      <div className={styles.sections}>
        {copy.sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2 className={`typo-h4 ${styles.sectionTitle}`}>{section.title}</h2>
            <p className={`typo-body ${styles.sectionBody}`}>{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  )
}

