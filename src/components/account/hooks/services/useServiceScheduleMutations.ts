'use client'

import { useReducer } from 'react'
import type { KeyedMutator } from 'swr'

import { patchServiceSessionSchedule } from '../../client-api/services'
import { toErrorMessage } from '../../client-api/parseApiError'
import { useAccountFormatters } from '../../shared/useAccountFormatters'
import type { FormMessage } from '../../forms/types'
import type { ServiceBookingRow } from '../../types'
import { formatServiceStatus as formatServiceStatusLabel } from './services-domain'

export type ScheduleEditDraft = {
  date: string
  time: string
}

type UseServiceScheduleMutationsArgs = {
  locale: string
  mutateServiceRows: KeyedMutator<ServiceBookingRow[]>
}

export type ServiceScheduleMutationsState = {
  sessionSavingId: string | null
  sessionMessage: FormMessage | null
  scheduleEditRow: ServiceBookingRow | null
  scheduleEditDraft: ScheduleEditDraft
}

export type ServiceScheduleMutationsAction =
  | { type: 'set_message'; payload: FormMessage | null }
  | { type: 'set_saving_id'; payload: string | null }
  | { type: 'open_edit_modal'; payload: ServiceBookingRow }
  | { type: 'close_edit_modal' }
  | { type: 'set_schedule_draft'; payload: ScheduleEditDraft }

const INITIAL_DRAFT: ScheduleEditDraft = { date: '', time: '' }

export const INITIAL_SERVICE_SCHEDULE_MUTATIONS_STATE: ServiceScheduleMutationsState = {
  sessionSavingId: null,
  sessionMessage: null,
  scheduleEditRow: null,
  scheduleEditDraft: INITIAL_DRAFT,
}

export function serviceScheduleMutationsReducer(
  state: ServiceScheduleMutationsState,
  action: ServiceScheduleMutationsAction,
): ServiceScheduleMutationsState {
  if (action.type === 'set_message') {
    return { ...state, sessionMessage: action.payload }
  }

  if (action.type === 'set_saving_id') {
    return { ...state, sessionSavingId: action.payload }
  }

  if (action.type === 'open_edit_modal') {
    const row = action.payload
    return {
      ...state,
      scheduleEditRow: row,
      scheduleEditDraft: {
        date: (row.proposedDate ?? row.requestedDate ?? '').slice(0, 10),
        time: row.proposedTime ?? row.requestedTime ?? '',
      },
    }
  }

  if (action.type === 'close_edit_modal') {
    return { ...state, scheduleEditRow: null }
  }

  if (action.type === 'set_schedule_draft') {
    return { ...state, scheduleEditDraft: action.payload }
  }

  return state
}

export function useServiceScheduleMutations({ locale, mutateServiceRows }: UseServiceScheduleMutationsArgs) {
  const { formatDate } = useAccountFormatters(locale)

  const [state, dispatch] = useReducer(
    serviceScheduleMutationsReducer,
    INITIAL_SERVICE_SCHEDULE_MUTATIONS_STATE,
  )
  const { sessionSavingId, sessionMessage, scheduleEditRow, scheduleEditDraft } = state

  const formatDateTime = (dateValue: string | null, timeValue?: string | null) => {
    if (!dateValue) return '—'
    const dateLabel = formatDate(dateValue, dateValue)
    return timeValue?.trim() ? `${dateLabel} · ${timeValue}` : dateLabel
  }

  const formatServiceSchedule = (row: ServiceBookingRow) => {
    if (row.appointmentStatus === 'confirmed' || row.appointmentStatus === 'confirmed_by_customer') {
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

  const formatServiceStatus = (row: ServiceBookingRow) => formatServiceStatusLabel(row)

  const canEditSchedule = (row: ServiceBookingRow) =>
    row.appointmentStatus !== 'confirmed' &&
    row.appointmentStatus !== 'confirmed_by_customer' &&
    row.appointmentStatus !== 'alternative_proposed' &&
    !row.proposedDate

  const openScheduleEditModal = (row: ServiceBookingRow) => {
    dispatch({ type: 'open_edit_modal', payload: row })
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
    void mutateServiceRows(
      (prev = []) => prev.map((entry) => (entry.id === rowId ? { ...entry, ...patch } : entry)),
      { revalidate: false },
    )
  }

  const patchSessionSchedule = async (
    row: ServiceBookingRow,
    payloadBody:
      | { action: 'set'; requestedDate: string; requestedTime: string }
      | { action: 'clear' },
  ) => {
    if (sessionSavingId) return false
    dispatch({ type: 'set_saving_id', payload: row.id })
    dispatch({ type: 'set_message', payload: null })
    try {
      await patchServiceSessionSchedule(row.id, payloadBody)
      return true
    } catch (error) {
      dispatch({
        type: 'set_message',
        payload: {
          type: 'error',
          text: toErrorMessage(error, 'Errore di rete durante il salvataggio della data.'),
        },
      })
      return false
    } finally {
      dispatch({ type: 'set_saving_id', payload: null })
    }
  }

  const setScheduleEditDraft: React.Dispatch<React.SetStateAction<ScheduleEditDraft>> = (
    value: ScheduleEditDraft | ((prev: ScheduleEditDraft) => ScheduleEditDraft),
  ) => {
    const next = typeof value === 'function' ? value(scheduleEditDraft) : value
    dispatch({ type: 'set_schedule_draft', payload: next })
  }

  const setScheduleEditRow = (row: ServiceBookingRow | null) => {
    if (!row) {
      dispatch({ type: 'close_edit_modal' })
      return
    }
    dispatch({ type: 'open_edit_modal', payload: row })
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
    dispatch({ type: 'close_edit_modal' })
    dispatch({
      type: 'set_message',
      payload: { type: 'success', text: 'Data aggiornata.' },
    })
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
    dispatch({ type: 'close_edit_modal' })
    dispatch({
      type: 'set_message',
      payload: { type: 'success', text: 'Data rimossa.' },
    })
  }

  return {
    sessionSavingId,
    sessionMessage,
    scheduleEditRow,
    setScheduleEditRow,
    scheduleEditDraft,
    setScheduleEditDraft,
    formatDateTime,
    formatServiceSchedule,
    formatServiceStatus,
    canEditSchedule,
    openScheduleEditModal,
    onSaveScheduleEdit,
    onClearScheduleEdit,
  }
}
