import type { AestheticFolderDraft, AddressDraft, FormMessage, PhotonAddressSuggestion } from '../../forms/types'
import type { AddressItem, AddressesView, OrderItem, ServiceBookingRow } from '../../types'

export type OverviewContainerProps = {
  data: {
    profileDraft: {
      firstName: string
      lastName: string
      phone: string
    }
    profileSaving: boolean
    profileMessage: FormMessage | null
  }
  actions: {
    setProfileDraft: React.Dispatch<
      React.SetStateAction<{
        firstName: string
        lastName: string
        phone: string
      }>
    >
    onSaveProfile: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  }
}

export type AestheticContainerProps = {
  form: {
    draft: AestheticFolderDraft
    setDraft: React.Dispatch<React.SetStateAction<AestheticFolderDraft>>
    saving: boolean
    message: FormMessage | null
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  }
}

export type OrdersContainerProps = {
  productsStyles: Record<string, string>
  data: {
    ordersByDateDesc: OrderItem[]
    nextProductDeliveryRow: OrderItem | null
    latestPurchasedProductRow: OrderItem | null
    productsSortLabel: string
    groupedProductRows: Array<
      | { kind: 'single'; row: OrderItem }
      | {
          kind: 'order-group'
          key: string
          lead: OrderItem
          rows: OrderItem[]
          productsTotal: number
        }
    >
  }
  view: {
    showAllProductPurchases: boolean
    expandedOrderGroups: Record<string, boolean>
  }
  actions: {
    setShowAllProductPurchases: (value: boolean | ((prev: boolean) => boolean)) => void
    setProductsFilterDrawerOpen: (value: boolean) => void
    setExpandedOrderGroups: (
      value: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>),
    ) => void
    setOrderDetails: (order: OrderItem | null) => void
  }
  formatMoney: (amount: number, currency: string) => string
  formatDate: (value: string | Date | null | undefined, fallback?: string) => string
}

export type ServicesContainerProps = {
  servicesStyles: Record<string, string>
  data: {
    serviceRowsState: ServiceBookingRow[]
    nextServiceAppointmentRow: ServiceBookingRow | null
    latestServicePurchasedRow: ServiceBookingRow | null
    servicesCurrentFilterLabel: string
    serviceRowsFiltered: ServiceBookingRow[]
    sessionMessage: FormMessage | null
    groupedServiceTableRows: Array<
      | { kind: 'single'; row: ServiceBookingRow }
      | {
          kind: 'package-group'
          key: string
          lead: ServiceBookingRow
          rows: ServiceBookingRow[]
        }
    >
  }
  view: {
    showAllServicesBookings: boolean
    expandedPackageGroups: Record<string, boolean>
  }
  actions: {
    openScheduleEditModal: (row: ServiceBookingRow) => void
    setShowAllServicesBookings: (value: boolean | ((prev: boolean) => boolean)) => void
    setServicesFilterDrawerOpen: (value: boolean) => void
    setExpandedPackageGroups: (
      value: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>),
    ) => void
    setServiceDetailsIsPackageChild: (value: boolean) => void
    setServiceDetailsRow: (row: ServiceBookingRow | null) => void
  }
  renderSchedulePill: (row: ServiceBookingRow, interactive?: boolean) => React.ReactNode
}

export type AddressesContainerProps = {
  data: {
    addressesView: AddressesView
    defaultAddress: AddressItem | null
    addresses: AddressItem[]
    showAddressForm: boolean
    editingAddressId: string | null
    addressMessage: FormMessage | null
    addressDraft: AddressDraft
    addressLookupQuery: string
    cityLoading: boolean
    showCitySuggestions: boolean
    citySuggestions: PhotonAddressSuggestion[]
  }
  actions: {
    setAddressLookupQuery: (value: string) => void
    setShowCitySuggestions: (value: boolean) => void
    applyCitySuggestion: (suggestion: PhotonAddressSuggestion) => void
    setAddressDraft: React.Dispatch<React.SetStateAction<AddressDraft>>
    onSaveAddress: (event: React.FormEvent<HTMLFormElement>) => void
    setEditingAddressId: (id: string | null) => void
    setShowAddressForm: (value: boolean | ((prev: boolean) => boolean)) => void
    setAddressMessage: (message: FormMessage | null) => void
    setAddressesView: (view: AddressesView) => void
    onSetDefaultAddress: (addressId: string) => void
    onEditAddress: (address: AddressItem) => void
    onDeleteAddressById: (addressId: string) => void
  }
  formatAddressLines: (address: AddressItem) => string[]
}
