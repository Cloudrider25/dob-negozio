import type { Payload, PayloadRequest, Where } from 'payload'

import { resolveLocale } from '@/lib/i18n/account'
import { defaultLocale, type Locale } from '@/lib/i18n/core'
import {
  getEmailDeliveryPolicy,
  getEmailDeliveryMode,
  type EmailDeliveryMode,
} from '@/lib/server/email/deliveryPolicy'
import { sendSMTPEmail } from '@/lib/server/email/sendSMTPEmail'
import type { EmailChannel, EmailEventKey } from '@/lib/server/email/events'

type EmailAttachment = {
  filename?: string
  content: Buffer
  contentType?: string
}

type EmailContent = {
  subject: string
  text?: string
  html?: string
}

type ResolvedEmailContent = EmailContent & {
  sourceUsed: 'template' | 'fallback'
  downgradedToFallback: boolean
  missingPlaceholders: string[]
}

type SendBusinessEventEmailArgs = {
  payload: Payload
  req?: PayloadRequest
  eventKey: EmailEventKey
  channel: EmailChannel
  locale?: Locale | string | null
  to: string
  data: Record<string, unknown>
  fallback?: EmailContent
  attachments?: EmailAttachment[]
  relatedCollection?: string
  relatedID?: number | string | null
}

type ResolveBusinessEventEmailContentArgs = Pick<
  SendBusinessEventEmailArgs,
  'payload' | 'req' | 'eventKey' | 'channel' | 'locale' | 'data' | 'fallback'
> & {
  deliveryMode?: EmailDeliveryMode
  templateOverride?: Awaited<ReturnType<typeof findTemplate>>
}

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const normalizeLocale = (value: Locale | string | null | undefined): Locale => {
  if (typeof value !== 'string' || !value.trim()) return defaultLocale
  return resolveLocale(value)
}

const normalizeScalar = (value: unknown): string => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) {
    return value.map((item) => normalizeScalar(item)).filter(Boolean).join(', ')
  }
  if (typeof value === 'object') return JSON.stringify(value)
  return ''
}

const flattenData = (value: Record<string, unknown>, prefix = ''): Record<string, string> => {
  const flat: Record<string, string> = {}

  for (const [key, currentValue] of Object.entries(value)) {
    const nextKey = prefix ? `${prefix}.${key}` : key

    if (
      currentValue &&
      typeof currentValue === 'object' &&
      !Array.isArray(currentValue) &&
      !(currentValue instanceof Date)
    ) {
      Object.assign(flat, flattenData(currentValue as Record<string, unknown>, nextKey))
      continue
    }

    flat[nextKey] = normalizeScalar(currentValue)
  }

  return flat
}

const extractPlaceholderKeys = (template: string) => {
  const matches = template.match(/\{\{\s*([^}]+?)\s*\}\}/g) || []
  return Array.from(
    new Set(
      matches
        .map((match) => match.replace(/^\{\{\s*|\s*\}\}$/g, '').trim())
        .filter(Boolean),
    ),
  )
}

const getMissingPlaceholders = (template: string, flatData: Record<string, string>) =>
  extractPlaceholderKeys(template).filter((key) => !(key in flatData))

const renderTemplate = (
  template: string,
  flatData: Record<string, string>,
  options?: { markerOnMissing?: boolean },
) => {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, key) => {
    const normalizedKey = typeof key === 'string' ? key.trim() : ''
    if (normalizedKey in flatData) return flatData[normalizedKey] ?? ''
    return options?.markerOnMissing ? `[missing: ${normalizedKey}]` : ''
  })
}

export const resolveBusinessEventEmailContent = async ({
  payload,
  req,
  eventKey,
  channel,
  locale,
  data,
  fallback,
  deliveryMode,
  templateOverride,
}: ResolveBusinessEventEmailContentArgs): Promise<ResolvedEmailContent | null> => {
  const resolvedLocale = normalizeLocale(locale)
  const flatData = flattenData(data)

  const template =
    templateOverride ??
    (await findTemplate({
      payload,
      req,
      eventKey,
      channel,
      locale: resolvedLocale,
    }))

  const templateSource = template
    ? {
        subject: normalizeText((template as { subject?: unknown }).subject),
        text: normalizeText((template as { text?: unknown }).text),
        html: normalizeText((template as { html?: unknown }).html),
      }
    : null

  const fallbackSource = {
    subject: fallback?.subject || '',
    text: fallback?.text || '',
    html: fallback?.html || '',
  }

  const source =
    deliveryMode === 'fallback'
      ? fallbackSource
      : deliveryMode === 'template'
        ? templateSource || fallbackSource
        : templateSource || fallbackSource

  if (!source || !source.subject || (!source.text && !source.html)) {
    return null
  }

  const collectMissingForSource = (currentSource: EmailContent) => {
    const missing = new Set<string>()

    for (const templatePart of [currentSource.subject, currentSource.text || '', currentSource.html || '']) {
      for (const key of getMissingPlaceholders(templatePart, flatData)) {
        missing.add(key)
      }
    }

    return Array.from(missing)
  }

  let sourceUsed: 'template' | 'fallback' = source === templateSource ? 'template' : 'fallback'
  let downgradedToFallback = false
  let finalSource = source
  let missingPlaceholders = collectMissingForSource(finalSource)

  if (
    sourceUsed === 'template' &&
    missingPlaceholders.length > 0 &&
    fallbackSource.subject &&
    (fallbackSource.text || fallbackSource.html)
  ) {
    finalSource = fallbackSource
    sourceUsed = 'fallback'
    downgradedToFallback = true
    missingPlaceholders = collectMissingForSource(finalSource)
  }

  const html = finalSource.html
    ? renderTemplate(finalSource.html, flatData, { markerOnMissing: true })
    : ''
  const text = finalSource.text
    ? renderTemplate(finalSource.text, flatData, { markerOnMissing: true })
    : stripHtml(html)

  return {
    subject: renderTemplate(finalSource.subject, flatData, { markerOnMissing: true }),
    html,
    text,
    sourceUsed,
    downgradedToFallback,
    missingPlaceholders,
  }
}

