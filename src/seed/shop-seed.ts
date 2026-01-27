import type { Payload } from 'payload'

type SeedItem = {
  name: string
  slug: string
  description?: string
  order?: number
}

type SeedCategory = SeedItem & {
  parentSlug?: string
  isMakeupRoot?: boolean
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
  | 'needs'
  | 'categories'
  | 'routine-steps'
  | 'lines'
  | 'textures'
  | 'makeup-collections'

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

const fetchBySlugs = async (
  payload: Payload,
  collection: SeedCollectionSlug,
  slugs: string[],
) => {
  if (!slugs.length) return new Map<string, string>()
  const result = await payload.find({
    collection,
    depth: 0,
    limit: slugs.length,
    where: { slug: { in: slugs } },
  })
  const map = new Map<string, number>()
  for (const doc of result.docs) {
    map.set(doc.slug, doc.id)
  }
  return map
}

const seedCategories = async (payload: Payload, categories: SeedCategory[]) => {
  if (!categories.length) return
  const roots = categories.filter((item) => !item.parentSlug)
  const children = categories.filter((item) => item.parentSlug)

  await seedSimpleCollection(payload, 'categories', roots)

  const allSlugs = categories.map((item) => item.slug)
  const slugToId = await fetchBySlugs(payload, 'categories', allSlugs)

  const existingSlugs = new Set(slugToId.keys())
  for (const item of children) {
    if (existingSlugs.has(item.slug)) continue
    const parentId = item.parentSlug ? slugToId.get(item.parentSlug) : undefined
    await payload.create({
      collection: 'categories',
      locale: 'it',
      overrideAccess: true,
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        order: item.order ?? 0,
        parent: (parentId ?? undefined) as number | undefined,
        isMakeupRoot: item.isMakeupRoot ?? false,
      },
    })
  }

  for (const item of roots) {
    if (!item.isMakeupRoot) continue
    const id = slugToId.get(item.slug)
    if (!id) continue
    await payload.update({
      collection: 'categories',
      id,
      overrideAccess: true,
      data: { isMakeupRoot: true },
    })
  }
}

export const seedShopTaxonomies = async (payload: Payload) => {
  const needsGroups = [
    {
      group: 'Viso',
      items: [
        'Rughe di Espressione',
        'Anti-age',
        'Prime Rughe',
        'Pelle con macchie',
        'Pelle Spenta',
        'Pelle Secca',
        'Pelle Normale',
        'Pelle Mista-impura',
        'Pelle Sensibile e Intollerante',
        'Pelle Maschile',
        'Age Care',
        'Skin Longevity',
      ],
    },
    {
      group: 'Corpo',
      items: [
        'Azione urto globale',
        'Benessere',
        'Cellulite',
        'Idratare e Nutrire',
        'Ridurre',
        'Tonificare e Rimodellare',
        'Zone Specifiche',
      ],
    },
    {
      group: 'Solari',
      items: [
        'Alte e Molto Alte Protezioni',
        'Basse, Medie Protezioni e Abbronzanti',
        'Doposole',
      ],
    },
    {
      group: 'Make-up',
      items: ['Viso', 'Occhi', 'Labbra'],
    },
  ]

  const needs = needsGroups.flatMap((group, groupIndex) =>
    group.items.map((name, index) => ({
      name,
      slug: `${slugify(group.group)}-${slugify(name)}`,
      order: groupIndex * 100 + index,
    })),
  )

  const rootCategories = [
    'Bestseller',
    'Viso',
    'Corpo',
    'Solari',
    'Make up',
    'Limited Edition',
  ]

  const rootCategoryItems = rootCategories.map((name, index) => ({
    name,
    slug: slugify(name === 'Make up' ? 'Make-up' : name),
    order: index,
    isMakeupRoot: name === 'Make up',
  }))

  const childrenByParent: Array<{ parent: string; items: string[] }> = [
    {
      parent: 'Viso',
      items: [
        'Biologico e Vegano',
        'Creme',
        'Detergenti e Struccanti',
        'Lozioni tonificanti e Mist',
        'Esfolianti e Scrub',
        'Maschere',
        'Sieri e concentrati',
        'Occhi e Labbra',
        'Kit',
      ],
    },
    {
      parent: 'Corpo',
      items: [
        'Oli',
        'Detersione e Igiene personale',
        'Scrub',
        'Creme e Burri',
        'Sieri',
        'Mousse',
        'Bende & Leggings',
        'Biologico e Vegano',
      ],
    },
    {
      parent: 'Solari',
      items: ['Protezione Corpo', 'Protezione Viso'],
    },
    {
      parent: 'Make up',
      items: [
        'Fondotinta',
        'Correttore',
        'Cipria',
        'Terre e Blush',
        'Sopracciglia',
        'Matite Occhi',
        'Matite Labbra',
        'Rossetti',
        'Ombretti',
        'Eyeliner e Mascara',
        'Pennelli e Accessori',
      ],
    },
    {
      parent: 'Limited Edition',
      items: ['Ambra di Sicilia'],
    },
  ]

  const childCategories = childrenByParent.flatMap((group, groupIndex) => {
    const parentSlug = slugify(group.parent === 'Make up' ? 'Make-up' : group.parent)
    return group.items.map((name, index) => ({
      name,
      slug: `${parentSlug}-${slugify(name)}`,
      parentSlug,
      order: groupIndex * 100 + index,
    }))
  })

  const categories: SeedCategory[] = [...rootCategoryItems, ...childCategories]

  const routineSteps = buildOrderedItems(['Fondamentali', 'Specifico'])

  const lines = buildOrderedItems([
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
  ])

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

  const makeupCollections = buildOrderedItems(['Basic', 'Eva', 'Grace', 'Lucrezia'])

  await seedSimpleCollection(payload, 'needs', needs)
  await seedCategories(payload, categories)
  await seedSimpleCollection(payload, 'routine-steps', routineSteps)
  await seedSimpleCollection(payload, 'lines', lines)
  await seedSimpleCollection(payload, 'textures', textures)
  await seedSimpleCollection(payload, 'makeup-collections', makeupCollections)
}
