'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowPathIcon, CheckIcon, ClockIcon, MinusIcon } from '@heroicons/react/24/outline'
import { getAccountDictionary } from '@/lib/account-i18n'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { MobileFilterDrawer } from '@/components/shared/MobileFilterDrawer'
import { AccountDashboardModals } from './AccountDashboardModals'
import { AccountLogoutButton } from './AccountLogoutButton'
import { SchedulePill } from './SchedulePill'
import type {
  AddressDraft,
  AestheticFolderDraft,
  FormMessage,
  PhotonAddressSuggestion,
} from './forms/types'
import type {
  AccountSection,
  AddressItem,
  AddressesView,
  OrderItem,
  ProductSort,
  ServiceBookingRow,
  ServicesFilter,
  ServicesSubFilter,
} from './types'
import productsStyles from './AccountProducts.module.css'
import servicesStyles from './AccountServices.module.css'
import styles from './AccountDashboardClient.module.css'

const loadAddressesTab = () => import('./tabs/AccountAddressesTab')
const loadAestheticTab = () => import('./tabs/AccountAestheticTab')
const loadOrdersTab = () => import('./tabs/AccountOrdersTab')
const loadServicesTab = () => import('./tabs/AccountServicesTab')
const loadOverviewTab = () => import('./tabs/AccountOverviewTab')

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

type NominatimResult = Array<{
  display_name?: string
  address?: {
    road?: string
    pedestrian?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state_district?: string
    state?: string
    postcode?: string
    country?: string
  }
}>

type MenuEntry =
  | {
      kind: 'tab'
      section: AccountSection
      label: string
      fullWidth?: boolean
    }
  | {
      kind: 'divider'
      label: string
    }

const PRODUCT_SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: 'newest', label: 'Più recenti' },
  { value: 'oldest', label: 'Meno recenti' },
  { value: 'total_desc', label: 'Totale alto-basso' },
  { value: 'total_asc', label: 'Totale basso-alto' },
]

const SERVICES_PRIMARY_OPTIONS: Array<{ value: ServicesFilter; label: string }> = [
  { value: 'not_used', label: 'Non usufruiti' },
  { value: 'used', label: 'Usufruiti' },
]

const SERVICES_SUB_OPTIONS: Array<{ value: ServicesSubFilter; label: string }> = [
  { value: 'all', label: 'Tutti' },
  { value: 'requested_date', label: 'Data richiesta' },
  { value: 'awaiting_confirmation', label: 'In attesa di conferma' },
  { value: 'date_to_request', label: 'Data da richiedere' },
  { value: 'confirmed_date', label: 'Data confermata' },
]

const TAB_PREFETCHERS: Partial<Record<AccountSection, () => Promise<unknown>>> = {
  overview: loadOverviewTab,
  addresses: loadAddressesTab,
  aesthetic: loadAestheticTab,
  services: loadServicesTab,
  orders: loadOrdersTab,
}

