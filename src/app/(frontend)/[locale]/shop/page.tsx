import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/lib/i18n'
import { getPayloadClient } from '@/lib/getPayloadClient'
import { buildContactLinks } from '@/lib/contact'
import { Hero } from '@/components/Hero'
import { ShopSectionSwitcher } from '@/components/shop/ShopSectionSwitcher'
import type { ShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import type { NeedData, ProductCard, TextureData } from '@/components/shop-navigator/types/navigator'
import styles from './shop.module.css'

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
  const pageConfig = await payload.find({
    collection: 'pages',
    locale,
    overrideAccess: false,
    limit: 1,
    depth: 1,
    where: {
      pageKey: {
        equals: 'shop',
      },
    },
  })
  const pageDoc = pageConfig.docs[0]
  const heroMedia = Array.isArray(pageDoc?.heroMedia) ? pageDoc?.heroMedia : []
  const resolveHeroMedia = (media: unknown, fallbackAlt: string = t.shop.title) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || fallbackAlt, mimeType: typed.mimeType || null }
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
  const [
    productsResult,
    needsResult,
    productAreasResult,
    timingProductsResult,
    skinTypesResult,
    texturesResult,
    routineTemplatesResult,
    routineTemplateStepsResult,
    routineTemplateStepProductsResult,
    routineStepsResult,
    routineStepRulesResult,
    siteSettings,
  ] = await Promise.all([
      payload.find({
        collection: 'products',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 500,
        sort: '-createdAt',
        where: {
          active: { equals: true },
        },
        select: {
          title: true,
          description: true,
          slug: true,
          price: true,
          brand: true,
          brandLine: true,
          coverImage: true,
          images: true,
          needs: true,
          textures: true,
          productAreas: true,
          timingProducts: true,
          skinTypePrimary: true,
          skinTypeSecondary: true,
          createdAt: true,
        },
      }),
      payload.find({
        collection: 'needs',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'order',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          order: true,
          boxTagline: true,
          cardTitle: true,
          cardTagline: true,
          cardMedia: true,
          productArea: true,
        },
      }),
      payload.find({
        collection: 'product-areas',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'order',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          order: true,
          boxTagline: true,
          cardTitle: true,
          cardTagline: true,
          cardMedia: true,
        },
      }),
      payload.find({
        collection: 'timing-products',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'order',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          order: true,
          boxTagline: true,
          cardTitle: true,
          cardTagline: true,
          cardMedia: true,
        },
      }),
      payload.find({
        collection: 'skin-types',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 500,
        sort: 'order',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          order: true,
          boxTagline: true,
          cardTitle: true,
          cardTagline: true,
          cardMedia: true,
          productArea: true,
        },
      }),
      payload.find({
        collection: 'textures',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 200,
        sort: 'order',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          order: true,
          boxTagline: true,
          cardTitle: true,
          cardTagline: true,
          cardMedia: true,
        },
      }),
      payload.find({
        collection: 'routine-templates',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 1000,
        sort: 'sortOrder',
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          productArea: true,
          timing: true,
          need: true,
          isMultibrand: true,
          brand: true,
        },
      }),
      payload.find({
        collection: 'routine-template-steps',
        locale,
        overrideAccess: false,
        depth: 1,
        limit: 5000,
        sort: 'stepOrder',
        select: {
          id: true,
          routineTemplate: true,
          routineStep: true,
          stepOrder: true,
          required: true,
        },
      }),
      payload.find({
        collection: 'routine-template-step-products',
        locale,
        overrideAccess: false,
        depth: 0,
        limit: 10000,
        select: {
          id: true,
          routineTemplate: true,
          routineStep: true,
          product: true,
          rank: true,
        },
      }),
      payload.find({
        collection: 'routine-steps',
        locale,
        overrideAccess: false,
        depth: 0,
        limit: 500,
        sort: 'stepOrderDefault',
        select: {
          id: true,
          name: true,
          slug: true,
          productArea: true,
          stepOrderDefault: true,
          isOptionalDefault: true,
        },
      }),
      payload.find({
        collection: 'routine-step-rules',
        locale,
        overrideAccess: false,
        depth: 0,
        limit: 1000,
        select: {
          id: true,
          routineStep: true,
          timing: true,
          skinType: true,
          ruleType: true,
        },
      }),
      payload.findGlobal({
        slug: 'site-settings',
        locale,
        overrideAccess: false,
      }),
    ])

  const resolveMedia = (media: unknown) => {
    if (!media || typeof media !== 'object' || !('url' in media)) return null
    const typed = media as { url?: string | null; alt?: string | null; mimeType?: string | null }
    if (!typed.url) return null
    return { url: typed.url, alt: typed.alt || null, mimeType: typed.mimeType || null }
  }

  const resolveLabel = (value: unknown) => {
    if (!value || typeof value === 'number') return undefined
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      const name = record.name
      if (typeof name === 'string') return name
      if (name && typeof name === 'object') {
        const localized = name as Record<string, unknown>
        const preferred = localized[locale]
        if (typeof preferred === 'string') return preferred
        const first = Object.values(localized).find((item) => typeof item === 'string')
        if (typeof first === 'string') return first
      }
    }
    return undefined
  }

  const toIdArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value
      .map((item) => {
        if (item && typeof item === 'object' && 'id' in item) return String(item.id)
        if (typeof item === 'string' || typeof item === 'number') return String(item)
        return ''
      })
      .filter(Boolean)
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

  const products: ProductCard[] = productsResult.docs.map((product) => ({
    id: String(product.id),
    title: product.title || '',
    description: product.description || undefined,
    slug: product.slug || undefined,
    price: product.price ?? undefined,
    brand: resolveBrandLabel(product.brand, locale),
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

  const resolveRelArray = (value: unknown) => {
    if (!Array.isArray(value)) return []
    return value
      .map((item) => {
        if (!item) return null
        if (typeof item === 'object' && 'id' in item) {
          return { id: String(item.id), label: resolveLabel(item) || String(item.id) }
        }
        if (typeof item === 'string' || typeof item === 'number') {
          return { id: String(item), label: String(item) }
        }
        return null
      })
      .filter((item): item is { id: string; label: string } => Boolean(item))
  }

  const shopAllProducts = productsResult.docs.map((product) => {
    const cover = resolveMedia(product.coverImage)
    const images = Array.isArray(product.images)
      ? product.images
          .map((media) => resolveMedia(media))
          .filter((media): media is NonNullable<ReturnType<typeof resolveMedia>> => Boolean(media))
      : []
    const needsRel = resolveRelArray(product.needs)
    const texturesRel = resolveRelArray(product.textures)
    const areasRel = resolveRelArray(product.productAreas)
    const timingsRel = resolveRelArray(product.timingProducts)
    const skinPrimary =
      product.skinTypePrimary && typeof product.skinTypePrimary === 'object' && 'id' in product.skinTypePrimary
        ? [{ id: String(product.skinTypePrimary.id), label: resolveLabel(product.skinTypePrimary) || String(product.skinTypePrimary.id) }]
        : product.skinTypePrimary
          ? [{ id: String(product.skinTypePrimary), label: String(product.skinTypePrimary) }]
          : []
    const skinSecondary = resolveRelArray(product.skinTypeSecondary)
    return {
      id: String(product.id),
      title: product.title || '',
      slug: product.slug || undefined,
      price: typeof product.price === 'number' ? product.price : undefined,
      createdAt: typeof product.createdAt === 'string' ? product.createdAt : undefined,
      brand: product.brand,
      brandLine: product.brandLine,
      coverImage: cover,
      images,
      needs: needsRel,
      textures: texturesRel,
      productAreas: areasRel,
      timingProducts: timingsRel,
      skinTypes: [...skinPrimary, ...skinSecondary],
    }
  })

  const navigatorData: ShopNavigatorData = {
    needs,
    textures,
    products,
  }

  const contactLinks = buildContactLinks({
    phone: siteSettings?.phone,
    whatsapp: siteSettings?.whatsapp,
    address: siteSettings?.address,
  })

  const resolveTaxonomyLabel = (value: unknown) => {
    if (!value || typeof value === 'number') return undefined
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      const name = record.name
      if (typeof name === 'string') return name
      if (name && typeof name === 'object') {
        const localized = name as Record<string, unknown>
        const preferred = localized[locale]
        if (typeof preferred === 'string') return preferred
        const first = Object.values(localized).find((item) => typeof item === 'string')
        if (typeof first === 'string') return first
      }
    }
    return undefined
  }

  const productCardMap = new Map(products.map((product) => [product.id, product]))

  const stepProductsMap = new Map<string, Array<{ productId: string; rank: number }>>()
  for (const entry of routineTemplateStepProductsResult.docs) {
    const templateId =
      typeof entry.routineTemplate === 'object' && entry.routineTemplate && 'id' in entry.routineTemplate
        ? String(entry.routineTemplate.id)
        : String(entry.routineTemplate)
    const stepId =
      typeof entry.routineStep === 'object' && entry.routineStep && 'id' in entry.routineStep
        ? String(entry.routineStep.id)
        : String(entry.routineStep)
    const productId =
      typeof entry.product === 'object' && entry.product && 'id' in entry.product
        ? String(entry.product.id)
        : String(entry.product)
    const key = `${templateId}:${stepId}`
    if (!stepProductsMap.has(key)) stepProductsMap.set(key, [])
    stepProductsMap.get(key)?.push({ productId, rank: entry.rank ?? 0 })
  }

  const routineTemplates = routineTemplatesResult.docs.map((template) => {
    const timingLabel = resolveTaxonomyLabel(template.timing) || ''
    const timingSlug =
      typeof template.timing === 'object' && template.timing && 'slug' in template.timing
        ? (template.timing.slug as string | undefined)
        : undefined
    const needLabel = resolveTaxonomyLabel(template.need) || ''
    const needSlug =
      typeof template.need === 'object' && template.need && 'slug' in template.need
        ? (template.need.slug as string | undefined)
        : undefined
    const productAreaLabel = resolveTaxonomyLabel(template.productArea) || ''
    const productAreaSlug =
      typeof template.productArea === 'object' && template.productArea && 'slug' in template.productArea
        ? (template.productArea.slug as string | undefined)
        : undefined
    const timingId =
      typeof template.timing === 'object' && template.timing && 'id' in template.timing
        ? String(template.timing.id)
        : String(template.timing)
    const needId =
      typeof template.need === 'object' && template.need && 'id' in template.need
        ? String(template.need.id)
        : String(template.need)
    const productAreaId =
      typeof template.productArea === 'object' && template.productArea && 'id' in template.productArea
        ? String(template.productArea.id)
        : template.productArea
          ? String(template.productArea)
          : undefined
    const brandLabel = resolveBrandLabel(template.brand, locale)
    const brandId =
      typeof template.brand === 'object' && template.brand && 'id' in template.brand
        ? String(template.brand.id)
        : template.brand
          ? String(template.brand)
          : undefined

    const templateSteps = routineTemplateStepsResult.docs
      .filter((step) => {
        const templateId =
          typeof step.routineTemplate === 'object' && step.routineTemplate && 'id' in step.routineTemplate
            ? String(step.routineTemplate.id)
            : String(step.routineTemplate)
        return templateId === String(template.id)
      })
      .map((step) => {
        const routineStep =
          typeof step.routineStep === 'object' && step.routineStep ? step.routineStep : undefined
        const routineStepId =
          routineStep && 'id' in routineStep ? String(routineStep.id) : String(step.routineStep)
        const label = resolveTaxonomyLabel(routineStep) || ''
        const slug =
          routineStep && 'slug' in routineStep && typeof routineStep.slug === 'string'
            ? routineStep.slug
            : undefined
        const key = `${template.id}:${routineStepId}`
        const productsForStep = (stepProductsMap.get(key) ?? [])
          .sort((a, b) => a.rank - b.rank)
          .map((item) => productCardMap.get(item.productId))
          .filter((item): item is ProductCard => Boolean(item))
        return {
          id: routineStepId,
          label,
          slug,
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
      need: { id: needId, label: needLabel, slug: needSlug },
      timing: { id: timingId, label: timingLabel, slug: timingSlug },
      productArea: productAreaLabel && productAreaId
        ? { id: productAreaId, label: productAreaLabel, slug: productAreaSlug }
        : undefined,
      isMultibrand: Boolean(template.isMultibrand),
      brand: brandLabel ? { id: brandId || brandLabel, label: brandLabel } : undefined,
      steps: templateSteps,
    }
  })

  const routineSteps = routineStepsResult.docs.map((step) => {
    const label = resolveTaxonomyLabel(step) || ''
    const productAreaId =
      typeof step.productArea === 'object' && step.productArea && 'id' in step.productArea
        ? String(step.productArea.id)
        : step.productArea
          ? String(step.productArea)
          : undefined
    return {
      id: String(step.id),
      label,
      slug: typeof step.slug === 'string' ? step.slug : undefined,
      productAreaId,
      stepOrder: typeof step.stepOrderDefault === 'number' ? step.stepOrderDefault : undefined,
      isOptional: Boolean(step.isOptionalDefault),
    }
  })

  const routineStepRules = routineStepRulesResult.docs.map((rule) => {
    const routineStepId =
      typeof rule.routineStep === 'object' && rule.routineStep && 'id' in rule.routineStep
        ? String(rule.routineStep.id)
        : String(rule.routineStep)
    const timingId =
      typeof rule.timing === 'object' && rule.timing && 'id' in rule.timing
        ? String(rule.timing.id)
        : rule.timing
          ? String(rule.timing)
          : null
    const skinTypeId =
      typeof rule.skinType === 'object' && rule.skinType && 'id' in rule.skinType
        ? String(rule.skinType.id)
        : rule.skinType
          ? String(rule.skinType)
          : null
    return {
      id: String(rule.id),
      routineStepId,
      timingId,
      skinTypeId,
      ruleType: rule.ruleType as 'require' | 'forbid' | 'warn',
    }
  })

  return (
    <div className={styles.page}>
      {hasHero && (
        <Hero
          eyebrow="DOB Milano"
          title={heroTitle || t.nav.shop || 'Shop'}
          description={heroDescription}
          variant={heroStyle}
          mediaDark={heroDark || undefined}
          mediaLight={heroLight || undefined}
          ctas={[
            { href: '#routine-builder', label: 'Routine consigliata', variant: 'primary' },
            { href: '#navigator', label: 'Esplora prodotti', variant: 'outline' },
          ]}
        />
      )}
      <ShopSectionSwitcher
        initialSection={
          section === 'navigator' || section === 'routine' || section === 'consulenza'
            ? section
            : 'shop-all'
        }
        navigatorData={navigatorData}
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
