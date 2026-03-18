import { cache } from 'react'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from 'lexical'

import type { Locale } from '@/lib/i18n/core'
import type { Page } from '@/payload/generated/payload-types'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { resolveMedia, type ResolvedMedia } from '@/lib/frontend/media/resolve'

export type FaqGroup = {
  label: string
  title: string
  items: Array<{
    question: string
    answerHtml: string
  }>
}

export type FaqConfig = {
  seo: Page['seo'] | null
  title: string
  subtitle: string
  media: ResolvedMedia | null
  groups: FaqGroup[]
}

const fallbackByLocale: Record<
  Locale,
  {
    title: string
    subtitle: string
    groups: FaqGroup[]
  }
> = {
  it: {
    title: 'Domande frequenti',
    subtitle:
      'Una raccolta rapida delle domande che riceviamo piu spesso su prenotazioni, trattamenti, shop online e assistenza.',
    groups: [
      {
        label: 'Products',
        title: 'Products',
        items: [
          {
            question: 'Quali prodotti sono adatti al mio tipo di pelle?',
            answerHtml:
              '<p>Ti consigliamo di usare la pagina contatti oppure i percorsi di consulenza per ricevere un suggerimento coerente con la tua pelle e i tuoi obiettivi.</p>',
          },
          {
            question: 'I prodotti sono adatti anche a pelli sensibili?',
            answerHtml:
              '<p>Dipende dalla formula e dalla sensibilita individuale. In caso di dubbi, contattaci prima dell’acquisto per un orientamento piu preciso.</p>',
          },
        ],
      },
      {
        label: 'Shipping',
        title: 'Shipping',
        items: [
          {
            question: 'Quanto tempo richiede la spedizione?',
            answerHtml:
              '<p>I tempi di spedizione dipendono dalla destinazione e vengono indicati durante il checkout o nella pagina spedizioni.</p>',
          },
        ],
      },
      {
        label: 'Orders and payments',
        title: 'Orders and payments',
        items: [
          {
            question: 'Come posso ricevere assistenza su un ordine?',
            answerHtml:
              '<p>Per supporto su ordini, spedizioni o rimborsi puoi usare il form contatti oppure scriverci tramite i recapiti indicati nella pagina Contact.</p>',
          },
        ],
      },
    ],
  },
  en: {
    title: 'Frequently asked questions',
    subtitle:
      'A quick collection of the questions we receive most often about bookings, treatments, online shop and support.',
    groups: [
      {
        label: 'Products',
        title: 'Products',
        items: [
          {
            question: 'Which products are best for my skin type?',
            answerHtml:
              '<p>We recommend using the contact page or a consultation flow to receive guidance that matches your skin condition and goals.</p>',
          },
          {
            question: 'Are the products suitable for sensitive skin?',
            answerHtml:
              '<p>This depends on the formula and individual sensitivity. If you are unsure, contact us before purchasing for more precise guidance.</p>',
          },
        ],
      },
      {
        label: 'Shipping',
        title: 'Shipping',
        items: [
          {
            question: 'How long does shipping take?',
            answerHtml:
              '<p>Shipping timing depends on destination and is shown during checkout or in the shipping policy page.</p>',
          },
        ],
      },
      {
        label: 'Orders and payments',
        title: 'Orders and payments',
        items: [
          {
            question: 'How can I get help with an order?',
            answerHtml:
              '<p>For order, shipping or refund support, use the contact form or write through the details listed on the Contact page.</p>',
          },
        ],
      },
    ],
  },
  ru: {
    title: 'Часто задаваемые вопросы',
    subtitle:
      'Краткая подборка самых частых вопросов о бронировании, процедурах, онлайн-магазине и поддержке.',
    groups: [
      {
        label: 'Products',
        title: 'Products',
        items: [
          {
            question: 'Какие продукты подойдут моему типу кожи?',
            answerHtml:
              '<p>Мы рекомендуем использовать страницу Contact или консультацию, чтобы получить рекомендации под состояние кожи и ваши цели.</p>',
          },
          {
            question: 'Подходят ли продукты для чувствительной кожи?',
            answerHtml:
              '<p>Это зависит от формулы и индивидуальной чувствительности. Если есть сомнения, свяжитесь с нами до покупки.</p>',
          },
        ],
      },
      {
        label: 'Shipping',
        title: 'Shipping',
        items: [
          {
            question: 'Сколько занимает доставка?',
            answerHtml:
              '<p>Сроки доставки зависят от направления и отображаются во время checkout или на странице доставки.</p>',
          },
        ],
      },
      {
        label: 'Orders and payments',
        title: 'Orders and payments',
        items: [
          {
            question: 'Как получить помощь по заказу?',
            answerHtml:
              '<p>По вопросам заказов, доставки или возвратов используйте контактную форму или данные со страницы Contact.</p>',
          },
        ],
      },
    ],
  },
}

const resolveRichTextHtml = (value: unknown): string | null => {
  if (!value || typeof value !== 'object' || !('root' in value)) return null

  try {
    return convertLexicalToHTML({ data: value as SerializedEditorState }) || null
  } catch {
    return null
  }
}

const resolveFaqGroups = (value: unknown): FaqGroup[] => {
  if (!Array.isArray(value)) return []

  return value
    .map((group) => {
      if (!group || typeof group !== 'object') return null

      const typedGroup = group as {
        label?: unknown
        title?: unknown
        items?: unknown
      }
      const label = typeof typedGroup.label === 'string' ? typedGroup.label.trim() : ''
      const title = typeof typedGroup.title === 'string' ? typedGroup.title.trim() : label
      const items = Array.isArray(typedGroup.items)
        ? typedGroup.items
            .map((item) => {
              if (!item || typeof item !== 'object') return null

              const typedItem = item as { q?: unknown; a?: unknown }
              const question = typeof typedItem.q === 'string' ? typedItem.q.trim() : ''
              const answerHtml = resolveRichTextHtml(typedItem.a)

              if (!question || !answerHtml) return null

              return {
                question,
                answerHtml,
              }
            })
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
        : []

      if (!label || items.length === 0) return null

      return {
        label,
        title: title || label,
        items,
      }
    })
    .filter((group): group is NonNullable<typeof group> => Boolean(group))
}

export const getFaqConfig = cache(async (locale: Locale): Promise<FaqConfig> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'pages',
      locale,
      fallbackLocale: 'it',
      overrideAccess: false,
      limit: 1,
      depth: 1,
      where: {
        pageKey: {
          equals: 'faq',
        },
      },
    })

    const page = result.docs[0]
    const fallback = fallbackByLocale[locale]

    return {
      seo: page?.seo ?? null,
      title: page?.faqTitle?.trim() || fallback.title,
      subtitle: page?.faqSubtitle?.trim() || fallback.subtitle,
      media: resolveMedia(page?.faqMedia, page?.faqTitle || fallback.title),
      groups: resolveFaqGroups(page?.faqGroups) || fallback.groups,
    }
  } catch (error) {
    console.error(`[faq] Failed to load page config for locale "${locale}".`, error)

    const fallback = fallbackByLocale[locale]

    return {
      seo: null,
      title: fallback.title,
      subtitle: fallback.subtitle,
      media: null,
      groups: fallback.groups,
    }
  }
})
