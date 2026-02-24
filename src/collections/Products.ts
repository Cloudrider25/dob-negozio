import type { CollectionConfig, Where } from 'payload'

import { isAdmin } from '../access/isAdmin'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const relationFilterFields = new Set([
  'productAreas',
  'needs',
  'textures',
  'timingProducts',
  'skinTypePrimary',
  'skinTypeSecondary',
  'brand',
  'brandLine',
])

const normalizeWhereEqualsArray = (where?: Where): Where | undefined => {
  if (!where || typeof where !== 'object') return where

  const walk = (node: unknown): unknown => {
    if (!node || typeof node !== 'object') return node
    if (Array.isArray(node)) return node.map(walk)

    const record = node as Record<string, unknown>
    const next: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(record)) {
      if ((key === 'and' || key === 'or') && Array.isArray(value)) {
        next[key] = value.map(walk)
        continue
      }

      if (relationFilterFields.has(key) && value && typeof value === 'object') {
        const valueRecord = value as Record<string, unknown>
        const equalsValue = valueRecord.equals
        if (Array.isArray(equalsValue)) {
          next[key] = {
            ...valueRecord,
            in: equalsValue,
          }
          delete (next[key] as Record<string, unknown>).equals
          continue
        }
      }

      next[key] = walk(value)
    }

    return next
  }

  return walk(where) as Where
}

