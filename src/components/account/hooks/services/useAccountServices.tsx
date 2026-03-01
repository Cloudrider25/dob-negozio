'use client'

import { useMemo, useState } from 'react'
import { ArrowPathIcon, CheckIcon, ClockIcon, MinusIcon } from '@heroicons/react/24/outline'

import { patchServiceSessionSchedule } from '../../client-api/services'
import { SERVICES_PRIMARY_OPTIONS, SERVICES_SUB_OPTIONS } from '../../constants'
import { SchedulePill } from '../../shared/SchedulePill'
import type { FormMessage } from '../../forms/types'
import type { ServiceBookingRow, ServicesFilter, ServicesSubFilter } from '../../types'

type ScheduleEditDraft = {
  date: string
  time: string
}

type UseAccountServicesArgs = {
  initialServiceRows: ServiceBookingRow[]
  servicesStyles: Record<string, string>
}

export function useAccountServices({ initialServiceRows, servicesStyles }: UseAccountServicesArgs) {
  const [servicesFilter, setServicesFilter] = useState<ServicesFilter>('not_used')
  const [servicesSubFilter, setServicesSubFilter] = useState<ServicesSubFilter>('all')
  const [sessionSavingId, setSessionSavingId] = useState<string | null>(null)
  const [sessionMessage, setSessionMessage] = useState<FormMessage | null>(null)
  const [serviceRowsState, setServiceRowsState] = useState<ServiceBookingRow[]>(initialServiceRows)
  const [expandedPackageGroups, setExpandedPackageGroups] = useState<Record<string, boolean>>({})
  const [showAllServicesBookings, setShowAllServicesBookings] = useState(false)
  const [servicesFilterDrawerOpen, setServicesFilterDrawerOpen] = useState(false)
  const [scheduleEditRow, setScheduleEditRow] = useState<ServiceBookingRow | null>(null)
  const [scheduleEditDraft, setScheduleEditDraft] = useState<ScheduleEditDraft>({
    date: '',
    time: '',
  })

  const formatDateTime = (dateValue: string | null, timeValue?: string | null) => {
    if (!dateValue) return '—'
    const date = new Date(dateValue)
    const dateLabel = Number.isNaN(date.getTime())
      ? dateValue
      : new Intl.DateTimeFormat('it-IT', {
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
      const { response, data } = await patchServiceSessionSchedule(row.id, payloadBody)
      if (!response.ok) {
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

  return {
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
  }
}
