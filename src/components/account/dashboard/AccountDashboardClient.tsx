'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { getAccountDictionary } from '@/lib/account-i18n'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { MobileFilterDrawer } from '@/components/shared/MobileFilterDrawer'

import { AccountDashboardModals } from './modals/AccountDashboardModals'
import { AccountLogoutButton } from '../shared/AccountLogoutButton'
import { fetchAestheticDraft, saveAestheticDraft } from '../client-api/aesthetic'
import { updateUserProfile } from '../client-api/profile'
import {
  getAccountMenuEntries,
  PRODUCT_SORT_OPTIONS,
  SERVICES_PRIMARY_OPTIONS,
  SERVICES_SUB_OPTIONS,
  type AccountMenuEntry,
} from '../constants'
import { useAccountAddresses } from '../hooks/addresses/useAccountAddresses'
import { useAccountOrders } from '../hooks/orders/useAccountOrders'
import { useAccountServices } from '../hooks/services/useAccountServices'
import type { AestheticFolderDraft, FormMessage } from '../forms/types'
import type {
  AccountSection,
  AddressItem,
  OrderItem,
  ProductSort,
  ServiceBookingRow,
  ServicesFilter,
  ServicesSubFilter,
} from '../types'
import productsStyles from '../tabs/orders/AccountOrders.module.css'
import servicesStyles from '../tabs/services/AccountServices.module.css'
import styles from './AccountDashboardClient.module.css'

const loadAddressesTab = () => import('../tabs/addresses/AccountAddressesTab')
const loadAestheticTab = () => import('../tabs/aesthetic/AccountAestheticTab')
const loadOrdersTab = () => import('../tabs/orders/AccountOrdersTab')
const loadServicesTab = () => import('../tabs/services/AccountServicesTab')
const loadOverviewTab = () => import('../tabs/overview/AccountOverviewTab')

