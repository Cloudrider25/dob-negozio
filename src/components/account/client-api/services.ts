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
  const data = (await response.json().catch(() => ({}))) as { error?: string }
  return { response, data }
}

