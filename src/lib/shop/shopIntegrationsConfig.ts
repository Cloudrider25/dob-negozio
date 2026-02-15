import type { Payload } from 'payload'

type SiteSettings = {
  stripe?: {
    secretKey?: string | null
    webhookSecret?: string | null
    publishableKey?: string | null
  } | null
  sendcloud?: {
    publicKey?: string | null
    secretKey?: string | null
  } | null
}

export type StripeConfig = {
  secretKey: string
  webhookSecret: string
  publishableKey: string
}

export type SendcloudConfig = {
  publicKey: string
  secretKey: string
}

const normalizeString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const getShopIntegrationsConfig = async (
  payload: Payload,
): Promise<{ stripe: StripeConfig; sendcloud: SendcloudConfig }> => {
  const settings = (await payload.findGlobal({
    slug: 'site-settings',
    locale: 'it',
    overrideAccess: true,
  })) as SiteSettings

  const stripeSettings = settings?.stripe || {}
  const sendcloudSettings = settings?.sendcloud || {}

  return {
    stripe: {
      secretKey:
        normalizeString(stripeSettings.secretKey) || normalizeString(process.env.STRIPE_SECRET_KEY),
      webhookSecret:
        normalizeString(stripeSettings.webhookSecret) ||
        normalizeString(process.env.STRIPE_WEBHOOK_SECRET),
      publishableKey:
        normalizeString(stripeSettings.publishableKey) ||
        normalizeString(process.env.STRIPE_PUBLISHABLE_KEY),
    },
    sendcloud: {
      publicKey:
        normalizeString(sendcloudSettings.publicKey) || normalizeString(process.env.SENDCLOUD_PUBLIC_KEY),
      secretKey:
        normalizeString(sendcloudSettings.secretKey) || normalizeString(process.env.SENDCLOUD_SECRET_KEY),
    },
  }
}