const AccountAddressesTab = dynamic(loadAddressesTab, { ssr: false, loading: () => null })
const AccountAestheticTab = dynamic(loadAestheticTab, { ssr: false, loading: () => null })
const AccountOrdersTab = dynamic(loadOrdersTab, { ssr: false, loading: () => null })
const AccountServicesTab = dynamic(loadServicesTab, { ssr: false, loading: () => null })
const AccountOverviewTab = dynamic(loadOverviewTab, { ssr: false, loading: () => null })

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
  overview: loadOverviewTab,
  addresses: loadAddressesTab,
  aesthetic: loadAestheticTab,
  services: loadServicesTab,
  orders: loadOrdersTab,
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
  const [section, setSection] = useState<AccountSection>('overview')

  const [serviceDetailsRow, setServiceDetailsRow] = useState<ServiceBookingRow | null>(null)
  const [serviceDetailsIsPackageChild, setServiceDetailsIsPackageChild] = useState(false)
  const [orderDetails, setOrderDetails] = useState<OrderItem | null>(null)

  const [profileDraft, setProfileDraft] = useState({
    firstName,
    lastName,
    phone,
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<FormMessage | null>(null)

  const [aestheticSaving, setAestheticSaving] = useState(false)
  const [aestheticMessage, setAestheticMessage] = useState<FormMessage | null>(null)
  const [aestheticDraft, setAestheticDraft] = useState<AestheticFolderDraft>({
    lastAssessmentDate: '',
    skinType: '',
    skinSensitivity: '',
    fitzpatrick: '',
    hydrationLevel: '',
    sebumLevel: '',
    elasticityLevel: '',
    acneTendency: false,
    rosaceaTendency: false,
    hyperpigmentationTendency: false,
    allergies: '',
    contraindications: '',
    medications: '',
    pregnancyOrBreastfeeding: '',
    homeCareRoutine: '',
    treatmentGoals: '',
    estheticianNotes: '',
    serviceRecommendations: '',
    productRecommendations: '',
  })

  const {
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
  } = useAccountOrders({ initialOrders })

  const {
    addresses,
    defaultAddress,
    showAddressForm,
    setShowAddressForm,
    editingAddressId,
    setEditingAddressId,
    addressesView,
    setAddressesView,
    addressMessage,
    setAddressMessage,
    addressDraft,
    setAddressDraft,
    addressLookupQuery,
    setAddressLookupQuery,
    citySuggestions,
    showCitySuggestions,
    setShowCitySuggestions,
    cityLoading,
    applyCitySuggestion,
    formatAddressLines,
    onDeleteAddressById,
    onSetDefaultAddress,
    onEditAddress,
    onSaveAddress,
  } = useAccountAddresses({ initialAddresses, userId })

  const {
    servicesFilter,
    setServicesFilter,
    servicesSubFilter,
    setServicesSubFilter,
    sessionSavingId,
    sessionMessage,
    serviceRowsState,
    expandedPackageGroups,
    setExpandedPackageGroups,
    showAllServicesBookings,
    setShowAllServicesBookings,
    servicesFilterDrawerOpen,
    setServicesFilterDrawerOpen,
    scheduleEditRow,
    setScheduleEditRow,
    scheduleEditDraft,
    setScheduleEditDraft,
    serviceRowsFiltered,
    groupedServiceTableRows,
    servicesCurrentFilterLabel,
    nextServiceAppointmentRow,
    latestServicePurchasedRow,
    formatServiceSchedule,
    formatServiceStatus,
    canEditSchedule,
    openScheduleEditModal,
    renderServiceDataPill,
    onSaveScheduleEdit,
    onClearScheduleEdit,
  } = useAccountServices({ initialServiceRows, servicesStyles })

  useEffect(() => {
    let active = true

    const loadAestheticDraft = async () => {
      try {
        const { response, data } = await fetchAestheticDraft()
        if (!response.ok) return
        if (!active || !data.draft) return
        setAestheticDraft(data.draft)
      } catch {
        // Best-effort load: do not block account UI if endpoint is unavailable.
      }
    }

    void loadAestheticDraft()

    return () => {
      active = false
    }
  }, [])

  const formatMoney = (value: number, currency: string) =>
    new Intl.NumberFormat(locale === 'it' ? 'it-IT' : locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(value)

  const onSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (profileSaving) return

    setProfileSaving(true)
    setProfileMessage(null)

    try {
      const { response, data } = await updateUserProfile(userId, profileDraft)
      if (!response.ok) {
        const message =
          data.message ||
          data.errors?.find((entry) => typeof entry?.message === 'string')?.message ||
          copy.overview.profileSaveError
        setProfileMessage({ type: 'error', text: message })
        return
      }

      setProfileMessage({ type: 'success', text: copy.overview.profileSaved })
    } catch {
      setProfileMessage({ type: 'error', text: copy.overview.profileNetworkError })
    } finally {
      setProfileSaving(false)
    }
  }

  const onSaveAestheticFolder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (aestheticSaving) return

    setAestheticSaving(true)
    setAestheticMessage(null)

    try {
      const { response, data } = await saveAestheticDraft(aestheticDraft)
      if (!response.ok) {
        setAestheticMessage({
          type: 'error',
          text: data.error || 'Errore durante il salvataggio della cartella estetica.',
        })
        return
      }
      setAestheticMessage({
        type: 'success',
        text: 'Cartella estetica salvata.',
      })
    } catch {
      setAestheticMessage({
        type: 'error',
        text: 'Errore di rete durante il salvataggio della cartella estetica.',
      })
    } finally {
      setAestheticSaving(false)
    }
  }

  const prefetchSection = (target: AccountSection) => {
    const load = TAB_PREFETCHERS[target]
    if (load) {
      void load()
    }
  }

  useEffect(() => {
    const preloadAllTabs = () => {
      Object.values(TAB_PREFETCHERS).forEach((load) => {
        if (load) void load()
      })
    }

    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
      cancelIdleCallback?: (id: number) => void
    }

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(preloadAllTabs, { timeout: 2500 })
      return () => {
        if (typeof win.cancelIdleCallback === 'function') {
          win.cancelIdleCallback(idleId)
        }
      }
    }

    const timeoutId = window.setTimeout(preloadAllTabs, 1200)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const renderAccountFooterActions = (className?: string) => (
    <div className={className}>
      <p className={`${styles.help} typo-body-lg`}>
        {copy.help} <Link href={`/${locale}/contact`}>{copy.contactUs}</Link>
      </p>
      <AccountLogoutButton locale={locale} className="typo-small-upper" label="LOG OUT" />
    </div>
  )

  const mobileSectionTitle =
    section === 'overview'
      ? `${copy.overview.greeting}, ${firstName || copy.fallbackCustomer}`
      : section === 'services'
        ? `Servizi, ${firstName || copy.fallbackCustomer}`
        : section === 'orders'
          ? `Prodotti, ${firstName || copy.fallbackCustomer}`
          : section === 'aesthetic'
            ? `Cartella Estetica, ${firstName || copy.fallbackCustomer}`
            : `${copy.addresses.title}, ${firstName || copy.fallbackCustomer}`

  const menuEntries: AccountMenuEntry[] = getAccountMenuEntries(copy.nav.addresses)

  return (
    <div className={styles.layout}>
      <SectionTitle as="h2" size="h2" className={`${styles.title} ${styles.mobilePageTitle}`}>
        {mobileSectionTitle}
      </SectionTitle>
      <aside className={styles.sidebar}>
        <nav className={styles.menu} aria-label={copy.nav.ariaLabel}>
          {menuEntries.map((entry, index) => {
            if (entry.kind === 'divider') {
              return (
                <div key={`divider-${index}`} className={styles.menuDivider} aria-hidden="true">
                  <span className={`${styles.menuDividerLabel} typo-caption-upper`}>
                    {entry.label}
                  </span>
                </div>
              )
            }

            const isActive = section === entry.section
            return (
              <button
                key={entry.section}
                className={`${styles.menuButton} ${entry.fullWidth ? styles.menuButtonFull : ''} typo-body-lg`}
                type="button"
                onClick={() => setSection(entry.section)}
                onMouseEnter={() => prefetchSection(entry.section)}
                onFocus={() => prefetchSection(entry.section)}
                onPointerDown={() => prefetchSection(entry.section)}
              >
                <span className="typo-body-lg">{entry.label}</span>
                <span className={`${styles.menuDot} ${isActive ? styles.menuDotActive : ''}`} />
              </button>
            )
          })}
        </nav>
        {renderAccountFooterActions(styles.sidebarFooter)}
      </aside>

      <section className={styles.content}>
        {section === 'overview' ? (
          <AccountOverviewTab
            styles={styles}
            copy={copy}
            identity={{
              firstName,
              email,
            }}
            data={{
              profileDraft,
              profileSaving,
              profileMessage,
            }}
            actions={{
              setProfileDraft,
              onSaveProfile,
            }}
          />
        ) : null}

        {section === 'aesthetic' ? (
          <AccountAestheticTab
            styles={styles}
            identity={{
              firstName,
              fallbackCustomer: copy.fallbackCustomer,
            }}
            form={{
              draft: aestheticDraft,
              setDraft: setAestheticDraft,
              saving: aestheticSaving,
              message: aestheticMessage,
              onSubmit: onSaveAestheticFolder,
            }}
          />
        ) : null}

        {section === 'orders' ? (
          <AccountOrdersTab
            styles={styles}
            productsStyles={productsStyles}
            identity={{
              locale,
              firstName,
              fallbackCustomer: copy.fallbackCustomer,
            }}
            data={{
              copy,
              ordersByDateDesc,
              nextProductDeliveryRow,
              latestPurchasedProductRow,
              productsSortLabel,
              groupedProductRows,
            }}
            view={{
              showAllProductPurchases,
              expandedOrderGroups,
            }}
            actions={{
              setShowAllProductPurchases,
              setProductsFilterDrawerOpen,
              setExpandedOrderGroups,
              setOrderDetails,
            }}
            formatMoney={formatMoney}
          />
        ) : null}

        {section === 'services' ? (
          <AccountServicesTab
            styles={styles}
            servicesStyles={servicesStyles}
            identity={{
              firstName,
              fallbackCustomer: copy.fallbackCustomer,
            }}
            data={{
              serviceRowsState,
              nextServiceAppointmentRow,
              latestServicePurchasedRow,
              servicesCurrentFilterLabel,
              serviceRowsFiltered,
              sessionMessage,
              groupedServiceTableRows,
            }}
            view={{
              showAllServicesBookings,
              expandedPackageGroups,
            }}
            actions={{
              openScheduleEditModal,
              setShowAllServicesBookings,
              setServicesFilterDrawerOpen,
              setExpandedPackageGroups,
              setServiceDetailsIsPackageChild,
              setServiceDetailsRow,
            }}
            renderServiceDataPill={renderServiceDataPill}
          />
        ) : null}

        <MobileFilterDrawer
          open={productsFilterDrawerOpen}
          onClose={() => setProductsFilterDrawerOpen(false)}
          title="Sort"
          groups={[
            {
              id: 'products-sort',
              value: productsSort,
              options: PRODUCT_SORT_OPTIONS,
              onChange: (value) => setProductsSort(value as ProductSort),
            },
          ]}
        />

        <MobileFilterDrawer
          open={servicesFilterDrawerOpen}
          onClose={() => setServicesFilterDrawerOpen(false)}
          title="Sort"
          groups={[
            {
              id: 'services-main',
              value: servicesFilter,
              options: SERVICES_PRIMARY_OPTIONS,
              onChange: (value) => {
                setServicesFilter(value as ServicesFilter)
                if (value === 'used') setServicesSubFilter('all')
              },
            },
            ...(servicesFilter === 'not_used'
              ? [
                  {
                    id: 'services-sub',
                    label: 'Stato',
                    value: servicesSubFilter,
                    options: SERVICES_SUB_OPTIONS,
                    onChange: (value: string) => setServicesSubFilter(value as ServicesSubFilter),
                  },
                ]
              : []),
          ]}
        />

        {section === 'addresses' ? (
          <AccountAddressesTab
            styles={styles}
            copy={copy}
            identity={{
              firstName,
              fallbackCustomer: copy.fallbackCustomer,
            }}
            data={{
              addressesView,
              defaultAddress,
              addresses,
              showAddressForm,
              editingAddressId,
              addressMessage,
              addressDraft,
              addressLookupQuery,
              cityLoading,
              showCitySuggestions,
              citySuggestions,
            }}
            actions={{
              setAddressLookupQuery,
              setShowCitySuggestions,
              applyCitySuggestion,
              setAddressDraft,
              onSaveAddress,
              setEditingAddressId,
              setShowAddressForm,
              setAddressMessage,
              setAddressesView,
              onSetDefaultAddress,
              onEditAddress,
              onDeleteAddressById,
            }}
            formatAddressLines={formatAddressLines}
          />
        ) : null}
      </section>
      {renderAccountFooterActions(styles.mobileFooterActions)}
      <AccountDashboardModals
        locale={locale}
        styles={styles}
        productsStyles={productsStyles}
        serviceDetailsRow={serviceDetailsRow}
        serviceDetailsIsPackageChild={serviceDetailsIsPackageChild}
        setServiceDetailsRow={setServiceDetailsRow}
        setServiceDetailsIsPackageChild={setServiceDetailsIsPackageChild}
        orderDetails={orderDetails}
        setOrderDetails={setOrderDetails}
        scheduleEditRow={scheduleEditRow}
        setScheduleEditRow={setScheduleEditRow}
        scheduleEditDraft={scheduleEditDraft}
        setScheduleEditDraft={setScheduleEditDraft}
        sessionSavingId={sessionSavingId}
        canEditSchedule={canEditSchedule}
        formatServiceSchedule={formatServiceSchedule}
        formatServiceStatus={formatServiceStatus}
        formatMoney={formatMoney}
        onSaveScheduleEdit={onSaveScheduleEdit}
        onClearScheduleEdit={onClearScheduleEdit}
      />
    </div>
  )
}
