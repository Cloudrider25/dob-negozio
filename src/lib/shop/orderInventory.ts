import type { Payload } from 'payload'

import type { Locale } from '@/lib/i18n'

const clampNonNegative = (value: number) => (value < 0 ? 0 : value)

type ItemQty = {
  productID: string
  quantity: number
}

type DeliveryEntry = {
  lot?: string | null
  quantity?: number | null
  costPerUnit?: number | null
  totalCost?: number | null
  deliveryDate?: string | null
  expiryDate?: string | null
}

const consumeDeliveriesFIFO = (deliveries: DeliveryEntry[], quantityToConsume: number): DeliveryEntry[] => {
  let remaining = quantityToConsume
  if (remaining <= 0) return deliveries

  const sorted = [...deliveries].sort((a, b) => {
    const aTime = a?.deliveryDate ? new Date(a.deliveryDate).getTime() : Number.POSITIVE_INFINITY
    const bTime = b?.deliveryDate ? new Date(b.deliveryDate).getTime() : Number.POSITIVE_INFINITY
    return aTime - bTime
  })

  const consumed = sorted.map((entry) => {
    const currentQty =
      typeof entry.quantity === 'number' && Number.isFinite(entry.quantity) ? entry.quantity : 0
    if (remaining <= 0 || currentQty <= 0) return entry

    const take = Math.min(currentQty, remaining)
    remaining -= take
    const nextQty = currentQty - take
    const costPerUnit =
      typeof entry.costPerUnit === 'number' && Number.isFinite(entry.costPerUnit)
        ? entry.costPerUnit
        : 0

    return {
      ...entry,
      quantity: nextQty,
      totalCost: nextQty > 0 && costPerUnit > 0 ? nextQty * costPerUnit : 0,
    }
  })

  return consumed.filter((entry) => {
    const qty = typeof entry.quantity === 'number' ? entry.quantity : 0
    return qty > 0
  })
}

const getOrderItemQuantities = async (payload: Payload, orderID: string): Promise<ItemQty[]> => {
  const result = await payload.find({
    collection: 'order-items',
    overrideAccess: true,
    depth: 0,
    limit: 500,
    where: {
      order: { equals: orderID },
    },
    select: {
      product: true,
      quantity: true,
    },
  })

  return result.docs
    .map((item) => {
      const productID =
        typeof item.product === 'object' && item.product && 'id' in item.product
          ? String(item.product.id)
          : String(item.product)
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0
      if (!productID || quantity <= 0) return null
      return { productID, quantity }
    })
    .filter((item): item is ItemQty => Boolean(item))
}

const adjustProductInventory = async ({
  payload,
  productID,
  locale,
  stockDelta,
  allocatedDelta,
}: {
  payload: Payload
  productID: string
  locale: Locale
  stockDelta: number
  allocatedDelta: number
}) => {
  const product = await payload.findByID({
    collection: 'products',
    id: productID,
    overrideAccess: true,
    locale,
    depth: 0,
    select: {
      stock: true,
      allocatedStock: true,
      deliveries: true,
    },
  })

  const stock = typeof product.stock === 'number' ? product.stock : 0
  const allocatedStock = typeof product.allocatedStock === 'number' ? product.allocatedStock : 0

  const deliveries = Array.isArray(product.deliveries)
    ? (product.deliveries as DeliveryEntry[])
    : []
  const nextDeliveries =
    stockDelta < 0 ? consumeDeliveriesFIFO(deliveries, Math.abs(stockDelta)) : deliveries
  const nextAllocated = clampNonNegative(allocatedStock + allocatedDelta)

  await payload.update({
    collection: 'products',
    id: productID,
    overrideAccess: true,
    locale,
    data: {
      deliveries: nextDeliveries,
      allocatedStock: nextAllocated,
    },
  })
}

export const allocateOrderInventory = async ({
  payload,
  orderID,
  locale,
}: {
  payload: Payload
  orderID: string | number
  locale: Locale
}) => {
  const orderIDValue = String(orderID)
  const order = await payload.findByID({
    collection: 'orders',
    id: orderIDValue,
    overrideAccess: true,
    locale,
    depth: 0,
    select: {
      inventoryCommitted: true,
      allocationReleased: true,
    },
  })

  if (order.inventoryCommitted || order.allocationReleased) return false

  const quantities = await getOrderItemQuantities(payload, orderIDValue)
  for (const item of quantities) {
    await adjustProductInventory({
      payload,
      productID: item.productID,
      locale,
      stockDelta: 0,
      allocatedDelta: item.quantity,
    })
  }

  return true
}

export const commitOrderInventory = async ({
  payload,
  orderID,
  locale,
}: {
  payload: Payload
  orderID: string | number
  locale: Locale
}) => {
  const orderIDValue = String(orderID)
  const order = await payload.findByID({
    collection: 'orders',
    id: orderIDValue,
    overrideAccess: true,
    locale,
    depth: 0,
    select: {
      inventoryCommitted: true,
      allocationReleased: true,
      status: true,
      paymentStatus: true,
    },
  })

  if (order.inventoryCommitted) return false

  const quantities = await getOrderItemQuantities(payload, orderIDValue)
  for (const item of quantities) {
    await adjustProductInventory({
      payload,
      productID: item.productID,
      locale,
      stockDelta: -item.quantity,
      allocatedDelta: -item.quantity,
    })
  }

  await payload.update({
    collection: 'orders',
    id: orderIDValue,
    overrideAccess: true,
    locale,
    data: {
      status: 'paid',
      paymentStatus: 'paid',
      inventoryCommitted: true,
      allocationReleased: false,
    },
  })

  return true
}

export const releaseOrderAllocation = async ({
  payload,
  orderID,
  locale,
}: {
  payload: Payload
  orderID: string | number
  locale: Locale
}) => {
  const orderIDValue = String(orderID)
  const order = await payload.findByID({
    collection: 'orders',
    id: orderIDValue,
    overrideAccess: true,
    locale,
    depth: 0,
    select: {
      inventoryCommitted: true,
      allocationReleased: true,
    },
  })

  if (order.inventoryCommitted || order.allocationReleased) return false

  const quantities = await getOrderItemQuantities(payload, orderIDValue)
  for (const item of quantities) {
    await adjustProductInventory({
      payload,
      productID: item.productID,
      locale,
      stockDelta: 0,
      allocatedDelta: -item.quantity,
    })
  }

  await payload.update({
    collection: 'orders',
    id: orderIDValue,
    overrideAccess: true,
    locale,
    data: {
      status: 'failed',
      paymentStatus: 'failed',
      allocationReleased: true,
    },
  })

  return true
}
