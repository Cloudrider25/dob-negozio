import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/getPayloadClient'
import type { ConsultationLeadInput } from '@/lib/consultation/types'

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item.length > 0)
    : []

const getClientIP = (headers: Headers) =>
  headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  headers.get('x-real-ip')?.trim() ||
  ''

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConsultationLeadInput

    const firstName = asString(body.firstName)
    const lastName = asString(body.lastName)
    const email = asString(body.email).toLowerCase()
    const phone = asString(body.phone)
    const skinType = asString(body.skinType)
    const concerns = asStringArray(body.concerns).slice(0, 20)
    const message = asString(body.message)
    const source = asString(body.source)
    const locale = asString(body.locale)
    const pagePath = asString(body.pagePath)

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields.' },
        { status: 400 },
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'Invalid email address.' },
        { status: 400 },
      )
    }

    const payload = await getPayloadClient()

    await payload.create({
      collection: 'consultation-leads',
      overrideAccess: true,
      data: {
        firstName,
        lastName,
        email,
        phone,
        skinType: skinType || undefined,
        concerns: concerns.length ? concerns.map((value) => ({ value })) : undefined,
        message: message || undefined,
        status: 'new',
        source: source || 'frontend-form',
        locale: locale || undefined,
        pagePath: pagePath || undefined,
        ip: getClientIP(request.headers) || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    const payload = await getPayloadClient()
    payload.logger.error({
      err: error,
      msg: 'Failed to persist consultation lead.',
    })

    return NextResponse.json(
      { ok: false, error: 'Unable to submit consultation request.' },
      { status: 500 },
    )
  }
}
