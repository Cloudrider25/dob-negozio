'use client'

import { useMemo, useState } from 'react'

import { PRODUCT_SORT_OPTIONS } from '../../constants'
import type { OrderItem, ProductSort } from '../../types'

type UseAccountOrdersArgs = {
  initialOrders: OrderItem[]
}

export function useAccountOrders({ initialOrders }: UseAccountOrdersArgs) {
  const [expandedOrderGroups, setExpandedOrderGroups] = useState<Record<string, boolean>>({})
  const [showAllProductPurchases, setShowAllProductPurchases] = useState(false)
  const [productsFilterDrawerOpen, setProductsFilterDrawerOpen] = useState(false)
  const [productsSort, setProductsSort] = useState<ProductSort>('newest')

  const ordersByDateDesc = useMemo(
    () =>
      [...initialOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [initialOrders],
  )

  const sortedOrdersForList = useMemo(() => {
    const rows = [...initialOrders]
    if (productsSort === 'oldest') {
      rows.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      return rows
    }
    if (productsSort === 'total_desc') {
      rows.sort((a, b) => (b.total || 0) - (a.total || 0))
      return rows
    }
    if (productsSort === 'total_asc') {
      rows.sort((a, b) => (a.total || 0) - (b.total || 0))
      return rows
    }
    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return rows
  }, [initialOrders, productsSort])

  const groupedProductRows = useMemo(() => {
    const output: Array<
      | { kind: 'single'; row: OrderItem }
      | {
          kind: 'order-group'
          key: string
          lead: OrderItem
          rows: OrderItem[]
          productsTotal: number
        }
    > = []

    const byOrder = new Map<string, OrderItem[]>()
    for (const row of sortedOrdersForList) {
      const key = row.orderNumber
      const list = byOrder.get(key) ?? []
      list.push(row)
      byOrder.set(key, list)
    }

    for (const [key, rows] of byOrder.entries()) {
      if (rows.length === 1) {
        output.push({ kind: 'single', row: rows[0] })
        continue
      }
      const ordered = [...rows].sort((a, b) => a.id - b.id)
      output.push({
        kind: 'order-group',
        key,
        lead: ordered[0],
        rows: ordered,
        productsTotal: ordered.reduce((sum, r) => sum + (r.total || 0), 0),
      })
    }

    output.sort((a, b) => {
      const aDate = a.kind === 'single' ? a.row.createdAt : a.lead.createdAt
      const bDate = b.kind === 'single' ? b.row.createdAt : b.lead.createdAt
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })

    return output
  }, [sortedOrdersForList])

  const nextProductDeliveryRow = useMemo(() => {
    const currentTs = Date.now()
    const candidates = ordersByDateDesc
      .map((row) => {
        if (!row.deliveryUpdatedAt) return { row, ts: null as number | null }
        const ts = new Date(row.deliveryUpdatedAt).getTime()
        return { row, ts: Number.isNaN(ts) ? null : ts }
      })
      .filter(
        (entry): entry is { row: OrderItem; ts: number } =>
          entry.ts !== null && entry.ts > currentTs,
      )
      .sort((a, b) => a.ts - b.ts)
    return candidates[0]?.row ?? null
  }, [ordersByDateDesc])

  const latestPurchasedProductRow = ordersByDateDesc[0] ?? null

  const productsSortLabel =
    PRODUCT_SORT_OPTIONS.find((option) => option.value === productsSort)?.label ?? 'Più recenti'

  return {
    expandedOrderGroups,
    setExpandedOrderGroups,
    showAllProductPurchases,
    setShowAllProductPurchases,
    productsFilterDrawerOpen,
    setProductsFilterDrawerOpen,
    productsSort,
    setProductsSort,
    ordersByDateDesc,
    groupedProductRows,
    nextProductDeliveryRow,
    latestPurchasedProductRow,
    productsSortLabel,
  }
}
