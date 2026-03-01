'use client'

import dynamic from 'next/dynamic'

import { useAccountDashboardContext } from '../AccountDashboardContext'
import type { AddressesContainerProps } from './contracts'

const loadAddressesTab = () => import('../../tabs/addresses/AccountAddressesTab')

export const preloadAddressesTab = loadAddressesTab

const AccountAddressesTab = dynamic(loadAddressesTab, { ssr: false, loading: () => null })

export function AddressesContainer({
  data,
  actions,
  formatAddressLines,
}: AddressesContainerProps) {
  const { styles, copy, identity } = useAccountDashboardContext()

  return (
    <AccountAddressesTab
      styles={styles}
      copy={copy}
      identity={identity}
      data={data}
      actions={actions}
      formatAddressLines={formatAddressLines}
    />
  )
}
