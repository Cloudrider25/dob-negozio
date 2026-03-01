'use client'

import dynamic from 'next/dynamic'

import { useAccountDashboardContext } from '../AccountDashboardContext'
import type { AestheticContainerProps } from './contracts'

const loadAestheticTab = () => import('../../tabs/aesthetic/AccountAestheticTab')

export const preloadAestheticTab = loadAestheticTab

const AccountAestheticTab = dynamic(loadAestheticTab, { ssr: false, loading: () => null })

export function AestheticContainer({ form }: AestheticContainerProps) {
  const { styles, identity } = useAccountDashboardContext()

  return <AccountAestheticTab styles={styles} identity={identity} form={form} />
}
