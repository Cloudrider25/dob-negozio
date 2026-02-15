import { getPayload } from 'payload'
import config from '../payload.config'
import { seedRoutineBuilder } from './fill-routine-builder'

type RelationValue = number | string | { id?: number | string } | null | undefined

const normalizeId = (value: RelationValue): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value)
  }
  if (value && typeof value === 'object' && 'id' in value) {
    return normalizeId(value.id ?? null)
  }
  return null
}

const toIdArray = (values?: RelationValue[]) =>
  (values ?? [])
    .map((value) => normalizeId(value))
    .filter((value): value is number => typeof value === 'number')

const getLocalizedString = (value: unknown, locale = 'it'): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const localized = value as Record<string, unknown>
    const preferred = localized[locale]
    if (typeof preferred === 'string') return preferred
    const fallback = Object.values(localized).find((item) => typeof item === 'string')
    if (typeof fallback === 'string') return fallback
  }
  return ''
}

const classifyTiming = (text: string) => {
  const lower = text.toLowerCase()
  const isSolare = ['spf', 'solare', 'sun', 'uv', 'sunscreen', 'protezione'].some((token) =>
    lower.includes(token),
  )
  const isMorning = ['giorno', 'day', 'mattina', 'mattutina'].some((token) => lower.includes(token))
  const isNight = ['notte', 'night', 'sera', 'serale'].some((token) => lower.includes(token))
  const isTreatment = ['trattamento', 'booster', 'fiala', 'ampolla', 'peel', 'scrub', 'maschera', 'mask'].some(
    (token) => lower.includes(token),
  )

  if (isSolare) return { slugs: ['solare'], reason: 'keyword: solare/spf' }
  if (isMorning || isNight) {
    return {
      slugs: [isMorning ? 'mattutina' : null, isNight ? 'serale' : null].filter(
        (value): value is string => Boolean(value),
      ),
      reason: 'keyword: mattina/sera',
    }
  }
  if (isTreatment) return { slugs: ['trattamento-mirato'], reason: 'keyword: trattamento' }
  return { slugs: ['mattutina', 'serale'], reason: 'default: AM+PM' }
}

const payload = await getPayload({ config })
const locale = 'it' as const

const desiredTimings = [
  { slug: 'mattutina', name: 'Mattutina' },
  { slug: 'serale', name: 'Serale' },
  { slug: 'trattamento-mirato', name: 'Trattamento mirato' },
  { slug: 'solare', name: 'Solare' },
]

const timings = await payload.find({
  collection: 'timing-products',
  depth: 0,
  limit: 200,
  overrideAccess: true,
  locale,
})

const timingBySlug = new Map(timings.docs.map((timing) => [timing.slug, timing]))

for (const timing of desiredTimings) {
  const existing = timingBySlug.get(timing.slug)
  if (existing) {
    const currentName = getLocalizedString(existing.name, locale)
    if (currentName !== timing.name) {
      await payload.update({
        collection: 'timing-products',
        id: existing.id,
        locale,
        overrideAccess: true,
        data: { name: timing.name },
      })
    }
  } else {
    const created = await payload.create({
      collection: 'timing-products',
      locale,
      overrideAccess: true,
      data: {
        name: timing.name,
        slug: timing.slug,
      },
    })
    timingBySlug.set(timing.slug, created)
  }
}

const legacyTiming = timingBySlug.get('giornaliera-am-pm')

if (legacyTiming) {
  const legacyId = legacyTiming.id
  const timingIdMap = new Map(
    Array.from(timingBySlug.entries()).map(([slug, timing]) => [slug, timing.id]),
  )

  let page = 1
  let processed = 0

  while (true) {
    const result = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 100,
      page,
      overrideAccess: true,
      where: {
        timingProducts: { contains: legacyId },
      },
    })

    for (const product of result.docs) {
      const title = getLocalizedString(product.title, locale)
      const slug = typeof product.slug === 'string' ? product.slug : ''
      const text = `${slug} ${title}`.trim()
      const existingTimingIds = toIdArray((product.timingProducts ?? []) as RelationValue[])
      const filteredTimingIds = existingTimingIds.filter((id) => id !== legacyId)
      const classification = classifyTiming(text)
      const newTimingIds = classification.slugs
        .map((timingSlug) => timingIdMap.get(timingSlug))
        .filter((id): id is number => typeof id === 'number')

      const finalTimingIds = Array.from(new Set([...filteredTimingIds, ...newTimingIds]))
      await payload.update({
        collection: 'products',
        id: product.id,
        overrideAccess: true,
        data: {
          timingProducts: finalTimingIds,
        },
      })
      processed += 1
    }

    if (!result.hasNextPage) break
    page += 1
  }

  const legacyTemplates = await payload.find({
    collection: 'routine-templates',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: { timing: { equals: legacyId } },
  })

  for (const template of legacyTemplates.docs) {
    const templateId = template.id
    const stepProducts = await payload.find({
      collection: 'routine-template-step-products',
      depth: 0,
      limit: 2000,
      overrideAccess: true,
      where: { routineTemplate: { equals: templateId } },
    })
    for (const doc of stepProducts.docs) {
      await payload.delete({
        collection: 'routine-template-step-products',
        id: doc.id,
        overrideAccess: true,
      })
    }

    const steps = await payload.find({
      collection: 'routine-template-steps',
      depth: 0,
      limit: 2000,
      overrideAccess: true,
      where: { routineTemplate: { equals: templateId } },
    })
    for (const doc of steps.docs) {
      await payload.delete({
        collection: 'routine-template-steps',
        id: doc.id,
        overrideAccess: true,
      })
    }

    await payload.delete({
      collection: 'routine-templates',
      id: templateId,
      overrideAccess: true,
    })
  }

  await payload.delete({
    collection: 'timing-products',
    id: legacyId,
    overrideAccess: true,
  })

  console.log(`Reassigned ${processed} products from giornaliera-am-pm.`)
}

await seedRoutineBuilder(payload)
console.log('Timing products updated and routine builder reseeded.')
