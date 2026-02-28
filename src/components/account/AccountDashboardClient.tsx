'use client'

import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  ArrowPathIcon,
  ChevronDownIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  MinusIcon,
} from '@heroicons/react/24/outline'

import { getAccountDictionary } from '@/lib/account-i18n'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { LabelText } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MobileFilterDrawer } from '@/components/shared/MobileFilterDrawer'

import { AccountListHeader } from './AccountListHeader'
import { AccountModal, accountModalClassNames } from './AccountModal'
import { AccountIconAction, AccountPillButton } from './AccountButtons'
import { AccountLogoutButton } from './AccountLogoutButton'
import { SchedulePill } from './SchedulePill'
import { AddressForm } from './forms/AddressForm'
import { AestheticForm } from './forms/AestheticForm'
import type { AddressDraft, AestheticFolderDraft, FormMessage, PhotonAddressSuggestion } from './forms/types'
import productsStyles from './AccountProducts.module.css'
import servicesStyles from './AccountServices.module.css'
import styles from './AccountDashboardClient.module.css'

type AccountSection = 'overview' | 'services' | 'orders' | 'addresses' | 'aesthetic'

type AddressItem = {
  id: string
  fullName: string
  address: string
  postalCode: string
  city: string
  province: string
  country: string
  firstName?: string
  lastName?: string
  company?: string
  streetAddress?: string
  apartment?: string
  phone?: string
  isDefault?: boolean
}

type OrderItem = {
  id: number
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  currency: string
  createdAt: string
  purchaseTitle: string
  purchaseThumb: string | null
  otherItemsCount: number
  quantity: number
  unitPrice: number
  productFulfillmentMode: 'shipping' | 'pickup' | 'none'
  trackingNumber: string | null
  trackingUrl: string | null
  deliveryStatus: string | null
  deliveryUpdatedAt: string | null
}

type ServiceBookingRow = {
  id: string
  orderServiceItemId: string
  sessionIndex: number
  orderId: number
  orderNumber: string
  orderCreatedAt: string
  orderStatus: string
  paymentStatus: string
  itemKind: 'service' | 'package'
  serviceTitle: string
  variantLabel: string
  sessionLabel: string
  sessionsTotal: number
  durationMinutes: number | null
  rowPrice: number
  currency: string
  appointmentMode: string
  appointmentStatus: string
  requestedDate: string | null
  requestedTime: string | null
  proposedDate: string | null
  proposedTime: string | null
  confirmedAt: string | null
}

type ServicesFilter = 'used' | 'not_used'
type ServicesSubFilter =
  | 'all'
  | 'requested_date'
  | 'awaiting_confirmation'
  | 'date_to_request'
  | 'confirmed_date'
