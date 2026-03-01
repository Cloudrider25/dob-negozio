type UpdateProfileDraft = {
  firstName: string
  lastName: string
  phone: string
}

export async function updateUserProfile(userId: number, draft: UpdateProfileDraft) {
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

  const data = (await response.json().catch(() => ({}))) as {
    message?: string
    errors?: Array<{ message?: string }>
  }

  return { response, data }
}

