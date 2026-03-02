'use client'

import dynamic from 'next/dynamic'

import { useAccountDashboardContext } from '../AccountDashboardContext'
import type { ServicesContainerProps } from './contracts'

const loadServicesTab = () => import('../../tabs/services/AccountServicesTab')

export const preloadServicesTab = loadServicesTab

const AccountServicesTab = dynamic(loadServicesTab, { ssr: false, loading: () => null })

export function ServicesContainer({
  servicesStyles,
  data,
  view,
  actions,
  renderSchedulePill,
}: ServicesContainerProps) {
  const { styles, identity } = useAccountDashboardContext()

  return (
    <AccountServicesTab
      styles={styles}
      servicesStyles={servicesStyles}
      identity={identity}
      data={data}
      view={view}
      actions={actions}
      renderSchedulePill={renderSchedulePill}
    />
  )
}
