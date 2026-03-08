'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n/core'
import { ShopAllSection } from '@/frontend/page-domains/shared/sections/ShopAllSection'
import { ConsulenzaSection } from '@/frontend/page-domains/shared/sections/ConsulenzaSection'
import { SectionSwitcher } from '@/frontend/components/sections/SectionSwitcher'
import type { ProductCard } from '@/frontend/page-domains/shop/pages/shop-page/sections/shop-navigator.types'
import type { CarouselItem } from '@/frontend/components/carousel/shared/types'
import styles from './ShopSectionSwitcher.module.css'

const RoutineBuilderSplitSection = dynamic(
  () => import('./RoutineBuilderSplitSection').then((module) => module.RoutineBuilderSplitSection),
  {
    loading: () => <section className={`${styles.sectionSkeleton} typo-small-upper`}>Loading routine builder...</section>,
  },
)

type ContactLinks = {
  phoneLink: string
  whatsappLink: string
  phoneDisplay: string
  whatsappDisplay: string
}

type RoutineTemplateView = {
  id: string
  name: string
  description?: string
  need: { id: string; label: string; slug?: string }
  timing: { id: string; label: string; slug?: string }
  productArea?: { id: string; label: string; slug?: string }
  isMultibrand: boolean
  brand?: { id: string; label: string; slug?: string }
  steps: Array<{
    id: string
    label: string
    slug?: string
    required: boolean
    order: number
    products: ProductCard[]
  }>
}

type ClassicParams = {
  query: string
  brand: string
  sort: string
  perPage: number
  page: number
  view: string
}

type SectionKey = 'shop-all' | 'routine' | 'consulenza'
type ShopSortKey = 'featured' | 'price-asc' | 'price-desc' | 'name'
const TRANSPARENT_IMAGE_PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

