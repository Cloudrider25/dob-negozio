import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { writeFileSync } from 'fs'

type TaxonomyMaps = {
  needs: Map<string, number>
  textures: Map<string, number>
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const hasAny = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(normalize(keyword)))

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

const getMaps = async (): Promise<TaxonomyMaps> => {
  const payload = await getPayload({ config })
  const [needs, textures] = await Promise.all([
    payload.find({ collection: 'needs', depth: 0, limit: 500 }),
    payload.find({ collection: 'textures', depth: 0, limit: 500 }),
  ])

  const toMap = (docs: Array<{ id: number; slug: string }>) =>
    new Map(docs.map((doc) => [doc.slug, doc.id]))

  return {
    needs: toMap(needs.docs as Array<{ id: number; slug: string }>),
    textures: toMap(textures.docs as Array<{ id: number; slug: string }>),
  }
}

const addId = (list: number[], id?: number) => {
  if (!id) return list
  if (list.includes(id)) return list
  return [...list, id]
}

const toIdArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'number') return item
      if (typeof item === 'string') return Number.parseInt(item, 10)
      if (item && typeof item === 'object' && 'id' in item) {
        const id = (item as { id?: number | string }).id
        if (typeof id === 'number') return id
        if (typeof id === 'string') return Number.parseInt(id, 10)
      }
      return NaN
    })
    .filter((id) => Number.isFinite(id))
}

const getLocalizedString = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    for (const key of Object.keys(record)) {
      const entry = record[key]
      if (typeof entry === 'string') return entry
    }
  }
  return ''
}


const textureRules = [
  { slug: slugify('Bifasico'), keywords: ['bifasico'] },
  { slug: slugify('Burro'), keywords: ['burro', 'butter'] },
  { slug: slugify('Concentrato'), keywords: ['concentrato', 'concentrati'] },
  { slug: slugify('Crema'), keywords: ['crema', 'creme', 'cream'] },
  { slug: slugify('Gel'), keywords: ['gel'] },
  { slug: slugify('Latte'), keywords: ['latte', 'milk'] },
  { slug: slugify('Mousse'), keywords: ['mousse'] },
  { slug: slugify('Olio'), keywords: ['olio', 'oil'] },
  { slug: slugify('Siero'), keywords: ['siero', 'serum'] },
  { slug: slugify('Spray'), keywords: ['spray'] },
]


const needRules = [
  { slug: `${slugify('Viso')}-${slugify('Rughe di Espressione')}`, keywords: ['rughe di espressione', 'linee di espressione'] },
  { slug: `${slugify('Viso')}-${slugify('Anti-age')}`, keywords: ['anti age', 'anti-age', 'antiage'] },
  { slug: `${slugify('Viso')}-${slugify('Prime Rughe')}`, keywords: ['prime rughe'] },
  { slug: `${slugify('Viso')}-${slugify('Pelle con macchie')}`, keywords: ['macchie', 'discromie', 'spots'] },
  { slug: `${slugify('Viso')}-${slugify('Pelle Spenta')}`, keywords: ['spenta', 'opaca', 'dull'] },
  { slug: `${slugify('Viso')}-${slugify('Pelle Secca')}`, keywords: ['pelle secca', 'secca', 'dry'] },
  { slug: `${slugify('Viso')}-${slugify('Pelle Normale')}`, keywords: ['pelle normale'] },
  { slug: `${slugify('Viso')}-${slugify('Pelle Mista-impura')}`, keywords: ['mista', 'impura', 'grassa', 'oily'] },
  { slug: `${slugify('Viso')}-${slugify('Pelle Sensibile e Intollerante')}`, keywords: ['sensibile', 'intollerante', 'delicata', 'reactive'] },
  { slug: `${slugify('Viso')}-${slugify('Pelle Maschile')}`, keywords: ['uomo', 'man', 'male', 'maschile'] },
  { slug: `${slugify('Viso')}-${slugify('Age Care')}`, keywords: ['age care'] },
  { slug: `${slugify('Viso')}-${slugify('Skin Longevity')}`, keywords: ['skin longevity'] },
  { slug: `${slugify('Corpo')}-${slugify('Azione urto globale')}`, keywords: ['urto globale', 'shock'] },
  { slug: `${slugify('Corpo')}-${slugify('Benessere')}`, keywords: ['benessere', 'wellness', 'relax'] },
  { slug: `${slugify('Corpo')}-${slugify('Cellulite')}`, keywords: ['cellulite'] },
  { slug: `${slugify('Corpo')}-${slugify('Idratare e Nutrire')}`, keywords: ['idrata', 'nutr', 'hydr', 'nourish'] },
  { slug: `${slugify('Corpo')}-${slugify('Ridurre')}`, keywords: ['ridurre', 'reduce', 'snellente', 'slim'] },
  { slug: `${slugify('Corpo')}-${slugify('Tonificare e Rimodellare')}`, keywords: ['tonific', 'rimodell', 'firm'] },
  { slug: `${slugify('Corpo')}-${slugify('Zone Specifiche')}`, keywords: ['zone specifiche', 'localizzato', 'targeted'] },
  { slug: `${slugify('Solari')}-${slugify('Alte e Molto Alte Protezioni')}`, keywords: ['spf 50', 'spf50', 'spf 50+', 'spf50+', 'molto alta', 'alta protezione'] },
  { slug: `${slugify('Solari')}-${slugify('Basse, Medie Protezioni e Abbronzanti')}`, keywords: ['abbronz', 'tanning', 'spf 6', 'spf6', 'spf 10', 'spf10', 'spf 15', 'spf15', 'media protezione', 'bassa protezione'] },
  { slug: `${slugify('Solari')}-${slugify('Doposole')}`, keywords: ['doposole', 'after sun', 'aftersun'] },
  { slug: `${slugify('Make-up')}-${slugify('Viso')}`, keywords: ['fondotinta', 'cipria', 'terre', 'blush', 'foundation', 'powder', 'bronzer'] },
  { slug: `${slugify('Make-up')}-${slugify('Occhi')}`, keywords: ['ombretti', 'eyeliner', 'mascara', 'matita occhi', 'eyeshadow'] },
  { slug: `${slugify('Make-up')}-${slugify('Labbra')}`, keywords: ['rossetto', 'lipstick', 'matita labbra'] },
]

