'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n'
import { ShopAllSection } from '@/components/shop/ShopAllSection'
import type { ConsultationFormData } from '@/components/forms/ConsultationForm'
import stylesConsultationForm from '@/components/forms/ConsultationForm.module.css'
import { submitConsultationLead } from '@/lib/consultation/submitConsultationLead'
import type { ShopNavigatorData } from '@/components/navigators/shop-navigator/data/shop-data-context'
import type { ProductCard } from '@/components/navigators/shop-navigator/types/navigator'
import type { ServicesCarouselItem } from '@/components/carousel/types'
import styles from './ShopSectionSwitcher.module.css'

const ShopNavigatorSection = dynamic(
  () =>
    import('@/components/navigators/shop-navigator/ShopNavigatorSection').then(
      (module) => module.ShopNavigatorSection,
    ),
  {
    loading: () => <section className={styles.sectionSkeleton}>Loading shop navigator...</section>,
  },
)

const RoutineBuilderSplitSection = dynamic(
  () =>
    import('@/components/shop/RoutineBuilderSplitSection').then(
      (module) => module.RoutineBuilderSplitSection,
    ),
  {
    loading: () => <section className={styles.sectionSkeleton}>Loading routine builder...</section>,
  },
)

const RoutineBuilderSection = dynamic(
  () =>
    import('@/components/shop/RoutineBuilderSection').then((module) => module.RoutineBuilderSection),
  {
    loading: () => <section className={styles.sectionSkeleton}>Loading recommended routine...</section>,
  },
)