const getNotificationAdminEmail = () =>
  normalizeText(process.env.SHOP_APPOINTMENT_ADMIN_EMAIL) ||
  normalizeText(process.env.ADMIN_EMAIL)

const writeDeliveryEvent = async ({
  payload,
  req,
  data,
}: {
  payload: Payload
  req?: PayloadRequest
  data: Record<string, unknown>
}) => {
  const client = req?.payload ?? payload

  try {
    await client.create({
      collection: 'email-delivery-events',
      overrideAccess: true,
      ...(req ? { req } : {}),
      data: data as never,
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: 'Failed to persist email delivery event.',
    })
  }
}

const notifyAdminOnFailure = async ({
  payload,
  req,
  eventKey,
  channel,
  locale,
  to,
  subject,
  errorMessage,
}: {
  payload: Payload
  req?: PayloadRequest
  eventKey: EmailEventKey
  channel: EmailChannel
  locale: Locale
  to: string
  subject: string
  errorMessage: string
}) => {
  if (eventKey === 'email_delivery_failed') return

  const adminEmail = getNotificationAdminEmail()
  if (!adminEmail || adminEmail === to) return

  const failureSubject = `[Admin] Email delivery failed: ${eventKey}`
  const failureText = [
    `Evento: ${eventKey}`,
    `Canale: ${channel}`,
    `Locale: ${locale}`,
    `Destinatario: ${to}`,
    `Subject: ${subject || 'n/a'}`,
    `Errore: ${errorMessage}`,
  ].join('\n')

  try {
    await sendSMTPEmail({
      payload,
      to: adminEmail,
      subject: failureSubject,
      text: failureText,
      html: `
        <p><strong>Evento:</strong> ${eventKey}</p>
        <p><strong>Canale:</strong> ${channel}</p>
        <p><strong>Locale:</strong> ${locale}</p>
        <p><strong>Destinatario:</strong> ${to}</p>
        <p><strong>Subject:</strong> ${subject || 'n/a'}</p>
        <p><strong>Errore:</strong> ${errorMessage}</p>
      `,
    })

    await writeDeliveryEvent({
      payload,
      req,
      data: {
        eventKey: 'email_delivery_failed',
        channel: 'admin',
        locale,
        to: adminEmail,
        subject: failureSubject,
        status: 'sent',
        provider: 'smtp',
        relatedCollection: 'email-delivery-events',
        relatedID: '',
        payloadSnapshot: {
          email: {
            eventKey,
            channel,
            to,
            subject,
            errorMessage,
          },
        },
      },
    })
  } catch (fallbackError) {
    payload.logger.error({
      err: fallbackError,
      msg: `Admin email failure notification failed for ${eventKey}.`,
    })
  }
}

const findTemplate = async ({
  payload,
  req,
  eventKey,
  channel,
  locale,
}: {
  payload: Payload
  req?: PayloadRequest
  eventKey: EmailEventKey
  channel: EmailChannel
  locale: Locale
}) => {
  const client = req?.payload ?? payload

  const where = (currentLocale: Locale): Where => ({
    and: [
      { eventKey: { equals: eventKey } },
      { channel: { equals: channel } },
      { locale: { equals: currentLocale } },
      { active: { equals: true } },
    ],
  })

  const primary = await client.find({
    collection: 'email-templates',
    overrideAccess: true,
    ...(req ? { req } : {}),
    depth: 0,
    limit: 1,
    locale,
    where: where(locale),
  })

  if (primary.docs[0]) return primary.docs[0]
  if (locale === defaultLocale) return null

  const fallback = await client.find({
    collection: 'email-templates',
    overrideAccess: true,
    ...(req ? { req } : {}),
    depth: 0,
    limit: 1,
    locale: defaultLocale,
    where: where(defaultLocale),
  })

  return fallback.docs[0] ?? null
}

