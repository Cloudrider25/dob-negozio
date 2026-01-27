import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { writeFileSync } from 'fs'

type TaxonomyMaps = {
  needs: Map<string, number>
  categories: Map<string, number>
  lines: Map<string, number>
  textures: Map<string, number>
  makeupCollections: Map<string, number>
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

const buildCategorySlug = (parent: string, name: string) => `${slugify(parent)}-${slugify(name)}`

const getMaps = async (): Promise<TaxonomyMaps> => {
  const payload = await getPayload({ config })
  const [needs, categories, lines, textures, makeupCollections] = await Promise.all([
    payload.find({ collection: 'needs', depth: 0, limit: 500 }),
    payload.find({ collection: 'categories', depth: 0, limit: 1000 }),
    payload.find({ collection: 'lines', depth: 0, limit: 500 }),
    payload.find({ collection: 'textures', depth: 0, limit: 500 }),
    payload.find({ collection: 'makeup-collections', depth: 0, limit: 200 }),
  ])

  const toMap = (docs: Array<{ id: number; slug: string }>) =>
    new Map(docs.map((doc) => [doc.slug, doc.id]))

  return {
    needs: toMap(needs.docs as Array<{ id: number; slug: string }>),
    categories: toMap(categories.docs as Array<{ id: number; slug: string }>),
    lines: toMap(lines.docs as Array<{ id: number; slug: string }>),
    textures: toMap(textures.docs as Array<{ id: number; slug: string }>),
    makeupCollections: toMap(makeupCollections.docs as Array<{ id: number; slug: string }>),
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

const toId = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: number | string }).id
    return typeof id === 'number' ? id : typeof id === 'string' ? Number.parseInt(id, 10) : undefined
  }
  return undefined
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

const categoryRules = [
  { slug: buildCategorySlug('Make up', 'Fondotinta'), keywords: ['fondotinta', 'foundation'] },
  { slug: buildCategorySlug('Make up', 'Correttore'), keywords: ['correttore', 'concealer'] },
  { slug: buildCategorySlug('Make up', 'Cipria'), keywords: ['cipria', 'powder'] },
  { slug: buildCategorySlug('Make up', 'Terre e Blush'), keywords: ['terre', 'blush', 'bronzer'] },
  { slug: buildCategorySlug('Make up', 'Sopracciglia'), keywords: ['sopracciglia', 'eyebrow', 'brows'] },
  { slug: buildCategorySlug('Make up', 'Matite Occhi'), keywords: ['matita occhi', 'matite occhi', 'kohl'] },
  { slug: buildCategorySlug('Make up', 'Matite Labbra'), keywords: ['matita labbra', 'matite labbra', 'lip liner'] },
  { slug: buildCategorySlug('Make up', 'Rossetti'), keywords: ['rossetto', 'rossetti', 'lipstick'] },
  { slug: buildCategorySlug('Make up', 'Ombretti'), keywords: ['ombretto', 'ombretti', 'eyeshadow'] },
  { slug: buildCategorySlug('Make up', 'Eyeliner e Mascara'), keywords: ['eyeliner', 'mascara'] },
  { slug: buildCategorySlug('Make up', 'Pennelli e Accessori'), keywords: ['pennello', 'pennelli', 'brush', 'accessori'] },
  { slug: buildCategorySlug('Solari', 'Protezione Corpo'), keywords: ['spf', 'protezione', 'solare', 'sunscreen', 'sun', 'corpo', 'body'] },
  { slug: buildCategorySlug('Solari', 'Protezione Viso'), keywords: ['spf', 'protezione', 'solare', 'sunscreen', 'sun', 'viso', 'face'] },
  { slug: buildCategorySlug('Solari', 'Doposole'), keywords: ['doposole', 'after sun', 'aftersun'] },
  { slug: buildCategorySlug('Viso', 'Detergenti e Struccanti'), keywords: ['detergente', 'detergenti', 'struccante', 'struccanti', 'cleanser', 'cleansing'] },
  { slug: buildCategorySlug('Viso', 'Lozioni tonificanti e Mist'), keywords: ['tonico', 'tonici', 'mist', 'lozione', 'lozioni', 'tonificante', 'toner'] },
  { slug: buildCategorySlug('Viso', 'Esfolianti e Scrub'), keywords: ['esfoliante', 'esfolianti', 'scrub', 'peeling', 'gommage'] },
  { slug: buildCategorySlug('Viso', 'Maschere'), keywords: ['maschera', 'maschere', 'mask'] },
  { slug: buildCategorySlug('Viso', 'Sieri e concentrati'), keywords: ['siero', 'sieri', 'serum', 'concentrato', 'concentrati', 'booster'] },
  { slug: buildCategorySlug('Viso', 'Occhi e Labbra'), keywords: ['contorno occhi', 'occhi', 'eye', 'labbra', 'lip'] },
  { slug: buildCategorySlug('Viso', 'Creme'), keywords: ['crema', 'creme', 'cream'] },
  { slug: buildCategorySlug('Viso', 'Kit'), keywords: ['kit', 'set', 'trousse'] },
  { slug: buildCategorySlug('Corpo', 'Oli'), keywords: ['olio', 'oli', 'oil', 'corpo', 'body'] },
  { slug: buildCategorySlug('Corpo', 'Detersione e Igiene personale'), keywords: ['bagnodoccia', 'doccia', 'shower', 'sapone', 'igiene'] },
  { slug: buildCategorySlug('Corpo', 'Scrub'), keywords: ['scrub', 'esfoliante', 'peeling', 'gommage', 'corpo', 'body'] },
  { slug: buildCategorySlug('Corpo', 'Creme e Burri'), keywords: ['burro', 'butter', 'crema', 'creme', 'body', 'corpo'] },
  { slug: buildCategorySlug('Corpo', 'Sieri'), keywords: ['siero', 'sieri', 'serum', 'corpo', 'body'] },
  { slug: buildCategorySlug('Corpo', 'Mousse'), keywords: ['mousse', 'schiuma'] },
  { slug: buildCategorySlug('Corpo', 'Bende & Leggings'), keywords: ['bende', 'leggings', 'bendaggi'] },
  { slug: buildCategorySlug('Limited Edition', 'Ambra di Sicilia'), keywords: ['ambra di sicilia'] },
  { slug: slugify('Bestseller'), keywords: ['bestseller', 'best seller'] },
]

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

