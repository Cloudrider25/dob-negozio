import type { Payload } from 'payload'

type RelationValue = number | string | { id?: number | string } | null | undefined

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

const normalizeId = (value: RelationValue): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value)
  }
  if (value && typeof value === 'object' && 'id' in value) {
    return normalizeId(value.id ?? null)
  }
  return null
}

const getLocalizedString = (value: unknown, locale = 'it'): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const localized = value as Record<string, unknown>
    const preferred = localized[locale]
    if (typeof preferred === 'string') return preferred
    const fallback = Object.values(localized).find((item) => typeof item === 'string')
    if (typeof fallback === 'string') return fallback
  }
  return ''
}

const loadAll = async <T extends { id?: number }>(
  payload: Payload,
  collection: Parameters<Payload['find']>[0]['collection'],
  locale?: Parameters<Payload['find']>[0]['locale'],
): Promise<T[]> => {
  const docs: T[] = []
  let page = 1
  while (true) {
    const result = await payload.find({
      collection,
      depth: 1,
      limit: 200,
      page,
      locale,
      overrideAccess: true,
    })
    docs.push(...(result.docs as unknown as T[]))
    if (!result.hasNextPage) break
    page += 1
  }
  return docs
}

const containsAny = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(keyword))

const keywordScore = (text: string, keywords: string[]) =>
  keywords.reduce((score, keyword) => (text.includes(keyword) ? score + 1 : score), 0)