type ProductSort = 'newest' | 'oldest' | 'total_desc' | 'total_asc'
type AddressesView = 'default' | 'book'

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

        const parseNominatim = (
          data: Array<{
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
          }>,
        ): PhotonAddressSuggestion[] => {
          const suggestionsRaw: PhotonAddressSuggestion[] = []
          for (const item of data) {
            const a = item.address ?? {}
            const road = a.road || a.pedestrian || ''
            const city = a.city || a.town || a.village || a.county || ''
            const streetAddress =
              [road, a.house_number].filter(Boolean).join(' ').trim() || undefined
            const province =
              normalizeProvince(a.county) ||
              normalizeProvince(a.state_district) ||
              normalizeProvince(a.state)
            const postalCode = a.postcode?.trim() || undefined
            const country = a.country?.trim() || undefined
            const label =
              [streetAddress, city || undefined, province, postalCode, country]
                .filter(Boolean)
                .join(', ') ||
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
        const nominatimRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&accept-language=it&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        )
        let suggestionsRaw: PhotonAddressSuggestion[] = []
        if (nominatimRes.ok) {
          const nominatimData = (await nominatimRes.json()) as Parameters<typeof parseNominatim>[0]
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

  const nowTs = Date.now()
  const getOrderFutureDeliveryTs = (row: OrderItem) => {
    if (!row.deliveryUpdatedAt) return null
    const ts = new Date(row.deliveryUpdatedAt).getTime()
    return Number.isNaN(ts) ? null : ts
  }
  const nextProductDeliveryRow = useMemo(() => {
    const candidates = ordersByDateDesc
      .map((row) => ({ row, ts: getOrderFutureDeliveryTs(row) }))
      .filter(
        (entry): entry is { row: OrderItem; ts: number } => entry.ts !== null && entry.ts > nowTs,
      )
      .sort((a, b) => a.ts - b.ts)
    return candidates[0]?.row ?? null
  }, [ordersByDateDesc, nowTs])
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
    if (!isPaidServiceRow(row)) return false
    if (!['confirmed', 'confirmed_by_customer'].includes(row.appointmentStatus)) return false
    const confirmedTs = getConfirmedSessionTs(row)
    return confirmedTs !== null && confirmedTs < nowTs
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
  }, [serviceRowsState, servicesFilter, servicesSubFilter, nowTs])

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

  const productSortOptions: Array<{ value: ProductSort; label: string }> = [
    { value: 'newest', label: 'Più recenti' },
    { value: 'oldest', label: 'Meno recenti' },
    { value: 'total_desc', label: 'Totale alto-basso' },
    { value: 'total_asc', label: 'Totale basso-alto' },
  ]

  const servicesPrimaryOptions: Array<{ value: ServicesFilter; label: string }> = [
    { value: 'not_used', label: 'Non usufruiti' },
    { value: 'used', label: 'Usufruiti' },
  ]

  const servicesSubOptions: Array<{ value: ServicesSubFilter; label: string }> = [
    { value: 'all', label: 'Tutti' },
    { value: 'requested_date', label: 'Data richiesta' },
    { value: 'awaiting_confirmation', label: 'In attesa di conferma' },
    { value: 'date_to_request', label: 'Data da richiedere' },
    { value: 'confirmed_date', label: 'Data confermata' },
  ]

  const productsSortLabel =
    productSortOptions.find((option) => option.value === productsSort)?.label ?? 'Più recenti'
  const servicesPrimaryLabel =
    servicesPrimaryOptions.find((option) => option.value === servicesFilter)?.label ??
    'Non usufruiti'
  const servicesSubLabel =
    servicesSubOptions.find((option) => option.value === servicesSubFilter)?.label ?? 'Tutti'
  const servicesCurrentFilterLabel =
    servicesFilter === 'not_used' && servicesSubFilter !== 'all'
      ? `${servicesPrimaryLabel} · ${servicesSubLabel}`
      : servicesPrimaryLabel

  const nextServiceAppointmentRow = useMemo(() => {
    const candidates = serviceRowsState
      .map((row) => ({ row, ts: getConfirmedSessionTs(row) }))
      .filter(
        (entry): entry is { row: ServiceBookingRow; ts: number } =>
          entry.ts !== null && entry.ts > nowTs,
      )
      .sort((a, b) => a.ts - b.ts)
    return candidates[0]?.row ?? null
  }, [serviceRowsState, nowTs])

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

  const onDeleteAddress = () => {
    if (addresses.length === 0) return
    const next = addresses.slice(1)
    setAddresses(next)
    setAddressMessage(null)
    setEditingAddressId(null)
    void persistAddresses(next).catch((error) =>
      setAddressMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Errore salvataggio indirizzi.',
      }),
    )
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

  return (
    <div className={styles.layout}>
      <SectionTitle as="h2" size="h2" className={`${styles.title} ${styles.mobilePageTitle}`}>
        {mobileSectionTitle}
      </SectionTitle>
      <aside className={styles.sidebar}>
        <nav className={styles.menu} aria-label={copy.nav.ariaLabel}>
          <button
            className={`${styles.menuButton} typo-body-lg`}
            type="button"
            onClick={() => setSection('overview')}
          >
            <span className="typo-body-lg">Account</span>
            <span
              className={`${styles.menuDot} ${section === 'overview' ? styles.menuDotActive : ''}`}
            />
          </button>
          <button
            className={`${styles.menuButton} typo-body-lg`}
            type="button"
            onClick={() => setSection('addresses')}
          >
            <span className="typo-body-lg">{copy.nav.addresses}</span>
            <span
              className={`${styles.menuDot} ${section === 'addresses' ? styles.menuDotActive : ''}`}
            />
          </button>
          <button
            className={`${styles.menuButton} ${styles.menuButtonFull} typo-body-lg`}
            type="button"
            onClick={() => setSection('aesthetic')}
          >
            <span className="typo-body-lg">Cartella Estetica</span>
            <span
              className={`${styles.menuDot} ${section === 'aesthetic' ? styles.menuDotActive : ''}`}
            />
          </button>
          <div className={styles.menuDivider} aria-hidden="true">
            <span className={`${styles.menuDividerLabel} typo-caption-upper`}>Ordini</span>
          </div>
          <button
            className={`${styles.menuButton} typo-body-lg`}
            type="button"
            onClick={() => setSection('services')}
          >
            <span className="typo-body-lg">Servizi</span>
            <span
              className={`${styles.menuDot} ${section === 'services' ? styles.menuDotActive : ''}`}
            />
          </button>
          <button
            className={`${styles.menuButton} typo-body-lg`}
            type="button"
            onClick={() => setSection('orders')}
          >
            <span className="typo-body-lg">Prodotti</span>
            <span
              className={`${styles.menuDot} ${section === 'orders' ? styles.menuDotActive : ''}`}
            />
          </button>
        </nav>
        {renderAccountFooterActions(styles.sidebarFooter)}
      </aside>

      <section className={styles.content}>
        {section === 'overview' ? (
          <>
            <SectionTitle as="h2" size="h2" className={styles.title}>
              {copy.overview.greeting}, {firstName || copy.fallbackCustomer}
            </SectionTitle>
            <hr className={styles.sectionDivider} />

            <div className={styles.block}>
              <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                {copy.overview.yourInfo}
              </SectionTitle>
              <form className={styles.profileForm} onSubmit={onSaveProfile}>
                <div className={styles.infoGrid}>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      {copy.overview.firstName}
                    </LabelText>
                    <Input
                      className={`${styles.profileInput} typo-body`}
                      value={profileDraft.firstName}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({ ...prev, firstName: event.target.value }))
                      }
                      autoComplete="given-name"
                    />
                  </label>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      {copy.overview.lastName}
                    </LabelText>
                    <Input
                      className={`${styles.profileInput} typo-body`}
                      value={profileDraft.lastName}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({ ...prev, lastName: event.target.value }))
                      }
                      autoComplete="family-name"
                    />
                  </label>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      {copy.overview.phone}
                    </LabelText>
                    <Input
                      className={`${styles.profileInput} typo-body`}
                      value={profileDraft.phone}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      autoComplete="tel"
                    />
                  </label>
                  <div className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      {copy.overview.email}
                    </LabelText>
                    <p className={`${styles.value} typo-body-lg`}>{email}</p>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <AccountPillButton
                    type="submit"
                    className={`typo-small-upper`}
                    disabled={profileSaving}
                  >
                    {profileSaving ? copy.overview.savingProfile : copy.overview.saveProfile}
                  </AccountPillButton>
                </div>
                {profileMessage ? (
                  <p
                    className={`${profileMessage.type === 'success' ? styles.successText : styles.errorText} typo-caption`}
                  >
                    {profileMessage.text}
                  </p>
                ) : null}
              </form>
            </div>
          </>
        ) : null}

        {section === 'aesthetic' ? (
          <>
            <SectionTitle as="h2" size="h2" className={styles.title}>
              Cartella Estetica, {firstName || copy.fallbackCustomer}
            </SectionTitle>
            <hr className={styles.sectionDivider} />
            <AestheticForm
              draft={aestheticDraft}
              setDraft={setAestheticDraft}
              saving={aestheticSaving}
              message={aestheticMessage}
              onSubmit={onSaveAestheticFolder}
            />
          </>
        ) : null}

        {section === 'orders' ? (
          <>
            {ordersByDateDesc.length === 0 ? (
              <SectionTitle as="h2" size="h2" className={styles.title}>
                {copy.orders.empty}
              </SectionTitle>
            ) : (
              <>
                <SectionTitle as="h2" size="h2" className={styles.title}>
                  Prodotti, {firstName || copy.fallbackCustomer}
                </SectionTitle>
                <hr className={styles.sectionDivider} />
                <div className={styles.accountSummarySection}>
                  <p className={`${styles.accountSummaryLabel} typo-caption-upper`}>
                    {nextProductDeliveryRow ? 'Prossima consegna' : 'Ultimo acquisto'}
                  </p>
                  <div
                    className={styles.accountSummaryCard}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setOrderDetails((nextProductDeliveryRow ?? latestPurchasedProductRow)!)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setOrderDetails((nextProductDeliveryRow ?? latestPurchasedProductRow)!)
                      }
                    }}
                  >
                    {(() => {
                      const order = nextProductDeliveryRow ?? latestPurchasedProductRow
                      if (!order) return null
                      return (
                        <>
                          <div className={productsStyles.orderPurchaseCell}>
                            <span className={productsStyles.orderThumb}>
                              {order.purchaseThumb ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={order.purchaseThumb} alt="" />
                              ) : (
                                <span className={productsStyles.orderThumbFallback} aria-hidden="true" />
                              )}
                            </span>
                            <div className={productsStyles.orderPurchaseMeta}>
                              <p className={`${styles.orderNumber} ${productsStyles.orderNumber} typo-body-lg`}>
                                {order.purchaseTitle}
                              </p>
                              <p className={`${styles.orderDate} ${productsStyles.orderDate} typo-caption`}>
                                {new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                }).format(new Date(order.createdAt))}
                              </p>
                              <p className={`${productsStyles.orderInlinePrice} typo-caption`}>
                                {formatMoney(order.total, order.currency)}
                              </p>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  <AccountPillButton
                    type="button"
                    className={`${styles.accountSummaryToggle} typo-caption-upper`}
                    onClick={() => setShowAllProductPurchases((prev) => !prev)}
                  >
                    {showAllProductPurchases ? 'Nascondi acquisti' : 'Tutti gli acquisti'}
                  </AccountPillButton>
                </div>
                {showAllProductPurchases ? (
                  <>
                    <div className={styles.filtersTriggerRow}>
                      <p className={`${styles.filtersTriggerLabel} typo-body-lg`}>Filtri:</p>
                      <button
                        type="button"
                    className={`${styles.filtersTriggerButton} typo-small-upper`}
                        onClick={() => setProductsFilterDrawerOpen(true)}
                        aria-label="Apri filtro prodotti"
                      >
                        <span>{productsSortLabel}</span>
                        <ChevronDownIcon width={16} height={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className={productsStyles.ordersListWrap}>
                      <AccountListHeader
                        variant="orders"
                        columns={['Acquisto', 'Dettagli']}
                      />
                      <div className={productsStyles.ordersList}>
                        {groupedProductRows.map((entry) => {
                          if (entry.kind === 'single') {
                            const order = entry.row
                            return (
                              <article
                                key={order.id}
                                className={productsStyles.ordersListRow}
                                onClick={() => setOrderDetails(order)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    setOrderDetails(order)
                                  }
                                }}
                              >
                                <div className={productsStyles.ordersListCell}>
                                  <span className={productsStyles.ordersListLabel}>Acquisto</span>
                                  <div className={productsStyles.orderPurchaseCell}>
                                    <span className={productsStyles.orderThumb}>
                                      {order.purchaseThumb ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={order.purchaseThumb} alt="" />
                                      ) : (
                                        <span
                                          className={productsStyles.orderThumbFallback}
                                          aria-hidden="true"
                                        />
                                      )}
                                    </span>
                                    <div className={productsStyles.orderPurchaseMeta}>
                                      <p className={`${styles.orderDate} ${productsStyles.orderDate} typo-caption`}>
                                        {new Intl.DateTimeFormat(
                                          locale === 'it' ? 'it-IT' : 'en-US',
                                          {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                          },
                                        ).format(new Date(order.createdAt))}
                                      </p>
                                      <p className={`${styles.orderNumber} ${productsStyles.orderNumber} typo-body-lg`}>
                                        {order.purchaseTitle}
                                      </p>
                                      <p className={`${productsStyles.orderInlinePrice} typo-caption`}>
                                        {formatMoney(order.total, order.currency)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className={`${productsStyles.ordersListCell} ${productsStyles.ordersListCellDetails}`}
                                >
                                  <span className={productsStyles.ordersListLabel}>Dettagli</span>
                                  <div className={productsStyles.actionsStack}>
                                    <AccountIconAction
                                      type="button"
                                      className="typo-caption-upper"
                                      compact
                                      aria-label="Apri dettagli ordine"
                                      title="Apri dettagli ordine"
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        setOrderDetails(order)
                                      }}
                                    >
                                      <EyeIcon width={18} height={18} aria-hidden="true" />
                                    </AccountIconAction>
                                  </div>
                                </div>
                              </article>
                            )
                          }

                          const isExpanded = Boolean(expandedOrderGroups[entry.key])
                          return (
                            <Fragment key={`order-group-${entry.key}`}>
                              <article
                                className={`${productsStyles.ordersListRow} ${productsStyles.packageGroupRow}`}
                                onClick={() =>
                                  setExpandedOrderGroups((prev) => ({
                                    ...prev,
                                    [entry.key]: !prev[entry.key],
                                  }))
                                }
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    setExpandedOrderGroups((prev) => ({
                                      ...prev,
                                      [entry.key]: !prev[entry.key],
                                    }))
                                  }
                                }}
                              >
                                <div className={productsStyles.ordersListCell}>
                                  <span className={productsStyles.ordersListLabel}>Acquisto</span>
                                  <div className={productsStyles.orderPurchaseCell}>
                                    <span className={productsStyles.orderThumb}>
                                      {entry.lead.purchaseThumb ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={entry.lead.purchaseThumb} alt="" />
                                      ) : (
                                        <span
                                          className={productsStyles.orderThumbFallback}
                                          aria-hidden="true"
                                        />
                                      )}
                                    </span>
                                    <div className={productsStyles.orderPurchaseMeta}>
                                      <p className={`${styles.orderDate} ${productsStyles.orderDate} typo-caption`}>
                                        {new Intl.DateTimeFormat(
                                          locale === 'it' ? 'it-IT' : 'en-US',
                                          {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                          },
                                        ).format(new Date(entry.lead.createdAt))}
                                      </p>
                                      <p className={`${styles.orderNumber} ${productsStyles.orderNumber} typo-body-lg`}>
                                        {entry.lead.orderNumber}
                                      </p>
                                      <p className={`${styles.orderMeta} ${productsStyles.orderMeta} typo-caption`}>
                                        {entry.rows.length} prodotti
                                      </p>
                                      <p className={`${productsStyles.orderInlinePrice} typo-caption`}>
                                        {formatMoney(entry.productsTotal, entry.lead.currency)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className={`${productsStyles.ordersListCell} ${productsStyles.ordersListCellDetails}`}
                                >
                                  <span className={productsStyles.ordersListLabel}>Dettagli</span>
                                  <div className={productsStyles.actionsStack}>
                                    <AccountIconAction
                                      type="button"
                                      className="typo-caption-upper"
                                      compact
                                      aria-label={isExpanded ? 'Collassa ordine' : 'Espandi ordine'}
                                      aria-expanded={isExpanded}
                                      title={isExpanded ? 'Collassa ordine' : 'Espandi ordine'}
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        setExpandedOrderGroups((prev) => ({
                                          ...prev,
                                          [entry.key]: !prev[entry.key],
                                        }))
                                      }}
                                    >
                                      {isExpanded ? '−' : '+'}
                                    </AccountIconAction>
                                  </div>
                                </div>
                              </article>
                              {isExpanded
                                ? entry.rows.map((order) => (
                                    <article
                                      key={order.id}
                                      className={`${productsStyles.ordersListRow} ${productsStyles.packageSessionRow}`}
                                      onClick={() => setOrderDetails(order)}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                          event.preventDefault()
                                          setOrderDetails(order)
                                        }
                                      }}
                                    >
                                      <div className={productsStyles.ordersListCell}>
                                        <span className={productsStyles.ordersListLabel}>Acquisto</span>
                                        <div className={productsStyles.orderPurchaseCell}>
                                          <span className={productsStyles.orderThumb}>
                                            {order.purchaseThumb ? (
                                              // eslint-disable-next-line @next/next/no-img-element
                                              <img src={order.purchaseThumb} alt="" />
                                            ) : (
                                              <span
                                                className={productsStyles.orderThumbFallback}
                                                aria-hidden="true"
                                              />
                                            )}
                                          </span>
                                          <div className={productsStyles.orderPurchaseMeta}>
                                            <p className={`${styles.orderDate} ${productsStyles.orderDate} typo-caption`}>
                                              {new Intl.DateTimeFormat(
                                                locale === 'it' ? 'it-IT' : 'en-US',
                                                {
                                                  day: '2-digit',
                                                  month: '2-digit',
                                                  year: 'numeric',
                                                },
                                              ).format(new Date(order.createdAt))}
                                            </p>
                                            <p className={`${styles.orderNumber} ${productsStyles.orderNumber} typo-body-lg`}>
                                              {order.purchaseTitle}
                                            </p>
                                            <p
                                              className={`${productsStyles.orderInlinePrice} typo-caption`}
                                            >
                                              {formatMoney(order.total, order.currency)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div
                                        className={`${productsStyles.ordersListCell} ${productsStyles.ordersListCellDetails}`}
                                      >
                                        <span className={productsStyles.ordersListLabel}>Dettagli</span>
                                        <div className={productsStyles.actionsStack}>
                                          <AccountIconAction
                                            type="button"
                                            className="typo-caption-upper"
                                            compact
                                            aria-label="Apri dettagli ordine"
                                            title="Apri dettagli ordine"
                                            onClick={(event) => {
                                              event.stopPropagation()
                                              setOrderDetails(order)
                                            }}
                                          >
                                            <EyeIcon width={18} height={18} aria-hidden="true" />
                                          </AccountIconAction>
                                        </div>
                                      </div>
                                    </article>
                                  ))
                                : null}
                            </Fragment>
                          )
                        })}
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            )}
          </>
        ) : null}

        {section === 'services' ? (
          <>
            <SectionTitle as="h2" size="h2" className={styles.title}>
              Servizi, {firstName || copy.fallbackCustomer}
            </SectionTitle>
            <hr className={styles.sectionDivider} />
            {serviceRowsState.length > 0 ? (
              <div className={styles.accountSummarySection}>
                <p className={`${styles.accountSummaryLabel} typo-caption-upper`}>
                  {nextServiceAppointmentRow
                    ? 'Prossimo appuntamento'
                    : 'Ultimo servizio acquistato'}
                </p>
                <div
                  className={styles.accountSummaryCard}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const row = (nextServiceAppointmentRow ?? latestServicePurchasedRow)!
                    openScheduleEditModal(row)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      const row = (nextServiceAppointmentRow ?? latestServicePurchasedRow)!
                      openScheduleEditModal(row)
                    }
                  }}
                >
                  {(() => {
                    const row = nextServiceAppointmentRow ?? latestServicePurchasedRow
                    if (!row) return null
                    return (
                      <>
                        <div className={servicesStyles.accountSummaryServiceMeta}>
                          <p className={`${styles.orderNumber} typo-body-lg`}>{row.serviceTitle}</p>
                          <p className={`${styles.orderMeta} typo-caption`}>
                            {row.itemKind === 'package' ? row.sessionLabel : 'Servizio singolo'}
                          </p>
                        </div>
                        <div className={servicesStyles.accountSummaryServicePillWrap}>
                          {renderServiceDataPill(row, false)}
                        </div>
                      </>
                    )
                  })()}
                </div>
                <AccountPillButton
                  type="button"
                  className={`${styles.accountSummaryToggle} typo-caption-upper`}
                  onClick={() => setShowAllServicesBookings((prev) => !prev)}
                >
                  {showAllServicesBookings
                    ? 'Nascondi servizi prenotati'
                    : 'Tutti i servizi prenotati'}
                </AccountPillButton>
              </div>
            ) : null}

            {showAllServicesBookings ? (
              <div className={styles.filtersTriggerRow}>
                <p className={`${styles.filtersTriggerLabel} typo-body-lg`}>Filtri:</p>
                <button
                  type="button"
                  className={`${styles.filtersTriggerButton} typo-small-upper`}
                  onClick={() => setServicesFilterDrawerOpen(true)}
                  aria-label="Apri filtro servizi"
                >
                  <span>{servicesCurrentFilterLabel}</span>
                  <ChevronDownIcon width={16} height={16} aria-hidden="true" />
                </button>
              </div>
            ) : null}

            {showAllServicesBookings && serviceRowsFiltered.length === 0 ? (
              <div className={styles.block}>
                <p className={`${styles.value} typo-body-lg`}>
                  Nessuna prenotazione servizio in questo filtro.
                </p>
              </div>
            ) : showAllServicesBookings ? (
              <>
                {sessionMessage ? (
                  <p
                    className={`${sessionMessage.type === 'success' ? styles.successText : styles.errorText} typo-caption`}
                  >
                    {sessionMessage.text}
                  </p>
                ) : null}
                <div className={servicesStyles.servicesList}>
                  <AccountListHeader
                    variant="services"
                    columns={['Servizio', 'Data']}
                  />
                  {groupedServiceTableRows.map((entry) => {
                    if (entry.kind === 'single') {
                      const row = entry.row
                      return (
                        <div
                          key={row.id}
                          className={servicesStyles.servicesListRow}
                          role="button"
                          tabIndex={0}
                          onClick={() => openScheduleEditModal(row)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              openScheduleEditModal(row)
                            }
                          }}
                        >
                          <div className={servicesStyles.servicesListCell}>
                            <span className={servicesStyles.servicesListLabel}>Servizio</span>
                            <div className={styles.serviceCellTitle}>{row.serviceTitle}</div>
                          </div>
                          <div className={servicesStyles.servicesListCell}>
                            <span className={servicesStyles.servicesListLabel}>Data</span>
                            {renderServiceDataPill(row, false)}
                          </div>
                        </div>
                      )
                    }

                    const isExpanded = Boolean(expandedPackageGroups[entry.key])
                    return (
                      <Fragment key={`frag-${entry.key}`}>
                        <div
                          className={`${servicesStyles.servicesListRow} ${servicesStyles.packageGroupRow}`}
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            setExpandedPackageGroups((prev) => ({
                              ...prev,
                              [entry.key]: !prev[entry.key],
                            }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setExpandedPackageGroups((prev) => ({
                                ...prev,
                                [entry.key]: !prev[entry.key],
                              }))
                            }
                          }}
                        >
                          <div className={servicesStyles.servicesListCell}>
                            <span className={servicesStyles.servicesListLabel}>Servizio</span>
                            <div className={styles.serviceCellTitle}>{entry.lead.serviceTitle}</div>
                          </div>
                          <div className={servicesStyles.servicesListCell}>
                            <span className={servicesStyles.servicesListLabel}>Data</span>
                            <span
                              className={`${servicesStyles.inlineDataPill} ${servicesStyles.packageTogglePill} typo-small-upper`}
                              aria-label={isExpanded ? 'Collassa pacchetto' : 'Espandi pacchetto'}
                              aria-expanded={isExpanded}
                              title={isExpanded ? 'Collassa pacchetto' : 'Espandi pacchetto'}
                            >
                              <span
                                className={`${servicesStyles.inlineStatusIcon} ${servicesStyles.statusIconEmpty}`}
                              >
                                <MinusIcon width={18} height={18} aria-hidden="true" />
                              </span>
                              <span className={servicesStyles.inlineDataDivider} aria-hidden="true" />
                              <span className={servicesStyles.inlineDataText}>Pacchetto</span>
                              <span className={servicesStyles.inlineDataDivider} aria-hidden="true" />
                              <span className={servicesStyles.inlinePillIconButton} aria-hidden="true">
                                {isExpanded ? '−' : '+'}
                              </span>
                            </span>
                          </div>
                        </div>
                        {isExpanded
                          ? [
                              <div
                                key={`${entry.key}-order-cta`}
                                className={`${servicesStyles.servicesListRow} ${servicesStyles.packageOrderCtaRow}`}
                              >
                                <div className={servicesStyles.servicesListCell}>
                                  <span className={servicesStyles.servicesListLabel}>Servizio</span>
                                  <AccountPillButton
                                    type="button"
                                    className={`${servicesStyles.packageOrderCta} typo-small-upper`}
                                    onClick={() => {
                                      setServiceDetailsIsPackageChild(false)
                                      setServiceDetailsRow(entry.lead)
                                    }}
                                  >
                                    Dettaglio ordine pacchetto
                                  </AccountPillButton>
                                </div>
                              </div>,
                              ...entry.rows.map((row) => (
                                <div
                                  key={row.id}
                                  className={`${servicesStyles.servicesListRow} ${servicesStyles.packageSessionRow}`}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => openScheduleEditModal(row)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault()
                                      openScheduleEditModal(row)
                                    }
                                  }}
                                >
                                  <div className={servicesStyles.servicesListCell}>
                                    <span className={servicesStyles.servicesListLabel}>Servizio</span>
                                    <div className={servicesStyles.packageSessionCell}>
                                      Seduta {row.sessionIndex}/{row.sessionsTotal}
                                    </div>
                                  </div>
                                  <div className={servicesStyles.servicesListCell}>
                                    <span className={servicesStyles.servicesListLabel}>Data</span>
                                    {renderServiceDataPill(row, false)}
                                  </div>
                                </div>
                              )),
                            ]
                          : null}
                      </Fragment>
                    )
                  })}
                </div>
              </>
            ) : null}
          </>
        ) : null}

        <MobileFilterDrawer
          open={productsFilterDrawerOpen}
          onClose={() => setProductsFilterDrawerOpen(false)}
          title="Sort"
          groups={[
            {
              id: 'products-sort',
              value: productsSort,
              options: productSortOptions,
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
              options: servicesPrimaryOptions,
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
                    options: servicesSubOptions,
                    onChange: (value: string) => setServicesSubFilter(value as ServicesSubFilter),
                  },
                ]
              : []),
          ]}
        />

        {section === 'addresses' ? (
          <>
            <SectionTitle as="h2" size="h2" className={styles.title}>
              {copy.addresses.title}, {firstName || copy.fallbackCustomer}
            </SectionTitle>
            <hr className={styles.sectionDivider} />
            {addressesView === 'default' ? (
              <div className={styles.block}>
                <div className={`${styles.rowBetween} ${styles.addressHeaderRow}`}>
                  <div>
                    <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                      {copy.addresses.defaultAddress}
                    </SectionTitle>
                    {defaultAddress ? (
                      <div className={`${styles.addressPreview} typo-body-lg`}>
                        {formatAddressLines(defaultAddress).map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      <p className={`${styles.value} typo-body-lg`}>{copy.addresses.noAddress}</p>
                    )}
                  </div>
                </div>
                <div className={styles.addressSectionActions}>
                  {defaultAddress ? (
                    <>
                      <AccountPillButton
                        type="button"
                        className={`${styles.addressPrimaryButton} typo-small-upper`}
                        onClick={() => {
                          setAddressesView('book')
                          setEditingAddressId(null)
                          setShowAddressForm(false)
                          setAddressMessage(null)
                        }}
                      >
                        Vedi/Modifica rubrica indirizzi
                      </AccountPillButton>
                    </>
                  ) : (
                    <AccountPillButton
                      type="button"
                      className={`${styles.addressPrimaryButton} typo-small-upper`}
                      onClick={() => {
                        setAddressesView('default')
                        setEditingAddressId(null)
                        setAddressMessage(null)
                        setAddressLookupQuery('')
                        setShowAddressForm((value) => !value)
                      }}
                    >
                      {copy.addresses.addNewAddress}
                    </AccountPillButton>
                  )}
                </div>
              </div>
            ) : null}

            {addressesView === 'book' ? (
              <div className={`${styles.block} ${styles.addressBookBlock}`}>
                <div className={styles.addressBookHeader}>
                  <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                    Rubrica indirizzi
                  </SectionTitle>
                  <button
                    type="button"
                    className={`${styles.addressBackLink} typo-caption-upper`}
                    onClick={() => setAddressesView('default')}
                  >
                    Chiudi rubrica
                  </button>
                </div>

                <div className={styles.addressBookList}>
                  {addresses.length === 0 ? (
                    <p className={`${styles.value} typo-body-lg`}>{copy.addresses.noAddress}</p>
                  ) : (
                    addresses.map((address, index) => (
                      <div key={address.id} className={styles.addressBookCard}>
                        <div>
                          <p className={`${styles.serviceCellTitle} typo-caption-upper`}>
                            {index === 0 ? copy.addresses.defaultAddress : 'Indirizzo'}
                          </p>
                          <div className={`${styles.addressPreview} typo-body-lg`}>
                            {formatAddressLines(address).map((line) => (
                              <p key={`${address.id}-${line}`}>{line}</p>
                            ))}
                          </div>
                        </div>

                        <div className={styles.addressBookActions}>
                          {index !== 0 ? (
                            <AccountPillButton
                              type="button"
                              className={`${styles.addressPrimaryButton} typo-small-upper`}
                              onClick={() => onSetDefaultAddress(address.id)}
                            >
                              Imposta predefinito
                            </AccountPillButton>
                          ) : null}
                          <div className={styles.addressBookActionRow}>
                            <AccountPillButton
                              type="button"
                              className={`${styles.addressPrimaryButton} typo-small-upper`}
                              onClick={() => onEditAddress(address)}
                            >
                              {copy.addresses.edit}
                            </AccountPillButton>
                            <button
                              type="button"
                              className={`${styles.addressDeleteLink} typo-caption-upper`}
                              onClick={() => onDeleteAddressById(address.id)}
                            >
                              {copy.addresses.delete}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <AccountPillButton
                  type="button"
                  className={`${styles.addressPrimaryButton} typo-small-upper`}
                  onClick={() => {
                    setAddressesView('book')
                    setEditingAddressId(null)
                    setShowAddressForm((value) => !value)
                    setAddressMessage(null)
                    setAddressLookupQuery('')
                  }}
                >
                  {copy.addresses.addNewAddress}
                </AccountPillButton>
              </div>
            ) : null}

            {showAddressForm ? (
              <AddressForm
                editingAddressId={editingAddressId}
                message={addressMessage}
                copy={copy.addresses}
                draft={addressDraft}
                lookupQuery={addressLookupQuery}
                cityLoading={cityLoading}
                showCitySuggestions={showCitySuggestions}
                citySuggestions={citySuggestions}
                onLookupQueryChange={setAddressLookupQuery}
                onLookupFocus={() => setShowCitySuggestions(true)}
                onLookupBlur={() => {
                  window.setTimeout(() => setShowCitySuggestions(false), 120)
                }}
                onSuggestionSelect={applyCitySuggestion}
                setDraft={setAddressDraft}
                onSubmit={onSaveAddress}
                onCancel={() => {
                  setEditingAddressId(null)
                  setAddressMessage(null)
                  setAddressLookupQuery('')
                  setShowAddressForm(false)
                }}
              />
            ) : null}
          </>
        ) : null}
      </section>
      {renderAccountFooterActions(styles.mobileFooterActions)}
      {serviceDetailsRow ? (
        <AccountModal
          open={Boolean(serviceDetailsRow)}
          titleId="service-details-title"
          title="Dettagli prenotazione"
          onClose={() => {
            setServiceDetailsRow(null)
            setServiceDetailsIsPackageChild(false)
          }}
        >
          <div className={accountModalClassNames.grid}>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Servizio</p>
              <p className={`${styles.value} typo-body-lg`}>{serviceDetailsRow.serviceTitle}</p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ordine</p>
              <p className={`${styles.value} typo-body-lg`}>{serviceDetailsRow.orderNumber}</p>
            </div>
            {!serviceDetailsIsPackageChild ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data ordine</p>
                <p className={`${styles.value} typo-body-lg`}>
                  {new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(serviceDetailsRow.orderCreatedAt))}
                </p>
              </div>
            ) : null}
            {!serviceDetailsIsPackageChild ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Pagamento</p>
                <p className={`${styles.value} typo-body-lg`}>
                  {serviceDetailsRow.orderStatus} · {serviceDetailsRow.paymentStatus}
                </p>
              </div>
            ) : null}
            {!serviceDetailsIsPackageChild ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Prezzo</p>
                <p className={`${styles.value} typo-body-lg`}>
                  {formatMoney(
                    serviceDetailsRow.itemKind === 'package'
                      ? serviceDetailsRow.rowPrice * Math.max(serviceDetailsRow.sessionsTotal || 1, 1)
                      : serviceDetailsRow.rowPrice,
                    serviceDetailsRow.currency,
                  )}
                </p>
              </div>
            ) : null}
          </div>
        </AccountModal>
      ) : null}
      {orderDetails ? (
        <AccountModal
          open={Boolean(orderDetails)}
          titleId="order-details-title"
          title="Dettagli ordine"
          onClose={() => setOrderDetails(null)}
        >
          <div className={accountModalClassNames.grid}>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ordine</p>
              <p className={`${styles.value} typo-body-lg`}>{orderDetails.orderNumber}</p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Prodotto</p>
              <div className={productsStyles.orderPurchaseCell}>
                <span className={productsStyles.orderThumb}>
                  {orderDetails.purchaseThumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={orderDetails.purchaseThumb} alt="" />
                  ) : (
                    <span className={productsStyles.orderThumbFallback} aria-hidden="true" />
                  )}
                </span>
                <div className={productsStyles.orderPurchaseMeta}>
                  <p className={`${styles.value} typo-body-lg`}>{orderDetails.purchaseTitle}</p>
                  {orderDetails.otherItemsCount > 0 ? (
                    <p className={`${styles.orderMeta} typo-caption`}>
                      + {orderDetails.otherItemsCount} altri prodotti nello stesso ordine
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data acquisto</p>
              <p className={`${styles.value} typo-body-lg`}>
                {new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(orderDetails.createdAt))}
              </p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Pagamento</p>
              <p className={`${styles.value} typo-body-lg`}>
                {orderDetails.status} · {orderDetails.paymentStatus}
              </p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Fulfillment</p>
              <p className={`${styles.value} typo-body-lg`}>
                {orderDetails.productFulfillmentMode === 'pickup'
                  ? 'Ritiro in negozio'
                  : 'Spedizione'}
              </p>
            </div>
            {orderDetails.productFulfillmentMode === 'shipping' ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Stato consegna</p>
                <p className={`${styles.value} typo-body-lg`}>
                  {orderDetails.deliveryStatus || 'In preparazione'}
                </p>
              </div>
            ) : null}
            {orderDetails.productFulfillmentMode === 'shipping' ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Tracking</p>
                <p className={`${styles.value} typo-body-lg`}>
                  {orderDetails.trackingNumber ? (
                    orderDetails.trackingUrl ? (
                      <a
                        href={orderDetails.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.inlineLink}
                      >
                        {orderDetails.trackingNumber}
                      </a>
                    ) : (
                      orderDetails.trackingNumber
                    )
                  ) : (
                    'Non disponibile'
                  )}
                </p>
              </div>
            ) : null}
            {orderDetails.productFulfillmentMode === 'shipping' && orderDetails.deliveryUpdatedAt ? (
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>
                  Ultimo aggiornamento spedizione
                </p>
                <p className={`${styles.value} typo-body-lg`}>
                  {new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(orderDetails.deliveryUpdatedAt))}
                </p>
              </div>
            ) : null}
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Quantità</p>
              <p className={`${styles.value} typo-body-lg`}>{orderDetails.quantity}</p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Prezzo unitario</p>
              <p className={`${styles.value} typo-body-lg`}>
                {formatMoney(orderDetails.unitPrice, orderDetails.currency)}
              </p>
            </div>
            <div>
              <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Totale riga</p>
              <p className={`${styles.value} typo-body-lg`}>
                {formatMoney(orderDetails.total, orderDetails.currency)}
              </p>
            </div>
          </div>
        </AccountModal>
      ) : null}
      {scheduleEditRow ? (
        <AccountModal
          open={Boolean(scheduleEditRow)}
          titleId="schedule-edit-title"
          title="Dettagli appuntamento"
          onClose={() => setScheduleEditRow(null)}
        >
          {(() => {
            const isPackageSession = scheduleEditRow.itemKind === 'package'
            return (
              <>
                <p className={`${styles.value} typo-body-lg`}>
                  {scheduleEditRow.serviceTitle}
                  {scheduleEditRow.itemKind === 'package' ? ` · ${scheduleEditRow.sessionLabel}` : ''}
                </p>
                <div className={accountModalClassNames.grid}>
                  {!isPackageSession ? (
                    <>
                      <div>
                        <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ordine</p>
                        <p className={`${styles.value} typo-body-lg`}>
                          {scheduleEditRow.orderNumber}
                        </p>
                      </div>
                      <div>
                        <p className={`${styles.serviceCellTitle} typo-caption-upper`}>
                          Data ordine
                        </p>
                        <p className={`${styles.value} typo-body-lg`}>
                          {new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(scheduleEditRow.orderCreatedAt))}
                        </p>
                      </div>
                      <div>
                        <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Status</p>
                        <p className={`${styles.value} typo-body-lg`}>
                          {formatServiceStatus(scheduleEditRow)}
                        </p>
                      </div>
                      <div>
                        <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Prezzo</p>
                        <p className={`${styles.value} typo-body-lg`}>
                          {formatMoney(scheduleEditRow.rowPrice, scheduleEditRow.currency)}
                        </p>
                      </div>
                    </>
                  ) : null}
                  {isPackageSession ? (
                    <div>
                      <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Seduta</p>
                      <p className={`${styles.value} typo-body-lg`}>{scheduleEditRow.sessionLabel}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data attuale</p>
                    <p className={`${styles.value} typo-body-lg`}>
                      {formatServiceSchedule(scheduleEditRow)}
                    </p>
                  </div>
                  <div>
                    <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data</p>
                    <Input
                      size="compact"
                      className={accountModalClassNames.input}
                      type="date"
                      value={scheduleEditDraft.date}
                      onChange={(e) =>
                        setScheduleEditDraft((prev) => ({ ...prev, date: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ora</p>
                    <Input
                      size="compact"
                      className={accountModalClassNames.input}
                      type="time"
                      value={scheduleEditDraft.time}
                      onChange={(e) =>
                        setScheduleEditDraft((prev) => ({ ...prev, time: e.target.value }))
                      }
                    />
                  </div>
                </div>
                {scheduleEditRow && !canEditSchedule(scheduleEditRow) ? (
                  <p className={`${styles.errorText} typo-caption`}>
                    Questa data è già gestita dal team e non è modificabile dal tuo account.
                  </p>
                ) : null}
                <div className={accountModalClassNames.actions}>
                  <AccountIconAction
                    type="button"
                    className="typo-caption-upper"
                    disabled={
                      sessionSavingId === scheduleEditRow.id || !canEditSchedule(scheduleEditRow)
                    }
                    onClick={() => void onSaveScheduleEdit()}
                  >
                    {sessionSavingId === scheduleEditRow.id ? 'Salvataggio…' : 'Salva data'}
                  </AccountIconAction>
                  <AccountIconAction
                    type="button"
                    className="typo-caption-upper"
                    disabled={
                      sessionSavingId === scheduleEditRow.id || !canEditSchedule(scheduleEditRow)
                    }
                    onClick={() => void onClearScheduleEdit()}
                  >
                    Annulla data
                  </AccountIconAction>
                </div>
              </>
            )
          })()}
        </AccountModal>
      ) : null}
    </div>
  )
}
