import { cache } from 'react'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from 'lexical'

import type { Locale } from '@/lib/i18n/core'
import type { Page } from '@/payload/generated/payload-types'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

export type ContactConfig = {
  seo: Page['seo'] | null
  title: string
  html: string
}

const fallbackTitleByLocale: Record<Locale, string> = {
  it: 'Contatti',
  en: 'Contact',
  ru: 'Контакты',
}

const fallbackHtmlByLocale: Record<Locale, string> = {
  it: '<p>Per assistenza ordini e informazioni: <a href="mailto:info@dobmilano.it">info@dobmilano.it</a></p>',
  en: '<p>For order support and information: <a href="mailto:info@dobmilano.it">info@dobmilano.it</a></p>',
  ru: '<p>Для поддержки по заказам и информации: <a href="mailto:info@dobmilano.it">info@dobmilano.it</a></p>',
}

const resolveRichTextHtml = (value: unknown): string | null => {
  if (!value || typeof value !== "object" || !('root' in value)) return null

  try {
    return convertLexicalToHTML({ data: value as SerializedEditorState }) || null
  } catch {
    return null
  }
}

export const getContactConfig = cache(async (locale: Locale): Promise<ContactConfig> => {
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
          equals: 'contact',
        },
      },
    })

    const page = result.docs[0]
    const title = page?.contactTitle?.trim() || fallbackTitleByLocale[locale]
    const html = resolveRichTextHtml(page?.contactDescription) || fallbackHtmlByLocale[locale]

    return {
      seo: page?.seo ?? null,
      title,
      html,
    }
  } catch (error) {
    console.error(`[contact] Failed to load page config for locale "${locale}".`, error)

    return {
      seo: null,
      title: fallbackTitleByLocale[locale],
      html: fallbackHtmlByLocale[locale],
    }
  }
})
