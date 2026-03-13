const DEFAULT_PUBLIC_ORIGIN = 'https://dobmilano.com'

const normalizeOrigin = (value: string): string | null => {
  const normalized = value.trim().replace(/\s+/g, '')
  if (!normalized) return null

  try {
    const url = new URL(normalized)
    return `${url.protocol}//${url.host}`
  } catch {
    return null
  }
}

export const getPublicSiteOrigin = (headers?: Headers): string => {
  const forwardedProto = headers?.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = headers?.get('x-forwarded-host')?.split(',')[0]?.trim()

  if (forwardedProto && forwardedHost) {
    const forwardedOrigin = normalizeOrigin(`${forwardedProto}://${forwardedHost}`)
    if (forwardedOrigin) return forwardedOrigin
  }

  const originHeader = headers?.get('origin')
  if (originHeader) {
    const origin = normalizeOrigin(originHeader)
    if (origin) return origin
  }

  const envOrigin =
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL || '') ||
    normalizeOrigin(process.env.SITE_URL || '') ||
    normalizeOrigin(process.env.PAYLOAD_PUBLIC_SERVER_URL || '')

  return envOrigin || DEFAULT_PUBLIC_ORIGIN
}
