'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ConsulenzaForm } from '@/components/shop-navigator/components/ConsulenzaForm'
import { ShopNavigatorSection } from '@/components/shop-navigator/ShopNavigatorSection'
import { RoutineBuilderSection } from '@/components/shop/RoutineBuilderSection'
import { RoutineBuilderSplitSection } from '@/components/shop/RoutineBuilderSplitSection'
import { ShopAllSection } from '@/components/shop/ShopAllSection'
import type { ShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import type { ProductCard } from '@/components/shop-navigator/types/navigator'
import type { ServicesCarouselItem } from '@/components/service-carousel/types'
import styles from './ShopSectionSwitcher.module.css'

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
      { key: 'navigator', label: 'Shop Navigator' },
      { key: 'routine', label: 'Routine Builder' },
      { key: 'consulenza', label: 'Consulenza' },
      { key: 'shop-all', label: 'Shop all' },
    ],
    [],
  )

  const filterOptions = useMemo(() => {
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
  }, [shopAllProducts, filters])

  useEffect(() => {
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
  }, [filterOptions, filters])

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
  }, [shopAllProducts, filters, orderBy])

  const shopAllItems = useMemo<ServicesCarouselItem[]>(() => {
    return filteredProducts.flatMap((product) => {
      const media = product.coverImage ?? product.images?.[0]
      if (!media) return []
      const brandLabel =
        product.brand && typeof product.brand === 'object' && 'name' in product.brand
          ? String((product.brand as { name?: unknown }).name ?? '')
          : null
      return [
        {
          title: product.title,
          subtitle: brandLabel,
          price: typeof product.price === 'number' ? `€ ${product.price}` : null,
          image: { url: media.url, alt: media.alt || product.title },
          tag: brandLabel,
          badgeLeft: null,
          badgeRight: null,
          href: product.slug ? `/${locale}/shop/${product.slug}` : undefined,
          duration: null,
        },
      ]
    })
  }, [filteredProducts, locale])

  return (
    <>
      <section className={styles.pills}>
        {pills.map((pill) => (
          <button
            key={pill.key}
            type="button"
            className={`${styles.pillLink} ${activeSection === pill.key ? styles.pillActive : ''}`}
            onClick={() => setActiveSection(pill.key as SectionKey)}
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
            Filtri
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
            Remove all
          </button>
        )}
      </section>

      {activeSection === 'shop-all' && showFilters && (
        <section className={styles.filters}>
          <div className={styles.filterRow} ref={filterRowRef}>
            {[
              { key: 'needs', label: 'Needs', options: filterOptions.needs },
              { key: 'textures', label: 'Texture', options: filterOptions.textures },
              { key: 'productAreas', label: 'Product Areas', options: filterOptions.productAreas },
              { key: 'timingProducts', label: 'Timing', options: filterOptions.timingProducts },
              { key: 'skinTypes', label: 'Skin Types', options: filterOptions.skinTypes },
              { key: 'brands', label: 'Brand', options: filterOptions.brands },
              { key: 'brandLines', label: 'Brand Line', options: filterOptions.brandLines },
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
                      <div className={styles.dropdownEmpty}>Nessuna opzione</div>
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
                Order by
              </button>
              {openFilter === 'order' && (
                <div className={styles.dropdown}>
                  {[
                    { id: 'recent', label: 'Recent' },
                    { id: 'price-asc', label: 'Prezzo crescente' },
                    { id: 'price-desc', label: 'Prezzo decrescente' },
                    { id: 'title', label: 'Titolo A-Z' },
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
          />
        </section>
      )}
    </>
  )
}
