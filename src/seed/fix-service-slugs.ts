import { getPayload } from 'payload'
import config from '../payload.config'

const payload = await getPayload({ config })

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

async function updateMissingSlugs(collection: 'areas' | 'objectives', field: 'name' | 'boxName') {
  const docs = await payload.find({
    collection,
    locale: 'it',
    limit: 500,
    overrideAccess: true,
    depth: 0,
  })

  for (const doc of docs.docs) {
    const rawValue = (doc as unknown as Record<string, unknown>)[field]
    const value = typeof rawValue === 'string' ? rawValue : ''
    if (!value) continue
    if (
      typeof (doc as unknown as { slug?: unknown }).slug === 'string' &&
      (doc as unknown as { slug?: string }).slug
    ) {
      continue
    }
    const slug = slugify(value)
    if (!slug) continue
    await payload.update({
      collection,
      id: doc.id,
      data: { slug },
      locale: 'it',
      overrideAccess: true,
    })
  }
}

await updateMissingSlugs('areas', 'name')
await updateMissingSlugs('objectives', 'boxName')

console.log('Service slugs updated')
