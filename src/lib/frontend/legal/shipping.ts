import { cache } from 'react'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from 'lexical'

import type { Locale } from '@/lib/i18n/core'
import type { Page } from '@/payload/generated/payload-types'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

export type ShippingConfig = {
  seo: Page['seo'] | null
  html: string | null
}

const fallbackByLocale: Record<Locale, string> = {
  it: '<p>Informazioni di spedizione in aggiornamento.</p>',
  en: '<p>Shipping policy is being updated.</p>',
  ru: '<p>Информация о доставке обновляется.</p>',
}

const resolveRichTextHtml = (value: unknown): string | null => {
  if (!value || typeof value !== 'object' || !('root' in value)) return null
  try {
    return convertLexicalToHTML({ data: value as SerializedEditorState }) || null
  } catch {
    return null
  }
}

export const getShippingConfig = cache(async (locale: Locale): Promise<ShippingConfig> => {
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
          equals: 'shipping',
        },
      },
    })

    const page = result.docs[0]
    const html = resolveRichTextHtml(page?.shippingContent)

    return {
      seo: page?.seo ?? null,
      html: html || fallbackByLocale[locale],
    }
  } catch (error) {
    console.error(`[shipping] Failed to load page config for locale "${locale}".`, error)

    return {
      seo: null,
      html: fallbackByLocale[locale],
    }
  }
})
