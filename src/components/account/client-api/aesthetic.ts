import type { AestheticFolderDraft } from '../forms/types'

export async function fetchAestheticDraft() {
  const response = await fetch('/api/account/aesthetic-folder', {
    method: 'GET',
    credentials: 'include',
  })
  const data = (await response.json().catch(() => ({}))) as { draft?: AestheticFolderDraft }
  return { response, data }
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
  const data = (await response.json().catch(() => ({}))) as { error?: string }
  return { response, data }
}

