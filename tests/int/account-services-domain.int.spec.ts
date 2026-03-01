import { describe, expect, it } from 'vitest'

import {
  filterServiceRows,
  findNextServiceAppointmentRow,
  formatServiceStatus,
  groupServices,
} from '@/components/account/hooks/services/services-domain'
import type { ServiceBookingRow } from '@/components/account/types'

const baseServiceRow = (overrides: Partial<ServiceBookingRow>): ServiceBookingRow => ({
  id: 's-1',
  orderServiceItemId: 'osi-1',
  sessionIndex: 1,
  orderId: 1,
  orderNumber: 'ORD-1',
  orderCreatedAt: '2026-01-01T10:00:00.000Z',
  orderStatus: 'paid',
  paymentStatus: 'paid',
  itemKind: 'service',
  serviceTitle: 'Trattamento',
  variantLabel: 'Base',
  sessionLabel: 'Seduta 1/1',
  sessionsTotal: 1,
  durationMinutes: 60,
  rowPrice: 80,
  currency: 'EUR',
  appointmentMode: 'requested_slot',
  appointmentStatus: 'pending',
  requestedDate: '2026-01-20',
  requestedTime: '10:30',
  proposedDate: null,
  proposedTime: null,
  confirmedAt: null,
  ...overrides,
})

describe('account services domain', () => {
  it('filters non-used services by sub-filter awaiting_confirmation', () => {
    const rows = [
      baseServiceRow({ id: 'a', appointmentStatus: 'alternative_proposed' }),
      baseServiceRow({ id: 'b', appointmentStatus: 'pending' }),
    ]

    const filtered = filterServiceRows(
      rows,
      'not_used',
      'awaiting_confirmation',
      new Date('2026-01-10T00:00:00.000Z').getTime(),
    )

    expect(filtered.map((row) => row.id)).toEqual(['a'])
  })

  it('filters used services only when confirmed appointment is in the past', () => {
    const rows = [
      baseServiceRow({
        id: 'used-confirmed',
        appointmentStatus: 'confirmed',
        proposedDate: '2026-01-03',
        proposedTime: '10:00',
      }),
      baseServiceRow({
        id: 'future-confirmed',
        appointmentStatus: 'confirmed',
        proposedDate: '2026-02-03',
        proposedTime: '10:00',
      }),
      baseServiceRow({
        id: 'not-paid',
        paymentStatus: 'pending',
        appointmentStatus: 'confirmed',
        proposedDate: '2026-01-02',
        proposedTime: '10:00',
      }),
    ]

    const filtered = filterServiceRows(
      rows,
      'used',
      'all',
      new Date('2026-01-20T00:00:00.000Z').getTime(),
    )

    expect(filtered.map((row) => row.id)).toEqual(['used-confirmed'])
  })

  it('groups package services by orderServiceItemId and sorts sessions', () => {
    const rows = [
      baseServiceRow({
        id: 'p2',
        itemKind: 'package',
        orderServiceItemId: 'pkg-1',
        sessionIndex: 2,
        sessionLabel: 'Seduta 2/3',
      }),
      baseServiceRow({
        id: 'p1',
        itemKind: 'package',
        orderServiceItemId: 'pkg-1',
        sessionIndex: 1,
        sessionLabel: 'Seduta 1/3',
      }),
      baseServiceRow({ id: 'single', itemKind: 'service', orderServiceItemId: 'single-1' }),
    ]

    const grouped = groupServices(rows)

    const pkg = grouped.find((entry) => entry.kind === 'package-group')
    expect(pkg?.kind).toBe('package-group')
    if (!pkg || pkg.kind !== 'package-group') throw new Error('Missing package group')
    expect(pkg.rows.map((row) => row.id)).toEqual(['p1', 'p2'])
  })

  it('maps status label and next appointment correctly', () => {
    const usedRow = baseServiceRow({
      id: 'used',
      appointmentStatus: 'confirmed',
      proposedDate: '2026-01-03',
      proposedTime: '09:00',
    })
    const nextRow = baseServiceRow({
      id: 'next',
      appointmentStatus: 'confirmed',
      proposedDate: '2026-01-12',
      proposedTime: '11:00',
    })

    expect(formatServiceStatus(usedRow, new Date('2026-01-10T00:00:00.000Z').getTime())).toBe(
      'Pagato · usufruito',
    )

    const next = findNextServiceAppointmentRow(
      [usedRow, nextRow],
      new Date('2026-01-10T00:00:00.000Z').getTime(),
    )

    expect(next?.id).toBe('next')
  })
})
