import 'dotenv/config'

import { getPayload } from 'payload'

import configPromise from '../src/payload.config'

const main = async () => {
  const payload = await getPayload({ config: configPromise })
  const locale = 'it'

  const counts = await Promise.all([
    payload.find({ collection: 'services', depth: 0, limit: 0, overrideAccess: true, locale }),
    payload.find({ collection: 'treatments', depth: 0, limit: 0, overrideAccess: true, locale }),
    payload.find({ collection: 'objectives', depth: 0, limit: 0, overrideAccess: true, locale }),
    payload.find({ collection: 'areas', depth: 0, limit: 0, overrideAccess: true, locale }),
    payload.find({ collection: 'intents', depth: 0, limit: 0, overrideAccess: true, locale }),
    payload.find({ collection: 'zones', depth: 0, limit: 0, overrideAccess: true, locale }),
  ])

  const [services, treatments, objectives, areas, intents, zones] = counts

  console.log('Counts:')
  console.log('services:', services.totalDocs)
  console.log('treatments:', treatments.totalDocs)
  console.log('objectives:', objectives.totalDocs)
  console.log('areas:', areas.totalDocs)
  console.log('intents:', intents.totalDocs)
  console.log('zones:', zones.totalDocs)

  const sample = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 5,
    sort: '-createdAt',
    overrideAccess: true,
    locale,
  })

  console.log('\nSample services:')
  for (const doc of sample.docs) {
    const treatmentsList = Array.isArray(doc.treatments) ? doc.treatments : []
    const primaryTreatment = treatmentsList[0] ?? doc.treatment
    console.log('-', {
      id: doc.id,
      name: doc.name,
      area: typeof doc.area === 'object' && doc.area ? doc.area.name : doc.area,
      objective: typeof doc.objective === 'object' && doc.objective ? doc.objective.boxName : doc.objective,
      treatment:
        typeof primaryTreatment === 'object' && primaryTreatment
          ? (primaryTreatment as { boxName?: string; cardName?: string; name?: string; id?: number | string }).boxName ||
            (primaryTreatment as { boxName?: string; cardName?: string; name?: string; id?: number | string }).cardName ||
            (primaryTreatment as { boxName?: string; cardName?: string; name?: string; id?: number | string }).name ||
            (primaryTreatment as { boxName?: string; cardName?: string; name?: string; id?: number | string }).id
          : primaryTreatment,
      intent: typeof doc.intent === 'object' && doc.intent ? doc.intent.code : doc.intent,
      zone: typeof doc.zone === 'object' && doc.zone ? doc.zone.code : doc.zone,
      gender: doc.gender,
      modality: doc.modality,
      price: doc.price,
      durationMinutes: doc.durationMinutes,
      active: doc.active,
    })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
