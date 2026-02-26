'use client'

import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  ArrowPathIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  MinusIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'

import { getAccountDictionary } from '@/lib/account-i18n'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { LabelText } from '@/components/ui/label'
import { Input, Select, Textarea } from '@/components/ui/input'

import { AccountLogoutButton } from './AccountLogoutButton'
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
type ServicesSubFilter = 'all' | 'requested_date' | 'awaiting_confirmation' | 'date_to_request' | 'confirmed_date'
type AddressesView = 'default' | 'book'

type PhotonAddressSuggestion = {
  label: string
  streetAddress?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
}

type AestheticFolderDraft = {
  lastAssessmentDate: string
  skinType: string
  skinSensitivity: string
  fitzpatrick: string
  hydrationLevel: string
  sebumLevel: string
  elasticityLevel: string
  acneTendency: boolean
  rosaceaTendency: boolean
  hyperpigmentationTendency: boolean
  allergies: string
  contraindications: string
  medications: string
  pregnancyOrBreastfeeding: string
  homeCareRoutine: string
  treatmentGoals: string
  estheticianNotes: string
  serviceRecommendations: string
  productRecommendations: string
}

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
  const [sessionMessage, setSessionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [serviceRowsState, setServiceRowsState] = useState<ServiceBookingRow[]>(initialServiceRows)
  const [expandedPackageGroups, setExpandedPackageGroups] = useState<Record<string, boolean>>({})
  const [expandedOrderGroups, setExpandedOrderGroups] = useState<Record<string, boolean>>({})
  const [showAllServicesBookings, setShowAllServicesBookings] = useState(false)
  const [showAllProductPurchases, setShowAllProductPurchases] = useState(false)
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
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [addressMessage, setAddressMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [addressDraft, setAddressDraft] = useState({
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
  const [aestheticMessage, setAestheticMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
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
      apartment:
        (address.apartment ??
          (address.address.includes(',') ? address.address.split(',').slice(1).join(',') : '')).trim(),
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

  const formatAddressLines = (address: AddressItem) => [
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
          if (
            value.includes('monza') ||
            value.includes('brianza')
          ) {
            return 'Monza and Brianza'
          }
          if (value.includes('milano')) {
            return 'Milano'
          }
          return undefined
        }

        const parseNominatim = (data: Array<{
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
        }>): PhotonAddressSuggestion[] => {
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
              [streetAddress, city || undefined, province, postalCode, country]
                .filter(Boolean)
                .join(', ') || item.display_name || ''
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
            arr.findIndex((item) => item.label.toLowerCase() === value.label.toLowerCase()) === index,
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

  const applyCitySuggestion = (suggestion: PhotonAddressSuggestion) => {
    setAddressDraft((prev) => {
      const nextProvince =
        suggestion.province &&
        ['Milano', 'Monza and Brianza'].includes(suggestion.province)
          ? suggestion.province
          : prev.province

      return {
        ...prev,
        streetAddress: suggestion.streetAddress || prev.streetAddress,
        city: suggestion.city || prev.city,
        postalCode: suggestion.postalCode || prev.postalCode,
        province: nextProvince,
        country:
          suggestion.country?.toLowerCase() === 'italy' || suggestion.country?.toLowerCase() === 'italia'
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

  const sortedOrders = useMemo(
    () =>
      [...initialOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [initialOrders],
  )

  const groupedProductRows = useMemo(() => {
    const output: Array<
      | { kind: 'single'; row: OrderItem }
      | { kind: 'order-group'; key: string; lead: OrderItem; rows: OrderItem[]; productsTotal: number }
    > = []

    const byOrder = new Map<string, OrderItem[]>()
    for (const row of sortedOrders) {
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
  }, [sortedOrders])

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
    if (row.appointmentStatus === 'confirmed' || row.appointmentStatus === 'confirmed_by_customer') {
      return formatDateTime(row.proposedDate ?? row.requestedDate, row.proposedTime ?? row.requestedTime)
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
    const candidates = sortedOrders
      .map((row) => ({ row, ts: getOrderFutureDeliveryTs(row) }))
      .filter((entry): entry is { row: OrderItem; ts: number } => entry.ts !== null && entry.ts > nowTs)
      .sort((a, b) => a.ts - b.ts)
    return candidates[0]?.row ?? null
  }, [sortedOrders, nowTs])
  const latestPurchasedProductRow = sortedOrders[0] ?? null

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
    if (['confirmed', 'confirmed_by_customer'].includes(row.appointmentStatus)) return 'Data confermata'
    if (row.appointmentMode === 'contact_later' || row.appointmentMode === 'none') return 'Data da richiedere'
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

  const nextServiceAppointmentRow = useMemo(() => {
    const candidates = serviceRowsState
      .map((row) => ({ row, ts: getConfirmedSessionTs(row) }))
      .filter((entry): entry is { row: ServiceBookingRow; ts: number } => entry.ts !== null && entry.ts > nowTs)
      .sort((a, b) => a.ts - b.ts)
    return candidates[0]?.row ?? null
  }, [serviceRowsState, nowTs])

  const latestServicePurchasedRow = useMemo(() => {
    const rows = [...serviceRowsState].sort(
      (a, b) => new Date(b.orderCreatedAt).getTime() - new Date(a.orderCreatedAt).getTime(),
    )
    return rows[0] ?? null
  }, [serviceRowsState])

  const renderServiceDataPill = (row: ServiceBookingRow) => (
    <button
      type="button"
      className={`${styles.inlineDataPill} ${styles.inlineDataPillButton} typo-caption-upper`}
      aria-label="Apri modifica data"
      title="Apri modifica data"
      onClick={() => openScheduleEditModal(row)}
    >
      {(() => {
        const icon = getScheduleStatusIcon(row)
        const StatusIcon = icon.icon
        const scheduleText = formatServiceSchedule(row)
        const [datePart, timePart = ''] = scheduleText.split(' · ')
        return (
          <>
            <span
              className={`${styles.inlineStatusIcon} ${icon.toneClass}`}
              aria-label={icon.label}
              title={icon.label}
            >
              <StatusIcon width={18} height={18} aria-hidden="true" />
            </span>
            <span className={styles.inlineDataDivider} aria-hidden="true" />
            <span className={styles.inlineDataText}>
              <span>{datePart}</span>
              {timePart ? (
                <>
                  <span className={styles.inlineDataDot} aria-hidden="true">·</span>
                  <span>{timePart}</span>
                </>
              ) : null}
            </span>
            <span className={styles.inlineDataDivider} aria-hidden="true" />
            <span className={styles.inlinePillIconButton} aria-hidden="true">
              <PencilSquareIcon width={16} height={16} aria-hidden="true" />
            </span>
          </>
        )
      })()}
    </button>
  )

  const canRequestDate = (row: ServiceBookingRow) =>
    row.appointmentMode !== 'requested_slot' &&
    row.appointmentStatus !== 'confirmed' &&
    row.appointmentStatus !== 'confirmed_by_customer' &&
    !row.requestedDate &&
    !row.proposedDate

  const canEditSchedule = (row: ServiceBookingRow) =>
    row.appointmentStatus !== 'confirmed' &&
    row.appointmentStatus !== 'confirmed_by_customer' &&
    row.appointmentStatus !== 'alternative_proposed' &&
    !row.proposedDate

  const getScheduleStatusIcon = (row: ServiceBookingRow) => {
    if (row.appointmentStatus === 'confirmed' || row.appointmentStatus === 'confirmed_by_customer') {
      return { icon: CheckIcon, toneClass: styles.statusIconConfirmed, label: 'Confermato' }
    }
    if (row.appointmentStatus === 'alternative_proposed') {
      return { icon: ArrowPathIcon, toneClass: styles.statusIconProposed, label: 'Alternativa proposta' }
    }
    if (row.appointmentMode === 'requested_slot' || row.appointmentStatus === 'pending') {
      return { icon: ClockIcon, toneClass: styles.statusIconPending, label: 'Pending' }
    }
    return { icon: MinusIcon, toneClass: styles.statusIconEmpty, label: 'Da definire' }
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
    patch: Partial<Pick<ServiceBookingRow, 'appointmentMode' | 'appointmentStatus' | 'requestedDate' | 'requestedTime' | 'proposedDate' | 'proposedTime'>>,
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
        setSessionMessage({ type: 'error', text: data.error || 'Impossibile salvare la data richiesta.' })
        return false
      }
      return true
    } catch {
      setSessionMessage({ type: 'error', text: 'Errore di rete durante il salvataggio della data.' })
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
      setAddressMessage({ type: 'error', text: error instanceof Error ? error.message : 'Errore salvataggio indirizzi.' }),
    )
  }

  const onDeleteAddressById = (id: string) => {
    const next = addresses.filter((address) => address.id !== id)
    setAddresses(next)
    setAddressMessage(null)
    if (editingAddressId === id) setEditingAddressId(null)
    void persistAddresses(next).catch((error) =>
      setAddressMessage({ type: 'error', text: error instanceof Error ? error.message : 'Errore salvataggio indirizzi.' }),
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
      setAddressMessage({ type: 'error', text: error instanceof Error ? error.message : 'Errore salvataggio indirizzi.' }),
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
          address.firstName ?? (address.fullName.split(' ').slice(0, -1).join(' ') || prev.firstName),
        lastName:
          address.lastName ?? (address.fullName.split(' ').slice(-1).join(' ') || prev.lastName),
        company: address.company ?? '',
        streetAddress:
          address.streetAddress ?? (address.address.split(',')[0]?.trim() || address.address),
        apartment:
          address.apartment ??
          (address.address.includes(',') ? address.address.split(',').slice(1).join(',').trim() : ''),
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
    } else if (!nextAddressesBase.some((address) => address.id !== nextAddress.id) && nextAddressesBase.length === 1) {
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
    setAestheticSaving(true)
    setAestheticMessage(null)

    // Frontend-only placeholder: backend persistence will be added in the next step.
    window.setTimeout(() => {
      setAestheticSaving(false)
      setAestheticMessage({ type: 'success', text: 'Cartella estetica salvata localmente (anteprima frontend).' })
    }, 250)
  }

  const renderAccountFooterActions = (className?: string) => (
    <div className={className}>
      <p className={`${styles.help} typo-body-lg`}>
        {copy.help}{' '}
        <Link href={`/${locale}/contact`}>
          {copy.contactUs}
        </Link>
      </p>

      <div className={styles.logoutWrap}>
        <AccountLogoutButton locale={locale} className="typo-small-upper" label="LOG OUT" />
      </div>
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
          <button className={`${styles.menuButton} typo-body-lg`} type="button" onClick={() => setSection('overview')}>
            <span className="typo-body-lg">Account</span>
            <span className={`${styles.menuDot} ${section === 'overview' ? styles.menuDotActive : ''}`} />
          </button>
          <button className={`${styles.menuButton} typo-body-lg`} type="button" onClick={() => setSection('addresses')}>
            <span className="typo-body-lg">{copy.nav.addresses}</span>
            <span className={`${styles.menuDot} ${section === 'addresses' ? styles.menuDotActive : ''}`} />
          </button>
          <button
            className={`${styles.menuButton} ${styles.menuButtonFull} typo-body-lg`}
            type="button"
            onClick={() => setSection('aesthetic')}
          >
            <span className="typo-body-lg">Cartella Estetica</span>
            <span className={`${styles.menuDot} ${section === 'aesthetic' ? styles.menuDotActive : ''}`} />
          </button>
          <div className={styles.menuDivider} aria-hidden="true">
            <span className={`${styles.menuDividerLabel} typo-caption-upper`}>Ordini</span>
          </div>
          <button className={`${styles.menuButton} typo-body-lg`} type="button" onClick={() => setSection('services')}>
            <span className="typo-body-lg">Servizi</span>
            <span className={`${styles.menuDot} ${section === 'services' ? styles.menuDotActive : ''}`} />
          </button>
          <button className={`${styles.menuButton} typo-body-lg`} type="button" onClick={() => setSection('orders')}>
            <span className="typo-body-lg">Prodotti</span>
            <span className={`${styles.menuDot} ${section === 'orders' ? styles.menuDotActive : ''}`} />
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
                  <button type="submit" className={`${styles.pillButton} typo-small-upper`} disabled={profileSaving}>
                    {profileSaving ? copy.overview.savingProfile : copy.overview.saveProfile}
                  </button>
                </div>
                {profileMessage ? (
                  <p className={`${profileMessage.type === 'success' ? styles.successText : styles.errorText} typo-caption`}>
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

            <div className={`${styles.block} ${styles.aestheticIntroBlock}`}>
              <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                Scheda cliente salone
              </SectionTitle>
              <p className={`${styles.value} typo-body-lg`}>
                Anteprima frontend della cartella estetica: dati utili alle estetiste per trattamento in salone,
                follow-up e raccomandazioni di servizi/prodotti.
              </p>
            </div>

            <form className={styles.aestheticForm} onSubmit={onSaveAestheticFolder}>
              <div className={`${styles.block} ${styles.aestheticBlock}`}>
                <div className={styles.rowBetween}>
                  <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                    Profilo Cutaneo
                  </SectionTitle>
                  <label className={styles.aestheticInlineField}>
                    <span className={`${styles.aestheticInlineLabel} typo-caption-upper`}>Ultima valutazione</span>
                    <Input
                      type="date"
                      className={`${styles.input} typo-body`}
                      value={aestheticDraft.lastAssessmentDate}
                      onChange={(event) =>
                        setAestheticDraft((prev) => ({ ...prev, lastAssessmentDate: event.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className={styles.aestheticGrid}>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      Tipo di pelle
                    </LabelText>
                    <Select
                      className={`${styles.select} typo-body`}
                      value={aestheticDraft.skinType}
                      onChange={(event) => setAestheticDraft((prev) => ({ ...prev, skinType: event.target.value }))}
                    >
                      <option value="">Seleziona</option>
                      <option value="normal">Normale</option>
                      <option value="dry">Secca</option>
                      <option value="oily">Grassa</option>
                      <option value="combination">Mista</option>
                      <option value="sensitive">Sensibile</option>
                    </Select>
                  </label>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      Sensibilità
                    </LabelText>
                    <Select
                      className={`${styles.select} typo-body`}
                      value={aestheticDraft.skinSensitivity}
                      onChange={(event) =>
                        setAestheticDraft((prev) => ({ ...prev, skinSensitivity: event.target.value }))
                      }
                    >
                      <option value="">Seleziona</option>
                      <option value="low">Bassa</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </Select>
                  </label>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      Fototipo (Fitzpatrick)
                    </LabelText>
                    <Select
                      className={`${styles.select} typo-body`}
                      value={aestheticDraft.fitzpatrick}
                      onChange={(event) =>
                        setAestheticDraft((prev) => ({ ...prev, fitzpatrick: event.target.value }))
                      }
                    >
                      <option value="">Seleziona</option>
                      {['I', 'II', 'III', 'IV', 'V', 'VI'].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </Select>
                  </label>
                </div>

                <div className={styles.aestheticMetricsGrid}>
                  {[
                    ['hydrationLevel', 'Idratazione %'],
                    ['sebumLevel', 'Sebum %'],
                    ['elasticityLevel', 'Elasticità %'],
                  ].map(([field, label]) => (
                    <label key={field} className={styles.profileField}>
                      <LabelText className={styles.label} variant="field">
                        {label}
                      </LabelText>
                      <Input
                        className={`${styles.input} typo-body`}
                        type="number"
                        min="0"
                        max="100"
                        value={aestheticDraft[field as keyof AestheticFolderDraft] as string}
                        onChange={(event) =>
                          setAestheticDraft((prev) => ({ ...prev, [field]: event.target.value }))
                        }
                      />
                    </label>
                  ))}
                </div>

                <div className={styles.aestheticToggleRow}>
                  {[
                    ['acneTendency', 'Tendenza acneica'],
                    ['rosaceaTendency', 'Tendenza rosacea'],
                    ['hyperpigmentationTendency', 'Tendenza iperpigmentazione'],
                  ].map(([field, label]) => (
                    <label key={field} className={`${styles.checkboxLabel} typo-caption-upper`}>
                      <input
                        type="checkbox"
                        checked={Boolean(aestheticDraft[field as keyof AestheticFolderDraft])}
                        onChange={(event) =>
                          setAestheticDraft((prev) => ({ ...prev, [field]: event.target.checked }))
                        }
                      />{' '}
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className={`${styles.block} ${styles.aestheticBlock}`}>
                <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                  Allergie E Controindicazioni
                </SectionTitle>
                <div className={styles.aestheticStack}>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      Allergie note
                    </LabelText>
                    <Textarea
                      className={`${styles.textarea} typo-body`}
                      rows={3}
                      value={aestheticDraft.allergies}
                      onChange={(event) => setAestheticDraft((prev) => ({ ...prev, allergies: event.target.value }))}
                      placeholder="Ingredienti, metalli, lattice, profumi..."
                    />
                  </label>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      Controindicazioni / condizioni cliniche
                    </LabelText>
                    <Textarea
                      className={`${styles.textarea} typo-body`}
                      rows={3}
                      value={aestheticDraft.contraindications}
                      onChange={(event) =>
                        setAestheticDraft((prev) => ({ ...prev, contraindications: event.target.value }))
                      }
                      placeholder="Couperose, dermatiti, isotretinoina, trattamenti recenti..."
                    />
                  </label>
                  <div className={styles.aestheticGrid}>
                    <label className={styles.profileField}>
                      <LabelText className={styles.label} variant="field">
                        Farmaci / integratori rilevanti
                      </LabelText>
                      <Textarea
                        className={`${styles.textarea} typo-body`}
                        rows={3}
                        value={aestheticDraft.medications}
                        onChange={(event) =>
                          setAestheticDraft((prev) => ({ ...prev, medications: event.target.value }))
                        }
                        placeholder="Es. anticoagulanti, retinoidi, terapia ormonale"
                      />
                    </label>
                    <label className={styles.profileField}>
                      <LabelText className={styles.label} variant="field">
                        Gravidanza / allattamento
                      </LabelText>
                      <Select
                        className={`${styles.select} typo-body`}
                        value={aestheticDraft.pregnancyOrBreastfeeding}
                        onChange={(event) =>
                          setAestheticDraft((prev) => ({
                            ...prev,
                            pregnancyOrBreastfeeding: event.target.value,
                          }))
                        }
                      >
                        <option value="">Seleziona</option>
                        <option value="no">No</option>
                        <option value="pregnancy">Gravidanza</option>
                        <option value="breastfeeding">Allattamento</option>
                      </Select>
                    </label>
                  </div>
                </div>
              </div>

              <div className={`${styles.block} ${styles.aestheticBlock}`}>
                <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                  Obiettivi, Note E Raccomandazioni
                </SectionTitle>
                <div className={styles.aestheticStack}>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      Obiettivi trattamento
                    </LabelText>
                    <Textarea
                      className={`${styles.textarea} typo-body`}
                      rows={3}
                      value={aestheticDraft.treatmentGoals}
                      onChange={(event) =>
                        setAestheticDraft((prev) => ({ ...prev, treatmentGoals: event.target.value }))
                      }
                      placeholder="Luminosità, texture, macchie, rassodamento..."
                    />
                  </label>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      Routine domiciliare
                    </LabelText>
                    <Textarea
                      className={`${styles.textarea} typo-body`}
                      rows={3}
                      value={aestheticDraft.homeCareRoutine}
                      onChange={(event) =>
                        setAestheticDraft((prev) => ({ ...prev, homeCareRoutine: event.target.value }))
                      }
                      placeholder="Detersione, acidi, SPF, frequenza..."
                    />
                  </label>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      Note estetista
                    </LabelText>
                    <Textarea
                      className={`${styles.textarea} typo-body`}
                      rows={4}
                      value={aestheticDraft.estheticianNotes}
                      onChange={(event) =>
                        setAestheticDraft((prev) => ({ ...prev, estheticianNotes: event.target.value }))
                      }
                      placeholder="Reazione al trattamento, tolleranza, follow-up consigliato..."
                    />
                  </label>
                  <div className={styles.aestheticGrid}>
                    <label className={styles.profileField}>
                      <LabelText className={styles.label} variant="field">
                        Servizi consigliati
                      </LabelText>
                      <Textarea
                        className={`${styles.textarea} typo-body`}
                        rows={3}
                        value={aestheticDraft.serviceRecommendations}
                        onChange={(event) =>
                          setAestheticDraft((prev) => ({
                            ...prev,
                            serviceRecommendations: event.target.value,
                          }))
                        }
                        placeholder="Protocolli consigliati, frequenza, cicli..."
                      />
                    </label>
                    <label className={styles.profileField}>
                      <LabelText className={styles.label} variant="field">
                        Prodotti consigliati
                      </LabelText>
                      <Textarea
                        className={`${styles.textarea} typo-body`}
                        rows={3}
                        value={aestheticDraft.productRecommendations}
                        onChange={(event) =>
                          setAestheticDraft((prev) => ({
                            ...prev,
                            productRecommendations: event.target.value,
                          }))
                        }
                        placeholder="SKU / linea / step routine"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={`${styles.pillButton} typo-small-upper`}
                  disabled={aestheticSaving}
                >
                  {aestheticSaving ? 'Salvataggio…' : 'Salva cartella estetica'}
                </button>
              </div>
              {aestheticMessage ? (
                <p className={`${aestheticMessage.type === 'success' ? styles.successText : styles.errorText} typo-caption`}>
                  {aestheticMessage.text}
                </p>
              ) : null}
            </form>
          </>
        ) : null}

        {section === 'orders' ? (
          <>
            {sortedOrders.length === 0 ? (
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
                    onClick={() => setOrderDetails((nextProductDeliveryRow ?? latestPurchasedProductRow)!)}
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
                          <div className={styles.orderPurchaseCell}>
                            <span className={styles.orderThumb}>
                              {order.purchaseThumb ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={order.purchaseThumb} alt="" />
                              ) : (
                                <span className={styles.orderThumbFallback} aria-hidden="true" />
                              )}
                            </span>
                            <div className={styles.orderPurchaseMeta}>
                              <p className={`${styles.orderNumber} typo-body-lg`}>{order.purchaseTitle}</p>
                              <p className={`${styles.orderDate} typo-caption`}>
                                {new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                }).format(new Date(order.createdAt))}
                              </p>
                              <p className={`${styles.orderInlinePrice} typo-caption`}>
                                {formatMoney(order.total, order.currency)}
                              </p>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  <button
                    type="button"
                    className={`${styles.pillButton} ${styles.accountSummaryToggle} typo-caption-upper`}
                    onClick={() => setShowAllProductPurchases((prev) => !prev)}
                  >
                    {showAllProductPurchases ? 'Nascondi acquisti' : 'Tutti gli acquisti'}
                  </button>
                </div>
                {showAllProductPurchases ? (
                <div className={styles.ordersListWrap}>
                  <div className={styles.ordersListHead} aria-hidden="true">
                    <span>Acquisto</span>
                    <span>Totale</span>
                    <span>Dettagli</span>
                  </div>
                  <div className={styles.ordersList}>
                  {groupedProductRows.map((entry) => {
                    if (entry.kind === 'single') {
                      const order = entry.row
                      return (
                        <article
                          key={order.id}
                          className={styles.ordersListRow}
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
                          <div className={styles.ordersListCell}>
                            <span className={styles.ordersListLabel}>Acquisto</span>
                            <div className={styles.orderPurchaseCell}>
                              <span className={styles.orderThumb}>
                                {order.purchaseThumb ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={order.purchaseThumb} alt="" />
                                ) : (
                                  <span className={styles.orderThumbFallback} aria-hidden="true" />
                                )}
                              </span>
                              <div className={styles.orderPurchaseMeta}>
                                <p className={`${styles.orderDate} typo-caption`}>
                                  {new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  }).format(new Date(order.createdAt))}
                                </p>
                                <p className={`${styles.orderNumber} typo-body-lg`}>{order.purchaseTitle}</p>
                                <p className={`${styles.orderInlinePrice} typo-caption`}>
                                  {formatMoney(order.total, order.currency)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className={styles.ordersListCell}>
                            <span className={styles.ordersListLabel}>Totale</span>
                            <p className={`${styles.orderAmount} typo-body-lg`}>
                              {formatMoney(order.total, order.currency)}
                            </p>
                          </div>
                          <div className={`${styles.ordersListCell} ${styles.ordersListCellDetails}`}>
                            <span className={styles.ordersListLabel}>Dettagli</span>
                            <div className={styles.actionsStack}>
                              <button
                                type="button"
                                className={`${styles.inlineActionButton} typo-caption-upper`}
                                aria-label="Apri dettagli ordine"
                                title="Apri dettagli ordine"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setOrderDetails(order)
                                }}
                              >
                                <EyeIcon width={18} height={18} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    }

                    const isExpanded = Boolean(expandedOrderGroups[entry.key])
                    return (
                      <Fragment key={`order-group-${entry.key}`}>
                        <article
                          className={`${styles.ordersListRow} ${styles.packageGroupRow}`}
                          onClick={() =>
                            setExpandedOrderGroups((prev) => ({ ...prev, [entry.key]: !prev[entry.key] }))
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setExpandedOrderGroups((prev) => ({ ...prev, [entry.key]: !prev[entry.key] }))
                            }
                          }}
                        >
                          <div className={styles.ordersListCell}>
                            <span className={styles.ordersListLabel}>Acquisto</span>
                            <div className={styles.orderPurchaseCell}>
                              <span className={styles.orderThumb}>
                                {entry.lead.purchaseThumb ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={entry.lead.purchaseThumb} alt="" />
                                ) : (
                                  <span className={styles.orderThumbFallback} aria-hidden="true" />
                                )}
                              </span>
                              <div className={styles.orderPurchaseMeta}>
                                <p className={`${styles.orderDate} typo-caption`}>
                                  {new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  }).format(new Date(entry.lead.createdAt))}
                                </p>
                                <p className={`${styles.orderNumber} typo-body-lg`}>{entry.lead.orderNumber}</p>
                                <p className={`${styles.orderMeta} typo-caption`}>
                                  {entry.rows.length} prodotti
                                </p>
                                <p className={`${styles.orderInlinePrice} typo-caption`}>
                                  {formatMoney(entry.productsTotal, entry.lead.currency)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className={styles.ordersListCell}>
                            <span className={styles.ordersListLabel}>Totale</span>
                            <p className={`${styles.orderAmount} typo-body-lg`}>
                              {formatMoney(entry.productsTotal, entry.lead.currency)}
                            </p>
                          </div>
                          <div className={`${styles.ordersListCell} ${styles.ordersListCellDetails}`}>
                            <span className={styles.ordersListLabel}>Dettagli</span>
                            <div className={styles.actionsStack}>
                              <button
                                type="button"
                                className={`${styles.inlineActionButton} typo-caption-upper`}
                                aria-label={isExpanded ? 'Collassa ordine' : 'Espandi ordine'}
                                aria-expanded={isExpanded}
                                title={isExpanded ? 'Collassa ordine' : 'Espandi ordine'}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setExpandedOrderGroups((prev) => ({ ...prev, [entry.key]: !prev[entry.key] }))
                                }}
                              >
                                {isExpanded ? '−' : '+'}
                              </button>
                            </div>
                          </div>
                        </article>
                        {isExpanded
                          ? entry.rows.map((order) => (
                              <article
                                key={order.id}
                                className={`${styles.ordersListRow} ${styles.packageSessionRow}`}
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
                                <div className={styles.ordersListCell}>
                                  <span className={styles.ordersListLabel}>Acquisto</span>
                                  <div className={styles.orderPurchaseCell}>
                                    <span className={styles.orderThumb}>
                                      {order.purchaseThumb ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={order.purchaseThumb} alt="" />
                                      ) : (
                                        <span className={styles.orderThumbFallback} aria-hidden="true" />
                                      )}
                                    </span>
                                    <div className={styles.orderPurchaseMeta}>
                                      <p className={`${styles.orderDate} typo-caption`}>
                                        {new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                        }).format(new Date(order.createdAt))}
                                      </p>
                                      <p className={`${styles.orderNumber} typo-body-lg`}>{order.purchaseTitle}</p>
                                      <p className={`${styles.orderInlinePrice} typo-caption`}>
                                        {formatMoney(order.total, order.currency)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className={styles.ordersListCell}>
                                  <span className={styles.ordersListLabel}>Totale</span>
                                  <p className={`${styles.orderAmount} typo-body-lg`}>
                                    {formatMoney(order.total, order.currency)}
                                  </p>
                                </div>
                                <div className={`${styles.ordersListCell} ${styles.ordersListCellDetails}`}>
                                  <span className={styles.ordersListLabel}>Dettagli</span>
                                  <div className={styles.actionsStack}>
                                    <button
                                      type="button"
                                      className={`${styles.inlineActionButton} typo-caption-upper`}
                                      aria-label="Apri dettagli ordine"
                                      title="Apri dettagli ordine"
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        setOrderDetails(order)
                                      }}
                                    >
                                      <EyeIcon width={18} height={18} aria-hidden="true" />
                                    </button>
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
                  {nextServiceAppointmentRow ? 'Prossimo appuntamento' : 'Ultimo servizio acquistato'}
                </p>
                <div
                  className={styles.accountSummaryCard}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const row = (nextServiceAppointmentRow ?? latestServicePurchasedRow)!
                    setServiceDetailsIsPackageChild(false)
                    setServiceDetailsRow(row)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      const row = (nextServiceAppointmentRow ?? latestServicePurchasedRow)!
                      setServiceDetailsIsPackageChild(false)
                      setServiceDetailsRow(row)
                    }
                  }}
                >
                  {(() => {
                    const row = nextServiceAppointmentRow ?? latestServicePurchasedRow
                    if (!row) return null
                    return (
                      <>
                        <div className={styles.accountSummaryServiceMeta}>
                          <p className={`${styles.orderNumber} typo-body-lg`}>{row.serviceTitle}</p>
                          <p className={`${styles.orderMeta} typo-caption`}>
                            {row.itemKind === 'package' ? row.sessionLabel : 'Servizio singolo'}
                          </p>
                        </div>
                        <div className={styles.accountSummaryServicePillWrap}>{renderServiceDataPill(row)}</div>
                        <button
                          type="button"
                          className={`${styles.inlineActionButton} typo-caption-upper`}
                          aria-label="Apri dettagli prenotazione"
                          title="Apri dettagli prenotazione"
                          onClick={(event) => {
                            event.stopPropagation()
                            setServiceDetailsIsPackageChild(row.itemKind === 'package')
                            setServiceDetailsRow(row)
                          }}
                        >
                          <EyeIcon width={18} height={18} aria-hidden="true" />
                        </button>
                      </>
                    )
                  })()}
                </div>
                <button
                  type="button"
                  className={`${styles.pillButton} ${styles.accountSummaryToggle} typo-caption-upper`}
                  onClick={() => setShowAllServicesBookings((prev) => !prev)}
                >
                  {showAllServicesBookings ? 'Nascondi servizi prenotati' : 'Tutti i servizi prenotati'}
                </button>
              </div>
            ) : null}

            {showAllServicesBookings ? (
            <div className={styles.servicesFilters}>
              <div className={styles.servicesFilterRow}>
                <button
                  type="button"
                  className={`${styles.filterChip} ${servicesFilter === 'not_used' ? styles.filterChipActive : ''} typo-caption-upper`}
                  onClick={() => {
                    setServicesFilter('not_used')
                    setServicesSubFilter('all')
                  }}
                >
                  Non usufruiti
                </button>
                <button
                  type="button"
                  className={`${styles.filterChip} ${servicesFilter === 'used' ? styles.filterChipActive : ''} typo-caption-upper`}
                  onClick={() => {
                    setServicesFilter('used')
                    setServicesSubFilter('all')
                  }}
                >
                  Usufruiti
                </button>
              </div>

              {servicesFilter === 'not_used' ? (
                <div className={styles.servicesFilterRow}>
                  {[
                    ['all', 'Tutti'],
                    ['requested_date', 'Data richiesta'],
                    ['awaiting_confirmation', 'In attesa di conferma'],
                    ['date_to_request', 'Data da richiedere'],
                    ['confirmed_date', 'Data confermata'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.filterChip} ${servicesSubFilter === value ? styles.filterChipActive : ''} typo-caption-upper`}
                      onClick={() => setServicesSubFilter(value as ServicesSubFilter)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            ) : null}

            {showAllServicesBookings && serviceRowsFiltered.length === 0 ? (
              <div className={styles.block}>
                <p className={`${styles.value} typo-body-lg`}>Nessuna prenotazione servizio in questo filtro.</p>
              </div>
            ) : showAllServicesBookings ? (
              <div className={styles.servicesTableWrap}>
                {sessionMessage ? (
                  <p className={`${sessionMessage.type === 'success' ? styles.successText : styles.errorText} typo-caption`}>
                    {sessionMessage.text}
                  </p>
                ) : null}
                <div className={styles.servicesList}>
                  <div className={styles.servicesListHead} aria-hidden="true">
                    <span>Servizio</span>
                    <span>Data</span>
                    <span>Dettagli</span>
                  </div>
                  {groupedServiceTableRows.map((entry) => {
                    if (entry.kind === 'single') {
                      const row = entry.row
                      return (
                        <div key={row.id} className={styles.servicesListRow}>
                          <div className={styles.servicesListCell}>
                            <span className={styles.servicesListLabel}>Servizio</span>
                            <div className={styles.serviceCellTitle}>{row.serviceTitle}</div>
                          </div>
                          <div className={styles.servicesListCell}>
                            <span className={styles.servicesListLabel}>Data</span>
                            {renderServiceDataPill(row)}
                          </div>
                          <div className={`${styles.servicesListCell} ${styles.servicesListCellDetails}`}>
                            <span className={styles.servicesListLabel}>Dettagli</span>
                            <div className={styles.actionsStack}>
                              <button
                                type="button"
                                className={`${styles.inlineActionButton} typo-caption-upper`}
                                aria-label="Apri dettagli"
                                title="Apri dettagli"
                                onClick={() => {
                                  setServiceDetailsIsPackageChild(false)
                                  setServiceDetailsRow(row)
                                }}
                              >
                                <EyeIcon width={18} height={18} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    const isExpanded = Boolean(expandedPackageGroups[entry.key])
                    return (
                      <Fragment key={`frag-${entry.key}`}>
                        <div className={`${styles.servicesListRow} ${styles.packageGroupRow}`}>
                          <div className={styles.servicesListCell}>
                            <span className={styles.servicesListLabel}>Servizio</span>
                            <div className={styles.serviceCellTitle}>{entry.lead.serviceTitle}</div>
                          </div>
                          <div className={styles.servicesListCell}>
                            <span className={styles.servicesListLabel}>Data</span>
                            <button
                              type="button"
                              className={`${styles.inlineDataPill} ${styles.packageTogglePill} typo-caption-upper`}
                              aria-label={isExpanded ? 'Collassa pacchetto' : 'Espandi pacchetto'}
                              aria-expanded={isExpanded}
                              title={isExpanded ? 'Collassa pacchetto' : 'Espandi pacchetto'}
                              onClick={() =>
                                setExpandedPackageGroups((prev) => ({
                                  ...prev,
                                  [entry.key]: !prev[entry.key],
                                }))
                              }
                            >
                              <span className={`${styles.inlineStatusIcon} ${styles.statusIconEmpty}`}>
                                <MinusIcon width={18} height={18} aria-hidden="true" />
                              </span>
                              <span className={styles.inlineDataDivider} aria-hidden="true" />
                              <span className={styles.inlineDataText}>Pacchetto</span>
                              <span className={styles.inlineDataDivider} aria-hidden="true" />
                              <span className={styles.inlinePillIconButton} aria-hidden="true">
                                {isExpanded ? '−' : '+'}
                              </span>
                            </button>
                          </div>
                          <div className={`${styles.servicesListCell} ${styles.servicesListCellDetails}`}>
                            <span className={styles.servicesListLabel}>Dettagli</span>
                            <div className={styles.actionsStack}>
                              <button
                                type="button"
                                className={`${styles.inlineActionButton} typo-caption-upper`}
                                aria-label="Apri dettagli"
                                title="Apri dettagli"
                                onClick={() => {
                                  setServiceDetailsIsPackageChild(false)
                                  setServiceDetailsRow(entry.lead)
                                }}
                              >
                                <EyeIcon width={18} height={18} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {isExpanded
                          ? entry.rows.map((row) => (
                              <div key={row.id} className={`${styles.servicesListRow} ${styles.packageSessionRow}`}>
                                <div className={styles.servicesListCell}>
                                  <span className={styles.servicesListLabel}>Servizio</span>
                                  <div className={styles.packageSessionCell}>
                                    Seduta {row.sessionIndex}/{row.sessionsTotal}
                                  </div>
                                </div>
                                <div className={styles.servicesListCell}>
                                  <span className={styles.servicesListLabel}>Data</span>
                                  {renderServiceDataPill(row)}
                                </div>
                                <div className={`${styles.servicesListCell} ${styles.servicesListCellDetails}`}>
                                  <span className={styles.servicesListLabel}>Dettagli</span>
                                  <div className={styles.actionsStack}>
                                    <button
                                      type="button"
                                      className={`${styles.inlineActionButton} typo-caption-upper`}
                                      aria-label="Apri dettagli"
                                      title="Apri dettagli"
                                      onClick={() => {
                                        setServiceDetailsIsPackageChild(true)
                                        setServiceDetailsRow(row)
                                      }}
                                    >
                                      <EyeIcon width={18} height={18} aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          : null}
                      </Fragment>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </>
        ) : null}

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
                    <button
                      type="button"
                      className={`${styles.pillButton} ${styles.addressPrimaryButton} typo-small-upper`}
                      onClick={() => {
                        setAddressesView('book')
                        setEditingAddressId(null)
                        setShowAddressForm(false)
                        setAddressMessage(null)
                      }}
                    >
                      Vedi/Modifica rubrica indirizzi
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={`${styles.pillButton} ${styles.addressPrimaryButton} typo-small-upper`}
                    onClick={() => {
                      setAddressesView('default')
                      setEditingAddressId(null)
                      setAddressMessage(null)
                      setAddressLookupQuery('')
                      setShowAddressForm((value) => !value)
                    }}
                  >
                    {copy.addresses.addNewAddress}
                  </button>
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
                            <button
                              type="button"
                              className={`${styles.pillButton} ${styles.addressPrimaryButton} typo-small-upper`}
                              onClick={() => onSetDefaultAddress(address.id)}
                            >
                              Imposta predefinito
                            </button>
                          ) : null}
                          <div className={styles.addressBookActionRow}>
                            <button
                              type="button"
                              className={`${styles.pillButton} ${styles.addressPrimaryButton} typo-small-upper`}
                              onClick={() => onEditAddress(address)}
                            >
                              {copy.addresses.edit}
                            </button>
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

                <button
                  type="button"
                  className={`${styles.pillButton} ${styles.addressPrimaryButton} typo-small-upper`}
                  onClick={() => {
                    setAddressesView('book')
                    setEditingAddressId(null)
                    setShowAddressForm((value) => !value)
                    setAddressMessage(null)
                    setAddressLookupQuery('')
                  }}
                >
                  {copy.addresses.addNewAddress}
                </button>
              </div>
            ) : null}

            {showAddressForm ? (
              <form className={styles.addressForm} onSubmit={onSaveAddress}>
                <SectionTitle as="h3" size="h3" className={styles.addressFormTitle}>
                  {editingAddressId ? 'Modifica indirizzo' : copy.addresses.formTitle}
                </SectionTitle>
                {addressMessage ? (
                  <p
                    className={`${
                      addressMessage.type === 'success' ? styles.successText : styles.errorText
                    } typo-caption`}
                  >
                    {addressMessage.text}
                  </p>
                ) : null}
                <div className={styles.formBlock}>
                  <p className={`${styles.formBlockLabel} typo-caption-upper`}>Ricerca indirizzo</p>
                  <div className={styles.cityAutocomplete}>
                    <Input
                      className={`${styles.input} typo-body`}
                      placeholder="Indirizzo (ricerca automatica)"
                      value={addressLookupQuery}
                      autoComplete="off"
                      onFocus={() => setShowCitySuggestions(true)}
                      onChange={(event) => setAddressLookupQuery(event.target.value)}
                      onBlur={() => {
                        window.setTimeout(() => setShowCitySuggestions(false), 120)
                      }}
                    />
                    {showCitySuggestions && (cityLoading || citySuggestions.length > 0) ? (
                      <div className={styles.citySuggestions} role="listbox" aria-label="Suggerimenti indirizzo">
                        {cityLoading ? (
                          <div className={`${styles.citySuggestionItem} ${styles.citySuggestionMuted} typo-caption`}>
                            Ricerca indirizzo...
                          </div>
                        ) : (
                          citySuggestions.map((suggestion) => (
                            <button
                              key={suggestion.label}
                              type="button"
                              className={`${styles.citySuggestionItem} typo-caption`}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => applyCitySuggestion(suggestion)}
                            >
                              {suggestion.label}
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className={styles.formBlockDivider} aria-hidden="true" />

                <div className={styles.formBlock}>
                  <p className={`${styles.formBlockLabel} typo-caption-upper`}>Intestatario</p>
                  <Input className={`${styles.input} typo-body`} placeholder={copy.addresses.firstName} value={addressDraft.firstName} onChange={(event) => setAddressDraft((prev) => ({ ...prev, firstName: event.target.value }))} />
                  <Input className={`${styles.input} typo-body`} placeholder={copy.addresses.lastName} value={addressDraft.lastName} onChange={(event) => setAddressDraft((prev) => ({ ...prev, lastName: event.target.value }))} />
                  <Input className={`${styles.input} typo-body`} placeholder={copy.addresses.company} value={addressDraft.company} onChange={(event) => setAddressDraft((prev) => ({ ...prev, company: event.target.value }))} />
                </div>

                <div className={styles.formBlockDivider} aria-hidden="true" />

                <div className={styles.formBlock}>
                  <p className={`${styles.formBlockLabel} typo-caption-upper`}>Indirizzo</p>
                  <Input className={`${styles.input} typo-body`} placeholder={copy.addresses.streetAddress} maxLength={30} value={addressDraft.streetAddress} autoComplete="street-address" onChange={(event) => setAddressDraft((prev) => ({ ...prev, streetAddress: event.target.value }))} />
                  <Input className={`${styles.input} typo-body`} placeholder={copy.addresses.apartment} maxLength={30} value={addressDraft.apartment} onChange={(event) => setAddressDraft((prev) => ({ ...prev, apartment: event.target.value }))} />
                  <Input className={`${styles.input} typo-body`} placeholder={copy.addresses.city} maxLength={30} value={addressDraft.city} autoComplete="address-level2" onChange={(event) => setAddressDraft((prev) => ({ ...prev, city: event.target.value }))} />
                  <p className={`${styles.limitHint} typo-caption`}>{copy.addresses.limitHint}</p>
                </div>

                <div className={styles.formBlockDivider} aria-hidden="true" />

                <div className={styles.formBlock}>
                  <p className={`${styles.formBlockLabel} typo-caption-upper`}>Consegna e contatti</p>
                  <Select
                    className={`${styles.select} typo-body`}
                    value={addressDraft.country}
                    onChange={(event) =>
                      setAddressDraft((prev) => ({ ...prev, country: event.target.value }))
                    }
                  >
                    <option value="Italy">{copy.addresses.countryItaly}</option>
                  </Select>
                  <Select
                    className={`${styles.select} typo-body`}
                    value={addressDraft.province}
                    onChange={(event) =>
                      setAddressDraft((prev) => ({ ...prev, province: event.target.value }))
                    }
                  >
                    <option value="">{copy.addresses.province}</option>
                    <option value="Monza and Brianza">{copy.addresses.provinceMonza}</option>
                    <option value="Milano">{copy.addresses.provinceMilano}</option>
                  </Select>
                  <Input
                    className={`${styles.input} typo-body`}
                    placeholder={copy.addresses.postalCode}
                    value={addressDraft.postalCode}
                    onChange={(event) =>
                      setAddressDraft((prev) => ({ ...prev, postalCode: event.target.value }))
                    }
                  />
                  <Input
                    className={`${styles.input} typo-body`}
                    placeholder={copy.addresses.phone}
                    value={addressDraft.phone}
                    onChange={(event) =>
                      setAddressDraft((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={addressDraft.isDefault}
                      onChange={(event) =>
                        setAddressDraft((prev) => ({ ...prev, isDefault: event.target.checked }))
                      }
                    />
                    <span className={`${styles.checkboxLabel} typo-small`}>{copy.addresses.setDefaultAddress}</span>
                  </label>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={`${styles.pillButton} typo-small-upper`}>
                    {copy.addresses.saveAddress}
                  </button>
                  <button
                    type="button"
                    className={`${styles.cancelLink} typo-small-upper`}
                    onClick={() => {
                      setEditingAddressId(null)
                      setAddressMessage(null)
                      setAddressLookupQuery('')
                      setShowAddressForm(false)
                    }}
                  >
                    {copy.addresses.cancel}
                  </button>
                </div>
              </form>
            ) : null}
          </>
        ) : null}
      </section>
      {renderAccountFooterActions(styles.mobileFooterActions)}
      {serviceDetailsRow ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="service-details-title">
          <div className={styles.modalCard}>
            <div className={styles.rowBetween}>
              <SectionTitle as="h3" size="h3" className={styles.subHeading}>
                <span id="service-details-title">Dettagli prenotazione</span>
              </SectionTitle>
              <button
                type="button"
                className={`${styles.inlineActionButton} typo-caption-upper`}
                onClick={() => {
                  setServiceDetailsRow(null)
                  setServiceDetailsIsPackageChild(false)
                }}
              >
                Chiudi
              </button>
            </div>
            <div className={styles.modalGrid}>
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Servizio</p>
                <p className={`${styles.value} typo-body-lg`}>{serviceDetailsRow.serviceTitle}</p>
              </div>
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ordine</p>
                <p className={`${styles.value} typo-body-lg`}>{serviceDetailsRow.orderNumber}</p>
              </div>
              {!serviceDetailsRow.itemKind || serviceDetailsRow.itemKind !== 'package' || serviceDetailsIsPackageChild ? (
                <div>
                  <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Seduta</p>
                  <p className={`${styles.value} typo-body-lg`}>{serviceDetailsRow.sessionLabel}</p>
                </div>
              ) : null}
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
              {serviceDetailsRow.itemKind !== 'package' || serviceDetailsIsPackageChild ? (
                <div>
                  <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data appuntamento</p>
                  <p className={`${styles.value} typo-body-lg`}>{formatServiceSchedule(serviceDetailsRow)}</p>
                </div>
              ) : null}
              {serviceDetailsRow.itemKind !== 'package' ? (
                <div>
                  <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Status</p>
                  <p className={`${styles.value} typo-body-lg`}>{formatServiceStatus(serviceDetailsRow)}</p>
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
          </div>
        </div>
      ) : null}
      {orderDetails ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="order-details-title">
          <div className={styles.modalCard}>
            <div className={styles.rowBetween}>
              <SectionTitle as="h3" size="h3" className={styles.subHeading}>
                <span id="order-details-title">Dettagli ordine</span>
              </SectionTitle>
              <button
                type="button"
                className={`${styles.inlineActionButton} typo-caption-upper`}
                onClick={() => setOrderDetails(null)}
              >
                Chiudi
              </button>
            </div>
            <div className={styles.modalGrid}>
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ordine</p>
                <p className={`${styles.value} typo-body-lg`}>{orderDetails.orderNumber}</p>
              </div>
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Prodotto</p>
                <div className={styles.orderPurchaseCell}>
                  <span className={styles.orderThumb}>
                    {orderDetails.purchaseThumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={orderDetails.purchaseThumb} alt="" />
                    ) : (
                      <span className={styles.orderThumbFallback} aria-hidden="true" />
                    )}
                  </span>
                  <div className={styles.orderPurchaseMeta}>
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
                  {orderDetails.productFulfillmentMode === 'pickup' ? 'Ritiro in negozio' : 'Spedizione'}
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
                  <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ultimo aggiornamento spedizione</p>
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
          </div>
        </div>
      ) : null}
      {scheduleEditRow ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="schedule-edit-title">
          <div className={styles.modalCard}>
            <div className={styles.rowBetween}>
              <SectionTitle as="h3" size="h3" className={styles.subHeading}>
                <span id="schedule-edit-title">Modifica data appuntamento</span>
              </SectionTitle>
              <button
                type="button"
                className={`${styles.inlineActionButton} typo-caption-upper`}
                onClick={() => setScheduleEditRow(null)}
              >
                Chiudi
              </button>
            </div>
            <p className={`${styles.value} typo-body-lg`}>
              {scheduleEditRow.serviceTitle}
              {scheduleEditRow.itemKind === 'package' ? ` · ${scheduleEditRow.sessionLabel}` : ''}
            </p>
            <div className={styles.modalGrid}>
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data attuale</p>
                <p className={`${styles.value} typo-body-lg`}>{formatServiceSchedule(scheduleEditRow)}</p>
              </div>
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Data</p>
                <input
                  className={styles.modalInput}
                  type="date"
                  value={scheduleEditDraft.date}
                  onChange={(e) => setScheduleEditDraft((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <p className={`${styles.serviceCellTitle} typo-caption-upper`}>Ora</p>
                <input
                  className={styles.modalInput}
                  type="time"
                  value={scheduleEditDraft.time}
                  onChange={(e) => setScheduleEditDraft((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            {scheduleEditRow && !canEditSchedule(scheduleEditRow) ? (
              <p className={`${styles.errorText} typo-caption`}>
                Questa data è già gestita dal team e non è modificabile dal tuo account.
              </p>
            ) : null}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.inlineActionButton} typo-caption-upper`}
                disabled={sessionSavingId === scheduleEditRow.id || !canEditSchedule(scheduleEditRow)}
                onClick={() => void onSaveScheduleEdit()}
              >
                {sessionSavingId === scheduleEditRow.id ? 'Salvataggio…' : 'Salva data'}
              </button>
              <button
                type="button"
                className={`${styles.inlineActionButton} typo-caption-upper`}
                disabled={sessionSavingId === scheduleEditRow.id || !canEditSchedule(scheduleEditRow)}
                onClick={() => void onClearScheduleEdit()}
              >
                Annulla data
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
