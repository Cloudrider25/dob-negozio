import { describe, expect, it } from 'vitest'

import {
  findNextProductDeliveryRow,
  groupOrders,
  sortOrdersByDateDesc,
  sortOrdersForList,
} from '@/components/account/hooks/orders/orders-domain'
import type { OrderItem } from '@/components/account/types'

const baseOrder = (overrides: Partial<OrderItem>): OrderItem => ({
  id: 1,
  orderNumber: 'ORD-1',
  status: 'paid',
  paymentStatus: 'paid',
  total: 100,
  currency: 'EUR',
  createdAt: '2026-01-01T10:00:00.000Z',
  purchaseTitle: 'Prodotto',
  purchaseThumb: null,
  otherItemsCount: 0,
  quantity: 1,
  unitPrice: 100,
  productFulfillmentMode: 'shipping',
  trackingNumber: null,
  trackingUrl: null,
  deliveryStatus: null,
  deliveryUpdatedAt: null,
  ...overrides,
})

describe('account orders domain', () => {
  it('groups same orderNumber rows and computes productsTotal', () => {
    const rows = [
      baseOrder({ id: 2, orderNumber: 'ORD-10', total: 20 }),
      baseOrder({ id: 1, orderNumber: 'ORD-10', total: 30 }),
      baseOrder({ id: 3, orderNumber: 'ORD-20', total: 15 }),
    ]

    const grouped = groupOrders(rows)

    expect(grouped).toHaveLength(2)

    const orderGroup = grouped.find((entry) => entry.kind === 'order-group')
    expect(orderGroup?.kind).toBe('order-group')
    if (!orderGroup || orderGroup.kind !== 'order-group') throw new Error('Unexpected grouping')
    expect(orderGroup.rows.map((row) => row.id)).toEqual([1, 2])
    expect(orderGroup.productsTotal).toBe(50)
  })

  it('supports sort by totals asc and desc', () => {
    const rows = [
      baseOrder({ id: 1, total: 70 }),
      baseOrder({ id: 2, total: 20 }),
      baseOrder({ id: 3, total: 40 }),
    ]

    expect(sortOrdersForList(rows, 'total_asc').map((row) => row.id)).toEqual([2, 3, 1])
    expect(sortOrdersForList(rows, 'total_desc').map((row) => row.id)).toEqual([1, 3, 2])
  })

  it('returns nearest future delivery row', () => {
    const sorted = sortOrdersByDateDesc([
      baseOrder({ id: 1, deliveryUpdatedAt: '2026-01-10T10:00:00.000Z' }),
      baseOrder({ id: 2, deliveryUpdatedAt: '2026-01-05T10:00:00.000Z' }),
      baseOrder({ id: 3, deliveryUpdatedAt: null }),
    ])

    const next = findNextProductDeliveryRow(sorted, new Date('2026-01-04T00:00:00.000Z').getTime())

    expect(next?.id).toBe(2)
  })
})
