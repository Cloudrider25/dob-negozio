import { getPayload } from 'payload'
import config from '../payload.config'

type LineTemplate = {
  lineHeadline: string
  description: string
  usage: string
  activeIngredients: string
  results: string
}

const lineTemplates: Record<string, LineTemplate> = {
  'is-clinical-cleansing-complex': {
    lineHeadline: 'Detersione professionale ad uso quotidiano',
    description: 'Detergente viso leggero pensato per una pulizia profonda ma delicata.',
    usage: "Applicare su pelle inumidita, massaggiare e risciacquare. Uso quotidiano.",
    activeIngredients: 'Complesso di attivi purificanti e lenitivi.',
    results: 'Pelle più pulita, fresca e uniforme.',
  },
  'is-clinical-cream-cleanser': {
    lineHeadline: 'Detergente cremoso per pelle delicata',
    description: 'Detergente cremoso che rimuove impurità e trucco senza seccare.',
    usage: 'Massaggiare su pelle umida e rimuovere con acqua tiepida.',
    activeIngredients: 'Attivi emollienti e lenitivi.',
    results: 'Pelle morbida, idratata e confortevole.',
  },
  'is-clinical-youth-serum': {
    lineHeadline: 'Siero anti‑age ad azione globale',
    description: 'Siero viso per contrastare i segni del tempo e migliorare la luminosità.',
    usage: 'Applicare mattina e/o sera su viso e collo.',
    activeIngredients: 'Peptidi e antiossidanti di origine vegetale.',
    results: 'Pelle più compatta, luminosa e uniforme.',
  },
  'is-clinical-pro-heal-serum': {
    lineHeadline: 'Siero lenitivo e protettivo',
    description: 'Siero professionale con azione lenitiva e antiossidante.',
    usage: 'Applicare mattina e/o sera su viso e collo.',
    activeIngredients: 'Vitamina C, vitamina E e attivi calmanti.',
    results: 'Comfort cutaneo e riduzione di arrossamenti visibili.',
  },
  'is-clinical-hydra-cool-serum': {
    lineHeadline: 'Idratazione profonda e immediata',
    description: 'Siero idratante ad azione rinfrescante per pelle disidratata.',
    usage: 'Applicare su pelle pulita, mattina e/o sera.',
    activeIngredients: 'Acido ialuronico e attivi idratanti.',
    results: 'Pelle idratata, morbida e lenita.',
  },
  'is-clinical-reparative-moisture-emulsion': {
    lineHeadline: 'Emulsione riparatrice e nutriente',
    description: 'Emulsione idratante che supporta la barriera cutanea.',
    usage: 'Applicare dopo detersione, mattina e/o sera.',
    activeIngredients: 'Attivi emollienti e antiossidanti.',
    results: 'Pelle più elastica e nutrita.',
  },
  'is-clinical-moisturizing-complex': {
    lineHeadline: 'Crema idratante quotidiana',
    description: 'Idratazione intensa e duratura per pelle secca o disidratata.',
    usage: 'Applicare mattina e/o sera su viso e collo.',
    activeIngredients: 'Acido ialuronico e antiossidanti.',
    results: 'Idratazione prolungata e comfort cutaneo.',
  },
  'is-clinical-eye-complex': {
    lineHeadline: 'Trattamento contorno occhi',
    description: 'Crema specifica per area perioculare.',
    usage: 'Applicare mattina e/o sera con movimenti delicati.',
    activeIngredients: 'Peptidi e antiossidanti.',
    results: 'Area occhi più distesa e luminosa.',
  },
  'is-clinical-youth-eye-complex': {
    lineHeadline: 'Contorno occhi anti‑age',
    description: 'Trattamento anti‑age per rughe e segni del tempo.',
    usage: 'Applicare mattina e/o sera con movimenti delicati.',
    activeIngredients: 'Peptidi e antiossidanti.',
    results: 'Riduzione dei segni di stanchezza.',
  },
  'is-clinical-c-eye-serum-advance': {
    lineHeadline: 'Siero contorno occhi illuminante',
    description: 'Siero per illuminare e distendere la zona perioculare.',
    usage: 'Applicare mattina e/o sera con movimenti delicati.',
    activeIngredients: 'Vitamina C stabilizzata e antiossidanti.',
    results: 'Sguardo più luminoso e uniforme.',
  },
}

