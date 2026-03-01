import { describe, expect, it } from 'vitest'

import {
  INITIAL_SERVICE_SCHEDULE_MUTATIONS_STATE,
  serviceScheduleMutationsReducer,
} from '@/components/account/hooks/services/useServiceScheduleMutations'
import type { ServiceBookingRow } from '@/components/account/types'

const row: ServiceBookingRow = {
  id: 'sess-1',
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
  rowPrice: 90,
  currency: 'EUR',
  appointmentMode: 'requested_slot',
  appointmentStatus: 'pending',
  requestedDate: '2026-01-20',
  requestedTime: '10:30',
  proposedDate: null,
  proposedTime: null,
  confirmedAt: null,
}

describe('serviceScheduleMutationsReducer', () => {
  it('opens modal and derives schedule draft from row fields', () => {
    const next = serviceScheduleMutationsReducer(INITIAL_SERVICE_SCHEDULE_MUTATIONS_STATE, {
      type: 'open_edit_modal',
      payload: row,
    })

    expect(next.scheduleEditRow?.id).toBe('sess-1')
    expect(next.scheduleEditDraft).toEqual({ date: '2026-01-20', time: '10:30' })
  })

  it('sets message and clears modal independently', () => {
    const withMessage = serviceScheduleMutationsReducer(INITIAL_SERVICE_SCHEDULE_MUTATIONS_STATE, {
      type: 'set_message',
      payload: { type: 'success', text: 'ok' },
    })

    expect(withMessage.sessionMessage).toEqual({ type: 'success', text: 'ok' })

    const opened = serviceScheduleMutationsReducer(withMessage, {
      type: 'open_edit_modal',
      payload: row,
    })

    const closed = serviceScheduleMutationsReducer(opened, { type: 'close_edit_modal' })
    expect(closed.scheduleEditRow).toBeNull()
    expect(closed.sessionMessage).toEqual({ type: 'success', text: 'ok' })
  })
})
