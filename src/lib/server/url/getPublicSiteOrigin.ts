const DEFAULT_PUBLIC_ORIGIN = 'https://dobmilano.com'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

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

const isLocalOrigin = (value: string | null): boolean => {
  if (!value) return false

  try {
    const url = new URL(value)
    return LOCAL_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

export const getPublicSiteOrigin = (headers?: Headers): string => {
  const forwardedProto = headers?.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = headers?.get('x-forwarded-host')?.split(',')[0]?.trim()

  if (forwardedProto && forwardedHost) {
    const forwardedOrigin = normalizeOrigin(`${forwardedProto}://${forwardedHost}`)
    if (forwardedOrigin && !isLocalOrigin(forwardedOrigin)) return forwardedOrigin
  }

  const originHeader = headers?.get('origin')
  if (originHeader) {
    const origin = normalizeOrigin(originHeader)
    if (origin && !isLocalOrigin(origin)) return origin
  }

  const envOriginCandidates = [
    process.env.NEXT_PUBLIC_SITE_URL || '',
    process.env.SITE_URL || '',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  ]

  const envOrigin =
    envOriginCandidates
      .map((value) => normalizeOrigin(value))
      .find((value) => value && !isLocalOrigin(value)) || null

  return envOrigin || DEFAULT_PUBLIC_ORIGIN
}
