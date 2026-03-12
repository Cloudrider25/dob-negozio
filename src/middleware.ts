import { NextRequest, NextResponse } from 'next/server'

import { isLocale } from '@/lib/i18n/core'
import { toInternalSeoPath } from '@/lib/frontend/seo/routes'
import { defaultLocale } from '@/lib/i18n/core'

type WindowState = {
  count: number
  resetAt: number
}

const authLimiterState = new Map<string, WindowState>()

const WINDOW_MS = 10 * 60 * 1000
const LIMIT_PER_WINDOW: Record<string, number> = {
  '/api/users/login': 12,
  '/api/users': 8,
  '/api/users/forgot-password': 6,
  '/api/users/reset-password': 6,
  '/api/users/verify': 20,
  '/api/consultation-leads': 10,
}

const getCanonicalSiteUrl = (): URL => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    'https://dobmilano.com'

  try {
    return new URL(raw)
  } catch {
    return new URL('https://dobmilano.com')
  }
}

const canonicalSiteUrl = getCanonicalSiteUrl()
const canonicalHost = canonicalSiteUrl.host.toLowerCase()
const canonicalProtocol = canonicalSiteUrl.protocol.replace(':', '').toLowerCase() || 'https'
const wwwHost = canonicalHost.startsWith('www.') ? canonicalHost : `www.${canonicalHost}`

const getClientIP = (req: NextRequest) =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  req.headers.get('x-real-ip')?.trim() ||
  'unknown'

const getPathLimit = (pathname: string) => {
  if (pathname.startsWith('/api/users/verify/')) return LIMIT_PER_WINDOW['/api/users/verify']
  return LIMIT_PER_WINDOW[pathname]
}

export function middleware(req: NextRequest) {
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase()
  const requestProtocol = forwardedProto || req.nextUrl.protocol.replace(':', '').toLowerCase()
  const requestHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim().toLowerCase()
  const effectiveHost = (requestHost || req.nextUrl.host).toLowerCase()

  const shouldNormalizeHost =
    effectiveHost === canonicalHost || effectiveHost === wwwHost || req.nextUrl.pathname === '/'

  if (
    shouldNormalizeHost &&
    (requestProtocol !== canonicalProtocol || effectiveHost === wwwHost)
  ) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.protocol = `${canonicalProtocol}:`
    redirectUrl.host = canonicalHost
    return NextResponse.redirect(redirectUrl, 308)
  }

  if (req.nextUrl.pathname === '/') {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = `/${defaultLocale}`
    return NextResponse.redirect(redirectUrl, 308)
  }

  const pathSegments = req.nextUrl.pathname.split('/').filter(Boolean)
  const localeSegment = pathSegments[0]
  if (localeSegment && isLocale(localeSegment)) {
    const publicLocalePath = `/${pathSegments.slice(1).join('/')}`
    const internalLocalePath = toInternalSeoPath(localeSegment, publicLocalePath)

    if (internalLocalePath !== publicLocalePath) {
      const rewriteUrl = req.nextUrl.clone()
      rewriteUrl.pathname = `/${localeSegment}${internalLocalePath}`
      return NextResponse.rewrite(rewriteUrl)
    }
  }

  if (req.method !== 'POST') return NextResponse.next()

  const limit = getPathLimit(req.nextUrl.pathname)
  if (!limit) return NextResponse.next()

  const now = Date.now()
  const ip = getClientIP(req)
  const key = `${req.nextUrl.pathname}:${ip}`
  const state = authLimiterState.get(key)

  if (!state || now > state.resetAt) {
    authLimiterState.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    })
    return NextResponse.next()
  }

  if (state.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((state.resetAt - now) / 1000))
    return NextResponse.json(
      {
        error: 'Too many requests. Please retry later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      },
    )
  }

  state.count += 1
  authLimiterState.set(key, state)

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt).*)',
    '/api/users',
    '/api/users/login',
    '/api/users/forgot-password',
    '/api/users/reset-password',
    '/api/users/verify/:path*',
    '/api/consultation-leads',
  ],
}
