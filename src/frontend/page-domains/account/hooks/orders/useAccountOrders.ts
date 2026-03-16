'use client'

import { useMemo, useState } from 'react'

import { PRODUCT_SORT_OPTIONS } from '../../constants'
import type { AccountWaitlistItem, OrderItem, ProductSort } from '../../types'
import {
  findNextProductDeliveryRow,
  groupOrders,
  sortOrdersByDateDesc,
  sortOrdersForList,
} from './orders-domain'

type UseAccountOrdersArgs = {
  initialOrders: OrderItem[]
  initialWaitlistRows: AccountWaitlistItem[]
}

export function useAccountOrders({ initialOrders, initialWaitlistRows }: UseAccountOrdersArgs) {
  const [expandedOrderGroups, setExpandedOrderGroups] = useState<Record<string, boolean>>({})
  const [showAllProductPurchases, setShowAllProductPurchases] = useState(false)
  const [productsFilterDrawerOpen, setProductsFilterDrawerOpen] = useState(false)
  const [productsSort, setProductsSort] = useState<ProductSort>('newest')

  const ordersByDateDesc = useMemo(() => sortOrdersByDateDesc(initialOrders), [initialOrders])

  const sortedOrdersForList = useMemo(
    () => sortOrdersForList(initialOrders, productsSort),
    [initialOrders, productsSort],
  )

  const groupedProductRows = useMemo(() => groupOrders(sortedOrdersForList), [sortedOrdersForList])

  const nextProductDeliveryRow = useMemo(
    () => findNextProductDeliveryRow(ordersByDateDesc),
    [ordersByDateDesc],
  )

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
    waitlistRows: initialWaitlistRows,
    groupedProductRows,
    nextProductDeliveryRow,
    latestPurchasedProductRow,
    productsSortLabel,
  }
}
