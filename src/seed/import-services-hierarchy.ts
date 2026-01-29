import 'dotenv/config'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import configPromise from '../payload.config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
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

const payload = await getPayload({ config: configPromise })
try {
  await runImport(payload)
} catch (err) {
  console.error(err)
  process.exit(1)
} finally {
  await payload.destroy()
}

const runImport = async (payload: { [key: string]: any }) => {
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
    const existing = await payload.find({
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
      const updated = await payload.update({
        collection: 'intents',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
        locale,
      })
      intentByCode.set(code, String(updated.id))
    } else {
      const created = await payload.create({
        collection: 'intents',
        data,
        overrideAccess: true,
        locale,
      })
      intentByCode.set(code, String(created.id))
    }
  }

  for (const row of zonesRows) {
    const code = row.zone_code
    if (!code) continue
    const existing = await payload.find({
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
      const updated = await payload.update({
        collection: 'zones',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
        locale,
      })
      zoneByCode.set(code, String(updated.id))
    } else {
      const created = await payload.create({
        collection: 'zones',
        data,
        overrideAccess: true,
        locale,
      })
      zoneByCode.set(code, String(created.id))
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
      const existing = await payload.find({
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
        const created = await payload.create({
          collection: 'areas',
          data: {
            name: areaName,
            slug: slugify(areaName),
          },
          overrideAccess: true,
          locale,
        })
        areaId = String(created.id)
      }
      areaMap.set(areaName, areaId)
    }

    const objectiveKey = `${areaName}::${objectiveName}`
    let objectiveId = objectiveMap.get(objectiveKey)
    if (!objectiveId) {
      const existing = await payload.find({
        collection: 'objectives',
        where: {
          and: [{ boxName: { equals: objectiveName } }, { area: { equals: areaId } }],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        locale,
      })
      if (existing.docs.length) {
        objectiveId = String(existing.docs[0].id)
      } else {
        const created = await payload.create({
          collection: 'objectives',
          data: {
            boxName: objectiveName,
            slug: slugify(`${areaName}-${objectiveName}`),
            area: areaId,
          },
          overrideAccess: true,
          locale,
        })
        objectiveId = String(created.id)
      }
      objectiveMap.set(objectiveKey, objectiveId)
    }

    let treatmentId = treatmentMap.get(treatmentName)
    if (!treatmentId) {
      const existing = await payload.find({
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
        const created = await payload.create({
          collection: 'treatments',
          data: {
            boxName: treatmentName,
            slug: slugify(treatmentName),
            reference: [
              { relationTo: 'areas', value: areaId },
              { relationTo: 'objectives', value: objectiveId },
            ],
            active: true,
          },
          overrideAccess: true,
          locale,
        })
        treatmentId = String(created.id)
      }
      treatmentMap.set(treatmentName, treatmentId)
    }

    const treatmentDoc = await payload.findByID({
      collection: 'treatments',
      id: treatmentId,
      depth: 0,
      overrideAccess: true,
      locale,
    })
    const references =
      (treatmentDoc.reference as Array<{ relationTo: string; value: string | number }>) || []
    ensureRelationEntry(references, 'areas', areaId)
    ensureRelationEntry(references, 'objectives', objectiveId)

    await payload.update({
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
      category: treatmentId,
      treatments: treatmentId ? [treatmentId] : [],
      objective: objectiveId,
      area: areaId,
      price: parseNumber(row.price) ?? 0,
      durationMinutes,
      active: parseBoolean(row.active),
      serviceType: mapServiceType(row.kind),
      gender: genderValue || undefined,
      modality: row.modality || undefined,
      intent: intentId,
      zone: zoneId,
      intentCode: intentCode || undefined,
      zoneCode: zoneCode || undefined,
    }

    const existingByExternalId = await payload.find({
      collection: 'services',
      where: { slug: { equals: slugify(`${row.service_name}-${serviceId}`) } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      locale,
    })

    if (existingByExternalId.docs.length) {
      await payload.update({
        collection: 'services',
        id: existingByExternalId.docs[0].id,
        data: { ...data, slug: existingByExternalId.docs[0].slug },
        overrideAccess: true,
        locale,
      })
      continue
    }

    const existingByName = await payload.find({
      collection: 'services',
      where: { name: { equals: row.service_name } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      locale,
    })

    if (existingByName.docs.length) {
      await payload.update({
        collection: 'services',
        id: existingByName.docs[0].id,
        data: { ...data, slug: existingByName.docs[0].slug },
        overrideAccess: true,
        locale,
      })
      continue
    }

    await payload.create({
      collection: 'services',
      data,
      overrideAccess: true,
      locale,
    })
  }
}

export default async function importServices({ payload }: { payload: any }) {
  try {
    await runImport(payload)
  } catch (err) {
    console.error(err)
    throw err
  }
}
