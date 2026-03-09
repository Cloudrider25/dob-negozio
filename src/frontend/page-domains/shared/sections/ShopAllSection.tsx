'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { CarouselCard } from '@/frontend/components/carousel/ui/CarouselCard'
import { getCarouselItemKey } from '@/frontend/components/carousel/shared/types'
import type { CarouselItem } from '@/frontend/components/carousel/shared/types'
import { SideDrawer } from '@/frontend/components/ui/compositions/SideDrawer'
import { Button } from '@/frontend/components/ui/primitives/button'
import { emitCartOpen, emitCartUpdated, readCart, writeCart } from '@/lib/frontend/cart/storage'
import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  FunnelIcon,
  RectangleStackIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import styles from './ShopAllSection.module.css'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name'

export type ShopAllFilterGroup = {
  key: string
  label: string
  options: Array<{ id: string; label: string }>
  selected: Set<string>
}

export type ShopAllControls = {
  labelPrefix?: string
  filtersNoneLabel?: string
  sortOptions?: Array<{ key: SortKey; label: string }>
  sortValue?: SortKey
  onSortChange?: (next: SortKey) => void
  filterGroups?: ShopAllFilterGroup[]
  onFilterToggle?: (groupKey: string, optionId: string) => void
  onClearFilters?: () => void
  clearFiltersLabel?: string
}

