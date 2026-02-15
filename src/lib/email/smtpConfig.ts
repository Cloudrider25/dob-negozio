import type { Payload } from 'payload'

type SiteSettings = {
  smtp?: {
    host?: string | null
    port?: number | null
    secure?: boolean | null
    user?: string | null
    pass?: string | null
    from?: string | null
  } | null
}

export type SMTPConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

const isEmail = (value: string) => /.+@.+\..+/.test(value)

const normalizeString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const getSMTPConfig = async (payload: Payload): Promise<SMTPConfig> => {
  const settings = (await payload.findGlobal({
    slug: 'site-settings',
    locale: 'it',
    overrideAccess: true,
  })) as SiteSettings

  const smtp = settings?.smtp || {}

  const host = normalizeString(smtp.host) || normalizeString(process.env.SMTP_HOST)
  const port =
    (typeof smtp.port === 'number' && Number.isFinite(smtp.port) ? smtp.port : undefined) ||
    Number(process.env.SMTP_PORT || 587)
  const secure =
    typeof smtp.secure === 'boolean' ? smtp.secure : process.env.SMTP_SECURE === 'true'
  const user = normalizeString(smtp.user) || normalizeString(process.env.SMTP_USER)
  const pass = normalizeString(smtp.pass) || normalizeString(process.env.SMTP_PASS)
  const rawFrom = normalizeString(smtp.from) || normalizeString(process.env.SMTP_FROM)
  const from = isEmail(rawFrom) ? rawFrom : isEmail(user) ? user : 'no-reply@dobmilano.it'

  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    user,
    pass,
    from,
  }
}
