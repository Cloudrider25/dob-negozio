'use client'

import { createContext, useContext } from 'react'

import type { AccountSection } from '../types'

type AccountDashboardCopy = {
  fallbackCustomer: string
  overview: {
    greeting: string
    yourInfo: string
    firstName: string
    lastName: string
    phone: string
    email: string
    saveProfile: string
    savingProfile: string
    profileSaved: string
    profileSaveError: string
    profileNetworkError: string
  }
  orders: {
    empty: string
  }
  addresses: {
    title: string
    defaultAddress: string
    noAddress: string
    addNewAddress: string
    edit: string
    delete: string
    formTitle: string
    firstName: string
    lastName: string
    company: string
    streetAddress: string
    apartment: string
    city: string
    limitHint: string
    countryItaly: string
    province: string
    provinceMonza: string
    provinceMilano: string
    postalCode: string
    phone: string
    setDefaultAddress: string
    saveAddress: string
    cancel: string
  }
}

type AccountDashboardContextValue = {
  styles: Record<string, string>
  identity: {
    firstName: string
    email: string
    fallbackCustomer: string
  }
  copy: AccountDashboardCopy
  ui: {
    section: AccountSection
    setSection: React.Dispatch<React.SetStateAction<AccountSection>>
    prefetchSection: (target: AccountSection) => void
  }
}

const AccountDashboardContext = createContext<AccountDashboardContextValue | null>(null)

export function AccountDashboardProvider({
  value,
  children,
}: {
  value: AccountDashboardContextValue
  children: React.ReactNode
}) {
  return <AccountDashboardContext.Provider value={value}>{children}</AccountDashboardContext.Provider>
}

export function useAccountDashboardContext() {
  const context = useContext(AccountDashboardContext)
  if (!context) {
    throw new Error('useAccountDashboardContext must be used within AccountDashboardProvider')
  }
  return context
}
