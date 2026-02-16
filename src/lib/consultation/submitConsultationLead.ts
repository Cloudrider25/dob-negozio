import type { ConsultationLeadInput } from '@/lib/consultation/types'

type ConsultationLeadResponse = {
  ok?: boolean
  error?: string
}

export const submitConsultationLead = async (payload: ConsultationLeadInput) => {
  const response = await fetch('/api/consultation-leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = 'Unable to submit consultation request.'
    try {
      const data = (await response.json()) as ConsultationLeadResponse
      if (typeof data?.error === 'string' && data.error.trim().length > 0) {
        message = data.error
      }
    } catch {
      // Keep fallback message when response is not JSON.
    }
    throw new Error(message)
  }
}
