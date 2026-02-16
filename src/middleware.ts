import { NextRequest, NextResponse } from 'next/server'

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

const getClientIP = (req: NextRequest) =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  req.headers.get('x-real-ip')?.trim() ||
  'unknown'

const getPathLimit = (pathname: string) => {
  if (pathname.startsWith('/api/users/verify/')) return LIMIT_PER_WINDOW['/api/users/verify']
  return LIMIT_PER_WINDOW[pathname]
}

export function middleware(req: NextRequest) {
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
    '/api/users',
    '/api/users/login',
    '/api/users/forgot-password',
    '/api/users/reset-password',
    '/api/users/verify/:path*',
    '/api/consultation-leads',
  ],
}
