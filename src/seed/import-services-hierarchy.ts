import 'dotenv/config'

import fs from 'fs'
import path from 'path'

import { getPayload, type Payload } from 'payload'

import configPromise from '../payload.config'

const rootDir = process.cwd()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const parseCSV = (filePath: string) => {
  const raw = fs.readFileSync(filePath, 'utf-8').trim()
  if (!raw) return []
  const [headerLine, ...lines] = raw.split(/\r?\n/)
  const headers = headerLine.split(',').map((h) => h.trim())
  return lines
    .filter(Boolean)
    .map((line) => {
      const values = line.split(',').map((value) => value.trim())
      return headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = values[index] ?? ''
        return acc
      }, {})
    })
}

const parseBoolean = (value: string) => value.toLowerCase() === 'true'

const parseNumber = (value: string) => {
  if (!value) return null
  const parsed = Number.parseFloat(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

const toRelationId = (value?: string) => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const readId = (value: unknown) => {
  if (!value || typeof value !== 'object') return ''
  const id = (value as { id?: unknown }).id
  if (typeof id === 'string' || typeof id === 'number') return String(id)
  return ''
}

const readSlug = (value: unknown) => {
  if (!value || typeof value !== 'object') return ''
  const slug = (value as { slug?: unknown }).slug
  return typeof slug === 'string' ? slug : ''
}

const mapServiceType = (value: string) => {
  const cleaned = value.trim().toLowerCase()
  if (cleaned === 'pacchetto') return 'package'
  return 'single'
}

const ensureRelationEntry = (
  entries: Array<{ relationTo: string; value: string | number }>,
  relationTo: string,
  value: string | number,
) => {
  if (!entries.some((entry) => entry.relationTo === relationTo && String(entry.value) === String(value))) {
    entries.push({ relationTo, value })
  }
}

const runImport = async (payload: Payload) => {
  const pFind = (args: unknown) => payload.find(args as never)
  const pUpdate = (args: unknown) => payload.update(args as never)
  const pCreate = (args: unknown) => payload.create(args as never)
  const pFindByID = (args: unknown) => payload.findByID(args as never)

  const locale = 'it'

  const servicesPath = path.resolve(rootDir, 'services_with_id.csv')
  const intentsPath = path.resolve(rootDir, 'intents.csv')
  const zonesPath = path.resolve(rootDir, 'zones.csv')
  const serviceIntentPath = path.resolve(rootDir, 'service_intent.csv')

  const servicesRows = parseCSV(servicesPath)
  const intentsRows = parseCSV(intentsPath)
  const zonesRows = parseCSV(zonesPath)
  const serviceIntentRows = parseCSV(serviceIntentPath)

  fs.writeFileSync(
    path.resolve(rootDir, 'Docs/import-services-hierarchy.log'),
    JSON.stringify(
      {
        ts: new Date().toISOString(),
        rows: {
          services: servicesRows.length,
          intents: intentsRows.length,
          zones: zonesRows.length,
          serviceIntents: serviceIntentRows.length,
        },
      },
      null,
      2,
    ),
  )

  console.log('CSV rows:', {
    services: servicesRows.length,
    intents: intentsRows.length,
    zones: zonesRows.length,
    serviceIntents: serviceIntentRows.length,
  })

  const intentByCode = new Map<string, string>()
  const zoneByCode = new Map<string, string>()

  for (const row of intentsRows) {
    const code = row.intent_code
    if (!code) continue
    const existing = await pFind({
      collection: 'intents',
      where: { code: { equals: code } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      locale,
    })
    const data = {
      code,
      label: row.label_it || code,
      description: row.description_it || undefined,
    }
    if (existing.docs.length) {
      const updated = await pUpdate({
        collection: 'intents',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
        locale,
      })
      intentByCode.set(code, readId(updated))
    } else {
      const created = await pCreate({
        collection: 'intents',
        data,
        overrideAccess: true,
        locale,
      })
      intentByCode.set(code, readId(created))
    }
  }

  for (const row of zonesRows) {
    const code = row.zone_code
    if (!code) continue
    const existing = await pFind({
      collection: 'zones',
      where: { code: { equals: code } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      locale,
    })
    const data = {
      code,
      label: row.label_it || code,
    }
    if (existing.docs.length) {
      const updated = await pUpdate({
        collection: 'zones',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
        locale,
      })
      zoneByCode.set(code, readId(updated))
    } else {
      const created = await pCreate({
        collection: 'zones',
        data,
        overrideAccess: true,
        locale,
      })
      zoneByCode.set(code, readId(created))
    }
  }

  console.log('Loaded intents:', intentByCode.size, 'zones:', zoneByCode.size)

  const serviceIntentMap = new Map<string, { intent: string; zone: string; gender: string }>()
  for (const row of serviceIntentRows) {
    if (!row.service_id) continue
    serviceIntentMap.set(row.service_id, {
      intent: row.intent_code,
      zone: row.zone_code,
      gender: row.gender,
    })
  }

  const areaMap = new Map<string, string>()
  const objectiveMap = new Map<string, string>()
  const treatmentMap = new Map<string, string>()

  for (const row of servicesRows) {
    const areaName = row.area?.trim()
    const objectiveName = row.objective?.trim()
    const treatmentName = row.treatment?.trim()

    if (!areaName || !objectiveName || !treatmentName) continue

    let areaId = areaMap.get(areaName)
    if (!areaId) {
      const existing = await pFind({
        collection: 'areas',
        where: { name: { equals: areaName } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        locale,
      })
      if (existing.docs.length) {
        areaId = String(existing.docs[0].id)
      } else {
        const created = await pCreate({
          collection: 'areas',
          data: {
            name: areaName,
            slug: slugify(areaName),
          },
          overrideAccess: true,
          locale,
        })
        areaId = readId(created)
      }
      areaMap.set(areaName, areaId)
    }

    const objectiveKey = `${areaName}::${objectiveName}`
    let objectiveId = objectiveMap.get(objectiveKey)
    if (!objectiveId) {
      const existing = await pFind({
        collection: 'objectives',
        where: {
          and: [{ boxName: { equals: objectiveName } }, { area: { equals: toRelationId(areaId) } }],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        locale,
      })
      if (existing.docs.length) {
        objectiveId = String(existing.docs[0].id)
      } else {
        const created = await pCreate({
          collection: 'objectives',
          data: {
            boxName: objectiveName,
            slug: slugify(`${areaName}-${objectiveName}`),
            area: toRelationId(areaId),
          },
          overrideAccess: true,
          locale,
        })
        objectiveId = readId(created)
      }
      objectiveMap.set(objectiveKey, objectiveId)
    }

    let treatmentId = treatmentMap.get(treatmentName)
    if (!treatmentId) {
      const existing = await pFind({
        collection: 'treatments',
        where: { boxName: { equals: treatmentName } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        locale,
      })
      if (existing.docs.length) {
        treatmentId = String(existing.docs[0].id)
      } else {
        const created = await pCreate({
          collection: 'treatments',
          data: {
            boxName: treatmentName,
            slug: slugify(treatmentName),
            reference: [
              { relationTo: 'areas', value: toRelationId(areaId) ?? areaId },
              { relationTo: 'objectives', value: toRelationId(objectiveId) ?? objectiveId },
            ],
            active: true,
          },
          overrideAccess: true,
          locale,
        })
        treatmentId = readId(created)
      }
      treatmentMap.set(treatmentName, treatmentId)
    }

    const treatmentDoc = await pFindByID({
      collection: 'treatments',
      id: treatmentId,
      depth: 0,
      overrideAccess: true,
      locale,
    })
    const treatmentWithRefs = treatmentDoc as {
      reference?: Array<{ relationTo: string; value: string | number }>
    }
    const references = treatmentWithRefs.reference || []
    ensureRelationEntry(references, 'areas', toRelationId(areaId) ?? areaId)
    ensureRelationEntry(references, 'objectives', toRelationId(objectiveId) ?? objectiveId)

    await pUpdate({
      collection: 'treatments',
      id: treatmentId,
      data: { reference: references },
      overrideAccess: true,
      locale,
    })
  }

  for (const row of servicesRows) {
    const serviceId = row.service_id?.trim()
    if (!serviceId) continue

    const intentPayload = serviceIntentMap.get(serviceId)
    const intentCode = intentPayload?.intent || row.intent_code
    const zoneCode = intentPayload?.zone || row.zone_code
    const genderValue = intentPayload?.gender || row.gender

    const intentId = intentCode ? intentByCode.get(intentCode) : undefined
    const zoneId = zoneCode ? zoneByCode.get(zoneCode) : undefined

    const areaId = areaMap.get(row.area)
    const objectiveId = objectiveMap.get(`${row.area}::${row.objective}`)
    const treatmentId = treatmentMap.get(row.treatment)

    const durationMinutes = parseNumber(row.duration_minutes)

    const data = {
      name: row.service_name,
      slug: slugify(`${row.service_name}-${serviceId}`),
      category: toRelationId(treatmentId),
      treatments: treatmentId ? [toRelationId(treatmentId) ?? treatmentId] : [],
      objective: toRelationId(objectiveId),
      area: toRelationId(areaId),
      price: parseNumber(row.price) ?? 0,
      durationMinutes,
      active: parseBoolean(row.active),
      serviceType: mapServiceType(row.kind),
      gender: genderValue || undefined,
      modality: row.modality || undefined,
      intent: toRelationId(intentId),
      zone: toRelationId(zoneId),
      intentCode: intentCode || undefined,
      zoneCode: zoneCode || undefined,
    }

    const existingByExternalId = await pFind({
      collection: 'services',
      where: { slug: { equals: slugify(`${row.service_name}-${serviceId}`) } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      locale,
    })

    if (existingByExternalId.docs.length) {
      const existingDoc = existingByExternalId.docs[0]
      await pUpdate({
        collection: 'services',
        id: readId(existingDoc),
        data: { ...data, slug: readSlug(existingDoc) },
        overrideAccess: true,
        locale,
      })
      continue
    }

    const existingByName = await pFind({
      collection: 'services',
      where: { name: { equals: row.service_name } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      locale,
    })

    if (existingByName.docs.length) {
      const existingDoc = existingByName.docs[0]
      await pUpdate({
        collection: 'services',
        id: readId(existingDoc),
        data: { ...data, slug: readSlug(existingDoc) },
        overrideAccess: true,
        locale,
      })
      continue
    }

    await pCreate({
      collection: 'services',
      data,
      overrideAccess: true,
      locale,
    })
  }
}

const payload = await getPayload({ config: configPromise })
try {
  await runImport(payload)
} catch (err) {
  console.error(err)
  process.exit(1)
} finally {
  await payload.destroy()
}

export default async function importServices({ payload }: { payload: Payload }) {
  try {
    await runImport(payload)
  } catch (err) {
    console.error(err)
    throw err
  }
}
