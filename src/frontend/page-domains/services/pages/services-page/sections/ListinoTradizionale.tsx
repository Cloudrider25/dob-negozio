'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { ShopAllSection, type ShopAllControls } from '@/frontend/page-domains/shared/sections/ShopAllSection'
import { useNavigatorData } from '@/frontend/page-domains/services/pages/services-page/sections/navigator-data-context'
import { getCarouselItemKey } from '@/frontend/components/carousel/shared/types'
import type { CarouselItem } from '@/frontend/components/carousel/shared/types'
import styles from '@/frontend/page-domains/services/pages/services-page/sections/ListinoTradizionale.module.css'
import { ServiceDeckCard } from '@/frontend/page-domains/services/pages/services-page/sections/ServiceDeckCard'

const FALLBACK_IMAGE = '/api/media/file/493b3205c13b5f67b36cf794c2222583-1.jpg'

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
  variabili: Array<{
    id: string
    name: string
    durationMinutes?: number | null
    price?: number
  }>
  pacchetti: Array<{
    id: string
    name: string
    linkedTo: string
    sessions?: number | null
    packagePrice?: number
    packageValue?: number | null
  }>
  deck?: {
    id: string
    name?: string
    slug?: string
    deckType?: 'laser' | 'wax' | 'other'
    sortOrder?: number | null
    coverTitle?: string
    coverSubtitle?: string
    coverImageUrl?: string
  }
}

type DeckCarouselItem = CarouselItem & {
  deckMeta: {
    id: string
    title: string
    subtitle?: string | null
    price?: string | null
    imageUrl: string
    imageAlt?: string | null
    items: CarouselItem[]
    sortOrder: number
  }
}

