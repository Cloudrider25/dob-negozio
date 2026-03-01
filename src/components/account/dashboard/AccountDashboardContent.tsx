'use client'

import { MobileFilterDrawer } from '@/components/shared/MobileFilterDrawer'

import { AddressesContainer } from './containers/AddressesContainer'
import { AestheticContainer } from './containers/AestheticContainer'
import { OrdersContainer } from './containers/OrdersContainer'
import { OverviewContainer } from './containers/OverviewContainer'
import { ServicesContainer } from './containers/ServicesContainer'
import {
  PRODUCT_SORT_OPTIONS,
  SERVICES_PRIMARY_OPTIONS,
  SERVICES_SUB_OPTIONS,
} from '../constants'
import { useAccountAddresses } from '../hooks/addresses/useAccountAddresses'
import { useAccountOrders } from '../hooks/orders/useAccountOrders'
import { useAccountServices } from '../hooks/services/useAccountServices'
import { ServiceDataPill } from '../tabs/services/ServiceDataPill'
import type { AestheticFolderDraft, FormMessage } from '../forms/types'
import type {
  AccountSection,
  OrderItem,
  ProductSort,
  ServiceBookingRow,
  ServicesFilter,
  ServicesSubFilter,
} from '../types'

type AccountDashboardContentProps = {
  section: AccountSection
  productsStyles: Record<string, string>
  servicesStyles: Record<string, string>
  orders: ReturnType<typeof useAccountOrders>
  addresses: ReturnType<typeof useAccountAddresses>
  services: ReturnType<typeof useAccountServices>
  profile: {
    draft: {
      firstName: string
      lastName: string
      phone: string
    }
    saving: boolean
    message: FormMessage | null
    setDraft: React.Dispatch<
      React.SetStateAction<{
        firstName: string
        lastName: string
        phone: string
      }>
    >
    onSave: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  }
  aesthetic: {
    draft: AestheticFolderDraft
    setDraft: React.Dispatch<React.SetStateAction<AestheticFolderDraft>>
    saving: boolean
    message: FormMessage | null
    onSave: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  }
  onSetOrderDetails: (order: OrderItem | null) => void
  onSetServiceDetailsRow: (row: ServiceBookingRow | null) => void
  onSetServiceDetailsIsPackageChild: (value: boolean) => void
  formatMoney: (amount: number, currency: string) => string
  formatDate: (value: string | Date | null | undefined, fallback?: string) => string
}

