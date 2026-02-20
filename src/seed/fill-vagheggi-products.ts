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
  'vagheggi-7525': {
    lineHeadline: 'Longevità della pelle',
    description:
      'Linea 75.25 dedicata alla longevità della pelle con cosmetici di precisione per una strategia globale anti‑age.',
    usage: 'Protocollo quotidiano anti‑age, mattina e/o sera dopo la detersione.',
    activeIngredients:
      'Attivatore NAD+, corteccia di Lapacho, Lavandula Hybrida, peptide da bio‑fermentazione.',
    results:
      'Migliora vitalità e uniformità, attenua le rughe e favorisce un effetto lifting e rimodellante.',
  },
  'vagheggi-delay-infinity': {
    lineHeadline: 'Anti‑age per rughe d’espressione',
    description:
      'Linea anti‑età per prevenire e trattare le rughe d’espressione, indicata per pelli da normali a secche con segni di stanchezza.',
    usage: 'Applicare mattina e/o sera su viso e collo dopo la detersione.',
    activeIngredients:
      'Acetyl Hexapeptide‑1, Acmella oleracea, retinolo incapsulato, acido ialuronico, oli vegetali e burro di karité, vitamina E.',
    results: 'Riduce le rughe d’espressione e migliora tonicità e distensione cutanea.',
  },
  'vagheggi-rehydra': {
    lineHeadline: 'Idratazione a lunga durata',
    description:
      'Linea studiata per offrire profonda idratazione e nutrimento alle pelli da normali a secche, riequilibrando la cute disidratata.',
    usage: 'Trattamento idratante quotidiano, mattina e sera.',
    activeIngredients:
      'Attivo multifunzionale ecosostenibile da pianta Cuateteco, stimola i meccanismi endogeni della pelle.',
    results: 'Idratazione profonda e duratura, pelle nutrita e luminosa a lungo.',
  },
  'vagheggi-equilibrium': {
    lineHeadline: 'Riequilibrio e nutrimento',
    description:
      'Linea cosmetica completa per viso, mani e corpo a base di estratti vegetali e oli essenziali, indicata per pelli da normalizzare, nutrire e riequilibrare.',
    usage: 'Uso quotidiano per mantenere equilibrio e comfort cutaneo.',
    activeIngredients: 'Estratti vegetali e oli essenziali.',
    results: 'Pelle riequilibrata, nutrita e più confortevole.',
  },
  'vagheggi-fuoco': {
    lineHeadline: 'Trattamento cellulite e adiposità',
    description:
      'Linea iconica per modellare, ridurre e contrastare gli inestetismi da cellulite e adiposità localizzata.',
    usage: 'Protocollo corpo con applicazione costante sulle zone critiche.',
    activeIngredients:
      'Molecole senolitiche e minerali di origine vulcanica; attivi Occhio di Drago e Malvarosa Nera.',
    results: 'Risultati visibili in 4 sedute con pelle più uniforme e compatta.',
  },
  'vagheggi-sinecell': {
    lineHeadline: 'Anti‑cellulite e drenante',
    description:
      'Linea di cosmetici corpo per combattere cellulite e adiposità localizzata con programma Bioth Ecology e alga Jania Rubens.',
    usage: 'Applicare con massaggio sulle zone da trattare.',
    activeIngredients: 'Alga Jania Rubens (Bioth Ecology Program).',
    results:
      'Riduzione dei depositi adiposi, incremento del tono e miglioramento della superficie cutanea.',
  },
  'vagheggi-booster-viso': {
    lineHeadline: 'Booster viso mirati',
    description: 'Concentrati viso ad alta performance con attivi specifici.',
    usage: 'Applicare localmente o su tutto il viso in base al bisogno.',
    activeIngredients: 'Attivi specifici per esigenze mirate.',
    results: 'Potenzia l’efficacia della routine.',
  },
}

const keywordTextureMap: Array<{ keyword: string; slug: string }> = [
  { keyword: 'bifasic', slug: 'bifasico' },
  { keyword: 'burro', slug: 'burro' },
  { keyword: 'concentrat', slug: 'concentrato' },
  { keyword: 'booster', slug: 'concentrato' },
  { keyword: 'fiala', slug: 'concentrato' },
  { keyword: 'crema', slug: 'crema' },
  { keyword: 'gel', slug: 'gel' },
  { keyword: 'criogel', slug: 'gel' },
  { keyword: 'latte', slug: 'latte' },
  { keyword: 'mousse', slug: 'mousse' },
  { keyword: 'olio', slug: 'olio' },
  { keyword: 'siero', slug: 'siero' },
  { keyword: 'spray', slug: 'spray' },
]

const detectFormat = (title: string) => {
  const mlMatch = title.match(/(\d+(?:[.,]\d+)?\s?ml)/i)
  if (mlMatch?.[1]) return mlMatch[1].replace(/\s+/g, '')
  const packMatch = title.match(/(\d+\s?x\s?\d+(?:[.,]\d+)?)/i)
  if (packMatch?.[1]) return packMatch[1].replace(/\s+/g, '')
  return undefined
}

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

const skinTypeMap: Record<string, { primary: string; secondary: string[] }> = {
  'vagheggi-7525': { primary: 'matura', secondary: [] },
  'vagheggi-delay-infinity': { primary: 'matura', secondary: [] },
  'vagheggi-rehydra': { primary: 'secca', secondary: ['disidratata'] },
  'vagheggi-equilibrium': { primary: 'secca', secondary: [] },
  'vagheggi-booster-viso': { primary: 'normale', secondary: [] },
  'vagheggi-fuoco': { primary: 'cellulite-mista', secondary: ['ritenzione-idrica'] },
  'vagheggi-sinecell': { primary: 'cellulite-mista', secondary: ['ritenzione-idrica'] },
}