const normalizeProvince = (raw?: string) => {
  const value = (raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
  if (!value) return undefined
  if (value.includes('monza') || value.includes('brianza')) {
    return 'Monza and Brianza'
  }
  if (value.includes('milano')) {
    return 'Milano'
  }
  return undefined
}

const parseNominatim = (data: NominatimResult): PhotonAddressSuggestion[] => {
  const suggestionsRaw: PhotonAddressSuggestion[] = []
  for (const item of data) {
    const a = item.address ?? {}
    const road = a.road || a.pedestrian || ''
    const city = a.city || a.town || a.village || a.county || ''
    const streetAddress = [road, a.house_number].filter(Boolean).join(' ').trim() || undefined
    const province =
      normalizeProvince(a.county) ||
      normalizeProvince(a.state_district) ||
      normalizeProvince(a.state)
    const postalCode = a.postcode?.trim() || undefined
    const country = a.country?.trim() || undefined
    const label =
      [streetAddress, city || undefined, province, postalCode, country].filter(Boolean).join(', ') ||
      item.display_name ||
      ''
    if (!label) continue
    suggestionsRaw.push({
      label,
      streetAddress,
      city: city || undefined,
      province,
      postalCode,
      country,
    })
  }
  return suggestionsRaw
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
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses)
  const [servicesFilter, setServicesFilter] = useState<ServicesFilter>('not_used')
  const [servicesSubFilter, setServicesSubFilter] = useState<ServicesSubFilter>('all')
  const [sessionSavingId, setSessionSavingId] = useState<string | null>(null)
  const [sessionMessage, setSessionMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [serviceRowsState, setServiceRowsState] = useState<ServiceBookingRow[]>(initialServiceRows)
  const [expandedPackageGroups, setExpandedPackageGroups] = useState<Record<string, boolean>>({})
  const [expandedOrderGroups, setExpandedOrderGroups] = useState<Record<string, boolean>>({})
  const [showAllServicesBookings, setShowAllServicesBookings] = useState(false)
  const [showAllProductPurchases, setShowAllProductPurchases] = useState(false)
  const [servicesFilterDrawerOpen, setServicesFilterDrawerOpen] = useState(false)
  const [productsFilterDrawerOpen, setProductsFilterDrawerOpen] = useState(false)
  const [productsSort, setProductsSort] = useState<ProductSort>('newest')
  const [serviceDetailsRow, setServiceDetailsRow] = useState<ServiceBookingRow | null>(null)
  const [serviceDetailsIsPackageChild, setServiceDetailsIsPackageChild] = useState(false)
  const [orderDetails, setOrderDetails] = useState<OrderItem | null>(null)
  const [scheduleEditRow, setScheduleEditRow] = useState<ServiceBookingRow | null>(null)
  const [scheduleEditDraft, setScheduleEditDraft] = useState({ date: '', time: '' })
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressesView, setAddressesView] = useState<AddressesView>('default')
  const [profileDraft, setProfileDraft] = useState({
    firstName,
    lastName,
    phone,
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<FormMessage | null>(null)
  const [addressMessage, setAddressMessage] = useState<FormMessage | null>(null)
  const [addressDraft, setAddressDraft] = useState<AddressDraft>({
    firstName: '',
    lastName: '',
    company: '',
    streetAddress: '',
    apartment: '',
    city: '',
    country: 'Italy',
    province: '',
    postalCode: '',
    phone: '',
    isDefault: true,
  })
  const [addressLookupQuery, setAddressLookupQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<PhotonAddressSuggestion[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)
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

  const defaultAddress = addresses[0] ?? null

  const persistAddresses = async (nextAddresses: AddressItem[]) => {
    const payloadAddresses = nextAddresses.map((address, index) => ({
      firstName: (address.firstName ?? '').trim(),
      lastName: (address.lastName ?? '').trim(),
      company: (address.company ?? '').trim(),
      streetAddress: (address.streetAddress ?? address.address.split(',')[0] ?? '').trim(),
      apartment: (
        address.apartment ??
        (address.address.includes(',') ? address.address.split(',').slice(1).join(',') : '')
      ).trim(),
      city: address.city.trim(),
      country: address.country.trim(),
      province: address.province.trim(),
      postalCode: address.postalCode.trim(),
      phone: (address.phone ?? '').trim(),
      isDefault: index === 0,
    }))

    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ addresses: payloadAddresses }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { message?: string }
      throw new Error(data.message || 'Impossibile salvare gli indirizzi.')
    }
  }

  const formatAddressLines = (address: AddressItem) =>
    [
      address.fullName?.trim() || '',
      address.address,
      `${address.postalCode} ${address.city} ${address.province}`.trim(),
      address.country,
    ].filter((line) => line.trim().length > 0)

  useEffect(() => {
    const query = addressLookupQuery.trim()
    if (query.length < 2) {
      setCitySuggestions([])
      setCityLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        setCityLoading(true)
        const nominatimRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&accept-language=it&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        )
        let suggestionsRaw: PhotonAddressSuggestion[] = []
        if (nominatimRes.ok) {
          const nominatimData = (await nominatimRes.json()) as NominatimResult
          suggestionsRaw = parseNominatim(nominatimData)
        }

        const suggestions = suggestionsRaw.filter(
          (value, index, arr) =>
            arr.findIndex((item) => item.label.toLowerCase() === value.label.toLowerCase()) ===
            index,
        )

        setCitySuggestions(suggestions)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setCitySuggestions([])
        }
      } finally {
        setCityLoading(false)
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [addressLookupQuery])

  useEffect(() => {
    let active = true

    const loadAestheticDraft = async () => {
      try {
        const response = await fetch('/api/account/aesthetic-folder', {
          method: 'GET',
          credentials: 'include',
        })
        if (!response.ok) return
        const data = (await response.json().catch(() => ({}))) as { draft?: AestheticFolderDraft }
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

  const applyCitySuggestion = (suggestion: PhotonAddressSuggestion) => {
    setAddressDraft((prev) => {
      const nextProvince =
        suggestion.province && ['Milano', 'Monza and Brianza'].includes(suggestion.province)
          ? suggestion.province
          : prev.province

      return {
        ...prev,
        streetAddress: suggestion.streetAddress || prev.streetAddress,
        city: suggestion.city || prev.city,
        postalCode: suggestion.postalCode || prev.postalCode,
        province: nextProvince,
        country:
          suggestion.country?.toLowerCase() === 'italy' ||
          suggestion.country?.toLowerCase() === 'italia'
            ? 'Italy'
            : prev.country,
      }
    })
    setAddressLookupQuery(suggestion.label)
    setShowCitySuggestions(false)
  }

  const formatMoney = (value: number, currency: string) =>
    new Intl.NumberFormat(locale === 'it' ? 'it-IT' : locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(value)

  const ordersByDateDesc = useMemo(
    () =>
      [...initialOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [initialOrders],
  )

  const sortedOrdersForList = useMemo(() => {
    const rows = [...initialOrders]
    if (productsSort === 'oldest') {
      rows.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      return rows
    }
    if (productsSort === 'total_desc') {
      rows.sort((a, b) => (b.total || 0) - (a.total || 0))
      return rows
    }
    if (productsSort === 'total_asc') {
      rows.sort((a, b) => (a.total || 0) - (b.total || 0))
      return rows
    }
    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return rows
  }, [initialOrders, productsSort])

  const groupedProductRows = useMemo(() => {
    const output: Array<
      | { kind: 'single'; row: OrderItem }
      | {
          kind: 'order-group'
          key: string
          lead: OrderItem
          rows: OrderItem[]
          productsTotal: number
        }
    > = []

    const byOrder = new Map<string, OrderItem[]>()
    for (const row of sortedOrdersForList) {
      const key = row.orderNumber
      const list = byOrder.get(key) ?? []
      list.push(row)
      byOrder.set(key, list)
    }

    for (const [key, rows] of byOrder.entries()) {
      if (rows.length === 1) {
        output.push({ kind: 'single', row: rows[0] })
        continue
      }
      const ordered = [...rows].sort((a, b) => a.id - b.id)
      output.push({
        kind: 'order-group',
        key,
        lead: ordered[0],
        rows: ordered,
        productsTotal: ordered.reduce((sum, r) => sum + (r.total || 0), 0),
      })
    }

    output.sort((a, b) => {
      const aDate = a.kind === 'single' ? a.row.createdAt : a.lead.createdAt
      const bDate = b.kind === 'single' ? b.row.createdAt : b.lead.createdAt
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })

    return output
  }, [sortedOrdersForList])

  const formatDateTime = (dateValue: string | null, timeValue?: string | null) => {
    if (!dateValue) return '—'
    const date = new Date(dateValue)
    const dateLabel = Number.isNaN(date.getTime())
      ? dateValue
      : new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(date)
    return timeValue?.trim() ? `${dateLabel} · ${timeValue}` : dateLabel
  }

  const formatServiceSchedule = (row: ServiceBookingRow) => {
    if (
      row.appointmentStatus === 'confirmed' ||
      row.appointmentStatus === 'confirmed_by_customer'
    ) {
      return formatDateTime(
        row.proposedDate ?? row.requestedDate,
        row.proposedTime ?? row.requestedTime,
      )
    }
    if (row.appointmentStatus === 'alternative_proposed') {
      return formatDateTime(row.proposedDate, row.proposedTime)
    }
    if (row.appointmentMode === 'requested_slot') {
      return formatDateTime(row.requestedDate, row.requestedTime)
    }
    return 'Da definire'
  }

  const getOrderFutureDeliveryTs = (row: OrderItem) => {
    if (!row.deliveryUpdatedAt) return null
    const ts = new Date(row.deliveryUpdatedAt).getTime()
    return Number.isNaN(ts) ? null : ts
  }
  const nextProductDeliveryRow = useMemo(() => {
    const currentTs = Date.now()
    const candidates = ordersByDateDesc
      .map((row) => ({ row, ts: getOrderFutureDeliveryTs(row) }))
      .filter(
        (entry): entry is { row: OrderItem; ts: number } =>
          entry.ts !== null && entry.ts > currentTs,
      )
      .sort((a, b) => a.ts - b.ts)
    return candidates[0]?.row ?? null
  }, [ordersByDateDesc])
  const latestPurchasedProductRow = ordersByDateDesc[0] ?? null

  const isPaidServiceRow = (row: ServiceBookingRow) =>
    ['paid', 'authorized', 'processing'].includes((row.paymentStatus || '').toLowerCase())
  const getConfirmedSessionTs = (row: ServiceBookingRow) => {
    const dateSource = row.proposedDate ?? row.requestedDate
    if (!dateSource) return null
    const raw = row.proposedTime?.trim() || row.requestedTime?.trim()
    const time = raw && /^\d{1,2}:\d{2}/.test(raw) ? raw : '00:00'
    const ts = new Date(`${dateSource}T${time}:00`).getTime()
    return Number.isNaN(ts) ? null : ts
  }
  const isUsedServiceRow = (row: ServiceBookingRow) => {
    const currentTs = Date.now()
    if (!isPaidServiceRow(row)) return false
    if (!['confirmed', 'confirmed_by_customer'].includes(row.appointmentStatus)) return false
    const confirmedTs = getConfirmedSessionTs(row)
    return confirmedTs !== null && confirmedTs < currentTs
  }

  const serviceRowsFiltered = useMemo(() => {
    let rows = [...serviceRowsState].sort(
      (a, b) => new Date(b.orderCreatedAt).getTime() - new Date(a.orderCreatedAt).getTime(),
    )

    rows = rows.filter((row) => {
      if (servicesFilter === 'used') return isUsedServiceRow(row)
      return !isUsedServiceRow(row)
    })

    if (servicesFilter !== 'not_used' || servicesSubFilter === 'all') return rows

    return rows.filter((row) => {
      const status = row.appointmentStatus
      const hasRequested = Boolean(row.requestedDate)
      const hasConfirmed = ['confirmed', 'confirmed_by_customer'].includes(status)

      if (servicesSubFilter === 'requested_date') {
        return row.appointmentMode === 'requested_slot' && hasRequested && status === 'pending'
      }
      if (servicesSubFilter === 'awaiting_confirmation') {
        return status === 'alternative_proposed'
      }
      if (servicesSubFilter === 'date_to_request') {
        return row.appointmentMode === 'contact_later' || row.appointmentMode === 'none'
      }
      if (servicesSubFilter === 'confirmed_date') {
        return hasConfirmed
      }
      return true
    })
  }, [serviceRowsState, servicesFilter, servicesSubFilter])

  const formatServiceStatus = (row: ServiceBookingRow) => {
    if (isUsedServiceRow(row)) return 'Pagato · usufruito'
    if (isPaidServiceRow(row)) {
      if (row.appointmentStatus === 'alternative_proposed') return 'Pagato · in attesa di conferma'
      if (['confirmed', 'confirmed_by_customer'].includes(row.appointmentStatus))
        return 'Pagato · data confermata'
      if (row.appointmentMode === 'contact_later' || row.appointmentMode === 'none')
        return 'Pagato · data da richiedere'
      return 'Pagato · data richiesta'
    }
    if (row.appointmentStatus === 'alternative_proposed') return 'In attesa di conferma'
    if (['confirmed', 'confirmed_by_customer'].includes(row.appointmentStatus))
      return 'Data confermata'
    if (row.appointmentMode === 'contact_later' || row.appointmentMode === 'none')
      return 'Data da richiedere'
    return 'Data richiesta'
  }

  const groupedServiceTableRows = useMemo(() => {
    const output: Array<
      | { kind: 'single'; row: ServiceBookingRow }
      | {
          kind: 'package-group'
          key: string
          lead: ServiceBookingRow
          rows: ServiceBookingRow[]
        }
    > = []

    const packageGroups = new Map<string, ServiceBookingRow[]>()

    for (const row of serviceRowsFiltered) {
      if (row.itemKind !== 'package') {
        output.push({ kind: 'single', row })
        continue
      }
      const key = row.orderServiceItemId || `${row.orderId}:${row.serviceTitle}:${row.variantLabel}`
      const list = packageGroups.get(key) ?? []
      list.push(row)
      packageGroups.set(key, list)
    }

    for (const [key, rows] of packageGroups.entries()) {
      rows.sort((a, b) => a.sessionIndex - b.sessionIndex)
      output.push({
        kind: 'package-group',
        key,
        lead: rows[0],
        rows,
      })
    }

    output.sort((a, b) => {
      const aDate = a.kind === 'single' ? a.row.orderCreatedAt : a.lead.orderCreatedAt
      const bDate = b.kind === 'single' ? b.row.orderCreatedAt : b.lead.orderCreatedAt
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })

    return output
  }, [serviceRowsFiltered])

  const productsSortLabel =
    PRODUCT_SORT_OPTIONS.find((option) => option.value === productsSort)?.label ?? 'Più recenti'
  const servicesPrimaryLabel =
    SERVICES_PRIMARY_OPTIONS.find((option) => option.value === servicesFilter)?.label ??
    'Non usufruiti'
  const servicesSubLabel =
    SERVICES_SUB_OPTIONS.find((option) => option.value === servicesSubFilter)?.label ?? 'Tutti'
  const servicesCurrentFilterLabel =
    servicesFilter === 'not_used' && servicesSubFilter !== 'all'
      ? `${servicesPrimaryLabel} · ${servicesSubLabel}`
      : servicesPrimaryLabel

  const nextServiceAppointmentRow = useMemo(() => {
    const currentTs = Date.now()
    const candidates = serviceRowsState
      .map((row) => ({ row, ts: getConfirmedSessionTs(row) }))
      .filter(
        (entry): entry is { row: ServiceBookingRow; ts: number } =>
          entry.ts !== null && entry.ts > currentTs,
      )
      .sort((a, b) => a.ts - b.ts)
    return candidates[0]?.row ?? null
  }, [serviceRowsState])

  const latestServicePurchasedRow = useMemo(() => {
    const rows = [...serviceRowsState].sort(
      (a, b) => new Date(b.orderCreatedAt).getTime() - new Date(a.orderCreatedAt).getTime(),
    )
    return rows[0] ?? null
  }, [serviceRowsState])

  const renderServiceDataPill = (row: ServiceBookingRow, interactive = true) => {
    const icon = getScheduleStatusIcon(row)
    return (
      <SchedulePill
        classNames={{
          root: servicesStyles.inlineDataPill,
          interactive: servicesStyles.inlineDataPillButton,
          statusIcon: servicesStyles.inlineStatusIcon,
          statusTone: icon.toneClass,
          divider: servicesStyles.inlineDataDivider,
          text: servicesStyles.inlineDataText,
          dot: servicesStyles.inlineDataDot,
          actionIcon: servicesStyles.inlinePillIconButton,
        }}
        scheduleText={formatServiceSchedule(row)}
        statusLabel={icon.label}
        StatusIcon={icon.icon}
        interactive={interactive}
        aria-label="Apri modifica data"
        title="Apri modifica data"
        onClick={() => openScheduleEditModal(row)}
      />
    )
  }

  const canEditSchedule = (row: ServiceBookingRow) =>
    row.appointmentStatus !== 'confirmed' &&
    row.appointmentStatus !== 'confirmed_by_customer' &&
    row.appointmentStatus !== 'alternative_proposed' &&
    !row.proposedDate

  const getScheduleStatusIcon = (row: ServiceBookingRow) => {
    if (
      row.appointmentStatus === 'confirmed' ||
      row.appointmentStatus === 'confirmed_by_customer'
    ) {
      return { icon: CheckIcon, toneClass: servicesStyles.statusIconConfirmed, label: 'Confermato' }
    }
    if (row.appointmentStatus === 'alternative_proposed') {
      return {
        icon: ArrowPathIcon,
        toneClass: servicesStyles.statusIconProposed,
        label: 'Alternativa proposta',
      }
    }
    if (row.appointmentMode === 'requested_slot' || row.appointmentStatus === 'pending') {
      return { icon: ClockIcon, toneClass: servicesStyles.statusIconPending, label: 'Pending' }
    }
    return { icon: MinusIcon, toneClass: servicesStyles.statusIconEmpty, label: 'Da definire' }
  }

  const openScheduleEditModal = (row: ServiceBookingRow) => {
    setScheduleEditRow(row)
    setScheduleEditDraft({
      date: (row.proposedDate ?? row.requestedDate ?? '').slice(0, 10),
      time: row.proposedTime ?? row.requestedTime ?? '',
    })
  }

  const applySessionRowUpdate = (
    rowId: string,
    patch: Partial<
      Pick<
        ServiceBookingRow,
        | 'appointmentMode'
        | 'appointmentStatus'
        | 'requestedDate'
        | 'requestedTime'
        | 'proposedDate'
        | 'proposedTime'
      >
    >,
  ) => {
    setServiceRowsState((prev) =>
      prev.map((entry) => (entry.id === rowId ? { ...entry, ...patch } : entry)),
    )
  }

  const patchSessionSchedule = async (
    row: ServiceBookingRow,
    payloadBody:
      | { action: 'set'; requestedDate: string; requestedTime: string }
      | { action: 'clear' },
  ) => {
    if (sessionSavingId) return false
    setSessionSavingId(row.id)
    setSessionMessage(null)
    try {
      const res = await fetch(`/api/account/service-sessions/${row.id}/request-date`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payloadBody),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setSessionMessage({
          type: 'error',
          text: data.error || 'Impossibile salvare la data richiesta.',
        })
        return false
      }
      return true
    } catch {
      setSessionMessage({
        type: 'error',
        text: 'Errore di rete durante il salvataggio della data.',
      })
      return false
    } finally {
      setSessionSavingId(null)
    }
  }

  const onSaveScheduleEdit = async () => {
    if (!scheduleEditRow) return
    if (!scheduleEditDraft.date || !scheduleEditDraft.time) return
    const ok = await patchSessionSchedule(scheduleEditRow, {
      action: 'set',
      requestedDate: scheduleEditDraft.date,
      requestedTime: scheduleEditDraft.time,
    })
    if (!ok) return
    applySessionRowUpdate(scheduleEditRow.id, {
      appointmentMode: 'requested_slot',
      appointmentStatus: 'pending',
      requestedDate: scheduleEditDraft.date,
      requestedTime: scheduleEditDraft.time,
      proposedDate: null,
      proposedTime: null,
    })
    setScheduleEditRow(null)
    setSessionMessage({ type: 'success', text: 'Data aggiornata.' })
  }

  const onClearScheduleEdit = async () => {
    if (!scheduleEditRow) return
    const ok = await patchSessionSchedule(scheduleEditRow, { action: 'clear' })
    if (!ok) return
    applySessionRowUpdate(scheduleEditRow.id, {
      appointmentMode: 'contact_later',
      appointmentStatus: 'none',
      requestedDate: null,
      requestedTime: null,
      proposedDate: null,
      proposedTime: null,
    })
    setScheduleEditRow(null)
    setSessionMessage({ type: 'success', text: 'Data rimossa.' })
  }

  const onDeleteAddressById = (id: string) => {
    const next = addresses.filter((address) => address.id !== id)
    setAddresses(next)
    setAddressMessage(null)
    if (editingAddressId === id) setEditingAddressId(null)
    void persistAddresses(next).catch((error) =>
      setAddressMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Errore salvataggio indirizzi.',
      }),
    )
  }

  const onSetDefaultAddress = (id: string) => {
    const next = (() => {
      const prev = addresses
      const index = prev.findIndex((address) => address.id === id)
      if (index <= 0) return prev
      const output = [...prev]
      const [selected] = output.splice(index, 1)
      output.unshift(selected)
      return output
    })()
    setAddresses(next)
    void persistAddresses(next).catch((error) =>
      setAddressMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Errore salvataggio indirizzi.',
      }),
    )
  }

  const onEditAddress = (address?: AddressItem | null) => {
    setAddressMessage(null)
    setAddressLookupQuery('')
    if (address) {
      setEditingAddressId(address.id)
      setAddressDraft((prev) => ({
        ...prev,
        firstName:
          address.firstName ??
          (address.fullName.split(' ').slice(0, -1).join(' ') || prev.firstName),
        lastName:
          address.lastName ?? (address.fullName.split(' ').slice(-1).join(' ') || prev.lastName),
        company: address.company ?? '',
        streetAddress:
          address.streetAddress ?? (address.address.split(',')[0]?.trim() || address.address),
        apartment:
          address.apartment ??
          (address.address.includes(',')
            ? address.address.split(',').slice(1).join(',').trim()
            : ''),
        city: address.city,
        country: address.country === 'Italia' ? 'Italy' : address.country,
        province: address.province,
        postalCode: address.postalCode,
        phone: address.phone ?? '',
        isDefault: Boolean(address.isDefault ?? false),
      }))
    } else {
      setEditingAddressId(null)
    }
    setShowAddressForm(true)
  }

  const onSaveAddress = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAddressMessage(null)
    const required = [
      addressDraft.firstName,
      addressDraft.lastName,
      addressDraft.streetAddress,
      addressDraft.city,
      addressDraft.country,
      addressDraft.province,
      addressDraft.postalCode,
    ]
    if (required.some((value) => value.trim().length === 0)) {
      setAddressMessage({
        type: 'error',
        text: 'Compila tutti i campi obbligatori (Nome, Cognome, Indirizzo, Città, Provincia, CAP).',
      })
      return
    }

    const nextAddress: AddressItem = {
      id: editingAddressId || `${Date.now()}`,
      fullName: `${addressDraft.firstName} ${addressDraft.lastName}`.trim(),
      address: [addressDraft.streetAddress, addressDraft.apartment].filter(Boolean).join(', '),
      postalCode: addressDraft.postalCode,
      city: addressDraft.city,
      province: addressDraft.province,
      country: addressDraft.country,
      firstName: addressDraft.firstName,
      lastName: addressDraft.lastName,
      company: addressDraft.company,
      streetAddress: addressDraft.streetAddress,
      apartment: addressDraft.apartment,
      phone: addressDraft.phone,
      isDefault: addressDraft.isDefault,
    }

    const nextAddressesBase = editingAddressId
      ? addresses.map((address) => (address.id === editingAddressId ? nextAddress : address))
      : [...addresses, nextAddress]

    let nextAddresses = nextAddressesBase
    if (addressDraft.isDefault) {
      nextAddresses = [
        ...nextAddressesBase.filter((address) => address.id === nextAddress.id),
        ...nextAddressesBase.filter((address) => address.id !== nextAddress.id),
      ]
    } else if (
      !nextAddressesBase.some((address) => address.id !== nextAddress.id) &&
      nextAddressesBase.length === 1
    ) {
      nextAddresses = [{ ...nextAddress, isDefault: true }]
    }

    setAddresses(nextAddresses)

    void persistAddresses(nextAddresses)
      .then(() => {
        setShowAddressForm(false)
        setAddressLookupQuery('')
        setEditingAddressId(null)
        setAddressMessage({ type: 'success', text: 'Indirizzo salvato.' })
        setAddressDraft({
          firstName: '',
          lastName: '',
          company: '',
          streetAddress: '',
          apartment: '',
          city: '',
          country: 'Italy',
          province: '',
          postalCode: '',
          phone: '',
          isDefault: true,
        })
      })
      .catch((error) => {
        setAddressMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Errore salvataggio indirizzi.',
        })
      })
  }

  const onSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (profileSaving) return

    setProfileSaving(true)
    setProfileMessage(null)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: profileDraft.firstName.trim(),
          lastName: profileDraft.lastName.trim(),
          phone: profileDraft.phone.trim(),
        }),
      })

      const data = (await response.json().catch(() => ({}))) as {
        message?: string
        errors?: Array<{ message?: string }>
      }
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
      const response = await fetch('/api/account/aesthetic-folder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(aestheticDraft),
      })
      const data = (await response.json().catch(() => ({}))) as { error?: string }
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

  const menuEntries: MenuEntry[] = [
    { kind: 'tab', section: 'overview', label: 'Account' },
    { kind: 'tab', section: 'addresses', label: copy.nav.addresses },
    { kind: 'tab', section: 'aesthetic', label: 'Cartella Estetica', fullWidth: true },
    { kind: 'divider', label: 'Ordini' },
    { kind: 'tab', section: 'services', label: 'Servizi' },
    { kind: 'tab', section: 'orders', label: 'Prodotti' },
  ]

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