export function AccountDashboardContent({
  section,
  productsStyles,
  servicesStyles,
  orders,
  addresses,
  services,
  profile,
  aesthetic,
  onSetOrderDetails,
  onSetServiceDetailsRow,
  onSetServiceDetailsIsPackageChild,
  formatMoney,
  formatDate,
}: AccountDashboardContentProps) {
  return (
    <section>
      {section === 'overview' ? (
        <OverviewContainer
          data={{
            profileDraft: profile.draft,
            profileSaving: profile.saving,
            profileMessage: profile.message,
          }}
          actions={{
            setProfileDraft: profile.setDraft,
            onSaveProfile: profile.onSave,
          }}
        />
      ) : null}

      {section === 'aesthetic' ? (
        <AestheticContainer
          form={{
            draft: aesthetic.draft,
            setDraft: aesthetic.setDraft,
            saving: aesthetic.saving,
            message: aesthetic.message,
            onSubmit: aesthetic.onSave,
          }}
        />
      ) : null}

      {section === 'orders' ? (
        <OrdersContainer
          productsStyles={productsStyles}
          data={{
            ordersByDateDesc: orders.ordersByDateDesc,
            nextProductDeliveryRow: orders.nextProductDeliveryRow,
            latestPurchasedProductRow: orders.latestPurchasedProductRow,
            productsSortLabel: orders.productsSortLabel,
            groupedProductRows: orders.groupedProductRows,
          }}
          view={{
            showAllProductPurchases: orders.showAllProductPurchases,
            expandedOrderGroups: orders.expandedOrderGroups,
          }}
          actions={{
            setShowAllProductPurchases: orders.setShowAllProductPurchases,
            setProductsFilterDrawerOpen: orders.setProductsFilterDrawerOpen,
            setExpandedOrderGroups: orders.setExpandedOrderGroups,
            setOrderDetails: onSetOrderDetails,
          }}
          formatMoney={formatMoney}
          formatDate={formatDate}
        />
      ) : null}

      {section === 'services' ? (
        <ServicesContainer
          servicesStyles={servicesStyles}
          data={{
            serviceRowsState: services.serviceRowsState,
            nextServiceAppointmentRow: services.nextServiceAppointmentRow,
            latestServicePurchasedRow: services.latestServicePurchasedRow,
            servicesCurrentFilterLabel: services.servicesCurrentFilterLabel,
            serviceRowsFiltered: services.serviceRowsFiltered,
            sessionMessage: services.sessionMessage,
            groupedServiceTableRows: services.groupedServiceTableRows,
          }}
          view={{
            showAllServicesBookings: services.showAllServicesBookings,
            expandedPackageGroups: services.expandedPackageGroups,
          }}
          actions={{
            openScheduleEditModal: services.openScheduleEditModal,
            setShowAllServicesBookings: services.setShowAllServicesBookings,
            setServicesFilterDrawerOpen: services.setServicesFilterDrawerOpen,
            setExpandedPackageGroups: services.setExpandedPackageGroups,
            setServiceDetailsIsPackageChild: onSetServiceDetailsIsPackageChild,
            setServiceDetailsRow: onSetServiceDetailsRow,
          }}
          renderSchedulePill={(row, interactive = true) => (
            <ServiceDataPill
              servicesStyles={servicesStyles}
              row={row}
              scheduleText={services.formatServiceSchedule(row)}
              interactive={interactive}
              onClick={() => services.openScheduleEditModal(row)}
            />
          )}
        />
      ) : null}

      <MobileFilterDrawer
        open={orders.productsFilterDrawerOpen}
        onClose={() => orders.setProductsFilterDrawerOpen(false)}
        title="Sort"
        groups={[
          {
            id: 'products-sort',
            value: orders.productsSort,
            options: PRODUCT_SORT_OPTIONS,
            onChange: (value) => orders.setProductsSort(value as ProductSort),
          },
        ]}
      />

      <MobileFilterDrawer
        open={services.servicesFilterDrawerOpen}
        onClose={() => services.setServicesFilterDrawerOpen(false)}
        title="Sort"
        groups={[
          {
            id: 'services-main',
            value: services.servicesFilter,
            options: SERVICES_PRIMARY_OPTIONS,
            onChange: (value) => {
              services.setServicesFilter(value as ServicesFilter)
              if (value === 'used') services.setServicesSubFilter('all')
            },
          },
          ...(services.servicesFilter === 'not_used'
            ? [
                {
                  id: 'services-sub',
                  label: 'Stato',
                  value: services.servicesSubFilter,
                  options: SERVICES_SUB_OPTIONS,
                  onChange: (value: string) =>
                    services.setServicesSubFilter(value as ServicesSubFilter),
                },
              ]
            : []),
        ]}
      />

      {section === 'addresses' ? (
        <AddressesContainer
          data={{
            addressesView: addresses.addressesView,
            defaultAddress: addresses.defaultAddress,
            addresses: addresses.addresses,
            showAddressForm: addresses.showAddressForm,
            editingAddressId: addresses.editingAddressId,
            addressMessage: addresses.addressMessage,
            addressDraft: addresses.addressDraft,
            addressLookupQuery: addresses.addressLookupQuery,
            cityLoading: addresses.cityLoading,
            showCitySuggestions: addresses.showCitySuggestions,
            citySuggestions: addresses.citySuggestions,
          }}
          actions={{
            setAddressLookupQuery: addresses.setAddressLookupQuery,
            setShowCitySuggestions: addresses.setShowCitySuggestions,
            applyCitySuggestion: addresses.applyCitySuggestion,
            setAddressDraft: addresses.setAddressDraft,
            onSaveAddress: addresses.onSaveAddress,
            setEditingAddressId: addresses.setEditingAddressId,
            setShowAddressForm: addresses.setShowAddressForm,
            setAddressMessage: addresses.setAddressMessage,
            setAddressesView: addresses.setAddressesView,
            onSetDefaultAddress: addresses.onSetDefaultAddress,
            onEditAddress: addresses.onEditAddress,
            onDeleteAddressById: addresses.onDeleteAddressById,
          }}
          formatAddressLines={addresses.formatAddressLines}
        />
      ) : null}
    </section>
  )
}