const payload = await getPayload({ config })

const brand = await payload.find({
  collection: 'brands',
  depth: 0,
  limit: 1,
  where: { slug: { equals: 'vagheggi' } },
})
if (brand.docs.length === 0) {
  console.log('Brand Vagheggi non trovato.')
  process.exit(0)
}
const brandId = brand.docs[0].id

const brandLines = await payload.find({
  collection: 'brand-lines',
  depth: 0,
  limit: 200,
  where: { brand: { equals: brandId } },
  locale: 'it',
})

const brandLineById = new Map(brandLines.docs.map((line) => [line.id, line]))

for (const line of brandLines.docs) {
  const template = lineTemplates[line.slug]
  if (!template) continue
  const updates: Record<string, unknown> = {}
  if (!line.lineHeadline) updates.lineHeadline = template.lineHeadline
  if (!line.description) updates.description = template.description
  if (!line.usage) updates.usage = template.usage
  if (!line.activeIngredients) updates.activeIngredients = template.activeIngredients
  if (!line.results) updates.results = template.results
  if (Object.keys(updates).length > 0) {
    await payload.update({
      collection: 'brand-lines',
      id: line.id,
      locale: 'it',
      overrideAccess: true,
      data: updates,
    })
  }
}

const needsPriority = await payload.find({
  collection: 'brand-line-needs-priority',
  depth: 0,
  limit: 500,
})
const needsByBrandLine = new Map<number | string, Array<number | string>>()
for (const entry of needsPriority.docs) {
  const brandLineId = typeof entry.brandLine === 'object' && entry.brandLine ? entry.brandLine.id : entry.brandLine
  const needId = typeof entry.need === 'object' && entry.need ? entry.need.id : entry.need
  if (!brandLineId || !needId) continue
  const current = needsByBrandLine.get(brandLineId) ?? []
  if (!current.includes(needId)) current.push(needId)
  needsByBrandLine.set(brandLineId, current)
}

const needs = await payload.find({
  collection: 'needs',
  depth: 1,
  limit: 200,
})
const needAreaById = new Map<number | string, number | string>()
for (const need of needs.docs) {
  const area =
    typeof need.productArea === 'object' && need.productArea ? need.productArea.id : need.productArea
  if (area) needAreaById.set(need.id, area)
}

const textures = await payload.find({
  collection: 'textures',
  depth: 0,
  limit: 200,
})
const textureBySlug = new Map(textures.docs.map((texture) => [texture.slug, texture.id]))

const timings = await payload.find({
  collection: 'timing-products',
  depth: 0,
  limit: 20,
})
const timingBySlug = new Map(timings.docs.map((timing) => [timing.slug, timing.id]))

const skinTypes = await payload.find({
  collection: 'skin-types',
  depth: 0,
  limit: 200,
})
const skinTypeBySlug = new Map(skinTypes.docs.map((type) => [type.slug, type.id]))

const products = await payload.find({
  collection: 'products',
  depth: 0,
  limit: 500,
  where: { brand: { equals: brandId } },
  locale: 'it',
})

for (const product of products.docs) {
  const updates: Record<string, unknown> = {}
  const lineId = typeof product.brandLine === 'object' && product.brandLine ? product.brandLine.id : product.brandLine
  const line = lineId ? brandLineById.get(lineId) : undefined
  const template = line && line.slug ? lineTemplates[line.slug] : undefined

  if (!product.description && template?.description) updates.description = template.description
  if (!product.usage && template?.usage) updates.usage = template.usage
  if (!product.activeIngredients && template?.activeIngredients)
    updates.activeIngredients = template.activeIngredients
  if (!product.results && template?.results) updates.results = template.results
  if (!product.format && product.title) {
    const format = detectFormat(product.title)
    if (format) updates.format = format
  }

  if ((!product.needs || product.needs.length === 0) && lineId) {
    const needsIds = needsByBrandLine.get(lineId) ?? []
    if (needsIds.length > 0) updates.needs = needsIds

    const areaIds = new Set<number | string>()
    for (const needId of needsIds) {
      const areaId = needAreaById.get(needId)
      if (areaId) areaIds.add(areaId)
    }
    if (areaIds.size > 0 && (!product.productAreas || product.productAreas.length === 0)) {
      updates.productAreas = Array.from(areaIds)
    }
  }

  if (!product.textures || product.textures.length === 0) {
    const title = (product.title || product.slug || '').toLowerCase()
    const match = keywordTextureMap.find(({ keyword }) => title.includes(keyword))
    if (match) {
      const textureId = textureBySlug.get(match.slug)
      if (textureId) updates.textures = [textureId]
    }
  }

  if (!product.timingProducts || product.timingProducts.length === 0) {
    const timingSlugs = resolveTimingSlugs(product.slug || '')
    const timingIds = timingSlugs
      .map((timingSlug) => timingBySlug.get(timingSlug))
      .filter((value): value is number => typeof value === 'number')
    if (timingIds.length > 0) updates.timingProducts = timingIds
  }

  if (!product.skinTypePrimary && line?.slug && skinTypeMap[line.slug]) {
    const primarySlug = skinTypeMap[line.slug].primary
    const primaryId = skinTypeBySlug.get(primarySlug)
    if (primaryId) updates.skinTypePrimary = primaryId
  }

  if ((!product.skinTypeSecondary || product.skinTypeSecondary.length === 0) && line?.slug && skinTypeMap[line.slug]) {
    const secondaryIds = skinTypeMap[line.slug].secondary
      .map((slug) => skinTypeBySlug.get(slug))
      .filter((id): id is number => typeof id === 'number')
    if (secondaryIds.length > 0) updates.skinTypeSecondary = secondaryIds
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

console.log('Vagheggi products filled.')
