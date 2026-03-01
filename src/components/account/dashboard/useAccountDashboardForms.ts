'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'

import { fetchAestheticDraft, saveAestheticDraft } from '../client-api/aesthetic'
import { toErrorMessage } from '../client-api/parseApiError'
import {
  fetchUserProfile,
  type ProfileDraft,
  updateUserProfile,
} from '../client-api/profile'
import type { AestheticFolderDraft, FormMessage } from '../forms/types'

const INITIAL_AESTHETIC_DRAFT: AestheticFolderDraft = {
  lastAssessmentDate: '',
  skinType: '',
  skinSensitivity: '',
  fitzpatrick: '',
  hydrationLevel: '',
  sebumLevel: '',
  elasticityLevel: '',
  acneTendency: false,
  rosaceaTendency: false,
  hyperpigmentationTendency: false,
  allergies: '',
  contraindications: '',
  medications: '',
  pregnancyOrBreastfeeding: '',
  homeCareRoutine: '',
  treatmentGoals: '',
  estheticianNotes: '',
  serviceRecommendations: '',
  productRecommendations: '',
}

type ProfileFormArgs = {
  userId: number
  initial: ProfileDraft
  messages: {
    saveError: string
    saved: string
    networkError: string
  }
}

export function useAccountProfileForm({ userId, initial, messages }: ProfileFormArgs) {
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<FormMessage | null>(null)

  const { data: profileData = initial, mutate: mutateProfile } = useSWR(
    `account:profile:${userId}`,
    () => fetchUserProfile(userId),
    {
      fallbackData: initial,
      revalidateOnFocus: false,
      errorRetryCount: 1,
      dedupingInterval: 60_000,
    },
  )

  useEffect(() => {
    setDraft(profileData)
  }, [profileData])

  const onSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return

    setSaving(true)
    setMessage(null)

    const nextDraft: ProfileDraft = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      phone: draft.phone.trim(),
    }

    const previousProfile = profileData
    await mutateProfile(nextDraft, { revalidate: false })

    try {
      const saved = await updateUserProfile(userId, nextDraft)
      await mutateProfile(saved, { revalidate: false })
      setMessage({ type: 'success', text: messages.saved })
    } catch (error) {
      await mutateProfile(previousProfile, { revalidate: false })
      setMessage({
        type: 'error',
        text: toErrorMessage(error, messages.networkError || messages.saveError),
      })
    } finally {
      setSaving(false)
    }
  }

  return { draft, setDraft, saving, message, onSave }
}

export function useAccountAestheticForm() {
  const [draft, setDraft] = useState<AestheticFolderDraft>(INITIAL_AESTHETIC_DRAFT)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<FormMessage | null>(null)

  const {
    data: serverDraft = INITIAL_AESTHETIC_DRAFT,
    mutate: mutateAesthetic,
  } = useSWR('account:aesthetic-folder', async () => fetchAestheticDraft().then((data) => data ?? INITIAL_AESTHETIC_DRAFT), {
    fallbackData: INITIAL_AESTHETIC_DRAFT,
    revalidateOnFocus: false,
    errorRetryCount: 1,
    dedupingInterval: 60_000,
  })

  useEffect(() => {
    setDraft(serverDraft)
  }, [serverDraft])

  const onSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return

    setSaving(true)
    setMessage(null)

    const previousDraft = serverDraft
    await mutateAesthetic(draft, { revalidate: false })

    try {
      const saved = await saveAestheticDraft(draft)
      await mutateAesthetic(saved, { revalidate: false })
      setMessage({ type: 'success', text: 'Cartella estetica salvata.' })
    } catch (error) {
      await mutateAesthetic(previousDraft, { revalidate: false })
      setMessage({
        type: 'error',
        text: toErrorMessage(error, 'Errore di rete durante il salvataggio della cartella estetica.'),
      })
    } finally {
      setSaving(false)
    }
  }

  return { draft, setDraft, saving, message, onSave }
}
