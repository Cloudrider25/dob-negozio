'use client'

import { useCallback, useMemo, useState } from 'react'

import { getAccountDictionary } from '@/lib/account-i18n'

import { AccountDashboardContent } from './AccountDashboardContent'
import { AccountDashboardProvider } from './AccountDashboardContext'
import { AccountDashboardSidebar } from './AccountDashboardSidebar'
import { preloadAddressesTab } from './containers/AddressesContainer'
import { preloadAestheticTab } from './containers/AestheticContainer'
import { preloadOrdersTab } from './containers/OrdersContainer'
import { preloadOverviewTab } from './containers/OverviewContainer'
import { preloadServicesTab } from './containers/ServicesContainer'
import { AccountDashboardModals } from './modals/AccountDashboardModals'
import {
  useAccountAestheticForm,
  useAccountProfileForm,
} from './useAccountDashboardForms'
import { useAccountAddresses } from '../hooks/addresses/useAccountAddresses'
import { useAccountOrders } from '../hooks/orders/useAccountOrders'
import { useAccountServices } from '../hooks/services/useAccountServices'
import { useAccountFormatters } from '../shared/useAccountFormatters'
import type { AccountSection, AddressItem, OrderItem, ServiceBookingRow } from '../types'
import productsStyles from '../tabs/orders/AccountOrders.module.css'
import servicesStyles from '../tabs/services/AccountServices.module.css'
import styles from './AccountDashboardClient.module.css'

type AccountDashboardClientProps = {
  locale: string
  userId: number
  email: string
  firstName: string
  lastName: string
  phone: string
  initialOrders: OrderItem[]
  initialServiceRows: ServiceBookingRow[]
  initialAddresses: AddressItem[]
}

const TAB_PREFETCHERS: Partial<Record<AccountSection, () => Promise<unknown>>> = {
  overview: preloadOverviewTab,
  addresses: preloadAddressesTab,
  aesthetic: preloadAestheticTab,
  services: preloadServicesTab,
  orders: preloadOrdersTab,
}

export function AccountDashboardClient({
  locale,
  userId,
  email,
  firstName,
  lastName,
  phone,
  initialOrders,
  initialServiceRows,
  initialAddresses,
}: AccountDashboardClientProps) {
  const copy = getAccountDictionary(locale).account
  const { formatDate, formatDateTime, formatMoney } = useAccountFormatters(locale)

  const [section, setSection] = useState<AccountSection>('overview')
  const [serviceDetailsRow, setServiceDetailsRow] = useState<ServiceBookingRow | null>(null)
  const [serviceDetailsIsPackageChild, setServiceDetailsIsPackageChild] = useState(false)
  const [orderDetails, setOrderDetails] = useState<OrderItem | null>(null)

  const orders = useAccountOrders({ initialOrders })
  const addresses = useAccountAddresses({ initialAddresses, userId })
  const services = useAccountServices({ initialServiceRows, locale })
  const profile = useAccountProfileForm({
    userId,
    initial: { firstName, lastName, phone },
    messages: {
      saveError: copy.overview.profileSaveError,
      saved: copy.overview.profileSaved,
      networkError: copy.overview.profileNetworkError,
    },
  })
  const aesthetic = useAccountAestheticForm()

  const prefetchSection = useCallback((target: AccountSection) => {
    const load = TAB_PREFETCHERS[target]
    if (load) void load()
  }, [])

  const dashboardContextValue = useMemo(
    () => ({
      styles,
      identity: { firstName, email, fallbackCustomer: copy.fallbackCustomer },
      copy: {
        fallbackCustomer: copy.fallbackCustomer,
        overview: copy.overview,
        orders: copy.orders,
        addresses: copy.addresses,
      },
      ui: { section, setSection, prefetchSection },
    }),
    [copy.addresses, copy.fallbackCustomer, copy.orders, copy.overview, email, firstName, prefetchSection, section],
  )

  return (
    <AccountDashboardProvider value={dashboardContextValue}>
      <div className={styles.layout}>
        <AccountDashboardSidebar
          styles={styles}
          copy={copy}
          locale={locale}
          firstName={firstName}
          section={section}
          setSection={setSection}
          prefetchSection={prefetchSection}
        />

        <section className={styles.content}>
          <AccountDashboardContent
            section={section}
            productsStyles={productsStyles}
            servicesStyles={servicesStyles}
            orders={orders}
            addresses={addresses}
            services={services}
            profile={{
              draft: profile.draft,
              saving: profile.saving,
              message: profile.message,
              setDraft: profile.setDraft,
              onSave: profile.onSave,
            }}
            aesthetic={{
              draft: aesthetic.draft,
              setDraft: aesthetic.setDraft,
              saving: aesthetic.saving,
              message: aesthetic.message,
              onSave: aesthetic.onSave,
            }}
            onSetOrderDetails={setOrderDetails}
            onSetServiceDetailsRow={setServiceDetailsRow}
            onSetServiceDetailsIsPackageChild={setServiceDetailsIsPackageChild}
            formatMoney={formatMoney}
            formatDate={formatDate}
          />
        </section>

        <AccountDashboardModals
          styles={styles}
          productsStyles={productsStyles}
          serviceDetailsRow={serviceDetailsRow}
          serviceDetailsIsPackageChild={serviceDetailsIsPackageChild}
          setServiceDetailsRow={setServiceDetailsRow}
          setServiceDetailsIsPackageChild={setServiceDetailsIsPackageChild}
          orderDetails={orderDetails}
          setOrderDetails={setOrderDetails}
          scheduleEditRow={services.scheduleEditRow}
          setScheduleEditRow={services.setScheduleEditRow}
          scheduleEditDraft={services.scheduleEditDraft}
          setScheduleEditDraft={services.setScheduleEditDraft}
          sessionSavingId={services.sessionSavingId}
          canEditSchedule={services.canEditSchedule}
          formatServiceSchedule={services.formatServiceSchedule}
          formatServiceStatus={services.formatServiceStatus}
          formatMoney={formatMoney}
          onSaveScheduleEdit={services.onSaveScheduleEdit}
          onClearScheduleEdit={services.onClearScheduleEdit}
          formatDateTime={formatDateTime}
        />
      </div>
    </AccountDashboardProvider>
  )
}
