'use client'

import dynamic from 'next/dynamic'

import { useAccountDashboardContext } from '../AccountDashboardContext'
import type { OverviewContainerProps } from './contracts'

const loadOverviewTab = () => import('../../tabs/overview/AccountOverviewTab')

export const preloadOverviewTab = loadOverviewTab

const AccountOverviewTab = dynamic(loadOverviewTab, { ssr: false, loading: () => null })

export function OverviewContainer({ data, actions }: OverviewContainerProps) {
  const { styles, copy, identity } = useAccountDashboardContext()

  return (
    <AccountOverviewTab
      styles={styles}
      copy={copy}
      identity={identity}
      data={data}
      actions={actions}
    />
  )
}
