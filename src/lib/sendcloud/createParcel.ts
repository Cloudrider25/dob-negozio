import type { Payload } from 'payload'

import type { Order } from '@/payload-types'

import { getShopIntegrationsConfig } from '@/lib/shop/shopIntegrationsConfig'

type SendcloudCreateParcelResult = {
  parcelId: number
  carrierCode: string
  trackingNumber: string
  trackingUrl: string
  labelUrl: string
  statusMessage: string
}

type SendcloudParcelItem = {
  description: string
  sku?: string
  quantity: number
  value: string
  weight: string
}

const toString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const toNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null)

const toCountryISO2 = (value: unknown) => {
  const country = toString(value)
  const upper = country.toUpperCase()
  if (upper === 'IT' || upper === 'ITALY' || upper === 'ITALIA') return 'IT'
  if (upper.length === 2) return upper
  return 'IT'
}

const splitAddressAndHouseNumber = (value: unknown) => {
  const input = toString(value)
  const match = input.match(/^(.*?)[,\s]+(\d+[A-Za-z\-\/]*)$/)
  if (!match) {
    return {
      address: input || 'N/A',
      houseNumber: '1',
    }
  }
  return {
    address: toString(match[1]) || input,
    houseNumber: toString(match[2]) || '1',
  }
}

const normalizeParcel = (input: unknown): SendcloudCreateParcelResult | null => {
  const parcel =
    input && typeof input === 'object' && !Array.isArray(input) ? (input as Record<string, unknown>) : null
  if (!parcel) return null

  const id = toNumber(parcel.id)
  if (typeof id !== 'number') return null

  const carrier =
    parcel.carrier && typeof parcel.carrier === 'object'
      ? (parcel.carrier as Record<string, unknown>)
      : null
  const label =
    parcel.label && typeof parcel.label === 'object'
      ? (parcel.label as Record<string, unknown>)
      : null
  const status =
    parcel.status && typeof parcel.status === 'object'
      ? (parcel.status as Record<string, unknown>)
      : null

  return {
    parcelId: id,
    carrierCode: toString(carrier?.code),
    trackingNumber: toString(parcel.tracking_number),
    trackingUrl: toString(parcel.tracking_url),
    labelUrl: toString(label?.label_printer),
    statusMessage: toString(status?.message),
  }
}

export const createSendcloudParcel = async ({
  payload,
  order,
}: {
  payload: Payload
  order: Order
}): Promise<SendcloudCreateParcelResult | null> => {
  const config = await getShopIntegrationsConfig(payload)
  const publicKey = config.sendcloud.publicKey
  const secretKey = config.sendcloud.secretKey
  if (!publicKey || !secretKey) return null

  const { address, houseNumber } = splitAddressAndHouseNumber(order.shippingAddress?.address)
  const baseUrl = toString(process.env.SENDCLOUD_API_BASE_URL) || 'https://panel.sendcloud.sc'
  const orderNumber = toString(order.orderNumber) || String(order.id)
  const authHeader = `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString('base64')}`
  const orderItemsResult = await payload.find({
    collection: 'order-items',
    overrideAccess: true,
    depth: 0,
    limit: 200,
    where: {
      order: {
        equals: order.id,
      },
    },
    select: {
      productTitle: true,
      productSlug: true,
      quantity: true,
      lineTotal: true,
      unitPrice: true,
    },
  })

  const parcelItems: SendcloudParcelItem[] = []
  for (const item of orderItemsResult.docs) {
    const quantity = toNumber(item.quantity) || 0
    const lineTotal = toNumber(item.lineTotal) || 0
    const unitWeight = 0.1
    if (quantity <= 0) continue
    parcelItems.push({
      description: toString(item.productTitle) || 'Item',
      sku: toString(item.productSlug) || undefined,
      quantity,
      value: lineTotal.toFixed(2),
      weight: (unitWeight * quantity).toFixed(3),
    })
  }

  const totalQuantity =
    parcelItems.length > 0
      ? parcelItems.reduce((sum, item) => sum + item.quantity, 0)
      : 1
  const totalWeight =
    parcelItems.length > 0
      ? parcelItems.reduce((sum, item) => sum + Number(item.weight), 0).toFixed(3)
      : '0.100'

  const existingResponse = await fetch(
    `${baseUrl}/api/v2/parcels?order_number=${encodeURIComponent(orderNumber)}`,
    {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
      cache: 'no-store',
    },
  )
  if (existingResponse.ok) {
    const existingData = (await existingResponse.json()) as { parcels?: unknown[] }
    const firstExisting = Array.isArray(existingData.parcels) ? normalizeParcel(existingData.parcels[0]) : null
    if (firstExisting) {
      return firstExisting
    }
  }

  const payloadBody = {
    parcel: {
      name: `${toString(order.customerFirstName)} ${toString(order.customerLastName)}`.trim() || 'Customer',
      company_name: '',
      address,
      house_number: houseNumber,
      city: toString(order.shippingAddress?.city),
      postal_code: toString(order.shippingAddress?.postalCode),
      telephone: toString(order.customerPhone),
      email: toString(order.customerEmail),
      country: toCountryISO2(order.shippingAddress?.country),
      order_number: orderNumber,
      request_label: false,
      total_order_value: Number.isFinite(order.total) ? order.total.toFixed(2) : '0.00',
      total_order_value_currency: toString(order.currency) || 'EUR',
      quantity: totalQuantity,
      weight: totalWeight,
      parcel_items: parcelItems,
    },
  }

  const response = await fetch(`${baseUrl}/api/v2/parcels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(payloadBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Sendcloud create parcel failed (${response.status}): ${errorText}`)
  }

  const data = (await response.json()) as { parcel?: unknown }
  const parcel = normalizeParcel(data.parcel)
  if (!parcel) {
    throw new Error('Sendcloud response missing parcel id.')
  }

  return parcel
}
