'use client'

import dynamic from 'next/dynamic'

import { useAccountDashboardContext } from '../AccountDashboardContext'
import type { OrdersContainerProps } from './contracts'

const loadOrdersTab = () => import('../../tabs/orders/AccountOrdersTab')

export const preloadOrdersTab = loadOrdersTab

const AccountOrdersTab = dynamic(loadOrdersTab, { ssr: false, loading: () => null })

export function OrdersContainer({
  productsStyles,
  data,
  view,
  actions,
  formatMoney,
  formatDate,
}: OrdersContainerProps) {
  const { styles, copy, identity } = useAccountDashboardContext()

  return (
    <AccountOrdersTab
      styles={styles}
      productsStyles={productsStyles}
      identity={identity}
      data={{ ...data, copy: { orders: { empty: copy.orders.empty } } }}
      view={view}
      actions={actions}
      formatMoney={formatMoney}
      formatDate={formatDate}
    />
  )
}
