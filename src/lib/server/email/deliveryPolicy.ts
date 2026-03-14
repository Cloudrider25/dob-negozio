import type { Payload, PayloadRequest } from 'payload'

import { defaultLocale, type Locale } from '@/lib/i18n/core'
import type { EmailEventKey } from '@/lib/server/email/events'

export const EMAIL_DELIVERY_MODE_OPTIONS = [
  { label: 'Template', value: 'template' },
  { label: 'Fallback', value: 'fallback' },
  { label: 'Disabled', value: 'disabled' },
] as const

export type EmailDeliveryMode = (typeof EMAIL_DELIVERY_MODE_OPTIONS)[number]['value']
export const EMAIL_POLICY_LOCALES = ['it', 'en', 'ru'] as const
export type EmailPolicyLocale = (typeof EMAIL_POLICY_LOCALES)[number]

export const EMAIL_EVENT_MARKER_PREFIX = '<!--dob-email-event:'
const EMAIL_EVENT_MARKER_SUFFIX = '-->'

const normalizePolicyLocale = (locale?: Locale | string | null): EmailPolicyLocale => {
  if (locale === 'en' || locale === 'ru') return locale
  return 'it'
}

export const injectEmailEventMarker = (
  html: string,
  eventKey: EmailEventKey,
  locale?: Locale | string | null,
) =>
  `${EMAIL_EVENT_MARKER_PREFIX}${eventKey}|${normalizePolicyLocale(locale)}${EMAIL_EVENT_MARKER_SUFFIX}${html}`

export const extractEmailEventMarker = (html: string) => {
  if (!html.startsWith(EMAIL_EVENT_MARKER_PREFIX)) {
    return { eventKey: null, locale: null, html }
  }

  const endIndex = html.indexOf(EMAIL_EVENT_MARKER_SUFFIX)
  if (endIndex === -1) {
    return { eventKey: null, locale: null, html }
  }

  const rawPayload = html.slice(EMAIL_EVENT_MARKER_PREFIX.length, endIndex).trim()
  const [rawEventKey, rawLocale] = rawPayload.split('|')
  const eventKey = rawEventKey.trim() as EmailEventKey
  const locale = normalizePolicyLocale(rawLocale)

  return {
    eventKey,
    locale,
    html: html.slice(endIndex + EMAIL_EVENT_MARKER_SUFFIX.length),
  }
}

type EmailDeliveryPolicyRow = {
  eventKey?: string
  recipientOverride?: string | null
  deliveryModeIt?: string
  deliveryModeEn?: string
  deliveryModeRu?: string
}

const readEmailDeliveryPolicies = async ({
  payload,
  req,
}: {
  payload: Payload
  req?: PayloadRequest
}) => {
  const client = req?.payload ?? payload

  const settings = await client.findGlobal({
    slug: 'site-settings',
    overrideAccess: true,
    ...(req ? { req } : {}),
    depth: 0,
  })

  return settings && typeof settings === 'object' && Array.isArray(settings.emailDeliveryPolicies)
    ? (settings.emailDeliveryPolicies as EmailDeliveryPolicyRow[])
    : []
}

export const getEmailDeliveryPolicy = async ({
  payload,
  req,
  eventKey,
}: {
  payload: Payload
  req?: PayloadRequest
  eventKey: EmailEventKey
}) => {
  try {
    const policies = await readEmailDeliveryPolicies({ payload, req })

    return (
      policies.find(
        (entry) => entry && typeof entry === 'object' && entry.eventKey === eventKey,
      ) || null
    )
  } catch {
    return null
  }
}

export const getEmailDeliveryMode = async ({
  payload,
  req,
  eventKey,
  locale,
}: {
  payload: Payload
  req?: PayloadRequest
  eventKey: EmailEventKey
  locale?: Locale | string | null
}): Promise<EmailDeliveryMode> => {
  const normalizedLocale = normalizePolicyLocale(locale || defaultLocale)

  try {
    const row = await getEmailDeliveryPolicy({
      payload,
      req,
      eventKey,
    })

    const deliveryMode =
      normalizedLocale === 'en'
        ? row?.deliveryModeEn
        : normalizedLocale === 'ru'
          ? row?.deliveryModeRu
          : row?.deliveryModeIt

    if (
      deliveryMode === 'template' ||
      deliveryMode === 'fallback' ||
      deliveryMode === 'disabled'
    ) {
      return deliveryMode
    }
  } catch {
    // Best-effort: fall back to template mode if settings are unavailable.
  }

  return 'template'
}