export function ShopSectionSwitcher({
  initialSection = 'shop-all',
  classicParams: _classicParams,
  routineTemplates,
  productAreas,
  routineTimings,
  routineSkinTypes,
  routineNeeds,
  routineSteps,
  routineStepRules,
  shopAllProducts,
  productBasePath: _productBasePath,
  contactLinks,
  locale,
  routineStep1Title,
  routineStep2Title,
}: {
  initialSection?: SectionKey
  classicParams: ClassicParams
  routineTemplates: RoutineTemplateView[]
  productAreas: Array<{
    id: string
    label: string
    slug?: string
    media?: { url: string; alt?: string | null } | null
    description?: string | null
  }>
  routineTimings: Array<{
    id: string
    label: string
    media?: { url: string; alt?: string | null } | null
    description?: string | null
  }>
  routineSkinTypes: Array<{
    id: string
    label: string
    media?: { url: string; alt?: string | null } | null
    description?: string | null
    productAreaId?: string
  }>
  routineNeeds: Array<{
    id: string
    label: string
    media?: { url: string; alt?: string | null } | null
    description?: string | null
  }>
  routineSteps: Array<{
    id: string
    label: string
    slug?: string
    productAreaId?: string
    stepOrder?: number
    isOptional?: boolean
  }>
  routineStepRules: Array<{
    id: string
    routineStepId: string
    timingId?: string | null
    skinTypeId?: string | null
    ruleType: 'require' | 'forbid' | 'warn'
  }>
  shopAllProducts: Array<{
    id: string
    title: string
    slug?: string
    price?: number
    createdAt?: string
    brand?: unknown
    brandLine?: unknown
    coverImage?: { url: string; alt?: string | null } | null
    images?: Array<{ url: string; alt?: string | null }>
    needs: Array<{ id: string; label: string }>
    textures: Array<{ id: string; label: string }>
    productAreas: Array<{ id: string; label: string }>
    timingProducts: Array<{ id: string; label: string }>
    skinTypes: Array<{ id: string; label: string }>
    alternatives: Array<{
      id: string
      title: string
      slug?: string
      format?: string | null
      price?: number
      coverImage?: { url: string; alt?: string | null } | null
    }>
  }>
  productBasePath: string
  contactLinks: ContactLinks
  locale: string
  routineStep1Title?: string | null
  routineStep2Title?: string | null
}) {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale
  const copy = getJourneyDictionary(resolvedLocale).shopFilters
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<SectionKey>(initialSection)
  const [orderBy, setOrderBy] = useState<ShopSortKey>('featured')
  const [filters, setFilters] = useState({
    needs: new Set<string>(),
    textures: new Set<string>(),
    productAreas: new Set<string>(),
    timingProducts: new Set<string>(),
    skinTypes: new Set<string>(),
    brands: new Set<string>(),
    brandLines: new Set<string>(),
  })
  const queryTerm = (searchParams?.get('q') ?? '').trim().toLowerCase()

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  const shouldComputeShopAll = activeSection === 'shop-all'

  const activeFilterCount = useMemo(() => {
    return (
      filters.needs.size +
      filters.textures.size +
      filters.productAreas.size +
      filters.timingProducts.size +
      filters.skinTypes.size +
      filters.brands.size +
      filters.brandLines.size
    )
  }, [filters])

  const pills = useMemo(
    () => [
      { key: 'routine', label: copy.sectionRoutine },
      { key: 'consulenza', label: copy.sectionConsultation },
      { key: 'shop-all', label: copy.sectionShopAll },
    ],
    [copy.sectionConsultation, copy.sectionRoutine, copy.sectionShopAll],
  )

  const updateSectionQuery = (nextSection: SectionKey) => {
    if (!pathname) return
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (nextSection === 'shop-all') {
      params.delete('section')
    } else {
      params.set('section', nextSection)
    }
    const nextQuery = params.toString()
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname
    router.replace(nextUrl, { scroll: false })
  }

  const filterOptions = useMemo(() => {
    if (!shouldComputeShopAll) {
      return {
        needs: [] as Array<{ id: string; label: string }>,
        textures: [] as Array<{ id: string; label: string }>,
        productAreas: [] as Array<{ id: string; label: string }>,
        timingProducts: [] as Array<{ id: string; label: string }>,
        skinTypes: [] as Array<{ id: string; label: string }>,
        brands: [] as Array<{ id: string; label: string }>,
        brandLines: [] as Array<{ id: string; label: string }>,
      }
    }

    const unique = (items: Array<{ id: string; label: string }>) => {
      const map = new Map<string, string>()
      for (const item of items) {
        if (!map.has(item.id)) map.set(item.id, item.label)
      }
      return Array.from(map.entries()).map(([id, label]) => ({ id, label }))
    }

    const productSubsetFor = (group: keyof typeof filters) => {
      return shopAllProducts.filter((product) => {
        const matchesSet = (values: Array<{ id: string }>, selected: Set<string>) =>
          selected.size === 0 || values.some((value) => selected.has(value.id))

        if (group !== 'needs' && !matchesSet(product.needs, filters.needs)) return false
        if (group !== 'textures' && !matchesSet(product.textures, filters.textures)) return false
        if (group !== 'productAreas' && !matchesSet(product.productAreas, filters.productAreas))
          return false
        if (group !== 'timingProducts' && !matchesSet(product.timingProducts, filters.timingProducts))
          return false
        if (group !== 'skinTypes' && !matchesSet(product.skinTypes, filters.skinTypes)) return false
        if (
          group !== 'brands' &&
          filters.brands.size > 0 &&
          (!product.brand ||
            typeof product.brand !== 'object' ||
            !('id' in product.brand) ||
            !filters.brands.has(String((product.brand as { id?: unknown }).id)))
        ) {
          return false
        }
        if (
          group !== 'brandLines' &&
          filters.brandLines.size > 0 &&
          (!product.brandLine ||
            typeof product.brandLine !== 'object' ||
            !('id' in product.brandLine) ||
            !filters.brandLines.has(String((product.brandLine as { id?: unknown }).id)))
        ) {
          return false
        }
        return true
      })
    }

    const brandOptions = unique(
      productSubsetFor('brands')
        .map((product) => {
          if (!product.brand || typeof product.brand !== 'object') return null
          const record = product.brand as { id?: unknown; name?: unknown }
          if (!record.id) return null
          const label = typeof record.name === 'string' ? record.name : String(record.id)
          return { id: String(record.id), label }
        })
        .filter(Boolean) as Array<{ id: string; label: string }>,
    )

    const brandLineOptions = unique(
      productSubsetFor('brandLines')
        .map((product) => {
          if (!product.brandLine || typeof product.brandLine !== 'object') return null
          const record = product.brandLine as { id?: unknown; name?: unknown }
          if (!record.id) return null
          const label = typeof record.name === 'string' ? record.name : String(record.id)
          return { id: String(record.id), label }
        })
        .filter(Boolean) as Array<{ id: string; label: string }>,
    )

    const options = {
      needs: unique(productSubsetFor('needs').flatMap((product) => product.needs)),
      textures: unique(productSubsetFor('textures').flatMap((product) => product.textures)),
      productAreas: unique(productSubsetFor('productAreas').flatMap((product) => product.productAreas)),
      timingProducts: unique(productSubsetFor('timingProducts').flatMap((product) => product.timingProducts)),
      skinTypes: unique(productSubsetFor('skinTypes').flatMap((product) => product.skinTypes)),
      brands: brandOptions,
      brandLines: brandLineOptions,
    }

    return options
  }, [shopAllProducts, filters, shouldComputeShopAll])

  useEffect(() => {
    if (!shouldComputeShopAll) return

    const prune = (group: keyof typeof filters, options: Array<{ id: string }>) => {
      if (filters[group].size === 0) return
      const allowed = new Set(options.map((item) => item.id))
      const next = new Set(Array.from(filters[group]).filter((id) => allowed.has(id)))
      if (next.size === filters[group].size) return
      setFilters((prev) => ({ ...prev, [group]: next }))
    }

    prune('needs', filterOptions.needs)
    prune('textures', filterOptions.textures)
    prune('productAreas', filterOptions.productAreas)
    prune('timingProducts', filterOptions.timingProducts)
    prune('skinTypes', filterOptions.skinTypes)
    prune('brands', filterOptions.brands)
    prune('brandLines', filterOptions.brandLines)
  }, [filterOptions, filters, shouldComputeShopAll])

  const toggleFilter = (group: keyof typeof filters, id: string) => {
    setFilters((prev) => {
      const next = new Set(prev[group])
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return { ...prev, [group]: next }
    })
  }

  const filteredProducts = useMemo(() => {
    if (!shouldComputeShopAll) return []

    const matchesSet = (values: Array<{ id: string }>, selected: Set<string>) =>
      selected.size === 0 || values.some((value) => selected.has(value.id))

    return shopAllProducts
      .filter((product) => {
        if (queryTerm) {
          const title = (product.title || '').toLowerCase()
          const slug = (product.slug || '').toLowerCase()
          const readName = (value: unknown) => {
            if (typeof value === 'string') return value
            if (value && typeof value === 'object') {
              const record = value as Record<string, unknown>
              const direct = record.name
              if (typeof direct === 'string') return direct
              if (direct && typeof direct === 'object') {
                const localized = direct as Record<string, unknown>
                const preferred = localized[resolvedLocale]
                if (typeof preferred === 'string') return preferred
                const first = Object.values(localized).find((entry) => typeof entry === 'string')
                if (typeof first === 'string') return first
              }
            }
            return ''
          }
          const brand = readName(product.brand).toLowerCase()
          const line = readName(product.brandLine).toLowerCase()
          const matchesQuery =
            title.includes(queryTerm) ||
            slug.includes(queryTerm) ||
            brand.includes(queryTerm) ||
            line.includes(queryTerm)
          if (!matchesQuery) return false
        }
        if (!matchesSet(product.needs, filters.needs)) return false
        if (!matchesSet(product.textures, filters.textures)) return false
        if (!matchesSet(product.productAreas, filters.productAreas)) return false
        if (!matchesSet(product.timingProducts, filters.timingProducts)) return false
        if (!matchesSet(product.skinTypes, filters.skinTypes)) return false
        if (
          filters.brands.size > 0 &&
          (!product.brand ||
            typeof product.brand !== 'object' ||
            !('id' in product.brand) ||
            !filters.brands.has(String((product.brand as { id?: unknown }).id)))
        ) {
          return false
        }
        if (
          filters.brandLines.size > 0 &&
          (!product.brandLine ||
            typeof product.brandLine !== 'object' ||
            !('id' in product.brandLine) ||
            !filters.brandLines.has(String((product.brandLine as { id?: unknown }).id)))
        ) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (orderBy === 'featured') return (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
        if (orderBy === 'price-asc') return (a.price ?? 0) - (b.price ?? 0)
        if (orderBy === 'price-desc') return (b.price ?? 0) - (a.price ?? 0)
        if (orderBy === 'name') return a.title.localeCompare(b.title)
        return (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
      })
  }, [shopAllProducts, filters, orderBy, queryTerm, resolvedLocale, shouldComputeShopAll])

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(resolvedLocale === 'it' ? 'it-IT' : resolvedLocale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [resolvedLocale],
  )

  const shopAllItems = useMemo<CarouselItem[]>(() => {
    return filteredProducts.map((product) => {
      const media = product.coverImage ?? product.images?.[0]
      const brandLabel =
        product.brand && typeof product.brand === 'object' && 'name' in product.brand
          ? String((product.brand as { name?: unknown }).name ?? '')
          : null
      const imageUrl = media?.url || TRANSPARENT_IMAGE_PLACEHOLDER
      const imageAlt = media?.alt || product.title
      const ctaPriceLabel = typeof product.price === 'number' ? priceFormatter.format(product.price) : ''
      const optionRows = [
        {
          id: product.id,
          title: product.title,
          slug: product.slug,
          format: null,
          price: product.price,
          coverImage: product.coverImage,
        },
        ...product.alternatives,
      ]
      const uniqueOptions = Array.from(
        optionRows.reduce((acc, option) => {
          if (!acc.has(option.id)) acc.set(option.id, option)
          return acc
        }, new Map<string, (typeof optionRows)[number]>()),
      ).map(([, value]) => value)
      const ctaAction =
        uniqueOptions.length > 1
          ? ({
              mode: 'options',
              drawerTitle: product.title,
              options: uniqueOptions.map((option) => ({
                id: option.id,
                label: option.format?.trim() || option.title,
                meta: typeof option.price === 'number' ? priceFormatter.format(option.price) : null,
                group: 'default' as const,
                payload: {
                  id: option.id,
                  title: option.title,
                  slug: option.slug,
                  price: option.price,
                  currency: 'EUR',
                  brand: brandLabel || undefined,
                  coverImage: option.coverImage?.url ?? product.coverImage?.url ?? null,
                },
              })),
            } as const)
          : ({
              mode: 'direct',
              payload: {
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: product.price,
                currency: 'EUR',
                brand: brandLabel || undefined,
                coverImage: product.coverImage?.url ?? null,
              },
            } as const)
      return {
        title: product.title,
        subtitle: brandLabel,
        price: typeof product.price === 'number' ? priceFormatter.format(product.price) : null,
        image: { url: imageUrl, alt: imageAlt },
        tag: brandLabel,
        badgeLeft: null,
        badgeRight: null,
        href: product.slug ? `/${locale}/shop/${product.slug}` : undefined,
        duration: null,
        mobileCtaLabel: ctaPriceLabel ? `compra - ${ctaPriceLabel}` : 'compra',
        ctaAction,
      }
    })
  }, [filteredProducts, locale, priceFormatter])

  return (
    <>
      <SectionSwitcher
        items={pills}
        activeKey={activeSection}
        onChange={(nextKey) => {
          const nextSection = nextKey as SectionKey
          setActiveSection(nextSection)
          updateSectionQuery(nextSection)
        }}
        actions={[]}
      />

      {activeSection === 'routine' && (
        <div className={styles.sectionBlockTop}>
          <RoutineBuilderSplitSection
            productAreas={productAreas}
            routineTimings={routineTimings}
            routineSkinTypes={routineSkinTypes}
            routineNeeds={routineNeeds}
            routineTemplates={routineTemplates}
            routineSteps={routineSteps}
            routineStepRules={routineStepRules}
            routineStep1Title={routineStep1Title}
            routineStep2Title={routineStep2Title}
            shopAllProducts={shopAllProducts}
          />
        </div>
      )}

      {activeSection === 'shop-all' && (
        <div className={styles.cardsBlock}>
          <ShopAllSection
            items={shopAllItems}
            controls={{
              sortValue: orderBy,
              onSortChange: (next) => setOrderBy(next),
              onClearFilters: () => {
                setFilters({
                  needs: new Set(),
                  textures: new Set(),
                  productAreas: new Set(),
                  timingProducts: new Set(),
                  skinTypes: new Set(),
                  brands: new Set(),
                  brandLines: new Set(),
                })
              },
              clearFiltersLabel: copy.removeAll,
              sortOptions: [
                { key: 'featured', label: copy.orderRecent },
                { key: 'price-asc', label: copy.orderPriceAsc },
                { key: 'price-desc', label: copy.orderPriceDesc },
                { key: 'name', label: copy.orderTitle },
              ],
              filterGroups: [
                { key: 'needs', label: copy.needs, options: filterOptions.needs, selected: filters.needs },
                { key: 'textures', label: copy.texture, options: filterOptions.textures, selected: filters.textures },
                {
                  key: 'productAreas',
                  label: copy.productAreas,
                  options: filterOptions.productAreas,
                  selected: filters.productAreas,
                },
                {
                  key: 'timingProducts',
                  label: copy.timing,
                  options: filterOptions.timingProducts,
                  selected: filters.timingProducts,
                },
                { key: 'skinTypes', label: copy.skinTypes, options: filterOptions.skinTypes, selected: filters.skinTypes },
                { key: 'brands', label: copy.brand, options: filterOptions.brands, selected: filters.brands },
                {
                  key: 'brandLines',
                  label: copy.brandLine,
                  options: filterOptions.brandLines,
                  selected: filters.brandLines,
                },
              ],
              onFilterToggle: (groupKey, optionId) => toggleFilter(groupKey as keyof typeof filters, optionId),
            }}
          />
        </div>
      )}

      {activeSection === 'consulenza' && (
        <section id="consulenza" className={`${styles.sectionBlockTop} w-full bg-[var(--bg)] px-[2.5vw] pt-8 pb-20`}>
          <ConsulenzaSection contactLinks={contactLinks} source="shop-consultation" />
        </section>
      )}
    </>
  )
}