export function ShopAllSection({
  items,
  controls,
  countOverride,
  renderGridItem,
}: {
  items: CarouselItem[]
  controls?: ShopAllControls
  countOverride?: number
  renderGridItem?: (args: {
    item: CarouselItem
    index: number
    defaultNode: ReactNode
    onCtaClick?: (item: CarouselItem) => void
    cardClassName?: string
  }) => ReactNode
}) {
  const [drawerItem, setDrawerItem] = useState<CarouselItem | null>(null)
  const [controlsDrawerOpen, setControlsDrawerOpen] = useState(false)
  const [internalSortBy, setInternalSortBy] = useState<SortKey>('featured')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const sortBy = controls?.sortValue ?? internalSortBy
  const setSortBy = controls?.onSortChange ?? setInternalSortBy
  const cardClassName =
    viewMode === 'grid'
      ? styles.compactCardMobile
      : viewMode === 'list'
        ? styles.desktopTwoColumnCard
        : undefined
  const sortOptions: Array<{ key: SortKey; label: string }> = controls?.sortOptions ?? [
    { key: 'featured', label: 'featured' },
    { key: 'price-asc', label: 'price low-high' },
    { key: 'price-desc', label: 'price high-low' },
    { key: 'name', label: 'name' },
  ]
  const filtersCount = (controls?.filterGroups ?? []).reduce((acc, group) => acc + group.selected.size, 0)
  const sortIsActive = sortBy !== 'featured'
  const controlsActiveCount = (sortIsActive ? 1 : 0) + filtersCount

  const entityLabel = useMemo(() => {
    const hasServices = items.some((item) => item.href?.includes('/services/'))
    return hasServices ? 'services' : 'products'
  }, [items])

  const sortedItems = useMemo(() => {
    const readPrice = (item: CarouselItem): number => {
      if (item.ctaAction?.mode === 'direct' && typeof item.ctaAction.payload.price === 'number') {
        return item.ctaAction.payload.price
      }
      if (item.ctaAction?.mode === 'options') {
        const optionWithPrice = item.ctaAction.options.find(
          (option) => typeof option.payload.price === 'number',
        )
        if (optionWithPrice && typeof optionWithPrice.payload.price === 'number') {
          return optionWithPrice.payload.price
        }
      }
      if (!item.price) return 0
      const normalized = item.price.replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(',', '.')
      const parsed = Number.parseFloat(normalized)
      return Number.isFinite(parsed) ? parsed : 0
    }

    const next = [...items]
    if (sortBy === 'name') {
      next.sort((a, b) => a.title.localeCompare(b.title, 'it'))
      return next
    }
    if (sortBy === 'price-asc') {
      next.sort((a, b) => readPrice(a) - readPrice(b))
      return next
    }
    if (sortBy === 'price-desc') {
      next.sort((a, b) => readPrice(b) - readPrice(a))
      return next
    }
    return next
  }, [items, sortBy])

  const drawerOptions = useMemo(() => {
    if (!drawerItem?.ctaAction || drawerItem.ctaAction.mode !== 'options') return []
    return drawerItem.ctaAction.options
  }, [drawerItem])

  const drawerVariantOptions = useMemo(
    () => drawerOptions.filter((option) => option.group === 'variant'),
    [drawerOptions],
  )
  const drawerPackageOptions = useMemo(
    () => drawerOptions.filter((option) => option.group === 'package'),
    [drawerOptions],
  )
  const drawerDefaultOptions = useMemo(
    () =>
      drawerOptions.filter(
        (option) => option.group !== 'variant' && option.group !== 'package',
      ),
    [drawerOptions],
  )

  const addPayloadToCart = (payload: {
    id: string
    title: string
    slug?: string
    price?: number
    currency?: string
    brand?: string
    format?: string
    coverImage?: string | null
  }) => {
    if (typeof window === 'undefined') return
    const next = readCart()
    const existing = next.find((item) => item.id === payload.id)

    if (existing) {
      existing.quantity += 1
      if (typeof payload.price === 'number') existing.price = payload.price
      if (!existing.slug && payload.slug) existing.slug = payload.slug
      if (!existing.brand && payload.brand) existing.brand = payload.brand
      if (!existing.format && payload.format) existing.format = payload.format
      if (!existing.coverImage && payload.coverImage) existing.coverImage = payload.coverImage
    } else {
      next.push({
        id: payload.id,
        title: payload.title,
        slug: payload.slug,
        price: payload.price,
        currency: payload.currency,
        brand: payload.brand,
        format: payload.format,
        coverImage: payload.coverImage ?? null,
        quantity: 1,
      })
    }

    writeCart(next)
    emitCartUpdated()
    emitCartOpen()
  }

  const handleCtaClick = (item: CarouselItem) => {
    const action = item.ctaAction
    if (!action) return
    if (action.mode === 'direct') {
      addPayloadToCart(action.payload)
      return
    }
    if (action.options.length === 0) return
    setDrawerItem(item)
  }

  const handleResetControls = () => {
    setSortBy('featured')
    controls?.onClearFilters?.()
  }

  return (
    <>
      <section className={styles.section}>
        <div className={styles.toolbar} aria-label="Sort and view">
          <div className={styles.sortLabel}>
            <button
              type="button"
              className={`${styles.sortSelect} ${controlsActiveCount > 0 ? styles.sortSelectActive : ''}`}
              aria-label={
                controlsActiveCount > 0
                  ? `Sort and filter, ${controlsActiveCount} active`
                  : 'Sort and filter'
              }
              onClick={() => setControlsDrawerOpen(true)}
            >
              <ArrowsUpDownIcon className={styles.sortSelectIcon} aria-hidden="true" />
              <span className={styles.sortSelectDivider} aria-hidden="true" />
              <FunnelIcon className={styles.sortSelectIcon} aria-hidden="true" />
              {controlsActiveCount > 0 ? (
                <span className={`${styles.sortIndicator} typo-caption-upper`}>{controlsActiveCount}</span>
              ) : null}
            </button>
          </div>
          <div className={styles.toolbarMeta}>
            <span className={styles.count}>
              {countOverride ?? sortedItems.length} {entityLabel}
            </span>
            <div className={styles.viewToggle} role="group" aria-label="View mode">
              <button
                type="button"
                className={`${styles.viewButton} ${viewMode === 'list' ? styles.viewButtonActive : ''}`}
                aria-label="List view"
                onClick={() => setViewMode('list')}
              >
                <RectangleStackIcon className={styles.viewIcon} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.viewButtonActive : ''}`}
                aria-label="Grid view"
                onClick={() => setViewMode('grid')}
              >
                <Squares2X2Icon className={styles.viewIcon} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className={`${styles.grid} ${viewMode === 'list' ? styles.gridList : ''}`}>
          {sortedItems.map((item, index) => (
            renderGridItem ? (
              renderGridItem({
                item,
                index,
                onCtaClick: item.ctaAction ? handleCtaClick : undefined,
                cardClassName,
                defaultNode: (
                  <CarouselCard
                    item={item}
                    cardClassName={cardClassName}
                    onCtaClick={item.ctaAction ? handleCtaClick : undefined}
                  />
                ),
              })
            ) : (
              <CarouselCard
                key={getCarouselItemKey(item, index)}
                item={item}
                cardClassName={cardClassName}
                onCtaClick={item.ctaAction ? handleCtaClick : undefined}
              />
            )
          ))}
        </div>
      </section>

      <SideDrawer
        open={controlsDrawerOpen}
        onClose={() => setControlsDrawerOpen(false)}
        ariaLabel="Sort and filter options"
        title="Sort / Filter"
        headerCenter={
          controlsActiveCount > 0 ? (
            <button type="button" className={styles.drawerResetButton} onClick={handleResetControls}>
              Reset
            </button>
          ) : null
        }
        placement="bottom"
        panelClassName={styles.optionsDrawerPanel}
      >
        <div className={styles.optionsDrawerBody}>
          <details className={styles.controlAccordion} open>
            <summary className={`${styles.controlSummary} typo-caption-upper`}>
              <span className={styles.controlSummaryLeft}>Sort</span>
              <ChevronDownIcon className={styles.controlSummaryChevron} aria-hidden="true" />
            </summary>
            <div className={styles.controlContent}>
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`${styles.optionButton} ${sortBy === option.key ? styles.optionButtonActive : ''}`}
                  onClick={() => setSortBy(option.key)}
                >
                  <span className={`${styles.optionLabel} typo-caption-upper`}>{option.label}</span>
                </button>
              ))}
            </div>
          </details>

          {(controls?.filterGroups ?? []).map((group) => (
            <details key={group.key} className={styles.controlAccordion}>
              <summary className={`${styles.controlSummary} typo-caption-upper`}>
                <span className={styles.controlSummaryLeft}>
                  {group.label}
                  {group.selected.size > 0 ? (
                    <span className={styles.controlSummaryCount}>{group.selected.size}</span>
                  ) : null}
                </span>
                <ChevronDownIcon className={styles.controlSummaryChevron} aria-hidden="true" />
              </summary>
              <div className={styles.controlContent}>
                {group.options.length === 0 ? (
                  <div className={styles.controlEmpty}>Nessuna opzione</div>
                ) : null}
                {group.options.map((option) => {
                  const selected = group.selected.has(option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      className={`${styles.optionButton} ${selected ? styles.optionButtonActive : ''}`}
                      onClick={() => controls?.onFilterToggle?.(group.key, option.id)}
                    >
                      <span className={`${styles.optionLabel} typo-caption-upper`}>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </details>
          ))}

          {controls?.onClearFilters ? (
            <Button
              type="button"
              kind="main"
              interactive
              className={styles.optionCancel}
              onClick={() => controls.onClearFilters?.()}
            >
              {controls.clearFiltersLabel ?? 'Rimuovi filtri'}
            </Button>
          ) : null}
        </div>
      </SideDrawer>

      <SideDrawer
        open={Boolean(drawerItem && drawerOptions.length > 0)}
        onClose={() => setDrawerItem(null)}
        ariaLabel="Seleziona opzione"
        title={drawerItem?.ctaAction?.mode === 'options' ? drawerItem.ctaAction.drawerTitle : 'Scegli opzione'}
        placement="bottom"
        panelClassName={styles.optionsDrawerPanel}
      >
        <div className={styles.optionsDrawerBody}>
          {drawerVariantOptions.length > 0 ? (
            <div className={styles.variantsBlock}>
              <p className={`${styles.variantsHeading} typo-caption-upper`}>Scegli</p>
              <div className={styles.variantsRow} role="group" aria-label="Variabili disponibili">
                {drawerVariantOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={styles.variantPill}
                    onClick={() => {
                      addPayloadToCart(option.payload)
                      setDrawerItem(null)
                    }}
                  >
                    <span className={`${styles.variantLabel} typo-caption-upper`}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {[...drawerPackageOptions, ...drawerDefaultOptions].map((option) => (
            <button
              key={option.id}
              type="button"
              className={styles.optionButton}
              onClick={() => {
                addPayloadToCart(option.payload)
                setDrawerItem(null)
              }}
            >
              <span className={`${styles.optionLabel} typo-caption-upper`}>{option.label}</span>
              {option.meta ? (
                <span className={`${styles.optionMeta} typo-small`}>{option.meta}</span>
              ) : null}
            </button>
          ))}
          <Button
            type="button"
            kind="main"
            interactive
            className={styles.optionCancel}
            onClick={() => setDrawerItem(null)}
          >
            Chiudi
          </Button>
        </div>
      </SideDrawer>
    </>
  )
}
