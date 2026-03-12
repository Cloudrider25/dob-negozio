'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './RoutineBuilderSplitSection.module.css'
import { MediaThumb } from '@/frontend/components/shared/MediaThumb'
import { SplitSection } from '@/frontend/components/ui/compositions/SplitSection'
import { StateCircleButton } from '@/frontend/components/ui/primitives/StateCircleButton'
import { Button } from '@/frontend/components/ui/primitives/button'
import { ChevronLeft, ChevronRight } from '@/frontend/components/ui/primitives/icons'
import { Swiper, SwiperSlide, type UISwiperInstance } from '@/frontend/components/ui/primitives/swiper'
import type { CartItem } from '@/lib/frontend/cart/storage'
import { emitCartUpdated, writeCart } from '@/lib/frontend/cart/storage'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media-core/thumbnail'

type ProductAreaItem = {
  id: string
  label: string
  slug?: string
  media?: { url?: string | null; alt?: string | null } | null
  description?: string | null
}

type TimingItem = {
  id: string
  label: string
  media?: { url?: string | null; alt?: string | null } | null
  description?: string | null
}

type SkinTypeItem = {
  id: string
  label: string
  media?: { url?: string | null; alt?: string | null } | null
  description?: string | null
  productAreaId?: string
}

type NeedItem = {
  id: string
  label: string
  media?: { url?: string | null; alt?: string | null } | null
  description?: string | null
}

type RoutineTemplateItem = {
  id: string
  name: string
  description?: string
  need: { id: string; label: string }
  timing: { id: string; label: string; slug?: string }
  productArea?: { id: string; label: string }
  skinType?: { id: string; label: string; slug?: string }
  isMultibrand: boolean
  brand?: { id: string; label: string }
  steps: Array<{
    id: string
    label: string
    slug?: string
    required?: boolean
    products: Array<{
      id: string
      title: string
      slug?: string
      format?: string
      price?: number
      currency?: string
      brand?: string
      coverImage?: { url: string; alt?: string | null } | null
      images?: Array<{ url: string; alt?: string | null }>
    }>
  }>
}

type RoutineStepItem = {
  id: string
  label: string
  slug?: string
  productAreaId?: string
  stepOrder?: number
  isOptional?: boolean
}

type RoutineStepRuleItem = {
  id: string
  routineStepId: string
  timingId?: string | null
  skinTypeId?: string | null
  ruleType: 'require' | 'forbid' | 'warn'
}

type FilterProduct = {
  id: string
  title?: string
  slug?: string
  format?: string
  price?: number
  currency?: string
  brand?: unknown
  needs: Array<{ id: string; label: string }>
  productAreas: Array<{ id: string; label: string }>
  timingProducts: Array<{ id: string; label: string }>
  skinTypes: Array<{ id: string; label: string }>
  coverImage?: { url: string; alt?: string | null } | null
  images?: Array<{ url: string; alt?: string | null }>
}

const STEP_KEYWORD_MAP: Record<string, string[]> = {
  detergente: ['deterg', 'cleansing', 'cleanser', 'latte', 'mousse'],
  tonico: ['tonico', 'toner', 'lozione'],
  siero: ['siero', 'serum', 'booster'],
  crema: ['crema', 'cream', 'emulsion', 'moistur', 'complex'],
  spf: ['spf', 'sunscreen', 'protezione'],
  struccante: ['struccante', 'doppia detersione', 'doppia-dettersione'],
  esfoliante: ['esfoliante', 'scrub', 'peel'],
  maschera: ['maschera', 'mask'],
  'contorno-occhi': ['contorno', 'eye'],
  'trattamento-notte': ['notte', 'night'],
  'detergente-corpo': ['doccia', 'bagnodoccia', 'deterg'],
  'esfoliante-corpo': ['esfoliante', 'scrub'],
  'trattamento-mirato': ['anticellulite', 'riduc', 'drenante', 'thermo', 'criogel', 'leggings'],
  'crema-olio-finale': ['crema', 'olio', 'emulsion'],
}