const mapProduct = (
  text: string,
  maps: TaxonomyMaps,
): {
  needs: number[]
  textures: number[]
} => {
  const textureIds: number[] = []
  for (const rule of textureRules) {
    if (hasAny(text, rule.keywords)) {
      const id = maps.textures.get(rule.slug)
      if (id) textureIds.push(id)
    }
  }

  const needIds: number[] = []
  for (const rule of needRules) {
    if (hasAny(text, rule.keywords)) {
      const id = maps.needs.get(rule.slug)
      if (id) needIds.push(id)
    }
  }

  return {
    needs: Array.from(new Set(needIds)),
    textures: Array.from(new Set(textureIds)),
  }
}

const payload = await getPayload({ config })
const maps = await getMaps()
const productsResult = await payload.find({
  collection: 'products',
  depth: 0,
  limit: 1000,
  locale: 'it',
})

const dryRun = process.env.PAYLOAD_MAPPING_DRY_RUN === 'true'
let updated = 0
let skipped = 0
let withMatches = 0
let totalMatches = 0
const sampleLogs: Array<{
  id: number
  title: string
  needs: number
  textures: number
}> = []

for (const product of productsResult.docs) {
  const text = normalize(
    [
      getLocalizedString(product.title),
      getLocalizedString(product.description),
      product.slug,
      product.brand,
      product.sku,
    ]
      .filter(Boolean)
      .join(' '),
  )
  const mapping = mapProduct(text, maps)
  const matchCount =
    mapping.needs.length +
    mapping.textures.length
  if (matchCount > 0) {
    withMatches += 1
    totalMatches += matchCount
    if (sampleLogs.length < 8) {
      sampleLogs.push({
        id: product.id as number,
        title: getLocalizedString(product.title),
        needs: mapping.needs.length,
        textures: mapping.textures.length,
      })
    }
  }

  const existingNeeds = toIdArray(product.needs)
  const existingTextures = toIdArray(product.textures)

  const nextNeeds = mapping.needs.reduce(addId, existingNeeds)
  const nextTextures = mapping.textures.reduce(addId, existingTextures)

  const hasChanges =
    nextNeeds.length !== existingNeeds.length ||
    nextTextures.length !== existingTextures.length

  if (!hasChanges) {
    skipped += 1
    continue
  }

  if (!dryRun) {
    await payload.update({
      collection: 'products',
      id: product.id,
      overrideAccess: true,
      data: {
        needs: nextNeeds,
        textures: nextTextures,
      },
    })
  }

  updated += 1
}

console.log(`Products processed: ${productsResult.docs.length}`)
console.log(`Products updated: ${updated}`)
console.log(`Products unchanged: ${skipped}`)
console.log(`Products with matches: ${withMatches}`)
console.log(`Total matches: ${totalMatches}`)
if (sampleLogs.length > 0) {
  console.log('Sample matches:')
  console.table(sampleLogs)
}
const reportPath = process.env.PAYLOAD_MAPPING_REPORT
if (reportPath) {
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        processed: productsResult.docs.length,
        updated,
        skipped,
        withMatches,
        totalMatches,
        samples: sampleLogs,
      },
      null,
      2,
    ),
    'utf-8',
  )
}
if (dryRun) {
  console.log('Dry run enabled: no updates were written.')
}
