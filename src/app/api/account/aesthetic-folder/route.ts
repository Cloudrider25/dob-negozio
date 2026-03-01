import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { ensureAnagraficaForCustomer } from '@/lib/anagrafiche/ensureAnagraficaForCustomer'

type AestheticFolderPayload = {
  lastAssessmentDate: string
  skinType: string
  skinSensitivity: string
  fitzpatrick: string
  hydrationLevel: string
  sebumLevel: string
  elasticityLevel: string
  acneTendency: boolean
  rosaceaTendency: boolean
  hyperpigmentationTendency: boolean
  allergies: string
  contraindications: string
  medications: string
  pregnancyOrBreastfeeding: string
  homeCareRoutine: string
  treatmentGoals: string
  estheticianNotes: string
  serviceRecommendations: string
  productRecommendations: string
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const asNullableNumber = (value: unknown) => {
  const parsed = Number(asString(value))
  return Number.isFinite(parsed) ? parsed : null
}
const asBoolean = (value: unknown) => value === true
const asSkinType = (value: string): 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive' | undefined =>
  ['normal', 'dry', 'oily', 'combination', 'sensitive'].includes(value)
    ? (value as 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive')
    : undefined
const asSkinSensitivity = (value: string): 'low' | 'medium' | 'high' | undefined =>
  ['low', 'medium', 'high'].includes(value) ? (value as 'low' | 'medium' | 'high') : undefined
const asFitzpatrick = (value: string): 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | undefined =>
  ['I', 'II', 'III', 'IV', 'V', 'VI'].includes(value)
    ? (value as 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI')
    : undefined
const asPregnancyState = (value: string): 'no' | 'pregnancy' | 'breastfeeding' | undefined =>
  ['no', 'pregnancy', 'breastfeeding'].includes(value)
    ? (value as 'no' | 'pregnancy' | 'breastfeeding')
    : undefined

const emptyDraft: AestheticFolderPayload = {
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

const mapRowToDraft = (row: Record<string, unknown>): AestheticFolderPayload => ({
  lastAssessmentDate:
    typeof row.lastAssessmentDate === 'string' && row.lastAssessmentDate.length > 0
      ? row.lastAssessmentDate.slice(0, 10)
      : '',
  skinType: asString(row.skinType),
  skinSensitivity: asString(row.skinSensitivity),
  fitzpatrick: asString(row.fitzpatrick),
  hydrationLevel: row.hydrationLevel == null ? '' : String(row.hydrationLevel),
  sebumLevel: row.sebumLevel == null ? '' : String(row.sebumLevel),
  elasticityLevel: row.elasticityLevel == null ? '' : String(row.elasticityLevel),
  acneTendency: row.acneTendency === true,
  rosaceaTendency: row.rosaceaTendency === true,
  hyperpigmentationTendency: row.hyperpigmentationTendency === true,
  allergies: asString(row.allergies),
  contraindications: asString(row.contraindications),
  medications: asString(row.medications),
  pregnancyOrBreastfeeding: asString(row.pregnancyOrBreastfeeding),
  homeCareRoutine: asString(row.homeCareRoutine),
  treatmentGoals: asString(row.treatmentGoals),
  estheticianNotes: asString(row.estheticianNotes),
  serviceRecommendations: asString(row.serviceRecommendations),
  productRecommendations: asString(row.productRecommendations),
})

async function getAuthenticatedUser(request: Request) {
  const payload = await getPayloadClient()
  const authResult = await payload.auth({ headers: request.headers })
  const user = authResult?.user && typeof authResult.user === 'object' ? authResult.user : null
  const rawId = user && 'id' in user ? (user as { id?: unknown }).id : null
  const userId = typeof rawId === 'number' ? rawId : typeof rawId === 'string' ? Number(rawId) : NaN
  return { payload, user, userId: Number.isFinite(userId) ? userId : null }
}

async function syncAestheticToAnagrafica(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  user: Record<string, unknown>,
  userId: number,
  data: {
    lastAssessmentDate: string | null
    skinType: string
    skinSensitivity: string
    fitzpatrick: string
    hydrationLevel: number | null
    sebumLevel: number | null
    elasticityLevel: number | null
    acneTendency: boolean
    rosaceaTendency: boolean
    hyperpigmentationTendency: boolean
    allergies: string
    contraindications: string
    medications: string
    pregnancyOrBreastfeeding: string
    homeCareRoutine: string
    treatmentGoals: string
    estheticianNotes: string
    serviceRecommendations: string
    productRecommendations: string
  },
) {
  await ensureAnagraficaForCustomer(payload, user as any)

  const existingAnagrafica = await payload.find({
    collection: 'anagrafiche',
    depth: 0,
    limit: 1,
    where: {
      customer: {
        equals: userId,
      },
    },
    overrideAccess: true,
  })

  const anagraficaData = {
    lastAssessmentDate: data.lastAssessmentDate,
    skinType: asSkinType(data.skinType),
    skinSensitivity: asSkinSensitivity(data.skinSensitivity),
    fitzpatrick: asFitzpatrick(data.fitzpatrick),
    hydrationLevel: data.hydrationLevel,
    sebumLevel: data.sebumLevel,
    elasticityLevel: data.elasticityLevel,
    acneTendency: data.acneTendency,
    rosaceaTendency: data.rosaceaTendency,
    hyperpigmentationTendency: data.hyperpigmentationTendency,
    allergies: data.allergies || undefined,
    contraindications: data.contraindications || undefined,
    medications: data.medications || undefined,
    pregnancyOrBreastfeeding: asPregnancyState(data.pregnancyOrBreastfeeding),
    homeCareRoutine: data.homeCareRoutine || undefined,
    treatmentGoals: data.treatmentGoals || undefined,
    estheticianNotes: data.estheticianNotes || undefined,
    serviceRecommendations: data.serviceRecommendations || undefined,
    productRecommendations: data.productRecommendations || undefined,
  }

  if (existingAnagrafica.docs.length > 0) {
    await payload.update({
      collection: 'anagrafiche',
      id: existingAnagrafica.docs[0].id,
      data: anagraficaData,
      overrideAccess: true,
      context: { skipUserWriteThrough: true },
    })
    return
  }

  await payload.create({
    collection: 'anagrafiche',
    data: {
      customer: userId,
      ...anagraficaData,
    },
    overrideAccess: true,
    context: { skipUserWriteThrough: true },
  })
}

export async function GET(request: Request) {
  const { payload, user, userId } = await getAuthenticatedUser(request)

  if (!userId || !user) {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const result = await payload.find({
    collection: 'account-aesthetic-profiles',
    depth: 0,
    limit: 1,
    where: {
      user: {
        equals: userId,
      },
    },
    user,
    overrideAccess: false,
  })

  const draft =
    result.docs.length > 0
      ? mapRowToDraft(result.docs[0] as unknown as Record<string, unknown>)
      : emptyDraft

  return NextResponse.json({ draft })
}

export async function PATCH(request: Request) {
  const { payload, user, userId } = await getAuthenticatedUser(request)

  if (!userId || !user) {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as Partial<AestheticFolderPayload>

  const lastAssessmentDate = asString(body.lastAssessmentDate)

  if (lastAssessmentDate && Number.isNaN(new Date(lastAssessmentDate).getTime())) {
    return NextResponse.json({ error: 'Data valutazione non valida.' }, { status: 400 })
  }
  const lastAssessmentIso = lastAssessmentDate ? new Date(lastAssessmentDate).toISOString() : null

  const existing = await payload.find({
    collection: 'account-aesthetic-profiles',
    depth: 0,
    limit: 1,
    where: {
      user: {
        equals: userId,
      },
    },
    user,
    overrideAccess: false,
  })

  const data = {
    user: userId,
    lastAssessmentDate: lastAssessmentIso,
    skinType: asString(body.skinType),
    skinSensitivity: asString(body.skinSensitivity),
    fitzpatrick: asString(body.fitzpatrick),
    hydrationLevel: asNullableNumber(body.hydrationLevel),
    sebumLevel: asNullableNumber(body.sebumLevel),
    elasticityLevel: asNullableNumber(body.elasticityLevel),
    acneTendency: asBoolean(body.acneTendency),
    rosaceaTendency: asBoolean(body.rosaceaTendency),
    hyperpigmentationTendency: asBoolean(body.hyperpigmentationTendency),
    allergies: asString(body.allergies),
    contraindications: asString(body.contraindications),
    medications: asString(body.medications),
    pregnancyOrBreastfeeding: asString(body.pregnancyOrBreastfeeding),
    homeCareRoutine: asString(body.homeCareRoutine),
    treatmentGoals: asString(body.treatmentGoals),
    estheticianNotes: asString(body.estheticianNotes),
    serviceRecommendations: asString(body.serviceRecommendations),
    productRecommendations: asString(body.productRecommendations),
  }

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'account-aesthetic-profiles',
      id: existing.docs[0].id,
      data,
      user,
      overrideAccess: false,
    })
  } else {
    await payload.create({
      collection: 'account-aesthetic-profiles',
      data,
      user,
      overrideAccess: false,
    })
  }

  await syncAestheticToAnagrafica(payload, user as unknown as Record<string, unknown>, userId, data)

  return NextResponse.json({ ok: true })
}
