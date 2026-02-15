import type { Payload } from 'payload'

type SeedItem = {
  name: string
  slug: string
  description?: string
  order?: number
}


const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

const buildOrderedItems = (items: string[], prefix?: string) =>
  items.map((name, index) => ({
    name,
    slug: prefix ? `${prefix}-${slugify(name)}` : slugify(name),
    order: index,
  }))

type SeedCollectionSlug =
  | 'product-areas'
  | 'brands'
  | 'brand-lines'
  | 'needs'
  | 'textures'

const seedSimpleCollection = async (
  payload: Payload,
  collection: SeedCollectionSlug,
  items: SeedItem[],
) => {
  if (!items.length) return
  const slugs = items.map((item) => item.slug)
  const existing = await payload.find({
    collection,
    depth: 0,
    limit: slugs.length,
    where: { slug: { in: slugs } },
  })
  const existingSlugs = new Set(existing.docs.map((doc) => doc.slug))

  for (const item of items) {
    if (existingSlugs.has(item.slug)) continue
    await payload.create({
      collection,
      locale: 'it',
      overrideAccess: true,
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        order: item.order ?? 0,
      },
    })
  }
}

export const seedShopTaxonomies = async (payload: Payload) => {
  // Needs are managed manually in DB now; no seed data here.

  const existingNickelTested = await payload.find({
    collection: 'attributes',
    depth: 0,
    limit: 1,
    where: { slug: { equals: 'nickel-tested' } },
  })
  if (existingNickelTested.docs.length === 0) {
    await payload.create({
      collection: 'attributes',
      locale: 'it',
      overrideAccess: true,
      data: {
        slug: 'nickel-tested',
        type: 'boolean',
        active: true,
        sortOrder: 0,
        name: 'Nickel tested',
        description:
          'Prodotti testati microbiologicamente, dermatologicamente e per il nickel.',
      },
    })
  }

  const textures = buildOrderedItems([
    'Bifasico',
    'Burro',
    'Concentrato',
    'Crema',
    'Gel',
    'Latte',
    'Mousse',
    'Olio',
    'Siero',
    'Spray',
  ])

  const vagheggiBrandSlug = slugify('Vagheggi')
  const vagheggiLines = [
    '75.25',
    'Balance',
    'Bio+',
    'Body Spa',
    'Booster Viso',
    'Bright Formula',
    'Delay Infinity',
    'Emozioni Plus',
    'Equilibrium',
    'Fuoco',
    'Intense',
    'Linea Bagnodoccia',
    'Lime',
    'Oligominerali',
    'Rehydra',
    'Sikelia',
    'Sinecell',
  ]

  const existingBrand = await payload.find({
    collection: 'brands',
    depth: 0,
    limit: 1,
    where: { slug: { equals: vagheggiBrandSlug } },
  })
  const brandId =
    existingBrand.docs.length > 0
      ? existingBrand.docs[0].id
      : (
          await payload.create({
            collection: 'brands',
            locale: 'it',
            overrideAccess: true,
            data: {
              name: 'Vagheggi',
              slug: vagheggiBrandSlug,
              active: true,
            },
          })
        ).id

  const brandLineSlugs = vagheggiLines.map((name) => `${vagheggiBrandSlug}-${slugify(name)}`)
  const existingBrandLines = await payload.find({
    collection: 'brand-lines',
    depth: 0,
    limit: brandLineSlugs.length,
    where: {
      and: [{ slug: { in: brandLineSlugs } }, { brand: { equals: brandId } }],
    },
  })
  const existingLineSlugs = new Set(existingBrandLines.docs.map((doc) => doc.slug))

  for (const [index, name] of vagheggiLines.entries()) {
    const slug = `${vagheggiBrandSlug}-${slugify(name)}`
    if (existingLineSlugs.has(slug)) continue
    await payload.create({
      collection: 'brand-lines',
      locale: 'it',
      overrideAccess: true,
      data: {
        name,
        slug,
        brand: brandId,
        sortOrder: index,
        active: true,
      },
    })
  }

  const needsResult = await payload.find({
    collection: 'needs',
    depth: 0,
    limit: 200,
  })
  const needSlugToId = new Map(needsResult.docs.map((doc) => [doc.slug, doc.id]))

  const brandLinesResult = await payload.find({
    collection: 'brand-lines',
    depth: 0,
    limit: 200,
    where: { brand: { equals: brandId } },
  })
  const brandLineSlugToId = new Map(brandLinesResult.docs.map((doc) => [doc.slug, doc.id]))

  const priorityMappings: Array<{
    lineSlug: string
    needs: Array<{ slug: string; score: number; note: string }>
  }> = [
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('75.25')}`,
      needs: [
        {
          slug: 'anti-age',
          score: 100,
          note: 'Longevità e contrasto ai segni del tempo. Source: vagheggi.com/75.25',
        },
        {
          slug: 'elasticizzante-rimpolpante',
          score: 50,
          note: 'Effetto lifting/elasticità. Source: vagheggi.com/75.25',
        },
        {
          slug: 'luminosita',
          score: 50,
          note: 'Migliora luminosità e vitalità. Source: vagheggi.com/75.25',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Balance')}`,
      needs: [
        {
          slug: 'purificante',
          score: 100,
          note: 'Pelle impura/acneica, azione purificante. Source: vagheggi.com/balance',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Bio+')}`,
      needs: [
        {
          slug: 'idratazione',
          score: 100,
          note: 'Idratazione viso. Source: vagheggi.com/bio-viso',
        },
        {
          slug: 'luminosita',
          score: 50,
          note: 'Luminosità viso. Source: vagheggi.com/bio-viso',
        },
        {
          slug: 'anti-age',
          score: 50,
          note: 'Anti-rughe/elasticità viso. Source: vagheggi.com/bio-viso',
        },
        {
          slug: 'nutriente',
          score: 100,
          note: 'Nutrizione corpo. Source: vagheggi.com/bio-corpo',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Booster Viso')}`,
      needs: [],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Bright Formula')}`,
      needs: [
        {
          slug: 'uniformante',
          score: 100,
          note: 'Anti-macchia/tono uniforme. Source: vagheggi.com/bright-formula',
        },
        {
          slug: 'luminosita',
          score: 100,
          note: 'Linea illuminante. Source: vagheggi.com/bright-formula',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Delay Infinity')}`,
      needs: [
        {
          slug: 'anti-age',
          score: 100,
          note: 'Prime rughe/anti-age. Source: vagheggi.com/delay-infinity',
        },
        {
          slug: 'elasticizzante-rimpolpante',
          score: 50,
          note: 'Elasticità/compattezza. Source: vagheggi.com/delay-infinity',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Emozioni Plus')}`,
      needs: [
        {
          slug: 'lenitiva-pelli-sensibili',
          score: 100,
          note: 'Pelle sensibile/intollerante. Source: vagheggi.com/emozioni-plus',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Equilibrium')}`,
      needs: [
        {
          slug: 'idratazione',
          score: 100,
          note: 'Pelle da riequilibrare e nutrire. Source: vagheggi.com/pelle-secca-e-arida',
        },
        {
          slug: 'nutriente',
          score: 100,
          note: 'Pelle da riequilibrare e nutrire (corpo). Source: vagheggi.com/pelle-secca-e-arida',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Intense')}`,
      needs: [
        {
          slug: 'anti-age',
          score: 100,
          note: 'Age care/distensione e riduzione rughe. Source: vagheggi.com/intense',
        },
        {
          slug: 'detossinante-ossidativo',
          score: 50,
          note: 'Protezione da stress e inquinamento (anti-ossidativo). Source: vagheggi.com/intense',
        },
        {
          slug: 'luminosita',
          score: 50,
          note: 'Illuminante/levigante. Source: vagheggi.com/intense',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Lime')}`,
      needs: [
        {
          slug: 'luminosita',
          score: 100,
          note: 'Azione illuminante e anti-macchia. Source: vagheggi.com/lime',
        },
        {
          slug: 'uniformante',
          score: 100,
          note: 'Riduce discromie/macchie. Source: vagheggi.com/lime',
        },
        {
          slug: 'detossinante-ossidativo',
          score: 50,
          note: 'Azione antiossidante/anti-inquinamento. Source: vagheggi.com/lime',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Oligominerali')}`,
      needs: [
        {
          slug: 'detossinante-ossidativo',
          score: 50,
          note: 'Azione riequilibrante (viso). Source: vagheggi.com/oligominerali',
        },
        {
          slug: 'detossinante',
          score: 50,
          note: 'Azione riequilibrante (corpo). Source: vagheggi.com/oligominerali',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Rehydra')}`,
      needs: [
        {
          slug: 'idratazione',
          score: 100,
          note: 'Linea idratante per pelle secca/disidratata. Source: vagheggi.com/pelle-secca-e-arida',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Body Spa')}`,
      needs: [
        {
          slug: 'nutriente',
          score: 100,
          note: 'Azione idratante e nutriente corpo. Source: vagheggi.com/-/linea-body-spa-il-benessere-diventa-esperienza',
        },
        {
          slug: 'esfoliante-levigante',
          score: 50,
          note: 'Scrub nutriente corpo. Source: vagheggi.com/-/linea-body-spa-il-benessere-diventa-esperienza',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Fuoco')}`,
      needs: [
        {
          slug: 'anticellulite',
          score: 100,
          note: 'Inestetismi cellulite/adipe localizzato. Source: vagheggi.com/fuoco-plus',
        },
        {
          slug: 'rassodante-tonificante',
          score: 100,
          note: 'Perdita di tonicità/compattezza. Source: vagheggi.com/fuoco-plus',
        },
        {
          slug: 'drenante',
          score: 50,
          note: 'Microcircolo/drenaggio. Source: vagheggi.com/fuoco-plus',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Linea Bagnodoccia')}`,
      needs: [],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Sikelia')}`,
      needs: [
        {
          slug: 'rassodante-tonificante',
          score: 100,
          note: 'Azione tonificante/rimodellante. Source: vagheggi.com/sikelia',
        },
        {
          slug: 'elasticizzante',
          score: 100,
          note: 'Elasticità e rimodellamento. Source: vagheggi.com/sikelia',
        },
        {
          slug: 'smagliature',
          score: 50,
          note: 'Trattamento smagliature. Source: vagheggi.com/sikelia',
        },
      ],
    },
    {
      lineSlug: `${vagheggiBrandSlug}-${slugify('Sinecell')}`,
      needs: [
        {
          slug: 'anticellulite',
          score: 100,
          note: 'Combattere cellulite e adipe localizzato. Source: vagheggi.com/sinecell',
        },
        {
          slug: 'drenante',
          score: 100,
          note: 'Azione drenante. Source: vagheggi.com/sinecell',
        },
        {
          slug: 'rassodante-tonificante',
          score: 50,
          note: 'Azione tonificante. Source: vagheggi.com/sinecell',
        },
      ],
    },
  ]

  const existingPriorities = await payload.find({
    collection: 'brand-line-needs-priority',
    depth: 0,
    limit: 500,
  })
  const existingPairs = new Set(
    existingPriorities.docs
      .map((doc) => {
        const brandLine = typeof doc.brandLine === 'object' && doc.brandLine ? doc.brandLine.id : doc.brandLine
        const need = typeof doc.need === 'object' && doc.need ? doc.need.id : doc.need
        if (!brandLine || !need) return null
        return `${brandLine}:${need}`
      })
      .filter((value): value is string => Boolean(value)),
  )

  for (const mapping of priorityMappings) {
    const lineId = brandLineSlugToId.get(mapping.lineSlug)
    if (!lineId || mapping.needs.length === 0) continue
    for (const entry of mapping.needs) {
      const needId = needSlugToId.get(entry.slug)
      if (!needId) continue
      const key = `${lineId}:${needId}`
      if (existingPairs.has(key)) continue
      await payload.create({
        collection: 'brand-line-needs-priority',
        overrideAccess: true,
        data: {
          brandLine: lineId,
          need: needId,
          score: entry.score,
          note: entry.note,
        },
      })
      existingPairs.add(key)
    }
  }

  const productAreasResult = await payload.find({
    collection: 'product-areas',
    depth: 0,
    limit: 50,
  })
  const productAreaSlugToId = new Map(productAreasResult.docs.map((doc) => [doc.slug, doc.id]))
  const faceAreaId = productAreaSlugToId.get('viso') ?? productAreaSlugToId.get('face')
  const bodyAreaId = productAreaSlugToId.get('corpo') ?? productAreaSlugToId.get('body')

  if (faceAreaId || bodyAreaId) {
    const routineSteps = [
      ...(faceAreaId
        ? [
            { areaId: faceAreaId, name: 'Detergente', slug: 'detergente', order: 0, isSystem: true, isOptional: false },
            { areaId: faceAreaId, name: 'Tonico', slug: 'tonico', order: 1, isSystem: false, isOptional: false },
            { areaId: faceAreaId, name: 'Siero', slug: 'siero', order: 2, isSystem: false, isOptional: false },
            { areaId: faceAreaId, name: 'Crema', slug: 'crema', order: 3, isSystem: true, isOptional: false },
            { areaId: faceAreaId, name: 'SPF', slug: 'spf', order: 4, isSystem: true, isOptional: false },
            { areaId: faceAreaId, name: 'Struccante', slug: 'struccante', order: 5, isSystem: false, isOptional: true },
            { areaId: faceAreaId, name: 'Esfoliante', slug: 'esfoliante', order: 6, isSystem: false, isOptional: true },
            { areaId: faceAreaId, name: 'Maschera', slug: 'maschera', order: 7, isSystem: false, isOptional: true },
            { areaId: faceAreaId, name: 'Contorno occhi', slug: 'contorno-occhi', order: 8, isSystem: false, isOptional: true },
            {
              areaId: faceAreaId,
              name: 'Trattamento notte',
              slug: 'trattamento-notte',
              order: 9,
              isSystem: false,
              isOptional: true,
            },
          ]
        : []),
      ...(bodyAreaId
        ? [
            {
              areaId: bodyAreaId,
              name: 'Detergente corpo',
              slug: 'detergente-corpo',
              order: 0,
              isSystem: true,
              isOptional: false,
            },
            {
              areaId: bodyAreaId,
              name: 'Esfoliante corpo',
              slug: 'esfoliante-corpo',
              order: 1,
              isSystem: false,
              isOptional: true,
            },
            {
              areaId: bodyAreaId,
              name: 'Trattamento mirato',
              slug: 'trattamento-mirato',
              order: 2,
              isSystem: false,
              isOptional: false,
            },
            {
              areaId: bodyAreaId,
              name: 'Crema / olio finale',
              slug: 'crema-olio-finale',
              order: 3,
              isSystem: true,
              isOptional: false,
            },
          ]
        : []),
    ]

    const existingSteps = await payload.find({
      collection: 'routine-steps',
      depth: 0,
      limit: 500,
    })
    const existingKeys = new Set(existingSteps.docs.map((doc) => `${doc.productArea}:${doc.slug}`))

    for (const step of routineSteps) {
      const key = `${step.areaId}:${step.slug}`
      if (existingKeys.has(key)) continue
      await payload.create({
        collection: 'routine-steps',
        locale: 'it',
        overrideAccess: true,
        data: {
          name: step.name,
          slug: step.slug,
          productArea: step.areaId,
          stepOrderDefault: step.order,
          isOptionalDefault: step.isOptional,
          isSystem: step.isSystem,
          active: true,
        },
      })
    }
  }

  await seedSimpleCollection(payload, 'textures', textures)
}
