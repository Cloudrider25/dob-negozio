import type { AestheticFolderDraft } from '../forms/types'
import { ApiClientError, parseApiError } from './parseApiError'

export async function fetchAestheticDraft() {
  const response = await fetch('/api/account/aesthetic-folder', {
    method: 'GET',
    credentials: 'include',
  })
  if (!response.ok) {
    const message = await parseApiError(response, 'Impossibile caricare la cartella estetica.')
    throw new ApiClientError(message, response.status)
  }

  const data = (await response.json().catch(() => ({}))) as { draft?: AestheticFolderDraft }
  return data.draft ?? null
}

export async function saveAestheticDraft(draft: AestheticFolderDraft) {
  const response = await fetch('/api/account/aesthetic-folder', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(draft),
  })
  if (!response.ok) {
    const message = await parseApiError(response, 'Errore durante il salvataggio della cartella estetica.')
    throw new ApiClientError(message, response.status)
  }

  const data = (await response.json().catch(() => ({}))) as { draft?: AestheticFolderDraft }
  return data.draft ?? draft
}