export const seedRoutineBuilder = async (payload: Payload) => {
  const locale = 'it' as const

  const existingSpfAttribute = await payload.find({
    collection: 'attributes',
    depth: 0,
    limit: 1,
    where: { slug: { equals: 'spf-level' } },
    overrideAccess: true,
  })
  if (existingSpfAttribute.docs.length === 0) {
    await payload.create({
      collection: 'attributes',
      locale,
      overrideAccess: true,
      data: {
        slug: 'spf-level',
        type: 'enum',
        active: true,
        sortOrder: 10,
        name: 'SPF',
        description: 'Livello di protezione solare.',
        values: [
          { slug: '30', sortOrder: 0, name: 'SPF 30' },
          { slug: '50', sortOrder: 1, name: 'SPF 50' },
          { slug: '50-plus', sortOrder: 2, name: 'SPF 50+' },
        ],
      },
    })
  }

  const [needs, productAreas, timings, routineSteps, skinTypes, brands, brandLines, products] =
    await Promise.all([
      loadAll<{ id: number; slug: string; name?: unknown; productArea?: RelationValue }>(
        payload,
        'needs',
        locale,
      ),
      loadAll<{ id: number; slug: string; name?: unknown }>(payload, 'product-areas', locale),
      loadAll<{ id: number; slug: string; name?: unknown }>(payload, 'timing-products', locale),
      loadAll<{
        id: number
        slug: string
        productArea?: RelationValue
        stepOrderDefault?: number | null
        isOptionalDefault?: boolean | null
      }>(payload, 'routine-steps', locale),
      loadAll<{ id: number; slug: string; productArea?: RelationValue }>(payload, 'skin-types'),
      loadAll<{ id: number; slug: string }>(payload, 'brands'),
      loadAll<{ id: number; slug: string; brand?: RelationValue }>(payload, 'brand-lines'),
      loadAll<{
        id: number
        slug?: string
        title?: unknown
        brand?: RelationValue
        brandLine?: RelationValue
        needs?: RelationValue[]
        productAreas?: RelationValue[]
        timingProducts?: RelationValue[]
      }>(payload, 'products', locale),
    ])

  const needsBySlug = new Map(needs.map((need) => [need.slug, need]))
  const areaBySlug = new Map(productAreas.map((area) => [area.slug, area]))
  const areaById = new Map(productAreas.map((area) => [area.id, area]))
  const timingBySlug = new Map(timings.map((timing) => [timing.slug, timing]))
  const skinTypeBySlugArea = new Map(
    skinTypes.map((skinType) => [`${skinType.slug}:${normalizeId(skinType.productArea)}`, skinType]),
  )
  const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand]))
  const brandLineBySlug = new Map(brandLines.map((line) => [line.slug, line]))

  const timingOrder = new Map(
    timings.map((timing) => [
      timing.slug,
      timing.slug === 'mattutina'
        ? 0
        : timing.slug === 'serale'
          ? 1
          : timing.slug === 'trattamento-mirato'
            ? 2
            : timing.slug === 'solare'
              ? 3
              : 4,
    ]),
  )

  const brandLineNeedPriority = await payload.find({
    collection: 'brand-line-needs-priority',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
  })
  const topBrandLineByNeedAndBrand = brandLineNeedPriority.docs.reduce((acc, doc) => {
    const needId = normalizeId(doc.need)
    const lineId = normalizeId(doc.brandLine)
    const score = typeof doc.score === 'number' ? doc.score : 0
    if (!needId || !lineId) return acc
    const line = brandLines.find((item) => item.id === lineId)
    const brandId = normalizeId(line?.brand)
    if (!brandId) return acc
    if (!acc.has(brandId)) acc.set(brandId, new Map())
    const brandMap = acc.get(brandId)
    if (!brandMap) return acc
    const current = brandMap.get(needId)
    if (!current || score > current.score) {
      brandMap.set(needId, { lineId, score })
    }
    return acc
  }, new Map<number, Map<number, { lineId: number; score: number }>>())

  const productIndex = products.map((product) => {
    const slug = (product.slug ?? '').toString()
    const title = getLocalizedString(product.title, locale) || slug
    const text = `${slug} ${title}`.toLowerCase()
    return {
      id: product.id,
      slug,
      title,
      text,
      brandId: normalizeId(product.brand),
      brandLineId: normalizeId(product.brandLine),
      needIds: (product.needs ?? [])
        .map((value) => normalizeId(value))
        .filter((value): value is number => typeof value === 'number'),
      areaIds: (product.productAreas ?? [])
        .map((value) => normalizeId(value))
        .filter((value): value is number => typeof value === 'number'),
      timingIds: (product.timingProducts ?? [])
        .map((value) => normalizeId(value))
        .filter((value): value is number => typeof value === 'number'),
    }
  })

  const vagheggiBrand = brandBySlug.get('vagheggi')
  const isClinicalBrand = brandBySlug.get('is-clinical')

  const isClinicalMappings: Array<{
    lineSlug: string
    needs: Array<{ slug: string; score: number; note: string }>
  }> = [
    {
      lineSlug: 'is-clinical-cleansing-complex',
      needs: [
        {
          slug: 'purificante',
          score: 95,
          note: 'Azione purificante e riequilibrante. Fonte: isclinical.com/cleansing-complex',
        },
      ],
    },
    {
      lineSlug: 'is-clinical-hydra-cool-serum',
      needs: [
        {
          slug: 'idratazione',
          score: 95,
          note: 'Siero idratante e lenitivo. Fonte: isclinical.com/hydra-cool-serum',
        },
        {
          slug: 'lenitiva-pelli-sensibili',
          score: 60,
          note: 'Siero lenitivo. Fonte: isclinical.com/hydra-cool-serum',
        },
      ],
    },
    {
      lineSlug: 'is-clinical-pro-heal-serum',
      needs: [
        {
          slug: 'lenitiva-pelli-sensibili',
          score: 90,
          note: 'Trattamento lenitivo e riparatore. Fonte: isclinical.com/pro-heal-serum-advance-plus',
        },
        {
          slug: 'anti-age',
          score: 50,
          note: 'Supporto anti-age. Fonte: isclinical.com/pro-heal-serum-advance-plus',
        },
      ],
    },
    {
      lineSlug: 'is-clinical-youth-serum',
      needs: [
        {
          slug: 'anti-age',
          score: 95,
          note: 'Siero anti-age. Fonte: isclinical.com/youth-serum',
        },
        {
          slug: 'elasticizzante-rimpolpante',
          score: 60,
          note: 'Migliora elasticità. Fonte: isclinical.com/youth-serum',
        },
      ],
    },
    {
      lineSlug: 'is-clinical-moisturizing-complex',
      needs: [
        {
          slug: 'idratazione',
          score: 90,
          note: 'Crema idratante. Fonte: isclinical.com/moisturizing-complex',
        },
      ],
    },
    {
      lineSlug: 'is-clinical-reparative-moisture-emulsion',
      needs: [
        {
          slug: 'idratazione',
          score: 85,
          note: 'Emulsione idratante. Fonte: isclinical.com/reparative-moisture-emulsion',
        },
        {
          slug: 'elasticizzante-rimpolpante',
          score: 50,
          note: 'Ripristino barriera/elasticità. Fonte: isclinical.com/reparative-moisture-emulsion',
        },
      ],
    },
    {
      lineSlug: 'is-clinical-eye-complex',
      needs: [
        {
          slug: 'contorno-occhi',
          score: 100,
          note: 'Trattamento contorno occhi. Fonte: isclinical.com/eye-complex',
        },
      ],
    },
    {
      lineSlug: 'is-clinical-youth-eye-complex',
      needs: [
        {
          slug: 'contorno-occhi',
          score: 100,
          note: 'Trattamento contorno occhi. Fonte: isclinical.com/youth-eye-complex',
        },
      ],
    },
    {
      lineSlug: 'is-clinical-c-eye-serum-advance',
      needs: [
        {
          slug: 'contorno-occhi',
          score: 100,
          note: 'Siero contorno occhi. Fonte: isclinical.com/c-eye-serum-advance-plus',
        },
      ],
    },
  ]

  if (isClinicalBrand) {
    const existingPriority = await payload.find({
      collection: 'brand-line-needs-priority',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
    })
    const existingPairs = new Set(
      existingPriority.docs
        .map((doc) => {
          const brandLine = normalizeId(doc.brandLine)
          const need = normalizeId(doc.need)
          return brandLine && need ? `${brandLine}:${need}` : null
        })
        .filter((value): value is string => Boolean(value)),
    )

    for (const mapping of isClinicalMappings) {
      const line = brandLineBySlug.get(mapping.lineSlug)
      if (!line) continue
      for (const entry of mapping.needs) {
        const need = needsBySlug.get(entry.slug)
        if (!need) continue
        const key = `${line.id}:${need.id}`
        if (existingPairs.has(key)) continue
        await payload.create({
          collection: 'brand-line-needs-priority',
          overrideAccess: true,
          data: {
            brandLine: line.id,
            need: need.id,
            score: entry.score,
            note: entry.note,
          },
        })
        existingPairs.add(key)
      }
    }
  }

  const routineRuleConfigs: Array<{
    stepSlug: string
    timingSlug?: string
    skinTypeSlug?: string
    skinAreaSlug?: string
    ruleType: 'require' | 'forbid' | 'warn'
    note: string
  }> = [
    {
      stepSlug: 'spf',
      timingSlug: 'mattutina',
      ruleType: 'require',
      note: 'SPF consigliato solo al mattino.',
    },
    {
      stepSlug: 'spf',
      timingSlug: 'serale',
      ruleType: 'forbid',
      note: 'SPF non necessario nella routine serale.',
    },
    {
      stepSlug: 'trattamento-notte',
      timingSlug: 'serale',
      ruleType: 'require',
      note: 'Trattamento notte solo nella routine serale.',
    },
    {
      stepSlug: 'struccante',
      timingSlug: 'serale',
      ruleType: 'require',
      note: 'Struccante consigliato nella routine serale.',
    },
    {
      stepSlug: 'struccante',
      timingSlug: 'mattutina',
      ruleType: 'forbid',
      note: 'Struccante non necessario nella routine mattutina.',
    },
    {
      stepSlug: 'esfoliante',
      skinTypeSlug: 'sensibile',
      skinAreaSlug: 'viso',
      ruleType: 'warn',
      note: 'Pelle sensibile: esfoliare con cautela.',
    },
    {
      stepSlug: 'esfoliante',
      skinTypeSlug: 'couperosica-rosacea-prone',
      skinAreaSlug: 'viso',
      ruleType: 'warn',
      note: 'Pelle couperosica/rosacea: esfoliare con cautela.',
    },
    {
      stepSlug: 'esfoliante-corpo',
      skinTypeSlug: 'sensibile',
      skinAreaSlug: 'corpo',
      ruleType: 'warn',
      note: 'Pelle sensibile: esfoliare con cautela.',
    },
  ]

  const existingRules = await payload.find({
    collection: 'routine-step-rules',
    depth: 0,
    limit: 500,
    overrideAccess: true,
  })
  const existingRuleKeys = new Set(
    existingRules.docs
      .map((doc) => {
        const step = normalizeId(doc.routineStep)
        const timing = normalizeId(doc.timing)
        const skinType = normalizeId(doc.skinType)
        const ruleType = doc.ruleType
        return step ? `${step}:${timing ?? 'null'}:${skinType ?? 'null'}:${ruleType}` : null
      })
      .filter((value): value is string => Boolean(value)),
  )

  const routineStepsBySlug = new Map(routineSteps.map((step) => [step.slug, step]))

  for (const rule of routineRuleConfigs) {
    const step = routineStepsBySlug.get(rule.stepSlug)
    if (!step) continue
    const timing = rule.timingSlug ? timingBySlug.get(rule.timingSlug) : undefined
    const skinAreaId = rule.skinAreaSlug ? areaBySlug.get(rule.skinAreaSlug)?.id : undefined
    const skinType =
      rule.skinTypeSlug && skinAreaId
        ? skinTypeBySlugArea.get(`${rule.skinTypeSlug}:${skinAreaId}`)
        : undefined

    const key = `${step.id}:${timing?.id ?? 'null'}:${skinType?.id ?? 'null'}:${rule.ruleType}`
    if (existingRuleKeys.has(key)) continue

    await payload.create({
      collection: 'routine-step-rules',
      overrideAccess: true,
      data: {
        routineStep: step.id,
        timing: timing?.id,
        skinType: skinType?.id,
        ruleType: rule.ruleType,
        note: rule.note,
      },
    })
    existingRuleKeys.add(key)
  }

  const templatesExisting = await payload.find({
    collection: 'routine-templates',
    depth: 0,
    limit: 500,
    overrideAccess: true,
  })
  const existingTemplateSlugs = new Set(templatesExisting.docs.map((doc) => doc.slug))

  const templates: Array<{
    id?: number
    slug: string
    name: string
    description: string
    productAreaId: number
    timingId: number
    needId: number
    isMultibrand: boolean
    brandId?: number
    brandLineId?: number
    sortOrder: number
  }> = []

  const needsByArea = needs.reduce((acc, need) => {
    const areaId = normalizeId(need.productArea)
    if (!areaId) return acc
    if (!acc.has(areaId)) acc.set(areaId, [])
    acc.get(areaId)?.push(need)
    return acc
  }, new Map<number, typeof needs>())

  const timingList = timings.sort((a, b) => (timingOrder.get(a.slug) ?? 0) - (timingOrder.get(b.slug) ?? 0))

  for (const [areaId, areaNeeds] of needsByArea.entries()) {
    const areaLabel =
      getLocalizedString(areaById.get(areaId)?.name, locale) || (areaId === areaBySlug.get('viso')?.id ? 'Viso' : 'Corpo')
    for (const need of areaNeeds) {
      const needLabel = getLocalizedString(need.name, locale) || need.slug
      for (const timing of timingList) {
        const timingLabel = getLocalizedString(timing.name, locale) || timing.slug
        const baseName = `Routine ${areaLabel} ${timingLabel} - ${needLabel}`
        const baseSlug = slugify(`routine-${areaLabel}-${timingLabel}-${needLabel}`)

        templates.push({
          slug: baseSlug,
          name: baseName,
          description: `Routine consigliata per ${needLabel.toLowerCase()} in versione ${timingLabel.toLowerCase()}.`,
          productAreaId: areaId,
          timingId: timing.id,
          needId: need.id,
          isMultibrand: true,
          sortOrder: timingOrder.get(timing.slug) ?? 0,
        })

        if (vagheggiBrand) {
          const topLine = topBrandLineByNeedAndBrand.get(vagheggiBrand.id)?.get(need.id)
          templates.push({
            slug: slugify(`${baseSlug}-vagheggi`),
            name: `${baseName} (Vagheggi)`,
            description: `Routine monobrand Vagheggi per ${needLabel.toLowerCase()}.`,
            productAreaId: areaId,
            timingId: timing.id,
            needId: need.id,
            isMultibrand: false,
            brandId: vagheggiBrand.id,
            brandLineId: topLine?.lineId,
            sortOrder: timingOrder.get(timing.slug) ?? 0,
          })
        }

        if (isClinicalBrand && areaId === areaBySlug.get('viso')?.id) {
          const topLine = topBrandLineByNeedAndBrand.get(isClinicalBrand.id)?.get(need.id)
          templates.push({
            slug: slugify(`${baseSlug}-is-clinical`),
            name: `${baseName} (iS Clinical)`,
            description: `Routine monobrand iS Clinical per ${needLabel.toLowerCase()}.`,
            productAreaId: areaId,
            timingId: timing.id,
            needId: need.id,
            isMultibrand: false,
            brandId: isClinicalBrand.id,
            brandLineId: topLine?.lineId,
            sortOrder: timingOrder.get(timing.slug) ?? 0,
          })
        }
      }
    }
  }

  const templateSlugToId = new Map<string, number>()
  for (const template of templates) {
    if (existingTemplateSlugs.has(template.slug)) continue
    const created = await payload.create({
      collection: 'routine-templates',
      locale,
      overrideAccess: true,
      data: {
        name: template.name,
        slug: template.slug,
        description: template.description,
        productArea: template.productAreaId,
        timing: template.timingId,
        need: template.needId,
        skinType: null,
        isMultibrand: template.isMultibrand,
        brand: template.brandId,
        brandLine: template.brandLineId,
        active: true,
        sortOrder: template.sortOrder,
      },
    })
    templateSlugToId.set(template.slug, created.id as number)
    existingTemplateSlugs.add(template.slug)
  }

  const allTemplates = await loadAll<{
    id: number
    slug: string
    productArea?: RelationValue
    timing?: RelationValue
    need?: RelationValue
    isMultibrand?: boolean | null
    brand?: RelationValue
    brandLine?: RelationValue
  }>(payload, 'routine-templates', locale)

  const existingTemplateSteps = await payload.find({
    collection: 'routine-template-steps',
    depth: 0,
    limit: 2000,
    overrideAccess: true,
  })
  const existingTemplateStepKeys = new Set(
    existingTemplateSteps.docs
      .map((doc) => {
        const templateId = normalizeId(doc.routineTemplate)
        const stepId = normalizeId(doc.routineStep)
        return templateId && stepId ? `${templateId}:${stepId}` : null
      })
      .filter((value): value is string => Boolean(value)),
  )

  const stepsByArea = routineSteps.reduce((acc, step) => {
    const areaId = normalizeId(step.productArea)
    if (!areaId) return acc
    if (!acc.has(areaId)) acc.set(areaId, [])
    acc.get(areaId)?.push(step)
    return acc
  }, new Map<number, typeof routineSteps>())

  for (const template of allTemplates) {
    const areaId = normalizeId(template.productArea)
    if (!areaId) continue
    const steps = (stepsByArea.get(areaId) ?? []).slice().sort((a, b) => {
      const orderA = a.stepOrderDefault ?? 0
      const orderB = b.stepOrderDefault ?? 0
      return orderA - orderB
    })

    for (const step of steps) {
      const key = `${template.id}:${step.id}`
      if (existingTemplateStepKeys.has(key)) continue
      await payload.create({
        collection: 'routine-template-steps',
        overrideAccess: true,
        data: {
          routineTemplate: template.id,
          routineStep: step.id,
          stepOrder: step.stepOrderDefault ?? 0,
          required: !step.isOptionalDefault,
        },
      })
      existingTemplateStepKeys.add(key)
    }
  }

  const existingTemplateStepProducts = await payload.find({
    collection: 'routine-template-step-products',
    depth: 0,
    limit: 5000,
    overrideAccess: true,
  })
  const existingTemplateStepProductKeys = new Set(
    existingTemplateStepProducts.docs
      .map((doc) => {
        const templateId = normalizeId(doc.routineTemplate)
        const stepId = normalizeId(doc.routineStep)
        const productId = normalizeId(doc.product)
        return templateId && stepId && productId ? `${templateId}:${stepId}:${productId}` : null
      })
      .filter((value): value is string => Boolean(value)),
  )

  const stepKeywords: Record<string, string[]> = {
    detergente: ['detergente', 'dettersione', 'deter', 'cleansing', 'cleanser', 'latte', 'mousse'],
    tonico: ['tonico', 'toner', 'lozione', 'lotion'],
    siero: ['siero', 'serum', 'booster', 'fiala', 'elixir'],
    crema: ['crema', 'cream', 'moistur', 'emulsion', 'complex'],
    spf: ['spf', 'sunscreen', 'protezione'],
    struccante: ['struccante', 'doppia-dettersione'],
    esfoliante: ['esfoliante', 'scrub', 'peel', 'papaina'],
    maschera: ['maschera', 'mask'],
    'contorno-occhi': ['contorno-occhi', 'eye', 'occhi', 'c-eye'],
    'trattamento-notte': ['notte', 'night'],
    'detergente-corpo': ['detergente', 'bagnodoccia', 'doccia', 'mousse'],
    'esfoliante-corpo': ['esfoliante', 'scrub', 'peel'],
    'trattamento-mirato': ['anticellulite', 'riducente', 'drenante', 'thermo', 'criogel', 'leggings', 'sculpting', 'bende'],
    'crema-olio-finale': ['crema', 'olio', 'emulsion', 'complex'],
  }

  const timingFilter = (timingSlug: string, text: string) => {
    if (timingSlug === 'mattutina') {
      return !containsAny(text, ['notte', 'night'])
    }
    if (timingSlug === 'serale') {
      return !containsAny(text, ['giorno', 'day', 'spf'])
    }
    if (timingSlug === 'solare') {
      return containsAny(text, ['spf', 'solare', 'sun', 'protezione', 'uv'])
    }
    if (timingSlug === 'trattamento-mirato') {
      return containsAny(text, ['trattamento', 'booster', 'fiala', 'ampolla', 'mask', 'maschera', 'peel', 'scrub'])
    }
    return true
  }

  for (const template of allTemplates) {
    const areaId = normalizeId(template.productArea)
    const needId = normalizeId(template.need)
    const timing = normalizeId(template.timing)
    const timingSlug = timings.find((item) => item.id === timing)?.slug
    if (!areaId || !needId || !timingSlug) continue

    const timingId = timingBySlug.get(timingSlug)?.id
    const baseProducts = productIndex.filter((product) => {
      if (!product.areaIds.includes(areaId)) return false
      if (template.brand && normalizeId(template.brand) && product.brandId !== normalizeId(template.brand)) return false
      if (template.brandLine && normalizeId(template.brandLine) && product.brandLineId !== normalizeId(template.brandLine))
        return false
      if (timingId && product.timingIds.length > 0) {
        return product.timingIds.includes(timingId)
      }
      return timingFilter(timingSlug, product.text)
    })
    const needProducts = baseProducts.filter((product) => product.needIds.includes(needId))

    const steps = (stepsByArea.get(areaId) ?? []).slice().sort((a, b) => {
      const orderA = a.stepOrderDefault ?? 0
      const orderB = b.stepOrderDefault ?? 0
      return orderA - orderB
    })

    for (const step of steps) {
      const keywords = stepKeywords[step.slug] ?? []
      const useNeedProducts = ![
        'detergente',
        'tonico',
        'crema',
        'spf',
        'struccante',
        'contorno-occhi',
      ].includes(step.slug)
      const sourceProducts =
        useNeedProducts && needProducts.length > 0 ? needProducts : baseProducts

      const candidates = sourceProducts
        .map((product) => ({
          product,
          score: keywordScore(product.text, keywords),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 1)

      let rank = 0
      for (const candidate of candidates) {
        const key = `${template.id}:${step.id}:${candidate.product.id}`
        if (existingTemplateStepProductKeys.has(key)) continue
        await payload.create({
          collection: 'routine-template-step-products',
          overrideAccess: true,
          data: {
            routineTemplate: template.id,
            routineStep: step.id,
            product: candidate.product.id,
            rank,
          },
        })
        existingTemplateStepProductKeys.add(key)
        rank += 1
      }
    }
  }

  const boostsExisting = await payload.find({
    collection: 'boosts',
    depth: 0,
    limit: 200,
    overrideAccess: true,
  })
  const boostKeys = new Set(
    boostsExisting.docs
      .map((doc) => {
        const timingId = normalizeId(doc.timing)
        const stepId = normalizeId(doc.routineStep)
        return timingId && stepId ? `${timingId}:${stepId}` : null
      })
      .filter((value): value is string => Boolean(value)),
  )

  const boostConfigs: Array<{ timingSlug: string; stepSlug: string; score: number }> = [
    { timingSlug: 'mattutina', stepSlug: 'spf', score: 20 },
    { timingSlug: 'serale', stepSlug: 'trattamento-notte', score: 20 },
    { timingSlug: 'serale', stepSlug: 'esfoliante', score: 10 },
  ]

  for (const boost of boostConfigs) {
    const timing = timingBySlug.get(boost.timingSlug)
    const step = routineStepsBySlug.get(boost.stepSlug)
    if (!timing || !step) continue
    const key = `${timing.id}:${step.id}`
    if (boostKeys.has(key)) continue
    await payload.create({
      collection: 'boosts',
      overrideAccess: true,
      data: {
        score: boost.score,
        timing: timing.id,
        routineStep: step.id,
      },
    })
    boostKeys.add(key)
  }

  const exclusionsExisting = await payload.find({
    collection: 'exclusions',
    depth: 0,
    limit: 500,
    overrideAccess: true,
  })
  const exclusionKeys = new Set(
    exclusionsExisting.docs
      .map((doc) => {
        const timingId = normalizeId(doc.timing)
        const stepId = normalizeId(doc.routineStep)
        const skinTypeId = normalizeId(doc.skinType)
        const severity = doc.severity
        return stepId ? `${stepId}:${timingId ?? 'null'}:${skinTypeId ?? 'null'}:${severity}` : null
      })
      .filter((value): value is string => Boolean(value)),
  )

  const exclusionConfigs: Array<{
    stepSlug: string
    timingSlug?: string
    skinTypeSlug?: string
    skinAreaSlug?: string
    severity: 'hide' | 'warn'
    reason: string
  }> = [
    {
      stepSlug: 'spf',
      timingSlug: 'serale',
      severity: 'hide',
      reason: 'SPF non necessario nella routine serale.',
    },
    {
      stepSlug: 'struccante',
      timingSlug: 'mattutina',
      severity: 'hide',
      reason: 'Struccante non necessario nella routine mattutina.',
    },
    {
      stepSlug: 'trattamento-notte',
      timingSlug: 'mattutina',
      severity: 'hide',
      reason: 'Trattamento notte non necessario al mattino.',
    },
    {
      stepSlug: 'esfoliante',
      skinTypeSlug: 'sensibile',
      skinAreaSlug: 'viso',
      severity: 'warn',
      reason: 'Pelle sensibile: esfoliare con cautela.',
    },
    {
      stepSlug: 'esfoliante',
      skinTypeSlug: 'couperosica-rosacea-prone',
      skinAreaSlug: 'viso',
      severity: 'warn',
      reason: 'Pelle couperosica/rosacea: esfoliare con cautela.',
    },
    {
      stepSlug: 'esfoliante-corpo',
      skinTypeSlug: 'sensibile',
      skinAreaSlug: 'corpo',
      severity: 'warn',
      reason: 'Pelle sensibile: esfoliare con cautela.',
    },
  ]

  for (const exclusion of exclusionConfigs) {
    const step = routineStepsBySlug.get(exclusion.stepSlug)
    if (!step) continue
    const timing = exclusion.timingSlug ? timingBySlug.get(exclusion.timingSlug) : undefined
    const skinAreaId = exclusion.skinAreaSlug ? areaBySlug.get(exclusion.skinAreaSlug)?.id : undefined
    const skinType =
      exclusion.skinTypeSlug && skinAreaId
        ? skinTypeBySlugArea.get(`${exclusion.skinTypeSlug}:${skinAreaId}`)
        : undefined

    const key = `${step.id}:${timing?.id ?? 'null'}:${skinType?.id ?? 'null'}:${exclusion.severity}`
    if (exclusionKeys.has(key)) continue

    await payload.create({
      collection: 'exclusions',
      overrideAccess: true,
      data: {
        severity: exclusion.severity,
        reason: exclusion.reason,
        timing: timing?.id,
        routineStep: step.id,
        skinType: skinType?.id,
      },
    })
    exclusionKeys.add(key)
  }
}
