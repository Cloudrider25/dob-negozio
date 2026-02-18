import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { getShopBaseData, getShopPageConfig, getShopRoutineData } from '@/lib/shop/getShopData'
import { buildContactLinks } from '@/lib/contact'
import { Hero } from '@/components/heroes/Hero'
import { ShopSectionSwitcher } from '@/components/shop/ShopSectionSwitcher'
import type { NeedData, ProductCard, TextureData } from '@/components/shop/shop-navigator.types'
import type {
  RoutineStep,
  RoutineStepRule,
  RoutineTemplate,
  RoutineTemplateStep,
  RoutineTemplateStepProduct,
} from '@/payload-types'

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{
    q?: string
    brand?: string
    sort?: string
    perPage?: string
    page?: string
    view?: string
    section?: string
  }>
}) {
  const { locale } = await params
  const query = (await searchParams)?.q?.trim() || ''
  const brand = (await searchParams)?.brand?.trim() || ''
  const sort = (await searchParams)?.sort?.trim() || 'recent'
  const section = (await searchParams)?.section?.trim() || 'shop-all'
  const perPageRaw = (await searchParams)?.perPage?.trim() || '12'
  const perPage = Number.parseInt(perPageRaw, 10)
  const pageRaw = (await searchParams)?.page?.trim() || '1'
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1)
  const view = (await searchParams)?.view?.trim() || 'grid'

  if (!isLocale(locale)) {
    notFound()
  }

  const t = getDictionary(locale)
  const payload = await getPayloadClient()
  const pageConfig = await getShopPageConfig(locale)
  const pageDoc = pageConfig.docs[0]
  const rawHeroMedia = Array.isArray(pageDoc?.heroMedia) ? pageDoc?.heroMedia : []
  const heroMediaIds = rawHeroMedia
    .map((media) => {
      if (media && typeof media === 'object' && 'id' in media) {
        const id = (media as { id?: unknown }).id
        if (typeof id === 'number' || typeof id === 'string') return String(id)
      }
      if (typeof media === 'number' || typeof media === 'string') return String(media)
      return null
    })
    .filter((value): value is string => Boolean(value))

  const heroMediaResult =
    heroMediaIds.length > 0
      ? await payload.find({
          collection: 'media',
          locale,
          overrideAccess: false,
          depth: 0,
          limit: heroMediaIds.length,
          where: {
            id: {
              in: heroMediaIds,
            },
          },
          select: {
            id: true,
            url: true,
            alt: true,
            mimeType: true,
            sizes: true,
          },
        })
      : { docs: [] as Array<Record<string, unknown>> }

  const heroMediaById = new Map(
    heroMediaResult.docs.map((media) => [String(media.id), media]),
  )

  const heroMedia = rawHeroMedia.map((media) => {
    if (media && typeof media === 'object' && 'id' in media) {
      const relationId = String((media as { id?: unknown }).id ?? '')
      return heroMediaById.get(relationId) || media
    }
    if (typeof media === 'number' || typeof media === 'string') {
      return heroMediaById.get(String(media)) || media
    }
    return media
  })
  const resolveHeroMedia = (media: unknown, fallbackAlt: string = t.shop.title) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as {
      url?: string | null
      alt?: string | null
      mimeType?: string | null
      sizes?: {
        heroDesktop?: { url?: string | null }
        heroMobile?: { url?: string | null }
      } | null
    }
    const desktopVariant = typed.sizes?.heroDesktop?.url
    const baseUrl = typed.url || null
    const bestHeroUrl = desktopVariant || baseUrl
    if (!bestHeroUrl) return null
    return { url: bestHeroUrl, alt: typed.alt || fallbackAlt, mimeType: typed.mimeType || null }
  }
  const heroPrimary = resolveHeroMedia(heroMedia?.[0])
  const heroSecondary = resolveHeroMedia(heroMedia?.[1])
  const heroDark = heroSecondary ? heroPrimary : heroPrimary
  const heroLight = heroSecondary ? heroSecondary : heroPrimary
  const hasHero = Boolean(heroDark || heroLight)
  const heroTitle =
    pageDoc?.heroTitleMode === 'fixed' && pageDoc?.heroTitle ? pageDoc.heroTitle : t.nav.shop
  const heroDescription = pageDoc?.heroDescription ?? t.shop.lead ?? null
  const heroStyle = pageDoc?.heroStyle === 'style2' ? 'style2' : 'style1'
  const routineStep1Title = pageDoc?.routineBuilderStep1Title ?? null
  const routineStep2Title = pageDoc?.routineBuilderStep2Title ?? null

  const resolveBrandLabel = (brand: unknown, fallbackLocale: string) => {
    if (!brand || typeof brand === 'number') return undefined
    if (typeof brand === 'string') return brand
    if (typeof brand === 'object') {
      const record = brand as Record<string, unknown>
      const name = record.name
      if (typeof name === 'string') return name
      if (name && typeof name === 'object') {
        const localized = name as Record<string, unknown>
        const preferred = localized[fallbackLocale]
        if (typeof preferred === 'string') return preferred
        const first = Object.values(localized).find((value) => typeof value === 'string')
        if (typeof first === 'string') return first
      }
    }
    return undefined
  }

  const resolveLocalizedText = (value: unknown) => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object') {
      const localized = value as Record<string, unknown>
      const preferred = localized[locale]
      if (typeof preferred === 'string') return preferred
      const first = Object.values(localized).find((item) => typeof item === 'string')
      if (typeof first === 'string') return first
    }
    return undefined
  }
  const shouldLoadRoutineData = section === 'routine'
  const {
    productsResult,
    brandsResult,
    brandLinesResult,
    needsResult,
    productAreasResult,
    timingProductsResult,
    skinTypesResult,
    texturesResult,
    siteSettings,
  } = await getShopBaseData(locale)
  const emptyRoutineData = {
    routineTemplatesResult: { docs: [] as RoutineTemplate[] },
    routineTemplateStepsResult: { docs: [] as RoutineTemplateStep[] },
    routineTemplateStepProductsResult: { docs: [] as RoutineTemplateStepProduct[] },
    routineStepsResult: { docs: [] as RoutineStep[] },
    routineStepRulesResult: { docs: [] as RoutineStepRule[] },
  }
  const {
    routineTemplatesResult,
    routineTemplateStepsResult,
    routineTemplateStepProductsResult,
    routineStepsResult,
    routineStepRulesResult,
  } = shouldLoadRoutineData ? await getShopRoutineData(locale) : emptyRoutineData

  const getRelationId = (value: unknown): string | undefined => {
    if (value && typeof value === 'object' && 'id' in value) {
      const relation = value as { id?: unknown }
      if (typeof relation.id === 'string' || typeof relation.id === 'number') {
        return String(relation.id)
      }
    }
    if (typeof value === 'string' || typeof value === 'number') return String(value)
    return undefined
  }

  const toIdArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value.map((item) => getRelationId(item)).filter((item): item is string => Boolean(item))
  }

  const mediaIds = new Set<string>()
  for (const product of productsResult.docs) {
    const coverId = getRelationId(product.coverImage)
    if (coverId) mediaIds.add(coverId)
    const imageIds = toIdArray(product.images)
    for (const imageId of imageIds) mediaIds.add(imageId)
  }

  const mediaResult =
    mediaIds.size > 0
      ? await payload.find({
          collection: 'media',
          locale,
          overrideAccess: false,
          depth: 0,
          limit: mediaIds.size,
          where: {
            id: { in: Array.from(mediaIds) },
          },
          select: {
            id: true,
            url: true,
            filename: true,
            alt: true,
            mimeType: true,
          },
        })
      : {
          docs: [] as Array<{
            id: string | number
            url?: string | null
            filename?: string | null
            alt?: string | null
            mimeType?: string | null
          }>,
        }

  const mediaById = new Map(
    mediaResult.docs.map((media) => [
      String(media.id),
      {
        url: media.url,
        filename: media.filename,
        alt: media.alt,
        mimeType: media.mimeType,
      },
    ]),
  )

  const buildMediaUrl = (value: { url?: string | null; filename?: string | null }) => {
    if (typeof value.url === 'string' && value.url.length > 0) return value.url
    if (typeof value.filename === 'string' && value.filename.length > 0) {
      return `/api/media/file/${encodeURIComponent(value.filename)}`
    }
    return null
  }

  const resolveMedia = (value: unknown) => {
    if (value && typeof value === 'object' && ('url' in value || 'filename' in value)) {
      const typed = value as {
        url?: string | null
        filename?: string | null
        alt?: string | null
        mimeType?: string | null
      }
      const resolvedUrl = buildMediaUrl(typed)
      if (!resolvedUrl) return null
      return { url: resolvedUrl, alt: typed.alt || null, mimeType: typed.mimeType || null }
    }
    const relationId = getRelationId(value)
    if (!relationId) return null
    const media = mediaById.get(relationId)
    if (!media) return null
    const resolvedUrl = buildMediaUrl(media)
    if (!resolvedUrl) return null
    return { url: resolvedUrl, alt: media.alt || null, mimeType: media.mimeType || null }
  }

  const needs: NeedData[] = needsResult.docs.map((need) => ({
    id: String(need.id),
    label: need.name || '',
    description: need.description || undefined,
    slug: need.slug || undefined,
    order: need.order ?? 0,
    boxTagline: need.boxTagline || undefined,
    cardTitle: need.cardTitle || undefined,
    cardTagline: need.cardTagline || undefined,
    cardMedia: resolveMedia(need.cardMedia),
  }))

  const routineNeeds = needsResult.docs.map((need) => ({
    id: String(need.id),
    label: need.name || '',
    description: resolveLocalizedText(need.description),
    media: resolveMedia(need.cardMedia),
  }))

  const productAreas = productAreasResult.docs.map((area) => ({
    id: String(area.id),
    label: area.name || '',
    slug: area.slug || undefined,
    media: resolveMedia(area.cardMedia),
    description: resolveLocalizedText(area.description),
  }))

  const routineTimings = timingProductsResult.docs.map((timing) => ({
    id: String(timing.id),
    label: timing.name || '',
    slug: timing.slug || undefined,
    media: resolveMedia(timing.cardMedia),
    description: resolveLocalizedText(timing.description),
  }))

  const routineSkinTypes = skinTypesResult.docs.map((skinType) => ({
    id: String(skinType.id),
    label: skinType.name || '',
    media: resolveMedia(skinType.cardMedia),
    description: resolveLocalizedText(skinType.description),
    productAreaId:
      typeof skinType.productArea === 'object' && skinType.productArea && 'id' in skinType.productArea
        ? String(skinType.productArea.id)
        : typeof skinType.productArea === 'string' || typeof skinType.productArea === 'number'
          ? String(skinType.productArea)
          : undefined,
  }))

  const textures: TextureData[] = texturesResult.docs.map((texture) => ({
    id: String(texture.id),
    label: texture.name || '',
    description: texture.description || undefined,
    slug: texture.slug || undefined,
    order: texture.order ?? 0,
    boxTagline: texture.boxTagline || undefined,
    cardTitle: texture.cardTitle || undefined,
    cardTagline: texture.cardTagline || undefined,
    cardMedia: resolveMedia(texture.cardMedia),
  }))

  const needsById = new Map(needs.map((item) => [item.id, item]))
  const texturesById = new Map(textures.map((item) => [item.id, item]))
  const productAreasById = new Map(productAreas.map((item) => [item.id, item]))
  const routineTimingsById = new Map(routineTimings.map((item) => [item.id, item]))
  const routineSkinTypesById = new Map(routineSkinTypes.map((item) => [item.id, item]))
  const brandsById = new Map(
    brandsResult.docs.map((brandDoc) => [
      String(brandDoc.id),
      {
        id: String(brandDoc.id),
        label: resolveLocalizedText(brandDoc.name) || '',
        slug: brandDoc.slug || undefined,
      },
    ]),
  )
  const brandLinesById = new Map(
    brandLinesResult.docs.map((brandLineDoc) => [
      String(brandLineDoc.id),
      {
        id: String(brandLineDoc.id),
        label: resolveLocalizedText(brandLineDoc.name) || '',
        slug: brandLineDoc.slug || undefined,
      },
    ]),
  )

  const toLabeledRelations = (
    value: unknown,
    labelMap: Map<string, { id: string; label: string } | { id: string; label: string; slug?: string } | NeedData | TextureData>,
  ) =>
    toIdArray(value).map((id) => {
      const found = labelMap.get(id)
      return {
        id,
        label: found?.label || id,
      }
    })

  const products: ProductCard[] = productsResult.docs.map((product) => ({
    id: String(product.id),
    title: product.title || '',
    description: product.description || undefined,
    slug: product.slug || undefined,
    price: product.price ?? undefined,
    brand: (() => {
      const brandId = getRelationId(product.brand)
      if (!brandId) return resolveBrandLabel(product.brand, locale)
      return brandsById.get(brandId)?.label || brandId
    })(),
    coverImage: resolveMedia(product.coverImage),
    images: Array.isArray(product.images)
      ? product.images
          .map((media) => resolveMedia(media))
          .filter((media): media is NonNullable<ReturnType<typeof resolveMedia>> => Boolean(media))
      : [],
    needIds: toIdArray(product.needs),
    textureIds: toIdArray(product.textures),
    createdAt: typeof product.createdAt === 'string' ? product.createdAt : undefined,
  }))

  const shopAllProducts = productsResult.docs.map((product) => {
    const cover = resolveMedia(product.coverImage)
    const images = Array.isArray(product.images)
      ? product.images
          .map((media) => resolveMedia(media))
          .filter((media): media is NonNullable<ReturnType<typeof resolveMedia>> => Boolean(media))
      : []
    const needsRel = toLabeledRelations(product.needs, needsById)
    const texturesRel = toLabeledRelations(product.textures, texturesById)
    const areasRel = toLabeledRelations(product.productAreas, productAreasById)
    const timingsRel = toLabeledRelations(product.timingProducts, routineTimingsById)
    const skinPrimaryId = getRelationId(product.skinTypePrimary)
    const skinPrimary = skinPrimaryId
      ? [
          {
            id: skinPrimaryId,
            label: routineSkinTypesById.get(skinPrimaryId)?.label || skinPrimaryId,
          },
        ]
      : []
    const skinSecondary = toLabeledRelations(product.skinTypeSecondary, routineSkinTypesById)
    const brandId = getRelationId(product.brand)
    const brandLineId = getRelationId(product.brandLine)
    const brand = brandId
      ? { id: brandId, name: brandsById.get(brandId)?.label || brandId }
      : undefined
    const brandLine = brandLineId
      ? { id: brandLineId, name: brandLinesById.get(brandLineId)?.label || brandLineId }
      : undefined
    return {
      id: String(product.id),
      title: product.title || '',
      slug: product.slug || undefined,
      price: typeof product.price === 'number' ? product.price : undefined,
      createdAt: typeof product.createdAt === 'string' ? product.createdAt : undefined,
      brand,
      brandLine,
      coverImage: cover,
      images,
      needs: needsRel,
      textures: texturesRel,
      productAreas: areasRel,
      timingProducts: timingsRel,
      skinTypes: [...skinPrimary, ...skinSecondary],
    }
  })

  const contactLinks = buildContactLinks({
    phone: siteSettings?.phone,
    whatsapp: siteSettings?.whatsapp,
    address: siteSettings?.address,
  })

  const productCardMap = new Map(products.map((product) => [product.id, product]))
  const routineSteps = routineStepsResult.docs.map((step) => {
    const productAreaId = getRelationId(step.productArea)
    return {
      id: String(step.id),
      label: resolveLocalizedText(step.name) || '',
      slug: typeof step.slug === 'string' ? step.slug : undefined,
      productAreaId,
      stepOrder: typeof step.stepOrderDefault === 'number' ? step.stepOrderDefault : undefined,
      isOptional: Boolean(step.isOptionalDefault),
    }
  })
  const routineStepsById = new Map(routineSteps.map((step) => [step.id, step]))

  const stepProductsMap = new Map<string, Array<{ productId: string; rank: number }>>()
  for (const entry of routineTemplateStepProductsResult.docs) {
    const templateId = getRelationId(entry.routineTemplate)
    const stepId = getRelationId(entry.routineStep)
    const productId = getRelationId(entry.product)
    if (!templateId || !stepId || !productId) continue
    const key = `${templateId}:${stepId}`
    if (!stepProductsMap.has(key)) stepProductsMap.set(key, [])
    stepProductsMap.get(key)?.push({ productId, rank: entry.rank ?? 0 })
  }

  const templateStepsByTemplateId = new Map<string, typeof routineTemplateStepsResult.docs>()
  for (const step of routineTemplateStepsResult.docs) {
    const templateId = getRelationId(step.routineTemplate)
    if (!templateId) continue
    if (!templateStepsByTemplateId.has(templateId)) {
      templateStepsByTemplateId.set(templateId, [])
    }
    templateStepsByTemplateId.get(templateId)?.push(step)
  }

  const routineTemplates = routineTemplatesResult.docs.map((template) => {
    const timingId = getRelationId(template.timing) || ''
    const needId = getRelationId(template.need) || ''
    const productAreaId = getRelationId(template.productArea)
    const brandId = getRelationId(template.brand)

    const timingTaxonomy = routineTimingsById.get(timingId)
    const needTaxonomy = needsById.get(needId)
    const productAreaTaxonomy = productAreaId ? productAreasById.get(productAreaId) : undefined
    const brandTaxonomy = brandId ? brandsById.get(brandId) : undefined

    const templateSteps = (templateStepsByTemplateId.get(String(template.id)) || [])
      .map((step) => {
        const routineStepId = getRelationId(step.routineStep) || ''
        const routineStepTaxonomy = routineStepsById.get(routineStepId)
        const key = `${template.id}:${routineStepId}`
        const productsForStep = (stepProductsMap.get(key) ?? [])
          .sort((a, b) => a.rank - b.rank)
          .map((item) => productCardMap.get(item.productId))
          .filter((item): item is ProductCard => Boolean(item))
        return {
          id: routineStepId,
          label: routineStepTaxonomy?.label || routineStepId,
          slug: routineStepTaxonomy?.slug,
          required: Boolean(step.required),
          order: step.stepOrder ?? 0,
          products: productsForStep,
        }
      })
      .sort((a, b) => a.order - b.order)

    return {
      id: String(template.id),
      name: resolveLocalizedText(template.name) || '',
      description: resolveLocalizedText(template.description) || undefined,
      need: { id: needId, label: needTaxonomy?.label || needId, slug: needTaxonomy?.slug },
      timing: { id: timingId, label: timingTaxonomy?.label || timingId, slug: timingTaxonomy?.slug },
      productArea: productAreaTaxonomy && productAreaId
        ? { id: productAreaId, label: productAreaTaxonomy.label, slug: productAreaTaxonomy.slug }
        : undefined,
      isMultibrand: Boolean(template.isMultibrand),
      brand: brandTaxonomy ? { id: brandTaxonomy.id, label: brandTaxonomy.label } : undefined,
      steps: templateSteps,
    }
  })

  const routineStepRules = routineStepRulesResult.docs.map((rule) => {
    const routineStepId = getRelationId(rule.routineStep) || ''
    const timingId = getRelationId(rule.timing) || null
    const skinTypeId = getRelationId(rule.skinType) || null
    return {
      id: String(rule.id),
      routineStepId,
      timingId,
      skinTypeId,
      ruleType: rule.ruleType as 'require' | 'forbid' | 'warn',
    }
  })

  return (
    <div className="shop-page">
      {hasHero && (
        <Hero
          eyebrow="DOB Milano"
          title={heroTitle || t.nav.shop || 'Shop'}
          description={heroDescription}
          variant={heroStyle}
          mediaDark={heroDark || undefined}
          mediaLight={heroLight || undefined}
          eagerMedia="dark"
        />
      )}
      <ShopSectionSwitcher
        initialSection={
          section === 'routine' || section === 'consulenza' ? section : 'shop-all'
        }
        classicParams={{
          query,
          brand,
          sort,
          perPage,
          page,
          view,
        }}
        routineTemplates={routineTemplates}
        routineSteps={routineSteps}
        routineStepRules={routineStepRules}
        productAreas={productAreas}
        routineTimings={routineTimings}
        routineSkinTypes={routineSkinTypes}
        routineNeeds={routineNeeds}
        shopAllProducts={shopAllProducts}
        productBasePath={`/${locale}/shop`}
        contactLinks={contactLinks}
        locale={locale}
        routineStep1Title={routineStep1Title}
        routineStep2Title={routineStep2Title}
      />
    </div>
  )
}