const formatRoutineProductPrice = (locale: string, value?: number, currency?: string) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null

  const normalizedLocale =
    locale === 'it' ? 'it-IT' : locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : locale

  return new Intl.NumberFormat(normalizedLocale, {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

export function RoutineBuilderSplitSection({
  productAreas,
  routineTimings,
  routineSkinTypes,
  routineNeeds,
  routineTemplates,
  routineSteps,
  routineStepRules,
  routineStep1Title,
  routineStep1Description,
  routineStep2Title,
  routineStep2Description,
  locale,
  shopAllProducts,
}: {
  productAreas: ProductAreaItem[]
  routineTimings: TimingItem[]
  routineSkinTypes: SkinTypeItem[]
  routineNeeds: NeedItem[]
  routineTemplates: RoutineTemplateItem[]
  routineSteps: RoutineStepItem[]
  routineStepRules: RoutineStepRuleItem[]
  routineStep1Title?: string | null
  routineStep1Description?: string | null
  routineStep2Title?: string | null
  routineStep2Description?: string | null
  locale: string
  shopAllProducts: FilterProduct[]
}) {
  const router = useRouter()
  const orderedAreas = useMemo(() => {
    const areas = [...productAreas]
    areas.sort((a, b) => {
      const aKey = a.label.toLowerCase() === 'viso' ? 0 : 1
      const bKey = b.label.toLowerCase() === 'viso' ? 0 : 1
      if (aKey !== bKey) return aKey - bKey
      return a.label.localeCompare(b.label)
    })
    return areas
  }, [productAreas])
  const defaultAreaId = orderedAreas.find((area) => area.label.toLowerCase() === 'viso')?.id
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(
    defaultAreaId ?? orderedAreas[0]?.id ?? null,
  )
  const [activeAreaId, setActiveAreaId] = useState<string | null>(
    defaultAreaId ?? orderedAreas[0]?.id ?? null,
  )
  const [activeTimingId, setActiveTimingId] = useState<string | null>(
    routineTimings[0]?.id ?? null,
  )
  const [activeSkinTypeId, setActiveSkinTypeId] = useState<string | null>(null)
  const [activeNeedId, setActiveNeedId] = useState<string | null>(null)
  const [selectedBrandId, setSelectedBrandId] = useState<string>('multibrand')
  const [routineMode, setRoutineMode] = useState<'preset' | 'custom'>('preset')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isRoutineDetailsOpen, setIsRoutineDetailsOpen] = useState(false)
  const leftSwiperRef = useRef<UISwiperInstance | null>(null)
  const rightSwiperRef = useRef<UISwiperInstance | null>(null)
  const timingOptionsSwiperRef = useRef<UISwiperInstance | null>(null)
  const skinTypeOptionsSwiperRef = useRef<UISwiperInstance | null>(null)
  const needOptionsSwiperRef = useRef<UISwiperInstance | null>(null)
  const selectedArea = orderedAreas.find((area) => area.id === selectedAreaId) ?? orderedAreas[0]
  const activeArea = orderedAreas.find((area) => area.id === activeAreaId) ?? selectedArea
  const activeTiming =
    routineTimings.find((timing) => timing.id === activeTimingId) ?? routineTimings[0]
  const timingMedia = routineTimings.find(
    (timing) => timing.id === activeTiming?.id && timing.media?.url,
  )
  const skinTypesForArea = useMemo(() => {
    if (!selectedArea?.id) return []
    return routineSkinTypes.filter((skin) => skin.productAreaId === selectedArea.id)
  }, [routineSkinTypes, selectedArea?.id])
  const activeSkinType =
    skinTypesForArea.find((skin) => skin.id === activeSkinTypeId) ?? skinTypesForArea[0]
  const skinTypeMedia = skinTypesForArea.find(
    (skin) => skin.id === activeSkinType?.id && skin.media?.url,
  )

  const filteredNeedIds = useMemo(() => {
    if (!selectedArea?.id || !activeTiming?.id || !activeSkinType?.id) return []
    const ids = new Set<string>()
    for (const product of shopAllProducts) {
      const matchesArea = product.productAreas.some((area) => area.id === selectedArea.id)
      if (!matchesArea) continue
      const matchesTiming = product.timingProducts.some((timing) => timing.id === activeTiming.id)
      if (!matchesTiming) continue
      const matchesSkin = product.skinTypes.some((skin) => skin.id === activeSkinType.id)
      if (!matchesSkin) continue
      for (const need of product.needs) ids.add(need.id)
    }
    return Array.from(ids)
  }, [activeSkinType?.id, activeTiming?.id, selectedArea?.id, shopAllProducts])

  const needsForSelection = useMemo(() => {
    const map = new Map(routineNeeds.map((need) => [need.id, need]))
    return filteredNeedIds
      .map((id) => map.get(id))
      .filter((need): need is NeedItem => Boolean(need))
  }, [filteredNeedIds, routineNeeds])

  const activeNeed = needsForSelection.find((need) => need.id === activeNeedId) ?? needsForSelection[0]
  const needMedia = needsForSelection.find((need) => need.id === activeNeed?.id && need.media?.url)

  const matchedRoutineTemplates = useMemo(() => {
    if (!selectedArea?.id || !activeTiming?.id || !activeNeed?.id) return []
    return routineTemplates.filter((template) => {
      if (template.productArea?.id && template.productArea.id !== selectedArea.id) return false
      if (template.timing.id !== activeTiming.id) return false
      if (template.need.id !== activeNeed.id) return false
      if (template.skinType?.id && template.skinType.id !== activeSkinType?.id) return false
      return true
    })
  }, [activeNeed?.id, activeSkinType?.id, activeTiming?.id, routineTemplates, selectedArea?.id])

  const filteredTemplates = useMemo(() => {
    return matchedRoutineTemplates.filter((template) => {
      if (selectedBrandId === 'multibrand') return template.isMultibrand
      return template.brand?.id === selectedBrandId
    })
  }, [matchedRoutineTemplates, selectedBrandId])

  const selectedTemplate =
    filteredTemplates.find((template) => template.id === selectedTemplateId) ?? filteredTemplates[0]

  const matchedRoutineProductIds = useMemo(() => {
    const ids = new Set<string>()

    for (const template of matchedRoutineTemplates) {
      for (const step of template.steps) {
        for (const product of step.products) {
          if (product.id) ids.add(product.id)
        }
      }
    }

    return ids
  }, [matchedRoutineTemplates])

  const customSteps = useMemo(() => {
    if (!selectedArea?.id) return []
    const stepsForArea = routineSteps.filter((step) => step.productAreaId === selectedArea.id)
    const timingId = activeTiming?.id
    const ruleByStep = new Map<string, RoutineStepRuleItem>()
    if (timingId) {
      for (const rule of routineStepRules) {
        if (rule.timingId !== timingId) continue
        ruleByStep.set(rule.routineStepId, rule)
      }
    }
    const warningSteps = new Set<string>()
    const forbiddenBySkin = new Set<string>()
    if (activeSkinType?.id) {
      for (const rule of routineStepRules) {
        if (!rule.skinTypeId) continue
        if (rule.skinTypeId !== activeSkinType.id) continue
        if (rule.ruleType === 'forbid') forbiddenBySkin.add(rule.routineStepId)
        if (rule.ruleType === 'warn') warningSteps.add(rule.routineStepId)
      }
    }
    return stepsForArea
      .filter((step) => ruleByStep.get(step.id)?.ruleType !== 'forbid')
      .filter((step) => !forbiddenBySkin.has(step.id))
      .map((step) => {
        const rule = ruleByStep.get(step.id)
        const required = rule?.ruleType === 'require' ? true : !step.isOptional
        return { ...step, required, warn: warningSteps.has(step.id) }
      })
      .sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0))
  }, [activeSkinType?.id, activeTiming?.id, routineStepRules, routineSteps, selectedArea?.id])

  const customProductsByStep = useMemo(() => {
    if (!selectedArea?.id || !activeTiming?.id || !activeNeed?.id) return new Map<string, FilterProduct[]>()
    const base = shopAllProducts.filter((product) => {
      if (matchedRoutineProductIds.has(product.id)) return false
      const matchesArea = product.productAreas.some((area) => area.id === selectedArea.id)
      if (!matchesArea) return false
      const matchesTiming = product.timingProducts.some((timing) => timing.id === activeTiming.id)
      if (!matchesTiming) return false
      const matchesSkin = activeSkinType
        ? product.skinTypes.some((skin) => skin.id === activeSkinType.id)
        : false
      if (!matchesSkin) return false
      const matchesNeed = product.needs.some((need) => need.id === activeNeed.id)
      return matchesNeed
    })

    const map = new Map<string, FilterProduct[]>()
    for (const step of customSteps) {
      const keywords = step.slug ? STEP_KEYWORD_MAP[step.slug] ?? [] : []
      const items = base.filter((product) => {
        if (keywords.length === 0) return true
        const text = (product.title ?? '').toLowerCase()
        return keywords.some((keyword) => text.includes(keyword))
      })
      map.set(step.id, items)
    }
    return map
  }, [activeNeed?.id, activeSkinType, activeTiming?.id, customSteps, matchedRoutineProductIds, selectedArea?.id, shopAllProducts])

  const presetSteps = useMemo(() => {
    if (!selectedTemplate) return []
    if (customSteps.length === 0) return selectedTemplate.steps
    const templateMap = new Map(selectedTemplate.steps.map((step) => [step.id, step]))
    return customSteps.map((step) => {
      const templateStep = templateMap.get(step.id)
      return {
        id: step.id,
        label: templateStep?.label ?? step.label,
        slug: templateStep?.slug ?? step.slug,
        required: templateStep?.required ?? step.required,
        products: templateStep?.products ?? [],
      }
    })
  }, [customSteps, selectedTemplate])

  const visiblePresetSteps = useMemo(
    () => presetSteps.filter((step) => step.products.length > 0),
    [presetSteps],
  )

  const visibleCustomSteps = useMemo(
    () => customSteps.filter((step) => (customProductsByStep.get(step.id)?.length ?? 0) > 0),
    [customProductsByStep, customSteps],
  )

  const routineCheckoutProducts = useMemo(() => {
    if (routineMode === 'preset') {
      return visiblePresetSteps.flatMap((step) =>
        step.products.slice(0, 1).map((product) => ({
          id: product.id,
          title: product.title,
          slug: product.slug,
          price: product.price,
          currency: product.currency ?? 'EUR',
          brand: product.brand,
          coverImage: product.coverImage?.url ?? product.images?.[0]?.url ?? null,
        })),
      )
    }

    return visibleCustomSteps.flatMap((step) =>
      (customProductsByStep.get(step.id) ?? []).map((product) => ({
        id: product.id,
        title: product.title ?? '',
        slug: product.slug,
        price: product.price,
        currency: product.currency ?? 'EUR',
        brand:
          product.brand && typeof product.brand === 'object' && 'name' in product.brand
            ? String((product.brand as { name?: unknown }).name ?? '')
            : undefined,
        coverImage: product.coverImage?.url ?? product.images?.[0]?.url ?? null,
      })),
    )
  }, [customProductsByStep, routineMode, visibleCustomSteps, visiblePresetSteps])

  const routineCheckoutTotal = useMemo(
    () =>
      routineCheckoutProducts.reduce(
        (sum, product) => sum + (typeof product.price === 'number' ? product.price : 0),
        0,
      ),
    [routineCheckoutProducts],
  )

  const routineCheckoutLabel = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'it-IT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
      }).format(routineCheckoutTotal),
    [locale, routineCheckoutTotal],
  )

  const renderRoutineProductInfo = (product: {
    title?: string
    format?: string
    price?: number
    currency?: string
  }) => {
    const formattedPrice = formatRoutineProductPrice(locale, product.price, product.currency)
    const hasMeta = Boolean(product.format || formattedPrice)

    return (
      <div className={styles.routineProductContent}>
        <p className={`${styles.routineProductTitle} typo-small`}>{product.title ?? ''}</p>
        {hasMeta ? (
          <div className={styles.routineProductMeta}>
            <span className={`${styles.routineProductFormat} typo-caption`}>
              {product.format || ''}
            </span>
            <span className={`${styles.routineProductPrice} typo-caption`}>
              {formattedPrice || ''}
            </span>
          </div>
        ) : null}
      </div>
    )
  }

  const availableBrands = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>()
    map.set('multibrand', { id: 'multibrand', label: 'Multibrand' })
    for (const template of routineTemplates) {
      if (template.brand && !template.isMultibrand) {
        map.set(template.brand.id, template.brand)
      }
    }
    return Array.from(map.values())
  }, [routineTemplates])

  const getCircleSizeClass = (count: number) => {
    if (count <= 4) return styles.circleSizeLarge
    if (count <= 6) return styles.circleSizeMedium
    return styles.circleSizeSmall
  }

  const goToNeeds = (areaId: string) => {
    setSelectedAreaId(areaId)
    setActiveAreaId(areaId)
    if (leftSwiperRef.current) leftSwiperRef.current.slideTo(1)
    if (rightSwiperRef.current) rightSwiperRef.current.slideTo(1)
  }

  const goToSkinTypes = (timingId: string) => {
    setActiveTimingId(timingId)
    if (leftSwiperRef.current) leftSwiperRef.current.slideTo(2)
    if (rightSwiperRef.current) rightSwiperRef.current.slideTo(2)
  }

  const goBackToTimings = () => {
    if (leftSwiperRef.current) leftSwiperRef.current.slideTo(1)
    if (rightSwiperRef.current) rightSwiperRef.current.slideTo(1)
  }

  const goBackToSkinTypes = () => {
    if (leftSwiperRef.current) leftSwiperRef.current.slideTo(2)
    if (rightSwiperRef.current) rightSwiperRef.current.slideTo(2)
  }

  const goBackToNeeds = () => {
    if (leftSwiperRef.current) leftSwiperRef.current.slideTo(3)
    if (rightSwiperRef.current) rightSwiperRef.current.slideTo(3)
  }

  useEffect(() => {
    if (!activeSkinTypeId && skinTypesForArea.length > 0) {
      setActiveSkinTypeId(skinTypesForArea[0].id)
    }
  }, [activeSkinTypeId, skinTypesForArea])

  useEffect(() => {
    if (!activeNeedId && needsForSelection.length > 0) {
      setActiveNeedId(needsForSelection[0].id)
    }
  }, [activeNeedId, needsForSelection])

  useEffect(() => {
    if (!selectedTemplateId && filteredTemplates.length > 0) {
      setSelectedTemplateId(filteredTemplates[0].id)
    }
  }, [filteredTemplates, selectedTemplateId])

  useEffect(() => {
    setIsRoutineDetailsOpen(false)
  }, [activeNeed?.id, activeSkinType?.id, activeTiming?.id, routineMode, selectedArea?.id, selectedBrandId, selectedTemplateId])

  useEffect(() => {
    if (!activeTiming?.id) return
    const index = routineTimings.findIndex((timing) => timing.id === activeTiming.id)
    if (index >= 0) timingOptionsSwiperRef.current?.slideTo(index, 0)
  }, [activeTiming?.id, routineTimings])

  useEffect(() => {
    if (!activeSkinType?.id) return
    const index = skinTypesForArea.findIndex((skin) => skin.id === activeSkinType.id)
    if (index >= 0) skinTypeOptionsSwiperRef.current?.slideTo(index, 0)
  }, [activeSkinType?.id, skinTypesForArea])

  useEffect(() => {
    if (!activeNeed?.id) return
    const index = needsForSelection.findIndex((need) => need.id === activeNeed.id)
    if (index >= 0) needOptionsSwiperRef.current?.slideTo(index, 0)
  }, [activeNeed?.id, needsForSelection])

  const goBackToAreas = () => {
    if (leftSwiperRef.current) leftSwiperRef.current.slideTo(0)
    if (rightSwiperRef.current) rightSwiperRef.current.slideTo(0)
  }

  const goToNeedsStep = () => {
    if (leftSwiperRef.current) leftSwiperRef.current.slideTo(3)
    if (rightSwiperRef.current) rightSwiperRef.current.slideTo(3)
  }

  const goToRoutinesStep = () => {
    if (leftSwiperRef.current) leftSwiperRef.current.slideTo(4)
    if (rightSwiperRef.current) rightSwiperRef.current.slideTo(4)
  }

  const handleRoutineCheckout = () => {
    if (typeof window === 'undefined' || routineCheckoutProducts.length === 0) return

    const next = routineCheckoutProducts.reduce<CartItem[]>((items, product) => {
      if (!product.id || !product.title) return items
      if (items.some((item) => item.id === product.id)) return items
      items.push({
          id: product.id,
          title: product.title,
          slug: product.slug,
          price: product.price,
          currency: product.currency,
          brand: product.brand,
          coverImage: product.coverImage,
          quantity: 1,
      })
      return items
    }, [])

    writeCart(next)
    emitCartUpdated()
    router.push(`/${locale}/checkout`)
  }

  return (
    <SplitSection
      aria-label="Routine Builder"
      className={styles.splitSection}
      style={{ ['--routine-slide-duration' as string]: '1000ms' }}
      mobileOrder="right-first"
      leftClassName={styles.panel}
      rightClassName={`${styles.panel} ${styles.panelMedia} ${isRoutineDetailsOpen ? styles.panelMediaExpanded : ''}`}
      left={
        <div className={styles.panelContent}>
          <Swiper
            className={styles.leftSwiper}
            slidesPerView={1}
            spaceBetween={0}
            allowTouchMove={false}
            speed={700}
            initialSlide={0}
            onSwiper={(swiper) => {
              leftSwiperRef.current = swiper
            }}
          >
            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <p className={`${styles.heading} typo-h1`}>
                  {routineStep1Title || 'Quando vuoi usare la routine?'}
                </p>
                <p
                  key={`${activeArea?.id}-desc`}
                  className={`${styles.bodyText} typo-body ${styles.slideInRight}`}
                >
                  {routineStep1Description ||
                    activeArea?.description ||
                    'Seleziona il timing ideale per te: mattina, sera o entrambi. Così possiamo personalizzare i passaggi in base al momento della giornata.'}
                </p>
                <div className={`${styles.circleList} ${getCircleSizeClass(orderedAreas.length)}`}>
                  {orderedAreas.map((area) => (
                    <StateCircleButton
                      key={area.id}
                      baseClassName={styles.circleItem}
                      typographyClassName="typo-small"
                      active={area.id === activeAreaId}
                      dimmed={Boolean(activeAreaId && area.id !== activeAreaId)}
                      selected={selectedAreaId === area.id}
                      onClick={() => {
                        setSelectedAreaId(area.id)
                        setActiveAreaId(area.id)
                      }}
                      onMouseEnter={() => setActiveAreaId(area.id)}
                      onMouseLeave={() => setActiveAreaId(selectedAreaId)}
                    >
                      {area.label}
                    </StateCircleButton>
                  ))}
                </div>
                <div className={`${styles.stepActions} ${styles.stepActionsSingle}`}>
                  <button
                    type="button"
                    className={`${styles.nextButton} typo-small-upper`}
                    onClick={() => goToNeeds(selectedAreaId || orderedAreas[0]?.id || '')}
                  >
                    Continua
                  </button>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <p className={`${styles.heading} typo-h1`}>
                  {routineStep2Title || 'Quando vuoi usare la routine?'}
                </p>
                <p key={`${activeTiming?.id}-desc`} className={`${styles.bodyText} typo-body ${styles.slideInRight}`}>
                  {routineStep2Description ||
                    activeTiming?.description ||
                    'Seleziona il timing ideale per te: mattina, sera o entrambi. Così possiamo personalizzare i passaggi in base al momento della giornata.'}
                </p>
                {routineTimings.length > 0 ? (
                  <div className={styles.block}>
                    <div className={styles.optionSliderHeader}>
                      <p className={`${styles.blockLabel} typo-caption-upper`}>Timing</p>
                      <div className={styles.optionSliderNav}>
                        <button
                          type="button"
                          className={styles.optionSliderChevron}
                          aria-label="Timing precedente"
                          onClick={() => timingOptionsSwiperRef.current?.slidePrev()}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          className={styles.optionSliderChevron}
                          aria-label="Timing successivo"
                          onClick={() => timingOptionsSwiperRef.current?.slideNext()}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                    <Swiper
                      className={styles.optionSlider}
                      slidesPerView="auto"
                      spaceBetween={12}
                      onSlideChange={(swiper) => {
                        const timing = routineTimings[swiper.activeIndex]
                        if (timing) setActiveTimingId(timing.id)
                      }}
                      onSwiper={(swiper) => {
                        timingOptionsSwiperRef.current = swiper
                      }}
                    >
                      {routineTimings.map((timing, index) => {
                        const isActive = timing.id === activeTimingId

                        return (
                          <SwiperSlide key={timing.id} className={styles.optionSlide}>
                            <button
                              type="button"
                              className={`${styles.optionCard} ${isActive ? styles.optionCardActive : ''}`}
                              onClick={() => timingOptionsSwiperRef.current?.slideTo(index)}
                              onMouseEnter={() => setActiveTimingId(timing.id)}
                              onFocus={() => setActiveTimingId(timing.id)}
                            >
                              <p className={`${styles.optionCardLabel} typo-body`}>{timing.label}</p>
                              {timing.description ? (
                                <p className={`${styles.optionCardBody} typo-body`}>{timing.description}</p>
                              ) : null}
                            </button>
                          </SwiperSlide>
                        )
                      })}
                    </Swiper>
                  </div>
                ) : (
                  <div className={styles.mediaPlaceholder} />
                )}
                <div className={styles.stepActions}>
                  <button type="button" className={`${styles.backButton} typo-small-upper`} onClick={goBackToAreas}>
                    Torna indietro
                  </button>
                  <button
                    type="button"
                    className={`${styles.nextButton} typo-small-upper`}
                    onClick={() => {
                      const activeTiming =
                        routineTimings[timingOptionsSwiperRef.current?.activeIndex ?? 0] ?? routineTimings[0]
                      goToSkinTypes(activeTiming?.id || '')
                    }}
                  >
                    Prosegui
                  </button>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <p className={`${styles.heading} typo-h1`}>Che tipo di pelle hai?</p>
                <p key={`${activeSkinType?.id}-desc`} className={`${styles.bodyText} typo-body ${styles.slideInRight}`}>
                  {activeSkinType?.description ||
                    'Seleziona il tipo di pelle per personalizzare ulteriormente la routine.'}
                </p>
                {skinTypesForArea.length > 0 ? (
                  <div className={styles.block}>
                    <div className={styles.optionSliderHeader}>
                      <p className={`${styles.blockLabel} typo-caption-upper`}>Tipo di pelle</p>
                      <div className={styles.optionSliderNav}>
                        <button
                          type="button"
                          className={styles.optionSliderChevron}
                          aria-label="Tipo di pelle precedente"
                          onClick={() => skinTypeOptionsSwiperRef.current?.slidePrev()}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          className={styles.optionSliderChevron}
                          aria-label="Tipo di pelle successivo"
                          onClick={() => skinTypeOptionsSwiperRef.current?.slideNext()}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                    <Swiper
                      className={styles.optionSlider}
                      slidesPerView="auto"
                      spaceBetween={12}
                      onSlideChange={(swiper) => {
                        const skin = skinTypesForArea[swiper.activeIndex]
                        if (skin) setActiveSkinTypeId(skin.id)
                      }}
                      onSwiper={(swiper) => {
                        skinTypeOptionsSwiperRef.current = swiper
                      }}
                    >
                      {skinTypesForArea.map((skin, index) => {
                        const isActive = skin.id === activeSkinType?.id

                        return (
                          <SwiperSlide key={skin.id} className={styles.optionSlide}>
                            <button
                              type="button"
                              className={`${styles.optionCard} ${isActive ? styles.optionCardActive : ''}`}
                              onClick={() => skinTypeOptionsSwiperRef.current?.slideTo(index)}
                              onMouseEnter={() => setActiveSkinTypeId(skin.id)}
                              onFocus={() => setActiveSkinTypeId(skin.id)}
                            >
                              <p className={`${styles.optionCardLabel} typo-body`}>{skin.label}</p>
                              {skin.description ? (
                                <p className={`${styles.optionCardBody} typo-body`}>{skin.description}</p>
                              ) : null}
                            </button>
                          </SwiperSlide>
                        )
                      })}
                    </Swiper>
                  </div>
                ) : (
                  <div className={styles.mediaPlaceholder} />
                )}
                <div className={styles.stepActions}>
                  <button type="button" className={`${styles.backButton} typo-small-upper`} onClick={goBackToTimings}>
                    Torna indietro
                  </button>
                  <button
                    type="button"
                    className={`${styles.nextButton} typo-small-upper`}
                    disabled={!activeSkinType}
                    onClick={goToNeedsStep}
                  >
                    Prosegui
                  </button>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <p className={`${styles.heading} typo-h1`}>Quali esigenze vuoi trattare?</p>
                <p key={`${activeNeed?.id}-desc`} className={`${styles.bodyText} typo-body ${styles.slideInRight}`}>
                  {activeNeed?.description ||
                    'Seleziona le esigenze principali per completare la routine.'}
                </p>
                {needsForSelection.length > 0 ? (
                  <div className={styles.block}>
                    <div className={styles.optionSliderHeader}>
                      <p className={`${styles.blockLabel} typo-caption-upper`}>Esigenza</p>
                      <div className={styles.optionSliderNav}>
                        <button
                          type="button"
                          className={styles.optionSliderChevron}
                          aria-label="Esigenza precedente"
                          onClick={() => needOptionsSwiperRef.current?.slidePrev()}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          className={styles.optionSliderChevron}
                          aria-label="Esigenza successiva"
                          onClick={() => needOptionsSwiperRef.current?.slideNext()}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                    <Swiper
                      className={styles.optionSlider}
                      slidesPerView="auto"
                      spaceBetween={12}
                      onSlideChange={(swiper) => {
                        const need = needsForSelection[swiper.activeIndex]
                        if (need) setActiveNeedId(need.id)
                      }}
                      onSwiper={(swiper) => {
                        needOptionsSwiperRef.current = swiper
                      }}
                    >
                      {needsForSelection.map((need, index) => {
                        const isActive = need.id === activeNeed?.id

                        return (
                          <SwiperSlide key={need.id} className={styles.optionSlide}>
                            <button
                              type="button"
                              className={`${styles.optionCard} ${isActive ? styles.optionCardActive : ''}`}
                              onClick={() => needOptionsSwiperRef.current?.slideTo(index)}
                              onMouseEnter={() => setActiveNeedId(need.id)}
                              onFocus={() => setActiveNeedId(need.id)}
                            >
                              <p className={`${styles.optionCardLabel} typo-body`}>{need.label}</p>
                              {need.description ? (
                                <p className={`${styles.optionCardBody} typo-body`}>{need.description}</p>
                              ) : null}
                            </button>
                          </SwiperSlide>
                        )
                      })}
                    </Swiper>
                  </div>
                ) : (
                  <div className={styles.mediaPlaceholder} />
                )}
                <div className={styles.stepActions}>
                  <button type="button" className={`${styles.backButton} typo-small-upper`} onClick={goBackToSkinTypes}>
                    Torna indietro
                  </button>
                  <button
                    type="button"
                    className={`${styles.nextButton} typo-small-upper`}
                    disabled={!activeNeed}
                    onClick={() => {
                      const need = needsForSelection[needOptionsSwiperRef.current?.activeIndex ?? 0] ?? needsForSelection[0]
                      if (need) setActiveNeedId(need.id)
                      goToRoutinesStep()
                    }}
                  >
                    Prosegui
                  </button>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <p className={`${styles.heading} typo-h1`}>Routine consigliate</p>
                <p className={`${styles.bodyText} typo-body`}>
                  Scegli se partire da una routine prestabilita o creare una routine personalizzata.
                </p>
                <div className={styles.choiceGroup}>
                  <button
                    type="button"
                    className={`${styles.choicePill} typo-small-upper ${routineMode === 'preset' ? styles.choicePillActive : ''}`}
                    onClick={() => setRoutineMode('preset')}
                  >
                    Routine prestabilita
                  </button>
                  <button
                    type="button"
                    className={`${styles.choicePill} typo-small-upper ${routineMode === 'custom' ? styles.choicePillActive : ''}`}
                    onClick={() => setRoutineMode('custom')}
                  >
                    Routine personalizzata
                  </button>
                </div>
                <div className={styles.choiceGroup}>
                  {availableBrands.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      className={`${styles.choicePill} typo-small-upper ${selectedBrandId === brand.id ? styles.choicePillActive : ''}`}
                      onClick={() => setSelectedBrandId(brand.id)}
                    >
                      {brand.label}
                    </button>
                  ))}
                </div>
                <div className={styles.routineList}>
                  {routineMode === 'preset' ? (
                    filteredTemplates.length > 0 ? (
                      filteredTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          className={`${styles.routineCard} ${
                            selectedTemplate?.id === template.id ? styles.routineCardActive : ''
                          }`}
                          onClick={() => setSelectedTemplateId(template.id)}
                        >
                          <p className={`${styles.routineCardTitle} typo-body`}>{template.name}</p>
                          {template.description ? (
                            <p className={`${styles.routineCardDescription} typo-small`}>{template.description}</p>
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <p className={`${styles.bodyText} typo-body`}>Nessuna routine disponibile per i filtri selezionati.</p>
                    )
                  ) : (
                    <p className={`${styles.bodyText} typo-body`}>
                      Modalità personalizzata: ti guideremo passo per passo nella selezione dei prodotti.
                    </p>
                  )}
                </div>
                <div className={styles.stepActions}>
                  <button type="button" className={`${styles.backButton} typo-small-upper`} onClick={goBackToNeeds}>
                    Torna indietro
                  </button>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      }
      right={
        <div className={`${styles.panelContentMedia} ${isRoutineDetailsOpen ? styles.panelContentMediaExpanded : ''}`}>
          <Swiper
            className={`${styles.mediaSwiper} ${isRoutineDetailsOpen ? styles.mediaSwiperExpanded : ''}`}
            slidesPerView={1}
            spaceBetween={0}
            allowTouchMove={false}
            speed={1000}
            initialSlide={0}
            onSwiper={(swiper) => {
              rightSwiperRef.current = swiper
            }}
          >
            <SwiperSlide className={styles.mediaSlide}>
              {activeArea?.media?.url ? (
                <Image
                  key={`${activeArea.id}-media`}
                  className={`${styles.areaMedia} ${styles.slideInRight}`}
                  src={activeArea.media.url}
                  alt={activeArea.media.alt || activeArea.label}
                  width={1600}
                  height={1200}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              ) : (
                <div className={styles.mediaPlaceholder} />
              )}
            </SwiperSlide>
            <SwiperSlide className={styles.mediaSlide}>
              {timingMedia?.media?.url ? (
                <Image
                  key={`${timingMedia.id}-media`}
                  className={`${styles.areaMedia} ${styles.slideInRight}`}
                  src={timingMedia.media.url}
                  alt={timingMedia.media.alt || timingMedia.label}
                  width={1600}
                  height={1200}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              ) : (
                <div className={styles.mediaPlaceholder} />
              )}
            </SwiperSlide>
            <SwiperSlide className={styles.mediaSlide}>
              {skinTypeMedia?.media?.url ? (
                <Image
                  key={`${skinTypeMedia.id}-media`}
                  className={`${styles.areaMedia} ${styles.slideInRight}`}
                  src={skinTypeMedia.media.url}
                  alt={skinTypeMedia.media.alt || skinTypeMedia.label}
                  width={1600}
                  height={1200}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              ) : (
                <div className={styles.mediaPlaceholder} />
              )}
            </SwiperSlide>
            <SwiperSlide className={styles.mediaSlide}>
              {needMedia?.media?.url ? (
                <Image
                  key={`${needMedia.id}-media`}
                  className={`${styles.areaMedia} ${styles.slideInRight}`}
                  src={needMedia.media.url}
                  alt={needMedia.media.alt || needMedia.label}
                  width={1600}
                  height={1200}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              ) : (
                <div className={styles.mediaPlaceholder} />
              )}
            </SwiperSlide>
            <SwiperSlide className={styles.mediaSlide}>
              <div className={styles.routineMediaPanel}>
                <div className={styles.routineBreadcrumb}>
                  <div className={styles.routineBreadcrumbRow}>
                    {selectedArea?.label ? (
                      <span className={`${styles.routineBreadcrumbNode} typo-small-upper`}>
                        <span className={`${styles.routineBreadcrumbStep} typo-caption-upper`}>Area</span>
                        {selectedArea.label}
                      </span>
                    ) : null}
                    {activeTiming?.label ? (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={`${styles.routineBreadcrumbNode} typo-small-upper`}>
                          <span className={`${styles.routineBreadcrumbStep} typo-caption-upper`}>Timing</span>
                          {activeTiming.label}
                        </span>
                      </>
                    ) : null}
                    {activeSkinType?.label ? (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={`${styles.routineBreadcrumbNode} typo-small-upper`}>
                          <span className={`${styles.routineBreadcrumbStep} typo-caption-upper`}>Tipo di pelle</span>
                          {activeSkinType.label}
                        </span>
                      </>
                    ) : null}
                    {activeNeed?.label ? (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={`${styles.routineBreadcrumbNode} typo-small-upper`}>
                          <span className={`${styles.routineBreadcrumbStep} typo-caption-upper`}>Esigenza</span>
                          {activeNeed?.label || 'Esigenza'}
                        </span>
                      </>
                    ) : null}
                    {routineMode === 'preset' ? (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={`${styles.routineBreadcrumbNode} typo-small-upper`}>
                          <span className={`${styles.routineBreadcrumbStep} typo-caption-upper`}>Routine</span>
                          Prestabilita
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={`${styles.routineBreadcrumbNode} typo-small-upper`}>
                          <span className={`${styles.routineBreadcrumbStep} typo-caption-upper`}>Routine</span>
                          Personalizzata
                        </span>
                      </>
                    )}
                    {selectedBrandId && selectedBrandId !== 'multibrand' ? (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={`${styles.routineBreadcrumbNode} typo-small-upper`}>
                          <span className={`${styles.routineBreadcrumbStep} typo-caption-upper`}>Brand</span>
                          {availableBrands.find((brand) => brand.id === selectedBrandId)?.label || 'Brand'}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.routineAccordionTrigger}
                  aria-expanded={isRoutineDetailsOpen}
                  aria-controls="routine-media-list"
                  onClick={() => setIsRoutineDetailsOpen((open) => !open)}
                >
                  <span className={`${styles.routineAccordionLabel} typo-small-upper`}>Scopri la tua routine</span>
                  <span className={`${styles.routineAccordionIcon} typo-small-upper`}>
                    {isRoutineDetailsOpen ? 'Chiudi' : 'Apri'}
                  </span>
                </button>
                <div
                  id="routine-media-list"
                  className={styles.routineMediaList}
                  hidden={!isRoutineDetailsOpen}
                >
                  {routineMode === 'preset' && selectedTemplate ? (
                    visiblePresetSteps.length > 0 ? (
                      visiblePresetSteps.map((step) => (
                        <div key={step.id} className={styles.routineStepGroup}>
                          <p className={`${styles.routineStepTitle} typo-small-upper`}>
                            {step.label}
                            {step.slug === 'esfoliante' && step.required === false ? ' (facoltativo)' : ''}
                          </p>
                          <div className={styles.routineStepBlock}>
                            <div className={styles.routineThumbs}>
                              {step.products.slice(0, 1).map((product) => {
                                const media = product.coverImage ?? product.images?.[0]
                                return (
                                  <div key={product.id} className={styles.routineProductRow}>
                                    <MediaThumb
                                      src={normalizeThumbnailSrc(media?.url)}
                                      alt={media?.alt || product.title}
                                      sizes="48px"
                                      className={styles.routineThumb}
                                      imageClassName={styles.routineThumbImage}
                                      fallback={<div className={styles.routineThumbFallback} />}
                                      unoptimized={isRemoteThumbnailSrc(media?.url)}
                                    />
                                    {renderRoutineProductInfo(product)}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`${styles.bodyText} typo-body`}>
                        Nessun prodotto assegnato agli step di questa routine.
                      </p>
                    )
                  ) : routineMode === 'custom' ? (
                    visibleCustomSteps.length > 0 ? (
                      visibleCustomSteps.map((step) => (
                        <div key={step.id} className={styles.routineStepGroup}>
                          <p className={`${styles.routineStepTitle} typo-small-upper`}>
                            {step.label}
                            {step.required ? '' : ' (facoltativo)'}
                            {step.warn ? ' · attenzione' : ''}
                          </p>
                          <div className={styles.routineStepBlock}>
                            <div className={styles.routineThumbs}>
                              {customProductsByStep.get(step.id)?.map((product) => {
                                const media = product.coverImage ?? product.images?.[0]
                                return (
                                  <div key={product.id} className={styles.routineProductRow}>
                                    <MediaThumb
                                      src={normalizeThumbnailSrc(media?.url)}
                                      alt={media?.alt || product.title || ''}
                                      sizes="48px"
                                      className={styles.routineThumb}
                                      imageClassName={styles.routineThumbImage}
                                      fallback={<div className={styles.routineThumbFallback} />}
                                      unoptimized={isRemoteThumbnailSrc(media?.url)}
                                    />
                                    {renderRoutineProductInfo(product)}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`${styles.bodyText} typo-body`}>
                        Nessuno step disponibile per questa combinazione.
                      </p>
                    )
                  ) : (
                    <p className={`${styles.bodyText} typo-body`}>
                      Seleziona una routine prestabilita per vedere i passaggi e i prodotti consigliati.
                    </p>
                  )}
                  {routineCheckoutProducts.length > 0 ? (
                    <div className={styles.routineCheckoutCta}>
                      <Button
                        type="button"
                        kind="main"
                        size="md"
                        interactive
                        className={styles.routineCheckoutButton}
                        onClick={handleRoutineCheckout}
                      >
                        {`Acquista routine · ${routineCheckoutLabel}`}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      }
    />
  )
}
