'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { ShopAllSection } from '@/components/shop/ShopAllSection'
import { useNavigatorData } from '@/components/services/navigator-data-context'
import type { ServicesCarouselItem } from '@/components/carousel/types'
import { Button } from '@/components/ui/button'
import styles from '@/components/navigators/service-navigator/components/ListinoTradizionale.module.css'
import filterStyles from '@/components/shop/ShopSectionSwitcher.module.css'

const FALLBACK_IMAGE = '/media/493b3205c13b5f67b36cf794c2222583.jpg'

type FilterKey = 'treatments' | 'areas'

type ServiceView = {
  id: string
  title: string
  description?: string
  price?: number
  durationMin?: number
  slug?: string
  imageUrl?: string
  treatmentOptions: Array<{ id: string; label: string }>
  areaOptions: Array<{ id: string; label: string }>
}

const parseFilterIds = (raw: string | null) =>
  new Set(
    (raw ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  )

const areSetsEqual = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && Array.from(a).every((value) => b.has(value))

export function ListinoTradizionale() {
  const { data } = useNavigatorData()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const showFilters = searchParams.get('filters') === 'open'
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [orderBy, setOrderBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'title'>('recent')
  const [filters, setFilters] = useState(() => ({
    treatments: parseFilterIds(searchParams.get('ft')),
    areas: parseFilterIds(searchParams.get('fa')),
  }))

  const locale = useMemo(() => {
    const segment = pathname.split('/').filter(Boolean)[0]
    return segment || 'it'
  }, [pathname])

  const serviceViews = useMemo<ServiceView[]>(() => {
    const treatmentsMap = new Map(data.treatments.map((treatment) => [treatment.id, treatment]))
    const goalsMap = new Map(data.goals.map((goal) => [goal.id, goal]))
    const areasMap = new Map(data.areas.map((area) => [area.id, area]))

    const resolveAreasForTreatment = (treatmentId: string): Array<{ id: string; label: string }> => {
      const treatment = treatmentsMap.get(treatmentId)
      if (!treatment) return []

      const areaMap = new Map<string, string>()
      for (const referenceId of treatment.referenceIds) {
        const area = areasMap.get(referenceId)
        if (area) {
          areaMap.set(area.id, area.label)
          continue
        }
        const goal = goalsMap.get(referenceId)
        if (goal?.areaId) {
          const goalArea = areasMap.get(goal.areaId)
          if (goalArea) areaMap.set(goalArea.id, goalArea.label)
        }
      }

      return Array.from(areaMap.entries()).map(([id, label]) => ({ id, label }))
    }

    return data.services.map((service) => {
      const treatmentOptions = service.treatmentIds
        .map((treatmentId) => {
          const treatment = treatmentsMap.get(treatmentId)
          if (!treatment) return null
          return { id: treatment.id, label: treatment.label }
        })
        .filter(Boolean) as Array<{ id: string; label: string }>

      const areasMapForService = new Map<string, string>()
      for (const treatment of treatmentOptions) {
        for (const area of resolveAreasForTreatment(treatment.id)) {
          areasMapForService.set(area.id, area.label)
        }
      }

      return {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        durationMin: service.durationMin,
        slug: service.slug,
        imageUrl: service.imageUrl,
        treatmentOptions,
        areaOptions: Array.from(areasMapForService.entries()).map(([id, label]) => ({ id, label })),
      }
    })
  }, [data.areas, data.goals, data.services, data.treatments])

  useEffect(() => {
    const fromQuery = {
      treatments: parseFilterIds(searchParams.get('ft')),
      areas: parseFilterIds(searchParams.get('fa')),
    }
    setFilters((prev) => {
      if (areSetsEqual(prev.treatments, fromQuery.treatments) && areSetsEqual(prev.areas, fromQuery.areas)) {
        return prev
      }
      return fromQuery
    })
  }, [searchParams])

  const syncFiltersToQuery = (nextFilters: { treatments: Set<string>; areas: Set<string> }) => {
    const params = new URLSearchParams(searchParams.toString())
    const toParam = (set: Set<string>) => Array.from(set).join(',')
    const treatments = toParam(nextFilters.treatments)
    const areas = toParam(nextFilters.areas)

    if (treatments) params.set('ft', treatments)
    else params.delete('ft')

    if (areas) params.set('fa', areas)
    else params.delete('fa')

    const query = params.toString()
    const currentQuery = searchParams.toString()
    if (query === currentQuery) return
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const filterOptions = useMemo(() => {
    const unique = (items: Array<{ id: string; label: string }>) => {
      const map = new Map<string, string>()
      for (const item of items) {
        if (!map.has(item.id)) map.set(item.id, item.label)
      }
      return Array.from(map.entries()).map(([id, label]) => ({ id, label }))
    }

    const matchesSet = (values: Array<{ id: string }>, selected: Set<string>) =>
      selected.size === 0 || values.some((value) => selected.has(value.id))

    const subsetFor = (group: FilterKey) =>
      serviceViews.filter((service) => {
        if (group !== 'treatments' && !matchesSet(service.treatmentOptions, filters.treatments)) return false
        if (group !== 'areas' && !matchesSet(service.areaOptions, filters.areas)) return false
        return true
      })

    return {
      treatments: unique(subsetFor('treatments').flatMap((service) => service.treatmentOptions)),
      areas: unique(subsetFor('areas').flatMap((service) => service.areaOptions)),
    }
  }, [filters.areas, filters.treatments, serviceViews])

  useEffect(() => {
    const allowedTreatments = new Set(filterOptions.treatments.map((item) => item.id))
    const allowedAreas = new Set(filterOptions.areas.map((item) => item.id))
    const next = {
      treatments: new Set(Array.from(filters.treatments).filter((id) => allowedTreatments.has(id))),
      areas: new Set(Array.from(filters.areas).filter((id) => allowedAreas.has(id))),
    }

    const changed =
      !areSetsEqual(next.treatments, filters.treatments) || !areSetsEqual(next.areas, filters.areas)

    if (!changed) return
    setFilters(next)
    syncFiltersToQuery(next)
    setOpenFilter(null)
  }, [filterOptions, filters.areas, filters.treatments])

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

  const toggleFilter = (group: FilterKey, id: string) => {
    const nextGroup = new Set(filters[group])
    if (nextGroup.has(id)) nextGroup.delete(id)
    else nextGroup.add(id)
    const next = {
      ...filters,
      [group]: nextGroup,
    }
    setFilters(next)
    syncFiltersToQuery(next)
  }

  const filteredServices = useMemo(() => {
    const matchesSet = (values: Array<{ id: string }>, selected: Set<string>) =>
      selected.size === 0 || values.some((value) => selected.has(value.id))

    return serviceViews
      .filter((service) => {
        if (!matchesSet(service.treatmentOptions, filters.treatments)) return false
        if (!matchesSet(service.areaOptions, filters.areas)) return false
        return true
      })
      .sort((a, b) => {
        if (orderBy === 'price-asc') return (a.price ?? 0) - (b.price ?? 0)
        if (orderBy === 'price-desc') return (b.price ?? 0) - (a.price ?? 0)
        if (orderBy === 'title') return a.title.localeCompare(b.title)
        return 0
      })
  }, [filters.areas, filters.treatments, orderBy, serviceViews])

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'it' ? 'it-IT' : locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [locale],
  )

  const servicesAsCards = useMemo<ServicesCarouselItem[]>(
    () =>
      filteredServices.map((service) => ({
        title: service.title,
        subtitle: service.description || '',
        price: typeof service.price === 'number' ? priceFormatter.format(service.price) : null,
        duration:
          typeof service.durationMin === 'number' && service.durationMin > 0
            ? `${service.durationMin} min`
            : null,
        image: {
          url: service.imageUrl || FALLBACK_IMAGE,
          alt: service.title,
        },
        tag: service.treatmentOptions[0]?.label || null,
        badgeLeft: service.areaOptions[0]?.label || null,
        badgeRight: null,
        href: service.slug ? `/${locale}/services/service/${service.slug}` : undefined,
      })),
    [filteredServices, locale, priceFormatter],
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={styles.wrapper}
    >
      {showFilters && (
        <section className={filterStyles.filters}>
          <div className={filterStyles.filterRow} ref={filterRowRef}>
            {[
              { key: 'treatments', label: 'Trattamenti', options: filterOptions.treatments },
              { key: 'areas', label: 'Aree', options: filterOptions.areas },
            ].map((group) => (
              <div key={group.key} className={filterStyles.filterGroup}>
                <Button
                  kind="main"
                  size="sm"
                  interactive
                  className={filterStyles.filterPill}
                  onClick={() => setOpenFilter((prev) => (prev === group.key ? null : group.key))}
                >
                  {group.label}
                </Button>
                {openFilter === group.key && (
                  <div className={filterStyles.dropdown}>
                    {group.options.length === 0 && (
                      <div className={filterStyles.dropdownEmpty}>Nessuna opzione</div>
                    )}
                    {group.options.map((option) => (
                      <Button
                        key={option.id}
                        kind="main"
                        size="sm"
                        interactive
                        aria-pressed={filters[group.key as FilterKey].has(option.id)}
                        className={`${filterStyles.dropdownItem} ${
                          filters[group.key as FilterKey].has(option.id)
                            ? filterStyles.dropdownItemActive
                            : ''
                        }`}
                        onClick={() => toggleFilter(group.key as FilterKey, option.id)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className={filterStyles.filterGroup}>
              <Button
                kind="main"
                size="sm"
                interactive
                className={filterStyles.filterPill}
                onClick={() => setOpenFilter((prev) => (prev === 'order' ? null : 'order'))}
              >
                Ordina per
              </Button>
              {openFilter === 'order' && (
                <div className={filterStyles.dropdown}>
                  {[
                    { id: 'recent', label: 'Recenti' },
                    { id: 'price-asc', label: 'Prezzo crescente' },
                    { id: 'price-desc', label: 'Prezzo decrescente' },
                    { id: 'title', label: 'Titolo' },
                  ].map((option) => (
                    <Button
                      key={option.id}
                      kind="main"
                      size="sm"
                      interactive
                      aria-pressed={orderBy === option.id}
                      className={`${filterStyles.dropdownItem} ${
                        orderBy === option.id ? filterStyles.dropdownItemActive : ''
                      }`}
                      onClick={() => setOrderBy(option.id as typeof orderBy)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className={styles.cardsBlock}>
        {servicesAsCards.length > 0 ? (
          <ShopAllSection items={servicesAsCards} />
        ) : (
          <div className={styles.empty}>Nessun servizio disponibile con i filtri selezionati.</div>
        )}
      </div>
    </motion.div>
  )
}
