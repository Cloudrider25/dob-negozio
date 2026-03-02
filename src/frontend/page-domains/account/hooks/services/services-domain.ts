import type { ServiceBookingRow, ServicesFilter, ServicesSubFilter } from '../../types'

export type GroupedServiceTableRow =
  | { kind: 'single'; row: ServiceBookingRow }
  | {
      kind: 'package-group'
      key: string
      lead: ServiceBookingRow
      rows: ServiceBookingRow[]
    }

const toTs = (value: string | Date) => new Date(value).getTime()

export function isPaidServiceRow(row: ServiceBookingRow) {
  return ['paid', 'authorized', 'processing'].includes((row.paymentStatus || '').toLowerCase())
}

export function getConfirmedSessionTs(row: ServiceBookingRow) {
  const dateSource = row.proposedDate ?? row.requestedDate
  if (!dateSource) return null

  const raw = row.proposedTime?.trim() || row.requestedTime?.trim()
  const time = raw && /^\d{1,2}:\d{2}/.test(raw) ? raw : '00:00'
  const ts = new Date(`${dateSource}T${time}:00`).getTime()

  return Number.isNaN(ts) ? null : ts
}

export function isUsedServiceRow(row: ServiceBookingRow, nowTs = Date.now()) {
  if (!isPaidServiceRow(row)) return false
  if (!['confirmed', 'confirmed_by_customer'].includes(row.appointmentStatus)) return false

  const confirmedTs = getConfirmedSessionTs(row)
  return confirmedTs !== null && confirmedTs < nowTs
}

export function filterServiceRows(
  rows: ServiceBookingRow[],
  servicesFilter: ServicesFilter,
  servicesSubFilter: ServicesSubFilter,
  nowTs = Date.now(),
) {
  let next = [...rows].sort((a, b) => toTs(b.orderCreatedAt) - toTs(a.orderCreatedAt))

  next = next.filter((row) => {
    if (servicesFilter === 'used') return isUsedServiceRow(row, nowTs)
    return !isUsedServiceRow(row, nowTs)
  })

  if (servicesFilter !== 'not_used' || servicesSubFilter === 'all') return next

  return next.filter((row) => {
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
}

export function formatServiceStatus(row: ServiceBookingRow, nowTs = Date.now()) {
  if (isUsedServiceRow(row, nowTs)) return 'Pagato · usufruito'

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
  if (row.appointmentMode === 'contact_later' || row.appointmentMode === 'none')
    return 'Data da richiedere'

  return 'Data richiesta'
}

export function groupServices(rows: ServiceBookingRow[]): GroupedServiceTableRow[] {
  const output: GroupedServiceTableRow[] = []
  const packageGroups = new Map<string, ServiceBookingRow[]>()

  for (const row of rows) {
    if (row.itemKind !== 'package') {
      output.push({ kind: 'single', row })
      continue
    }

    const key = row.orderServiceItemId || `${row.orderId}:${row.serviceTitle}:${row.variantLabel}`
    const list = packageGroups.get(key) ?? []
    list.push(row)
    packageGroups.set(key, list)
  }

  for (const [key, packageRows] of packageGroups.entries()) {
    const ordered = [...packageRows].sort((a, b) => a.sessionIndex - b.sessionIndex)
    output.push({
      kind: 'package-group',
      key,
      lead: ordered[0],
      rows: ordered,
    })
  }

  output.sort((a, b) => {
    const aDate = a.kind === 'single' ? a.row.orderCreatedAt : a.lead.orderCreatedAt
    const bDate = b.kind === 'single' ? b.row.orderCreatedAt : b.lead.orderCreatedAt
    return toTs(bDate) - toTs(aDate)
  })

  return output
}

export function findNextServiceAppointmentRow(rows: ServiceBookingRow[], nowTs = Date.now()) {
  const candidates = rows
    .map((row) => ({ row, ts: getConfirmedSessionTs(row) }))
    .filter((entry): entry is { row: ServiceBookingRow; ts: number } => entry.ts !== null && entry.ts > nowTs)
    .sort((a, b) => a.ts - b.ts)

  return candidates[0]?.row ?? null
}

export function findLatestServicePurchasedRow(rows: ServiceBookingRow[]) {
  const sorted = [...rows].sort((a, b) => toTs(b.orderCreatedAt) - toTs(a.orderCreatedAt))
  return sorted[0] ?? null
}