const productGalleryMediaFilterOptions = ({ data }: { data?: unknown }) => {
  if (!data) return true

  const toId = (value: unknown): number | string | null => {
    if (typeof value === 'number' || typeof value === 'string') return value
    if (value && typeof value === 'object' && 'id' in value) {
      const id = (value as { id?: unknown }).id
      if (typeof id === 'number' || typeof id === 'string') return id
    }
    return null
  }

  const ids = new Set<number | string>()
  const coverId = toId((data as { coverImage?: unknown }).coverImage)
  if (coverId !== null) ids.add(coverId)

  const images = (data as { images?: unknown }).images
  if (Array.isArray(images)) {
    for (const image of images) {
      const imageId = toId(image)
      if (imageId !== null) ids.add(imageId)
    }
  }

  if (ids.size === 0) return true
  return { id: { in: Array.from(ids) } }
}

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'price', 'active'],
    group: 'Catalogo Shop',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeOperation: [
      ({ args, operation }) => {
        if (operation !== 'find') return args
        if (!args?.where) return args
        return {
          ...args,
          where: normalizeWhereEqualsArray(args.where),
        }
      },
    ],
    beforeValidate: [
      ({ data, req }) => {
        if (!data || data.slug) return data
        const rawTitle = data.title
        let titleValue = ''
        if (typeof rawTitle === 'string') {
          titleValue = rawTitle
        } else if (rawTitle && typeof rawTitle === 'object') {
          const localized = rawTitle as Record<string, unknown>
          const preferredLocale = req.locale || 'it'
          const preferred = localized[preferredLocale]
          if (typeof preferred === 'string') {
            titleValue = preferred
          } else {
            const first = Object.values(localized).find((value) => typeof value === 'string')
            if (typeof first === 'string') titleValue = first
          }
        }
        if (!titleValue) return data
        const slug = slugify(titleValue)
        if (slug) {
          data.slug = slug
        }
        return data
      },
      ({ data, originalDoc }) => {
        if (!data) return data

        const source = Array.isArray(data.deliveries)
          ? data.deliveries
          : Array.isArray(originalDoc?.deliveries)
            ? originalDoc?.deliveries
            : []

        if (!Array.isArray(source) || source.length === 0) {
          data.stock = 0
          data.averageCost = 0
          data.total = 0
          data.lastDeliveryDate = null
          return data
        }

        let totalQuantity = 0
        let totalCost = 0
        let lastDeliveryTime = -Infinity
        let lastDeliveryISO: string | null = null

        const normalized = source.map((entry) => {
          const quantity = typeof entry?.quantity === 'number' ? entry.quantity : 0
          const costPerUnit = typeof entry?.costPerUnit === 'number' ? entry.costPerUnit : 0
          const total = quantity > 0 && costPerUnit > 0 ? quantity * costPerUnit : typeof entry?.totalCost === 'number' ? entry.totalCost : 0

          totalQuantity += quantity
          totalCost += total

          const deliveryDateValue = entry?.deliveryDate
          const deliveryDate =
            typeof deliveryDateValue === 'string' || deliveryDateValue instanceof Date
              ? new Date(deliveryDateValue)
              : null

          if (deliveryDate && !Number.isNaN(deliveryDate.getTime())) {
            const time = deliveryDate.getTime()
            if (time > lastDeliveryTime) {
              lastDeliveryTime = time
              lastDeliveryISO = deliveryDate.toISOString()
            }
          }

          return {
            ...entry,
            totalCost: total,
          }
        })

        if (Array.isArray(data.deliveries)) {
          data.deliveries = normalized
        }

        data.stock = totalQuantity
        data.total = totalCost
        data.averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0
        data.lastDeliveryDate = lastDeliveryISO

        return data
      },
      async ({ data, req, originalDoc }) => {
        if (!data) return data

        const resolveId = (value: unknown): number | undefined => {
          const normalize = (input: unknown) => {
            if (typeof input === 'number' && Number.isFinite(input)) return input
            if (typeof input === 'string' && input.trim() !== '' && !Number.isNaN(Number(input))) {
              return Number(input)
            }
            return undefined
          }
          if (typeof value === 'object' && value && 'id' in value) {
            const record = value as { id?: unknown }
            return normalize(record.id)
          }
          return normalize(value)
        }

        const locale = req.locale || 'it'
        const cache = (req.context as { shopCache?: Record<string, unknown> }).shopCache ?? {}
        ;(req.context as { shopCache?: Record<string, unknown> }).shopCache = cache

        const getCached = async <T>(
          key: string,
          loader: () => Promise<T>,
        ): Promise<T> => {
          if (key in cache) return cache[key] as T
          const value = await loader()
          cache[key] = value
          return value
        }

        const brandLineId = resolveId(data.brandLine) ?? resolveId(originalDoc?.brandLine)
        if (!brandLineId) return data

        const brandLine = await req.payload.findByID({
          collection: 'brand-lines',
          id: String(brandLineId),
          depth: 0,
          locale,
          overrideAccess: false,
          req,
        })

        if (!data.brand && brandLine?.brand) {
          data.brand = brandLine.brand
        }

        const isEmptyText = (value: unknown) => typeof value !== 'string' || value.trim().length === 0

        if (isEmptyText(data.description) && typeof brandLine?.description === 'string') {
          data.description = brandLine.description
        }
        if (isEmptyText(data.usage) && typeof brandLine?.usage === 'string') {
          data.usage = brandLine.usage
        }
        if (isEmptyText(data.activeIngredients) && typeof brandLine?.activeIngredients === 'string') {
          data.activeIngredients = brandLine.activeIngredients
        }
        if (isEmptyText(data.results) && typeof brandLine?.results === 'string') {
          data.results = brandLine.results
        }
        if (!Array.isArray(data.needs) || data.needs.length === 0) {
          const needsPriority = await req.payload.find({
            collection: 'brand-line-needs-priority',
            depth: 0,
            limit: 50,
            where: {
              brandLine: { equals: brandLineId },
            },
            overrideAccess: false,
            req,
          })
          if (needsPriority.docs.length > 0) {
            const needs = needsPriority.docs
              .map((doc) => (typeof doc.need === 'object' && doc.need ? doc.need.id : doc.need))
              .map((id) => (typeof id === 'number' ? id : typeof id === 'string' ? Number(id) : undefined))
              .filter((id): id is number => typeof id === 'number' && Number.isFinite(id))
            if (needs.length > 0) {
              data.needs = needs

              if (!Array.isArray(data.productAreas) || data.productAreas.length === 0) {
                const needsDocs = await req.payload.find({
                  collection: 'needs',
                  depth: 1,
                  limit: needs.length,
                  where: { id: { in: needs } },
                  overrideAccess: false,
                  req,
                })
                const areaIds = new Set<number>()
                for (const need of needsDocs.docs) {
                  const area =
                    typeof need.productArea === 'object' && need.productArea
                      ? need.productArea.id
                      : need.productArea
                  const normalized = typeof area === 'number' ? area : typeof area === 'string' ? Number(area) : undefined
                  if (typeof normalized === 'number' && Number.isFinite(normalized)) {
                    areaIds.add(normalized)
                  }
                }
                if (areaIds.size > 0) {
                  data.productAreas = Array.from(areaIds)
                }
              }
            }
          }
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

        const resolveTimingSlugs = (slug: string): string[] => {
          const lower = slug.toLowerCase()
          if (
            lower.includes('spf') ||
            lower.includes('solare') ||
            lower.includes('sun') ||
            lower.includes('uv')
          ) {
            return ['solare']
          }
          const isMorning =
            lower.includes('giorno') || lower.includes('day') || lower.includes('mattina') || lower.includes('mattutina')
          const isNight =
            lower.includes('notte') || lower.includes('night') || lower.includes('sera') || lower.includes('serale')
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
          'is-clinical-cleansing-complex': { primary: 'impura-acneica', secondary: [] },
          'is-clinical-cream-cleanser': { primary: 'sensibile', secondary: [] },
          'is-clinical-youth-serum': { primary: 'matura', secondary: [] },
          'is-clinical-pro-heal-serum': { primary: 'matura', secondary: [] },
          'is-clinical-hydra-cool-serum': { primary: 'secca', secondary: ['disidratata'] },
          'is-clinical-reparative-moisture-emulsion': { primary: 'secca', secondary: ['disidratata'] },
          'is-clinical-moisturizing-complex': { primary: 'secca', secondary: ['disidratata'] },
          'is-clinical-eye-complex': { primary: 'normale', secondary: [] },
          'is-clinical-youth-eye-complex': { primary: 'matura', secondary: [] },
          'is-clinical-c-eye-serum-advance': { primary: 'matura', secondary: [] },
        }

        if (!Array.isArray(data.textures) || data.textures.length === 0) {
          const texturesBySlug = await getCached('texturesBySlug', async () => {
            const textures = await req.payload.find({
              collection: 'textures',
              depth: 0,
              limit: 200,
              overrideAccess: false,
              req,
            })
            return new Map(textures.docs.map((texture) => [texture.slug, texture.id]))
          })
          const source = `${data.title || ''} ${data.slug || ''}`.toLowerCase()
          const match = keywordTextureMap.find(({ keyword }) => source.includes(keyword))
          if (match) {
            const textureId = texturesBySlug.get(match.slug)
            if (textureId) data.textures = [textureId]
          }
        }

        if (!Array.isArray(data.timingProducts) || data.timingProducts.length === 0) {
          const timingBySlug = await getCached('timingBySlug', async () => {
            const timings = await req.payload.find({
              collection: 'timing-products',
              depth: 0,
              limit: 20,
              overrideAccess: false,
              req,
            })
            return new Map(timings.docs.map((timing) => [timing.slug, timing.id]))
          })
          const timingSlugs = resolveTimingSlugs(data.slug || '')
          const timingIds = timingSlugs
            .map((timingSlug) => timingBySlug.get(timingSlug))
            .filter((value): value is number => typeof value === 'number')
          if (timingIds.length > 0) data.timingProducts = timingIds
        }

        const lineSlug = typeof brandLine?.slug === 'string' ? brandLine.slug : undefined
        if (!data.skinTypePrimary && lineSlug && skinTypeMap[lineSlug]) {
          const skinTypeBySlug = await getCached('skinTypeBySlug', async () => {
            const types = await req.payload.find({
              collection: 'skin-types',
              depth: 0,
              limit: 200,
              overrideAccess: false,
              req,
            })
            return new Map(types.docs.map((type) => [type.slug, type.id]))
          })
          const primaryId = skinTypeBySlug.get(skinTypeMap[lineSlug].primary)
          if (primaryId) data.skinTypePrimary = primaryId
        }

        if ((!Array.isArray(data.skinTypeSecondary) || data.skinTypeSecondary.length === 0) && lineSlug && skinTypeMap[lineSlug]) {
          const skinTypeBySlug = await getCached('skinTypeBySlug', async () => {
            const types = await req.payload.find({
              collection: 'skin-types',
              depth: 0,
              limit: 200,
              overrideAccess: false,
              req,
            })
            return new Map(types.docs.map((type) => [type.slug, type.id]))
          })
          const secondaryIds = skinTypeMap[lineSlug].secondary
            .map((slug) => skinTypeBySlug.get(slug))
            .filter((id): id is number => typeof id === 'number')
          if (secondaryIds.length > 0) data.skinTypeSecondary = secondaryIds
        }

        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Prod. Generali',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'sku',
                  type: 'text',
                  unique: true,
                },
                {
                  name: 'format',
                  label: 'Formato',
                  type: 'text',
                },
                {
                  name: 'price',
                  label: 'Selling price',
                  type: 'number',
                  min: 0,
                  required: true,
                },
              ],
            },
            {
              name: 'alternatives',
              label: 'Variazioni prodotto',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'product',
                      label: 'Prodotto',
                      type: 'relationship',
                      relationTo: 'products',
                      filterOptions: ({ data, req }) => {
                        if (req?.context && (req.context as { skipAlternativeFilter?: boolean }).skipAlternativeFilter) {
                          return true
                        }
                        if (!data) return true

                        const asId = (value: unknown) => {
                          if (typeof value === 'object' && value && 'id' in value) {
                            const record = value as { id?: unknown }
                            if (typeof record.id === 'number' || typeof record.id === 'string') return record.id
                          }
                          if (typeof value === 'number' || typeof value === 'string') return value
                          return undefined
                        }

                        const toIdArray = (value: unknown) => {
                          if (Array.isArray(value)) {
                            return value
                              .map(asId)
                              .filter((id): id is number | string => typeof id === 'number' || typeof id === 'string')
                          }
                          const single = asId(value)
                          return single ? [single] : []
                        }

                        const and: Where[] = [{ active: { equals: true } } as Where]

                        const selfId = asId(data.id)
                        if (selfId) {
                          and.push({ id: { not_equals: selfId } } as Where)
                        }

                        const brandId = asId(data.brand)
                        if (brandId) {
                          and.push({ brand: { equals: brandId } } as Where)
                        }

                        const brandLineId = asId(data.brandLine)
                        if (brandLineId) {
                          and.push({ brandLine: { equals: brandLineId } } as Where)
                        }

                        const skinTypePrimaryId = asId(data.skinTypePrimary)
                        if (skinTypePrimaryId) {
                          and.push({ skinTypePrimary: { equals: skinTypePrimaryId } } as Where)
                        }

                        for (const needId of toIdArray(data.needs)) {
                          and.push({ needs: { contains: needId } } as Where)
                        }

                        for (const skinTypeId of toIdArray(data.skinTypeSecondary)) {
                          and.push({ skinTypeSecondary: { contains: skinTypeId } } as Where)
                        }

                        for (const textureId of toIdArray(data.textures)) {
                          and.push({ textures: { contains: textureId } } as Where)
                        }

                        for (const areaId of toIdArray(data.productAreas)) {
                          and.push({ productAreas: { contains: areaId } } as Where)
                        }

                        for (const timingId of toIdArray(data.timingProducts)) {
                          and.push({ timingProducts: { contains: timingId } } as Where)
                        }

                        return { and } as Where
                      },
                    },
                    {
                      name: 'sku',
                      type: 'text',
                    },
                    {
                      name: 'format',
                      label: 'Formato',
                      type: 'text',
                    },
                    {
                      name: 'price',
                      label: 'Selling price',
                      type: 'number',
                      min: 0,
                    },
                  ],
                },
                {
                  name: 'isRefill',
                  label: 'Is refill',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
        {
          label: 'Prod. Info',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'tagline',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'badgeSource',
                  label: 'Badge source',
                  type: 'select',
                  defaultValue: 'brand',
                  options: [
                    { label: 'Brand badge', value: 'brand' },
                    { label: 'Badge collection', value: 'collection' },
                  ],
                  required: true,
                },
                {
                  name: 'badge',
                  label: 'Badge',
                  type: 'relationship',
                  relationTo: 'badges',
                  admin: {
                    condition: (data) => data?.badgeSource === 'collection',
                  },
                },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'brand',
                  type: 'relationship',
                  relationTo: 'brands',
                },
                {
                  name: 'brandLine',
                  type: 'relationship',
                  relationTo: 'brand-lines',
                  filterOptions: ({ data }) => {
                    if (!data?.brand) return true
                    return { brand: { equals: data.brand } }
                  },
                },
              ],
            },
            {
              name: 'isRefill',
              label: 'Is refill',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          label: 'Prod. Gallery',
          fields: [
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              maxRows: 4,
            },
          ],
        },
        {
          label: 'Prod. Accordion',
          fields: [
            {
              name: 'heroAccordionTitle',
              type: 'ui',
              label: 'Hero + Accordion',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'usage',
              label: "Modo d'uso",
              type: 'textarea',
              localized: true,
            },
            {
              name: 'activeIngredients',
              label: 'Principi attivi',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'results',
              label: 'Risultati',
              type: 'textarea',
              localized: true,
            },
          ],
        },
        {
          label: 'Prod. Video',
          fields: [
            {
              name: 'videoSectionTitle',
              type: 'ui',
              label: 'Video',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'videoEmbedUrl',
              type: 'text',
              admin: {
                description: 'URL embed (YouTube/Vimeo)',
              },
            },
            {
              name: 'videoUpload',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'videoPoster',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Prod. Specs',
          fields: [
            {
              name: 'specsSectionTitle',
              type: 'ui',
              label: 'Product Specs',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'specsMedia',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: productGalleryMediaFilterOptions,
              admin: {
                description: 'Seleziona un media già presente in cover/gallery del prodotto.',
              },
            },
            {
              name: 'specsGoodFor',
              label: 'Good for',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'specsFeelsLike',
              label: 'Feels like',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'specsSmellsLike',
              label: 'Smells like',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'specsFYI',
              label: 'FYI',
              type: 'textarea',
              localized: true,
            },
          ],
        },
        {
          label: 'Prod. Include',
          fields: [
            {
              name: 'includedSectionTitle',
              type: 'ui',
              label: "What's included",
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'includedMedia',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: productGalleryMediaFilterOptions,
              admin: {
                description: 'Seleziona un media dalla gallery del prodotto.',
              },
            },
            {
              name: 'includedLabel',
              label: 'Label',
              type: 'text',
              localized: true,
            },
            {
              name: 'includedDescription',
              type: 'richText',
              localized: true,
            },
            {
              name: 'includedIngredientsLabel',
              label: 'Ingredients Label',
              type: 'text',
              localized: true,
            },
            {
              name: 'includedIngredients',
              label: 'Ingredients',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      label: 'Label',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'description',
                      label: 'Description',
                      type: 'textarea',
                      localized: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'includedFooter',
              label: 'Footer',
              type: 'text',
              localized: true,
            },
          ],
        },
        {
          label: 'Prod. FAQ',
          fields: [
            {
              name: 'faqSectionTitle',
              type: 'ui',
              label: 'FAQ',
              admin: {
                components: {
                  Field: '/components/admin/SectionTitle',
                },
              },
            },
            {
              name: 'faqMedia',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: productGalleryMediaFilterOptions,
            },
            {
              type: 'row',
              fields: [
                { name: 'faqTitle', type: 'text', localized: true },
                { name: 'faqSubtitle', type: 'text', localized: true },
              ],
            },
            {
              name: 'faqItems',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'q', type: 'text', localized: true },
                    { name: 'a', type: 'textarea', localized: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Relazioni',
          fields: [
            {
              name: 'needs',
              type: 'relationship',
              relationTo: 'needs',
              hasMany: true,
            },
            {
              name: 'skinTypePrimary',
              type: 'relationship',
              relationTo: 'skin-types',
            },
            {
              name: 'skinTypeSecondary',
              type: 'relationship',
              relationTo: 'skin-types',
              hasMany: true,
            },
            {
              name: 'textures',
              type: 'relationship',
              relationTo: 'textures',
              hasMany: true,
            },
            {
              name: 'productAreas',
              type: 'relationship',
              relationTo: 'product-areas',
              hasMany: true,
            },
            {
              name: 'timingProducts',
              type: 'relationship',
              relationTo: 'timing-products',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Magazzino',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'stock',
                  label: 'Total stock',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'allocatedStock',
                  label: 'Allocated stock',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'averageCost',
                  label: 'Average Cost',
                  type: 'number',
                  min: 0,
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'total',
                  label: 'Total Cost',
                  type: 'number',
                  min: 0,
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'lastDeliveryDate',
                  label: 'Last delivery',
                  type: 'date',
                  admin: {
                    readOnly: true,
                  },
                },
              ],
            },
            {
              name: 'deliveries',
              label: 'Deliveries',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'lot',
                      type: 'text',
                    },
                    {
                      name: 'quantity',
                      type: 'number',
                      min: 0,
                    },
                    {
                      name: 'costPerUnit',
                      label: 'Cost per unit',
                      type: 'number',
                      min: 0,
                    },
                    {
                      name: 'totalCost',
                      label: 'Total cost',
                      type: 'number',
                      min: 0,
                      admin: {
                        readOnly: true,
                      },
                    },
                    {
                      name: 'deliveryDate',
                      label: 'Delivery date',
                      type: 'date',
                    },
                    {
                      name: 'expiryDate',
                      label: 'Expiry date',
                      type: 'date',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Stripe',
          fields: [
            {
              name: 'stripeProductId',
              type: 'text',
              admin: {
                position: 'sidebar',
                readOnly: true,
              },
            },
            {
              name: 'stripePriceId',
              type: 'text',
              admin: {
                position: 'sidebar',
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