const ConsulenzaForm = dynamic(
  () =>
    import('@/components/forms/ConsultationForm').then(
      (module) => module.ConsultationForm,
    ),
  {
    loading: () => <section className={styles.sectionSkeleton}>Loading consulenza form...</section>,
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

type SectionKey = 'shop-all' | 'navigator' | 'routine' | 'consulenza'
const TRANSPARENT_IMAGE_PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

export function ShopSectionSwitcher({
  initialSection = 'shop-all',
  navigatorData,
  classicParams,
  routineTemplates,
  productAreas,
  routineTimings,
  routineSkinTypes,
  routineNeeds,
  routineSteps,
  routineStepRules,
  shopAllProducts,
  productBasePath,
  contactLinks,
  locale,
  routineStep1Title,
  routineStep2Title,
}: {
  initialSection?: SectionKey
  navigatorData: ShopNavigatorData
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
  const [showFilters, setShowFilters] = useState(false)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [orderBy, setOrderBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'title'>('recent')
  const [filters, setFilters] = useState({
    needs: new Set<string>(),
    textures: new Set<string>(),
    productAreas: new Set<string>(),
    timingProducts: new Set<string>(),
    skinTypes: new Set<string>(),
    brands: new Set<string>(),
    brandLines: new Set<string>(),
  })

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  const shouldComputeShopAll = activeSection === 'shop-all' || showFilters

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
      { key: 'navigator', label: copy.sectionNavigator },
      { key: 'routine', label: copy.sectionRoutine },
      { key: 'consulenza', label: copy.sectionConsultation },
      { key: 'shop-all', label: copy.sectionShopAll },
    ],
    [copy.sectionConsultation, copy.sectionNavigator, copy.sectionRoutine, copy.sectionShopAll],
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

  const handleConsultationSubmit = async (formData: ConsultationFormData) => {
    await submitConsultationLead({
      ...formData,
      source: 'shop-consultation',
      pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
      locale:
        typeof document !== 'undefined' ? document.documentElement.lang?.trim() || undefined : undefined,
    })
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
      if (filters[group].size === 0) return false
      const allowed = new Set(options.map((item) => item.id))
      const next = new Set(Array.from(filters[group]).filter((id) => allowed.has(id)))
      if (next.size === filters[group].size) return false
      setFilters((prev) => ({ ...prev, [group]: next }))
      return true
    }

    const changed =
      prune('needs', filterOptions.needs) ||
      prune('textures', filterOptions.textures) ||
      prune('productAreas', filterOptions.productAreas) ||
      prune('timingProducts', filterOptions.timingProducts) ||
      prune('skinTypes', filterOptions.skinTypes) ||
      prune('brands', filterOptions.brands) ||
      prune('brandLines', filterOptions.brandLines)

    if (changed) {
      setOpenFilter(null)
    }
  }, [filterOptions, filters, shouldComputeShopAll])

  const filterRowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!openFilter) return
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!filterRowRef.current || !target) return
      if (filterRowRef.current.contains(target)) return
      setOpenFilter(null)
    }
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [openFilter])

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
        if (orderBy === 'price-asc') return (a.price ?? 0) - (b.price ?? 0)
        if (orderBy === 'price-desc') return (b.price ?? 0) - (a.price ?? 0)
        if (orderBy === 'title') return a.title.localeCompare(b.title)
        return (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
      })
  }, [shopAllProducts, filters, orderBy, shouldComputeShopAll])

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

  const shopAllItems = useMemo<ServicesCarouselItem[]>(() => {
    return filteredProducts.map((product) => {
      const media = product.coverImage ?? product.images?.[0]
      const brandLabel =
        product.brand && typeof product.brand === 'object' && 'name' in product.brand
          ? String((product.brand as { name?: unknown }).name ?? '')
          : null
      const imageUrl = media?.url || TRANSPARENT_IMAGE_PLACEHOLDER
      const imageAlt = media?.alt || product.title
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
      }
    })
  }, [filteredProducts, locale, priceFormatter])

  return (
    <>
      <section className={styles.pills}>
        {pills.map((pill) => (
          <button
            key={pill.key}
            type="button"
            className={`${styles.pillLink} ${activeSection === pill.key ? styles.pillActive : ''}`}
            onClick={() => {
              const nextSection = pill.key as SectionKey
              setActiveSection(nextSection)
              updateSectionQuery(nextSection)
            }}
          >
            {pill.label}
          </button>
        ))}
        {activeSection === 'shop-all' && (
          <button
            type="button"
            className={`${styles.pillLink} ${showFilters ? styles.pillActive : ''}`}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            {copy.filters}
            {activeFilterCount > 0 && (
              <span className={styles.filterCount}>{activeFilterCount}</span>
            )}
          </button>
        )}
        {activeSection === 'shop-all' && activeFilterCount > 0 && (
          <button
            type="button"
            className={styles.pillLink}
            onClick={() => {
              setFilters({
                needs: new Set(),
                textures: new Set(),
                productAreas: new Set(),
                timingProducts: new Set(),
                skinTypes: new Set(),
                brands: new Set(),
                brandLines: new Set(),
              })
            }}
          >
            {copy.removeAll}
          </button>
        )}
      </section>

      {activeSection === 'shop-all' && showFilters && (
        <section className={styles.filters}>
          <div className={styles.filterRow} ref={filterRowRef}>
            {[
              { key: 'needs', label: copy.needs, options: filterOptions.needs },
              { key: 'textures', label: copy.texture, options: filterOptions.textures },
              { key: 'productAreas', label: copy.productAreas, options: filterOptions.productAreas },
              { key: 'timingProducts', label: copy.timing, options: filterOptions.timingProducts },
              { key: 'skinTypes', label: copy.skinTypes, options: filterOptions.skinTypes },
              { key: 'brands', label: copy.brand, options: filterOptions.brands },
              { key: 'brandLines', label: copy.brandLine, options: filterOptions.brandLines },
            ].map((group) => (
              <div key={group.key} className={styles.filterGroup}>
                <button
                  type="button"
                  className={styles.filterPill}
                  onClick={() => {
                    setOpenFilter((prev) => (prev === group.key ? null : group.key))
                  }}
                >
                  {group.label}
                </button>
                {openFilter === group.key && (
                  <div className={styles.dropdown}>
                    {group.options.length === 0 && (
                      <div className={styles.dropdownEmpty}>{copy.noOptions}</div>
                    )}
                    {group.options.map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        className={`${styles.dropdownItem} ${
                          filters[group.key as keyof typeof filters].has(option.id)
                            ? styles.dropdownItemActive
                            : ''
                        }`}
                        onClick={() =>
                          toggleFilter(group.key as keyof typeof filters, option.id)
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className={styles.filterGroup}>
              <button
                type="button"
                className={styles.filterPill}
                onClick={() => {
                  setOpenFilter((prev) => (prev === 'order' ? null : 'order'))
                }}
              >
                {copy.orderBy}
              </button>
              {openFilter === 'order' && (
                <div className={styles.dropdown}>
                  {[
                    { id: 'recent', label: copy.orderRecent },
                    { id: 'price-asc', label: copy.orderPriceAsc },
                    { id: 'price-desc', label: copy.orderPriceDesc },
                    { id: 'title', label: copy.orderTitle },
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      className={`${styles.dropdownItem} ${
                        orderBy === option.id ? styles.dropdownItemActive : ''
                      }`}
                      onClick={() => setOrderBy(option.id as typeof orderBy)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'navigator' && (
        <div id="navigator">
          <ShopNavigatorSection
            data={navigatorData}
            initialClassicParams={classicParams}
            productBasePath={productBasePath}
          />
        </div>
      )}

      {activeSection === 'routine' && (
        <>
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
          <RoutineBuilderSection templates={routineTemplates} productBasePath={productBasePath} />
        </>
      )}

      {activeSection === 'shop-all' && <ShopAllSection items={shopAllItems} />}

      {activeSection === 'consulenza' && (
        <section id="consulenza">
          <ConsulenzaForm
            phoneLink={contactLinks.phoneLink}
            phoneDisplay={contactLinks.phoneDisplay}
            whatsappLink={contactLinks.whatsappLink}
            whatsappDisplay={contactLinks.whatsappDisplay}
            styles={stylesConsultationForm}
            contactStyleVariant="plain"
            onSubmit={handleConsultationSubmit}
          />
        </section>
      )}
    </>
  )
}
