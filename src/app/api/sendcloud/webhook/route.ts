import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/getPayloadClient'

type GenericRecord = Record<string, unknown>

const asRecord = (value: unknown): GenericRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as GenericRecord) : {}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const asNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const getNested = (source: GenericRecord, path: string): unknown =>
  path.split('.').reduce<unknown>((current, key) => asRecord(current)[key], source)

const firstString = (source: GenericRecord, paths: string[]) => {
  for (const path of paths) {
    const value = asString(getNested(source, path))
    if (value) return value
  }
  return ''
}

const firstNumber = (source: GenericRecord, paths: string[]) => {
  for (const path of paths) {
    const value = asNumber(getNested(source, path))
    if (typeof value === 'number') return value
  }
  return null
}

export async function POST(request: Request) {
  const configuredSecret = process.env.SENDCLOUD_WEBHOOK_SECRET?.trim()
  if (configuredSecret) {
    const incomingSecret = request.headers.get('x-sendcloud-webhook-secret')?.trim()
    if (!incomingSecret || incomingSecret !== configuredSecret) {
      return NextResponse.json({ ok: false, error: 'Invalid webhook secret.' }, { status: 401 })
    }
  }

  const rawBody = await request.text()
  let payloadBody: GenericRecord
  try {
    payloadBody = asRecord(JSON.parse(rawBody))
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const eventType = firstString(payloadBody, ['event', 'type', 'action']) || 'sendcloud.event'
  const parcelId = firstNumber(payloadBody, ['parcel.id', 'parcel_id', 'id'])
  const statusMessage = firstString(payloadBody, [
    'parcel.status.message',
    'parcel.status',
    'status.message',
    'status',
    'message',
  ])
  const trackingNumber = firstString(payloadBody, [
    'parcel.tracking_number',
    'tracking_number',
    'parcel.tracking.number',
  ])
  const trackingUrl = firstString(payloadBody, [
    'parcel.tracking_url',
    'tracking_url',
    'parcel.tracking.url',
  ])
  const carrierCode = firstString(payloadBody, ['parcel.carrier.code', 'carrier.code', 'carrier'])
  const labelUrl = firstString(payloadBody, [
    'parcel.label.label_printer',
    'parcel.label_url',
    'label_url',
  ])

  const payload = await getPayloadClient()
  payload.logger.info({
    msg: 'Received Sendcloud webhook event.',
    eventType,
    parcelId,
  })

  if (typeof parcelId !== 'number') {
    return NextResponse.json(
      {
        ok: true,
        skipped: true,
        reason: 'Missing parcel id in payload.',
      },
      { status: 202 },
    )
  }

  const orderResult = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: {
      'sendcloud.parcelId': {
        equals: parcelId,
      },
    },
  })

  if (orderResult.totalDocs === 0) {
    return NextResponse.json(
      {
        ok: true,
        skipped: true,
        reason: 'No order found for parcel id.',
        parcelId,
      },
      { status: 202 },
    )
  }

  const order = orderResult.docs[0]
  await payload.update({
    collection: 'orders',
    id: order.id,
    overrideAccess: true,
    data: {
      sendcloud: {
        parcelId,
        carrierCode: carrierCode || undefined,
        trackingNumber: trackingNumber || undefined,
        trackingUrl: trackingUrl || undefined,
        labelUrl: labelUrl || undefined,
        statusMessage: statusMessage || eventType,
        lastSyncAt: new Date().toISOString(),
        error: '',
      },
    },
  })

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    parcelId,
    eventType,
  })
}
