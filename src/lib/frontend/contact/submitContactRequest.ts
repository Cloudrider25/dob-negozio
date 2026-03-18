import type { ContactRequestInput } from '@/lib/shared/contact/types'

type ContactRequestResponse = {
  ok?: boolean
  error?: string
}

export const submitContactRequest = async (payload: ContactRequestInput) => {
  const formData = new FormData()
  formData.set('firstName', payload.firstName)
  formData.set('lastName', payload.lastName)
  formData.set('email', payload.email)
  formData.set('contactReason', payload.contactReason)
  formData.set('topic', payload.topic)
  formData.set('message', payload.message)

  for (const file of payload.attachments ?? []) {
    formData.append('attachments', file)
  }

  const response = await fetch('/api/contact-requests', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let message = 'Unable to submit contact request.'
    try {
      const data = (await response.json()) as ContactRequestResponse
      if (typeof data?.error === 'string' && data.error.trim().length > 0) {
        message = data.error
      }
    } catch {
      // Keep fallback message when response is not JSON.
    }
    throw new Error(message)
  }
}
