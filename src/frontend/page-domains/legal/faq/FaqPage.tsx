import { notFound } from 'next/navigation'

import { Hero } from '@/frontend/components/heroes/Hero'
import { FaqGroups } from '@/frontend/page-domains/legal/faq/FaqGroups'
import { getFaqConfig } from '@/lib/frontend/legal/faq'
import { isLocale, type Locale } from '@/lib/i18n/core'
import styles from './FaqPage.module.css'

const copyByLocale: Record<
  Locale,
  {
    title: string
    intro: string
    items: Array<{ question: string; answer: string }>
  }
> = {
  it: {
    title: 'Domande frequenti',
    intro:
      'Una raccolta rapida delle domande che riceviamo piu spesso su prenotazioni, trattamenti, shop online e assistenza.',
    items: [
      {
        question: 'Come posso prenotare un trattamento?',
        answer:
          'Puoi contattarci dalla pagina Contatti oppure tramite i canali diretti indicati sul sito per concordare disponibilita e appuntamento.',
      },
      {
        question: 'Posso acquistare prodotti online?',
        answer:
          'Si. Lo shop DOB Milano permette di acquistare prodotti professionali online con checkout dedicato e conferma ordine.',
      },
      {
        question: 'Come posso ricevere assistenza su un ordine?',
        answer:
          'Per supporto su ordini, spedizioni o rimborsi puoi usare il form contatti oppure scriverci all’indirizzo email indicato nella pagina Contact.',
      },
    ],
  },
  en: {
    title: 'Frequently asked questions',
    intro:
      'A quick collection of the questions we receive most often about bookings, treatments, online shop and support.',
    items: [
      {
        question: 'How can I book a treatment?',
        answer:
          'You can contact us through the Contact page or through the direct channels listed on the site to arrange availability and appointments.',
      },
      {
        question: 'Can I buy products online?',
        answer:
          'Yes. The DOB Milano shop lets you purchase professional products online with a dedicated checkout and order confirmation.',
      },
      {
        question: 'How can I get support for an order?',
        answer:
          'For help with orders, shipping or refunds, use the contact form or write to the email address listed on the Contact page.',
      },
    ],
  },
  ru: {
    title: 'Часто задаваемые вопросы',
    intro:
      'Краткая подборка самых частых вопросов о бронировании, процедурах, онлайн-магазине и поддержке.',
    items: [
      {
        question: 'Как записаться на процедуру?',
        answer:
          'Вы можете связаться с нами через страницу Contact или по прямым каналам, указанным на сайте, чтобы согласовать доступность и запись.',
      },
      {
        question: 'Можно ли купить продукты онлайн?',
        answer:
          'Да. Магазин DOB Milano позволяет покупать профессиональные продукты онлайн с отдельным checkout и подтверждением заказа.',
      },
      {
        question: 'Как получить поддержку по заказу?',
        answer:
          'Для помощи по заказам, доставке или возвратам используйте контактную форму или напишите на email, указанный на странице Contact.',
      },
    ],
  },
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const config = await getFaqConfig(locale)
  const copy = copyByLocale[locale]

  return (
    <main className={styles.page}>
      <Hero
        title={config.title}
        description={config.subtitle}
        mediaDark={config.media}
        ariaLabel={config.title}
      />

      <section className={styles.listSection}>
        <header className={styles.header}>
          <h2 className={`typo-h2 ${styles.sectionTitle}`}>{copy.title}</h2>
          <p className={`${styles.intro} typo-body-lg`}>{copy.intro}</p>
        </header>
        <FaqGroups groups={config.groups} />
      </section>
    </main>
  )
}