const isDeckCarouselItem = (item: CarouselItem | DeckCarouselItem): item is DeckCarouselItem =>
  'deckMeta' in item

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
  const queryTerm = (searchParams?.get('q') ?? '').trim().toLowerCase()
  const [orderBy, setOrderBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'title'>('recent')
  const [filters, setFilters] = useState(() => ({
    treatments: parseFilterIds(searchParams?.get('ft') ?? null),
    areas: parseFilterIds(searchParams?.get('fa') ?? null),
  }))

  const locale = useMemo(() => {
    const segment = (pathname ?? '').split('/').filter(Boolean)[0]
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
        variabili: Array.isArray(service.variabili) ? service.variabili : [],
        pacchetti: Array.isArray(service.pacchetti) ? service.pacchetti : [],
        deck: service.deck,
      }
    })
  }, [data.areas, data.goals, data.services, data.treatments])

  useEffect(() => {
    const fromQuery = {
      treatments: parseFilterIds(searchParams?.get('ft') ?? null),
      areas: parseFilterIds(searchParams?.get('fa') ?? null),
    }
    setFilters((prev) => {
      if (areSetsEqual(prev.treatments, fromQuery.treatments) && areSetsEqual(prev.areas, fromQuery.areas)) {
        return prev
      }
      return fromQuery
    })
  }, [searchParams])

  const syncFiltersToQuery = useCallback((nextFilters: { treatments: Set<string>; areas: Set<string> }) => {
    if (!pathname) return
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    const toParam = (set: Set<string>) => Array.from(set).join(',')
    const treatments = toParam(nextFilters.treatments)
    const areas = toParam(nextFilters.areas)

    if (treatments) params.set('ft', treatments)
    else params.delete('ft')

    if (areas) params.set('fa', areas)
    else params.delete('fa')

    const query = params.toString()
    const currentQuery = searchParams?.toString() ?? ''
    if (query === currentQuery) return
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

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
  }, [filterOptions, filters.areas, filters.treatments, syncFiltersToQuery])

  const toggleFilter = useCallback(
    (group: FilterKey, id: string) => {
      setFilters((prev) => {
        const nextGroup = new Set(prev[group])
        if (nextGroup.has(id)) nextGroup.delete(id)
        else nextGroup.add(id)
        const next = {
          ...prev,
          [group]: nextGroup,
        }
        syncFiltersToQuery(next)
        return next
      })
    },
    [syncFiltersToQuery],
  )

  const filteredServices = useMemo(() => {
    const matchesSet = (values: Array<{ id: string }>, selected: Set<string>) =>
      selected.size === 0 || values.some((value) => selected.has(value.id))

    return serviceViews
      .filter((service) => {
        if (queryTerm) {
          const haystack = [
            service.title,
            service.description || '',
            service.slug || '',
            ...service.treatmentOptions.map((item) => item.label),
            ...service.areaOptions.map((item) => item.label),
          ]
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(queryTerm)) return false
        }
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
  }, [filters.areas, filters.treatments, orderBy, queryTerm, serviceViews])

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

  const servicesAsCards = useMemo<Array<CarouselItem | DeckCarouselItem>>(
    () => {
      const toCarouselItem = (service: ServiceView): CarouselItem => {
        const formattedBasePrice =
          typeof service.price === 'number' ? priceFormatter.format(service.price) : null
        const defaultServicePayload = {
          id: `${service.id}:service:default`,
          title: service.title,
          slug: service.slug,
          price: service.price,
          currency: 'EUR',
          coverImage: service.imageUrl || null,
        }
        const variableOptions = service.variabili.map((variable) => ({
          id: variable.id,
          label: variable.durationMinutes
            ? `${variable.name} (${variable.durationMinutes} min)`
            : variable.name,
          meta: typeof variable.price === 'number' ? priceFormatter.format(variable.price) : null,
          group: 'variant' as const,
          payload: {
            id: `${service.id}:service:${variable.id}`,
            title: `${service.title} ${variable.name}`.trim(),
            slug: service.slug,
            price: variable.price,
            currency: 'EUR',
            coverImage: service.imageUrl || null,
          },
        }))
        const defaultVariantOption =
          typeof service.price === 'number'
            ? {
                id: `${service.id}:variant:default`,
                label:
                  typeof service.durationMin === 'number' && service.durationMin > 0
                    ? `Base (${service.durationMin} min)`
                    : 'Base',
                meta: priceFormatter.format(service.price),
                group: 'variant' as const,
                payload: {
                  id: `${service.id}:service:default`,
                  title:
                    typeof service.durationMin === 'number' && service.durationMin > 0
                      ? `${service.title} Base (${service.durationMin} min)`
                      : `${service.title} Base`,
                  slug: service.slug,
                  price: service.price,
                  currency: 'EUR',
                  coverImage: service.imageUrl || null,
                },
              }
            : null
        const packageOptions = service.pacchetti.map((pkg) => ({
          id: pkg.id,
          label: pkg.name,
          meta: [
            typeof pkg.packagePrice === 'number' ? priceFormatter.format(pkg.packagePrice) : null,
            pkg.sessions ? `${pkg.sessions} sedute` : null,
          ]
            .filter(Boolean)
            .join(' · '),
          group: 'package' as const,
          payload: {
            id: `${service.id}:package:${pkg.id}`,
            title: pkg.name,
            slug: service.slug,
            price: pkg.packagePrice,
            currency: 'EUR',
            coverImage: service.imageUrl || null,
          },
        }))
        const hasOptions = variableOptions.length > 0 || packageOptions.length > 0
        const allVariantOptions = defaultVariantOption
          ? [defaultVariantOption, ...variableOptions]
          : variableOptions

        return {
          id: service.id,
          title: service.title,
          subtitle: service.description || '',
          price: formattedBasePrice,
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
          mobileCtaLabel: formattedBasePrice ? `prenota - ${formattedBasePrice}` : 'prenota',
          ctaAction: hasOptions
            ? {
              mode: 'options' as const,
              drawerTitle: service.title,
              options: [...allVariantOptions, ...packageOptions],
            }
            : {
                mode: 'direct' as const,
                payload: defaultServicePayload,
              },
        }
      }

      const singles: CarouselItem[] = []
      const deckMap = new Map<
        string,
        {
          id: string
          title: string
          subtitle?: string | null
          imageUrl: string
          imageAlt: string
          sortOrder: number
          items: CarouselItem[]
          prices: number[]
        }
      >()

      for (const service of filteredServices) {
        const card = toCarouselItem(service)
        const deck = service.deck
        if (!deck?.id) {
          singles.push(card)
          continue
        }

        const deckTitle = deck.coverTitle || deck.name || card.title
        const deckSubtitle = deck.coverSubtitle || null
        const deckImageUrl = deck.coverImageUrl || service.imageUrl || FALLBACK_IMAGE
        const sortOrder = typeof deck.sortOrder === 'number' ? deck.sortOrder : 0

        if (!deckMap.has(deck.id)) {
          deckMap.set(deck.id, {
            id: deck.id,
            title: deckTitle,
            subtitle: deckSubtitle,
            imageUrl: deckImageUrl,
            imageAlt: deckTitle,
            sortOrder,
            items: [],
            prices: [],
          })
        }

        const entry = deckMap.get(deck.id)!
        entry.items.push(card)
        if (typeof service.price === 'number') entry.prices.push(service.price)
      }

      const decks: DeckCarouselItem[] = [...deckMap.values()]
        .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, locale))
        .map((deck) => {
          const minPrice = deck.prices.length > 0 ? Math.min(...deck.prices) : null
          const formattedPrice = typeof minPrice === 'number' ? `da ${priceFormatter.format(minPrice)}` : null
          return {
            id: `deck:${deck.id}`,
            title: deck.title,
            subtitle: deck.subtitle,
            price: formattedPrice,
            image: {
              url: deck.imageUrl,
              alt: deck.imageAlt,
            },
            deckMeta: {
              id: deck.id,
              title: deck.title,
              subtitle: deck.subtitle,
              price: formattedPrice,
              imageUrl: deck.imageUrl,
              imageAlt: deck.imageAlt,
              items: deck.items,
              sortOrder: deck.sortOrder,
            },
          }
        })

      return [...decks, ...singles]
    },
    [filteredServices, locale, priceFormatter],
  )

  const controls = useMemo<ShopAllControls>(() => {
    const sortValue =
      orderBy === 'price-asc' || orderBy === 'price-desc' ? orderBy : orderBy === 'title' ? 'name' : 'featured'

    return {
      labelPrefix: 'Sort/Filter',
      filtersNoneLabel: 'none',
      sortValue,
      sortOptions: [
        { key: 'featured', label: 'featured' },
        { key: 'price-asc', label: 'price low-high' },
        { key: 'price-desc', label: 'price high-low' },
        { key: 'name', label: 'name' },
      ],
      onSortChange: (next) => {
        if (next === 'price-asc' || next === 'price-desc') {
          setOrderBy(next)
          return
        }
        if (next === 'name') {
          setOrderBy('title')
          return
        }
        setOrderBy('recent')
      },
      filterGroups: [
        {
          key: 'treatments',
          label: 'Trattamenti',
          options: filterOptions.treatments,
          selected: filters.treatments,
        },
        {
          key: 'areas',
          label: 'Aree',
          options: filterOptions.areas,
          selected: filters.areas,
        },
      ],
      onFilterToggle: (groupKey, optionId) => {
        if (groupKey === 'treatments' || groupKey === 'areas') {
          toggleFilter(groupKey, optionId)
        }
      },
      onClearFilters: () => {
        const next = { treatments: new Set<string>(), areas: new Set<string>() }
        setFilters(next)
        syncFiltersToQuery(next)
      },
      clearFiltersLabel: 'Rimuovi filtri',
    }
  }, [filterOptions.areas, filterOptions.treatments, filters.areas, filters.treatments, orderBy, syncFiltersToQuery, toggleFilter])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={styles.wrapper}
    >
      <div className={styles.cardsBlock}>
        {servicesAsCards.length > 0 ? (
          <ShopAllSection
            items={servicesAsCards}
            controls={controls}
            countOverride={filteredServices.length}
            renderGridItem={({ item, index, defaultNode, onCtaClick, cardClassName }) => {
              if (!isDeckCarouselItem(item)) {
                return <div key={getCarouselItemKey(item, index)}>{defaultNode}</div>
              }

              return (
                <ServiceDeckCard
                  key={getCarouselItemKey(item, index)}
                  title={item.deckMeta.title}
                  subtitle={item.deckMeta.subtitle}
                  price={item.deckMeta.price}
                  count={item.deckMeta.items.length}
                  imageUrl={item.deckMeta.imageUrl}
                  imageAlt={item.deckMeta.imageAlt}
                  childrenItems={item.deckMeta.items}
                  onChildCtaClick={onCtaClick}
                  coverClassName={cardClassName}
                />
              )
            }}
          />
        ) : (
          <div className={`${styles.empty} typo-body`}>Nessun servizio disponibile con i filtri selezionati.</div>
        )}
      </div>
    </motion.div>
  )
}
