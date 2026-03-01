import { ApiClientError, parseApiError } from './parseApiError'

type UpdateProfileDraft = {
  firstName: string
  lastName: string
  phone: string
}

export type ProfileDraft = UpdateProfileDraft

type UserProfileResponse = {
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
}

export async function fetchUserProfile(userId: number): Promise<ProfileDraft> {
  const response = await fetch(`/api/users/${userId}?depth=0`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await parseApiError(response, 'Impossibile caricare il profilo utente.')
    throw new ApiClientError(message, response.status)
  }

  const data = (await response.json().catch(() => ({}))) as UserProfileResponse

  return {
    firstName: data.firstName?.trim() || '',
    lastName: data.lastName?.trim() || '',
    phone: data.phone?.trim() || '',
  }
}

export async function updateUserProfile(userId: number, draft: UpdateProfileDraft): Promise<ProfileDraft> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      phone: draft.phone.trim(),
    }),
  })

  if (!response.ok) {
    const message = await parseApiError(response, 'Impossibile aggiornare il profilo utente.')
    throw new ApiClientError(message, response.status)
  }

  const data = (await response.json().catch(() => ({}))) as UserProfileResponse

  return {
    firstName: data.firstName?.trim() || draft.firstName.trim(),
    lastName: data.lastName?.trim() || draft.lastName.trim(),
    phone: data.phone?.trim() || draft.phone.trim(),
  }
}
