import { ApiClientError, parseApiError } from './parseApiError'
import type { ServiceBookingRow } from '../types'

type SessionSchedulePayload =
  | { action: 'set'; requestedDate: string; requestedTime: string }
  | { action: 'clear' }

export async function patchServiceSessionSchedule(rowId: string, payloadBody: SessionSchedulePayload) {
  const response = await fetch(`/api/account/service-sessions/${rowId}/request-date`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payloadBody),
  })
  if (!response.ok) {
    const message = await parseApiError(response, 'Impossibile salvare la data richiesta.')
    throw new ApiClientError(message, response.status)
  }
}

export async function fetchAccountServiceRows(): Promise<ServiceBookingRow[]> {
  const response = await fetch('/api/account/service-sessions', {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await parseApiError(response, 'Impossibile caricare le prenotazioni servizi.')
    throw new ApiClientError(message, response.status)
  }

  const data = (await response.json().catch(() => ({}))) as { docs?: ServiceBookingRow[] }
  return Array.isArray(data.docs) ? data.docs : []
}
