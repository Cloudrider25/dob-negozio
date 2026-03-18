import { cache } from 'react'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from 'lexical'

import type { Locale } from '@/lib/i18n/core'
import type { Page } from '@/payload/generated/payload-types'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'

export type TermsConfig = {
  seo: Page['seo'] | null
  html: string | null
}

const fallbackByLocale: Record<Locale, string> = {
  it: '<p>Termini e condizioni in aggiornamento.</p>',
  en: '<p>Terms and conditions are being updated.</p>',
  ru: '<p>Условия использования обновляются.</p>',
}

const resolveRichTextHtml = (value: unknown): string | null => {
  if (!value || typeof value !== 'object' || !('root' in value)) return null
  try {
    return convertLexicalToHTML({ data: value as SerializedEditorState }) || null
  } catch {
    return null
  }
}

export const getTermsConfig = cache(async (locale: Locale): Promise<TermsConfig> => {
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
          equals: 'terms',
        },
      },
    })

    const page = result.docs[0]
    const html = resolveRichTextHtml(page?.termsContent)

    return {
      seo: page?.seo ?? null,
      html: html || fallbackByLocale[locale],
    }
  } catch (error) {
    console.error(`[terms] Failed to load page config for locale "${locale}".`, error)

    return {
      seo: null,
      html: fallbackByLocale[locale],
    }
  }
})