const productToLineSlug: Record<string, string> = {
  'cleansing-complex-180-ml': 'is-clinical-cleansing-complex',
  'cream-cleanser-120-ml': 'is-clinical-cream-cleanser',
  'youth-serum-30-ml': 'is-clinical-youth-serum',
  'pro-heal-serum-advanced-15ml': 'is-clinical-pro-heal-serum',
  'hydra-cool-serum-15-ml': 'is-clinical-hydra-cool-serum',
  'reparative-moisture-emulsion-50g': 'is-clinical-reparative-moisture-emulsion',
  'moisturazing-complex-50g': 'is-clinical-moisturizing-complex',
  'eye-complex-15g': 'is-clinical-eye-complex',
  'youth-eye-complex-15g': 'is-clinical-youth-eye-complex',
  'c-eye-serum-advanced-15ml': 'is-clinical-c-eye-serum-advance',
}

const needsByLineSlug: Record<string, string[]> = {
  'is-clinical-cleansing-complex': ['purificante'],
  'is-clinical-cream-cleanser': ['idratazione', 'lenitiva-pelli-sensibili'],
  'is-clinical-youth-serum': ['anti-age', 'elasticizzante-rimpolpante'],
  'is-clinical-pro-heal-serum': ['lenitiva-pelli-sensibili', 'detossinante-ossidativo'],
  'is-clinical-hydra-cool-serum': ['idratazione', 'lenitiva-pelli-sensibili'],
  'is-clinical-reparative-moisture-emulsion': ['idratazione', 'elasticizzante-rimpolpante'],
  'is-clinical-moisturizing-complex': ['idratazione'],
  'is-clinical-eye-complex': ['contorno-occhi', 'luminosita'],
  'is-clinical-youth-eye-complex': ['contorno-occhi', 'anti-age'],
  'is-clinical-c-eye-serum-advance': ['contorno-occhi', 'luminosita', 'anti-age'],
}

const keywordTextureMap: Array<{ keyword: string; slug: string }> = [
  { keyword: 'crema', slug: 'crema' },
  { keyword: 'serum', slug: 'siero' },
  { keyword: 'siero', slug: 'siero' },
  { keyword: 'cleanser', slug: 'crema' },
]

const resolveTimingSlugs = (slug: string): string[] => {
  const lower = slug.toLowerCase()
  if (lower.includes('spf') || lower.includes('solare') || lower.includes('sun') || lower.includes('uv')) {
    return ['solare']
  }
  const isMorning =
    lower.includes('giorno') || lower.includes('day') || lower.includes('mattina') || lower.includes('mattutina')
  const isNight = lower.includes('notte') || lower.includes('night') || lower.includes('sera') || lower.includes('serale')
  const isTreatment =
    lower.includes('trattamento') ||
    lower.includes('booster') ||
    lower.includes('fiala') ||
    lower.includes('ampolla') ||
    lower.includes('peel') ||
    lower.includes('scrub') ||
    lower.includes('maschera') ||
    lower.includes('mask')
  if (isMorning || isNight) {
    return [isMorning ? 'mattutina' : null, isNight ? 'serale' : null].filter(
      (value): value is string => Boolean(value),
    )
  }
  if (isTreatment) return ['trattamento-mirato']
  return ['mattutina', 'serale']
}

const payload = await getPayload({ config })

const brand = await payload.find({
  collection: 'brands',
  depth: 0,
  limit: 1,
  where: { slug: { equals: 'is-clinical' } },
})
if (brand.docs.length === 0) {
  console.log('Brand iS Clinical non trovato.')
  process.exit(0)
}
const brandId = brand.docs[0].id

const existingLines = await payload.find({
  collection: 'brand-lines',
  depth: 0,
  limit: 200,
  where: { brand: { equals: brandId } },
})
const lineSlugToId = new Map(existingLines.docs.map((line) => [line.slug, line.id]))