const lineRules = [
  '75.15',
  '75.25',
  'Atypical',
  'Balance',
  'Bio+',
  'Booster Viso',
  'Bright Formula',
  'Delay Infinity',
  'Emozioni Plus',
  'Equilibrium',
  'Intense',
  'Lime',
  'Oligominerali',
  'Rehydra',
  'Body Spa',
  'Fuoco Plus',
  'Linea Bagnodoccia',
  'Sikelia',
  'Sinecell',
  'Phytomakeup',
  'Theatre 1585',
  'Summer Paradise',
  'Booster',
  'Ambra di Sicilia',
]

const makeupCollectionRules = [
  { slug: slugify('Basic'), keywords: ['basic'] },
  { slug: slugify('Eva'), keywords: ['eva'] },
  { slug: slugify('Grace'), keywords: ['grace'] },
  { slug: slugify('Lucrezia'), keywords: ['lucrezia'] },
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
  categories: number[]
  lines: number[]
  textures: number[]
  makeupCollection?: number
} => {
  const categoryIds: number[] = []
  for (const rule of categoryRules) {
    if (hasAny(text, rule.keywords)) {
      const id = maps.categories.get(rule.slug)
      if (id) categoryIds.push(id)
    }
  }

  const textureIds: number[] = []
  for (const rule of textureRules) {
    if (hasAny(text, rule.keywords)) {
      const id = maps.textures.get(rule.slug)
      if (id) textureIds.push(id)
    }
  }

  const lineIds: number[] = []
  const normalizedText = normalize(text)
  for (const line of lineRules) {
    const needle = normalize(line)
    if (needle && normalizedText.includes(needle)) {
      const slug = slugify(line)
      const id = maps.lines.get(slug)
      if (id) lineIds.push(id)
    }
  }

  const needIds: number[] = []
  for (const rule of needRules) {
    if (hasAny(text, rule.keywords)) {
      const id = maps.needs.get(rule.slug)
      if (id) needIds.push(id)
    }
  }

  let makeupCollectionId: number | undefined
  for (const rule of makeupCollectionRules) {
    if (hasAny(text, rule.keywords)) {
      makeupCollectionId = maps.makeupCollections.get(rule.slug)
      if (makeupCollectionId) break
    }
  }

  return {
    needs: Array.from(new Set(needIds)),
    categories: Array.from(new Set(categoryIds)),
    lines: Array.from(new Set(lineIds)),
    textures: Array.from(new Set(textureIds)),
    makeupCollection: makeupCollectionId,
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
  categories: number
  lines: number
  textures: number
  makeup: boolean
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
    mapping.categories.length +
    mapping.lines.length +
    mapping.textures.length +
    (mapping.makeupCollection ? 1 : 0)
  if (matchCount > 0) {
    withMatches += 1
    totalMatches += matchCount
    if (sampleLogs.length < 8) {
      sampleLogs.push({
        id: product.id as number,
        title: getLocalizedString(product.title),
        needs: mapping.needs.length,
        categories: mapping.categories.length,
        lines: mapping.lines.length,
        textures: mapping.textures.length,
        makeup: Boolean(mapping.makeupCollection),
      })
    }
  }

  const existingNeeds = toIdArray(product.needs)
  const existingCategories = toIdArray(product.categories)
  const existingLines = toIdArray(product.lines)
  const existingTextures = toIdArray(product.textures)
  const existingMakeup = toId(product.makeupCollection)

  const nextNeeds = mapping.needs.reduce(addId, existingNeeds)
  const nextCategories = mapping.categories.reduce(addId, existingCategories)
  const nextLines = mapping.lines.reduce(addId, existingLines)
  const nextTextures = mapping.textures.reduce(addId, existingTextures)
  const nextMakeup = mapping.makeupCollection ?? existingMakeup

  const hasChanges =
    nextNeeds.length !== existingNeeds.length ||
    nextCategories.length !== existingCategories.length ||
    nextLines.length !== existingLines.length ||
    nextTextures.length !== existingTextures.length ||
    nextMakeup !== existingMakeup

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
        categories: nextCategories,
        routineSteps: product.routineSteps,
        lines: nextLines,
        textures: nextTextures,
        makeupCollection: nextMakeup,
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
