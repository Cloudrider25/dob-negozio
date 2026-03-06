import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import { getSendcloudShippingOptions } from '@/lib/server/sendcloud/getShippingQuote'
import { isFreeShippingUnlocked } from '@/lib/shared/shop/shipping'

type ShippingQuoteRequest = {
  address?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
  subtotal?: number
  itemsCount?: number
}

const toString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ShippingQuoteRequest
    const address = toString(body.address)
    const city = toString(body.city)
    const province = toString(body.province)
    const postalCode = toString(body.postalCode)
    const country = toString(body.country) || 'IT'
    const subtotal =
      typeof body.subtotal === 'number' && Number.isFinite(body.subtotal) ? body.subtotal : 0
    const itemsCount =
      typeof body.itemsCount === 'number' && Number.isFinite(body.itemsCount) && body.itemsCount > 0
        ? Math.floor(body.itemsCount)
        : 0

    if (!address || !city || !province || !postalCode) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required destination fields.',
        },
        { status: 400 },
      )
    }

    const payload = await getPayloadClient()
    const options = await getSendcloudShippingOptions({
      payload,
      toCountry: country,
      toPostalCode: postalCode,
      itemsCount,
    })
    const isFree = isFreeShippingUnlocked(subtotal)
    const normalizedOptions = isFree
      ? options.map((option) => ({
          ...option,
          amount: 0,
        }))
      : options
    const best = normalizedOptions[0]

    return NextResponse.json({
      ok: true,
      freeShipping: isFree,
      amount: best?.amount ?? null,
      currency: best?.currency ?? 'EUR',
      methodName: best?.name ?? null,
      methods: normalizedOptions,
    })
  } catch (error) {
    const payload = await getPayloadClient()
    payload.logger.error({
      err: error,
      msg: 'Unable to fetch shipping quote.',
    })
    return NextResponse.json(
      {
        ok: false,
        error: 'Unable to fetch shipping quote.',
      },
      { status: 500 },
    )
  }
}