for (const [slug, template] of Object.entries(lineTemplates)) {
  let lineId = lineSlugToId.get(slug)
  if (!lineId) {
    const created = await payload.create({
      collection: 'brand-lines',
      locale: 'it',
      overrideAccess: true,
      data: {
        name: slug.replace('is-clinical-', '').replace(/-/g, ' '),
        slug,
        brand: brandId,
        active: true,
      },
    })
    lineId = created.id
    lineSlugToId.set(slug, lineId)
  }

  const line = existingLines.docs.find((doc) => doc.id === lineId)
  const updates: Record<string, unknown> = {}
  if (!line?.lineHeadline) updates.lineHeadline = template.lineHeadline
  if (!line?.description) updates.description = template.description
  if (!line?.usage) updates.usage = template.usage
  if (!line?.activeIngredients) updates.activeIngredients = template.activeIngredients
  if (!line?.results) updates.results = template.results

  if (Object.keys(updates).length > 0) {
    await payload.update({
      collection: 'brand-lines',
      id: lineId,
      locale: 'it',
      overrideAccess: true,
      data: updates,
    })
  }
}

const needs = await payload.find({
  collection: 'needs',
  depth: 0,
  limit: 200,
})
const needSlugToId = new Map(needs.docs.map((need) => [need.slug, need.id]))

const textures = await payload.find({
  collection: 'textures',
  depth: 0,
  limit: 200,
})
const textureSlugToId = new Map(textures.docs.map((texture) => [texture.slug, texture.id]))

const timings = await payload.find({
  collection: 'timing-products',
  depth: 0,
  limit: 20,
})
const timingSlugToId = new Map(timings.docs.map((timing) => [timing.slug, timing.id]))

const products = await payload.find({
  collection: 'products',
  depth: 0,
  limit: 200,
  where: { brand: { equals: brandId } },
  locale: 'it',
})

for (const product of products.docs) {
  const lineSlug = productToLineSlug[product.slug || '']
  if (!lineSlug) {
    console.log(`Skip (no line match): ${product.slug}`)
    continue
  }
  const lineId = lineSlugToId.get(lineSlug)
  const template = lineTemplates[lineSlug]

  const updates: Record<string, unknown> = {}
  if (!product.brandLine && lineId) updates.brandLine = lineId
  if (!product.description && template?.description) updates.description = template.description
  if (!product.usage && template?.usage) updates.usage = template.usage
  if (!product.activeIngredients && template?.activeIngredients)
    updates.activeIngredients = template.activeIngredients
  if (!product.results && template?.results) updates.results = template.results
  if (!product.lineHeadline && template?.lineHeadline) updates.lineHeadline = template.lineHeadline

  const needsSlugs = needsByLineSlug[lineSlug] ?? []
  if ((!product.needs || product.needs.length === 0) && needsSlugs.length > 0) {
    const ids = needsSlugs.map((slug) => needSlugToId.get(slug)).filter(Boolean)
    if (ids.length > 0) updates.needs = ids
  }

  if (!product.productAreas || product.productAreas.length === 0) {
    updates.productAreas = [1]
  }

  if (!product.textures || product.textures.length === 0) {
    const source = (product.title || product.slug || '').toLowerCase()
    const match = keywordTextureMap.find(({ keyword }) => source.includes(keyword))
    if (match) {
      const textureId = textureSlugToId.get(match.slug)
      if (textureId) updates.textures = [textureId]
    }
  }

  if (!product.timingProducts || product.timingProducts.length === 0) {
    const timingSlugs = resolveTimingSlugs(product.slug || '')
    const timingIds = timingSlugs
      .map((timingSlug) => timingSlugToId.get(timingSlug))
      .filter((value): value is number => typeof value === 'number')
    if (timingIds.length > 0) updates.timingProducts = timingIds
  }

  if (Object.keys(updates).length > 0) {
    await payload.update({
      collection: 'products',
      id: product.id,
      locale: 'it',
      overrideAccess: true,
      context: { skipAlternativeFilter: true },
      data: updates,
    })
  }
}

console.log('iS Clinical products filled.')