export const sendBusinessEventEmail = async ({
  payload,
  req,
  eventKey,
  channel,
  locale,
  to,
  data,
  fallback,
  attachments,
  relatedCollection,
  relatedID,
}: SendBusinessEventEmailArgs) => {
  const resolvedLocale = normalizeLocale(locale)
  const deliveryMode = await getEmailDeliveryMode({
    payload,
    req,
    eventKey,
    locale: resolvedLocale,
  })
  const [template, policy] = await Promise.all([
    findTemplate({
      payload,
      req,
      eventKey,
      channel,
      locale: resolvedLocale,
    }),
    getEmailDeliveryPolicy({
      payload,
      req,
      eventKey,
    }),
  ])

  const normalizedTo =
    channel === 'customer'
      ? normalizeText(to)
      : normalizeText(policy?.recipientOverride) || normalizeText(to)

  if (deliveryMode === 'disabled') {
    await writeDeliveryEvent({
      payload,
      req,
      data: {
        eventKey,
        channel,
        locale: resolvedLocale,
        to: normalizedTo,
        subject: fallback?.subject || '',
        status: 'skipped',
        provider: 'smtp',
        errorMessage: 'Delivery disabled by site settings.',
        relatedCollection: relatedCollection || '',
        relatedID: relatedID == null ? '' : String(relatedID),
        payloadSnapshot: data,
      },
    })
    return { ok: false as const, status: 'skipped' as const }
  }

  if (!normalizedTo) {
    await writeDeliveryEvent({
      payload,
      req,
      data: {
        eventKey,
        channel,
        locale: resolvedLocale,
        to: '',
        subject: fallback?.subject || '',
        status: 'skipped',
        provider: 'smtp',
        errorMessage: 'Missing recipient.',
        relatedCollection: relatedCollection || '',
        relatedID: relatedID == null ? '' : String(relatedID),
        payloadSnapshot: data,
      },
    })
    return { ok: false as const, status: 'skipped' as const }
  }

  const content = await resolveBusinessEventEmailContent({
    payload,
    req,
    eventKey,
    channel,
    locale: resolvedLocale,
    data,
    fallback,
    deliveryMode,
    templateOverride: template,
  })

  if (!content) {
    await writeDeliveryEvent({
      payload,
      req,
      data: {
        eventKey,
        channel,
        locale: resolvedLocale,
        to: normalizedTo,
        subject: fallback?.subject || '',
        status: 'skipped',
        provider: 'smtp',
        errorMessage: 'Missing template content.',
        relatedCollection: relatedCollection || '',
        relatedID: relatedID == null ? '' : String(relatedID),
        payloadSnapshot: data,
      },
    })
    return { ok: false as const, status: 'skipped' as const }
  }

  const subject = content.subject
  const html = content.html || ''
  const text = content.text || stripHtml(html)
  const diagnostics =
    content.downgradedToFallback || content.missingPlaceholders.length > 0
      ? {
          sourceUsed: content.sourceUsed,
          downgradedToFallback: content.downgradedToFallback,
          missingPlaceholders: content.missingPlaceholders,
        }
      : null

  if (diagnostics) {
    payload.logger.warn({
      msg: `Email template diagnostics for ${eventKey}:${channel}:${resolvedLocale}`,
      diagnostics,
    })
  }

  try {
    await sendSMTPEmail({
      payload,
      to: normalizedTo,
      subject,
      text,
      html,
      attachments,
    })

    await writeDeliveryEvent({
      payload,
      req,
      data: {
        eventKey,
        channel,
        locale: resolvedLocale,
        to: normalizedTo,
        subject,
        status: 'sent',
        provider: 'smtp',
        relatedCollection: relatedCollection || '',
        relatedID: relatedID == null ? '' : String(relatedID),
        payloadSnapshot: diagnostics ? { ...data, emailDiagnostics: diagnostics } : data,
      },
    })

    return { ok: true as const, status: 'sent' as const }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email delivery error.'

    await writeDeliveryEvent({
      payload,
      req,
      data: {
        eventKey,
        channel,
        locale: resolvedLocale,
        to: normalizedTo,
        subject,
        status: 'failed',
        provider: 'smtp',
        errorMessage,
        relatedCollection: relatedCollection || '',
        relatedID: relatedID == null ? '' : String(relatedID),
        payloadSnapshot: diagnostics ? { ...data, emailDiagnostics: diagnostics } : data,
      },
    })

    await notifyAdminOnFailure({
      payload,
      req,
      eventKey,
      channel,
      locale: resolvedLocale,
      to: normalizedTo,
      subject,
      errorMessage,
    })

    throw error
  }
}
