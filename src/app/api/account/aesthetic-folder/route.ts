import { NextResponse } from 'next/server'
import { sql } from '@payloadcms/db-postgres'

import { getPayloadClient } from '@/lib/getPayloadClient'

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
    typeof row.last_assessment_date === 'string' && row.last_assessment_date.length > 0
      ? row.last_assessment_date.slice(0, 10)
      : '',
  skinType: asString(row.skin_type),
  skinSensitivity: asString(row.skin_sensitivity),
  fitzpatrick: asString(row.fitzpatrick),
  hydrationLevel: row.hydration_level == null ? '' : String(row.hydration_level),
  sebumLevel: row.sebum_level == null ? '' : String(row.sebum_level),
  elasticityLevel: row.elasticity_level == null ? '' : String(row.elasticity_level),
  acneTendency: row.acne_tendency === true,
  rosaceaTendency: row.rosacea_tendency === true,
  hyperpigmentationTendency: row.hyperpigmentation_tendency === true,
  allergies: asString(row.allergies),
  contraindications: asString(row.contraindications),
  medications: asString(row.medications),
  pregnancyOrBreastfeeding: asString(row.pregnancy_or_breastfeeding),
  homeCareRoutine: asString(row.home_care_routine),
  treatmentGoals: asString(row.treatment_goals),
  estheticianNotes: asString(row.esthetician_notes),
  serviceRecommendations: asString(row.service_recommendations),
  productRecommendations: asString(row.product_recommendations),
})

async function getAuthenticatedUser(request: Request) {
  const payload = await getPayloadClient()
  const authResult = await payload.auth({ headers: request.headers })
  const user = authResult?.user && typeof authResult.user === 'object' ? authResult.user : null
  const rawId = user && 'id' in user ? (user as { id?: unknown }).id : null
  const userId = typeof rawId === 'number' ? rawId : typeof rawId === 'string' ? Number(rawId) : NaN
  return { payload, userId: Number.isFinite(userId) ? userId : null }
}

export async function GET(request: Request) {
  const { payload, userId } = await getAuthenticatedUser(request)

  if (!userId) {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const result = await payload.db.drizzle.execute(sql`
    SELECT
      last_assessment_date,
      skin_type,
      skin_sensitivity,
      fitzpatrick,
      hydration_level,
      sebum_level,
      elasticity_level,
      acne_tendency,
      rosacea_tendency,
      hyperpigmentation_tendency,
      allergies,
      contraindications,
      medications,
      pregnancy_or_breastfeeding,
      home_care_routine,
      treatment_goals,
      esthetician_notes,
      service_recommendations,
      product_recommendations
    FROM account_aesthetic_profiles
    WHERE user_id = ${userId}
    LIMIT 1
  `)

  const rows = (result as { rows?: Array<Record<string, unknown>> }).rows ?? []
  const draft = rows.length > 0 ? mapRowToDraft(rows[0]) : emptyDraft

  return NextResponse.json({ draft })
}

export async function PATCH(request: Request) {
  const { payload, userId } = await getAuthenticatedUser(request)

  if (!userId) {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as Partial<AestheticFolderPayload>

  const lastAssessmentDate = asString(body.lastAssessmentDate)

  if (lastAssessmentDate && Number.isNaN(new Date(lastAssessmentDate).getTime())) {
    return NextResponse.json({ error: 'Data valutazione non valida.' }, { status: 400 })
  }
  const lastAssessmentIso = lastAssessmentDate ? new Date(lastAssessmentDate).toISOString() : null

  await payload.db.drizzle.execute(sql`
    INSERT INTO account_aesthetic_profiles (
      user_id,
      last_assessment_date,
      skin_type,
      skin_sensitivity,
      fitzpatrick,
      hydration_level,
      sebum_level,
      elasticity_level,
      acne_tendency,
      rosacea_tendency,
      hyperpigmentation_tendency,
      allergies,
      contraindications,
      medications,
      pregnancy_or_breastfeeding,
      home_care_routine,
      treatment_goals,
      esthetician_notes,
      service_recommendations,
      product_recommendations,
      updated_at
    ) VALUES (
      ${userId},
      ${lastAssessmentIso},
      ${asString(body.skinType)},
      ${asString(body.skinSensitivity)},
      ${asString(body.fitzpatrick)},
      ${asNullableNumber(body.hydrationLevel)},
      ${asNullableNumber(body.sebumLevel)},
      ${asNullableNumber(body.elasticityLevel)},
      ${asBoolean(body.acneTendency)},
      ${asBoolean(body.rosaceaTendency)},
      ${asBoolean(body.hyperpigmentationTendency)},
      ${asString(body.allergies)},
      ${asString(body.contraindications)},
      ${asString(body.medications)},
      ${asString(body.pregnancyOrBreastfeeding)},
      ${asString(body.homeCareRoutine)},
      ${asString(body.treatmentGoals)},
      ${asString(body.estheticianNotes)},
      ${asString(body.serviceRecommendations)},
      ${asString(body.productRecommendations)},
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      last_assessment_date = EXCLUDED.last_assessment_date,
      skin_type = EXCLUDED.skin_type,
      skin_sensitivity = EXCLUDED.skin_sensitivity,
      fitzpatrick = EXCLUDED.fitzpatrick,
      hydration_level = EXCLUDED.hydration_level,
      sebum_level = EXCLUDED.sebum_level,
      elasticity_level = EXCLUDED.elasticity_level,
      acne_tendency = EXCLUDED.acne_tendency,
      rosacea_tendency = EXCLUDED.rosacea_tendency,
      hyperpigmentation_tendency = EXCLUDED.hyperpigmentation_tendency,
      allergies = EXCLUDED.allergies,
      contraindications = EXCLUDED.contraindications,
      medications = EXCLUDED.medications,
      pregnancy_or_breastfeeding = EXCLUDED.pregnancy_or_breastfeeding,
      home_care_routine = EXCLUDED.home_care_routine,
      treatment_goals = EXCLUDED.treatment_goals,
      esthetician_notes = EXCLUDED.esthetician_notes,
      service_recommendations = EXCLUDED.service_recommendations,
      product_recommendations = EXCLUDED.product_recommendations,
      updated_at = now()
  `)

  return NextResponse.json({ ok: true })
}
