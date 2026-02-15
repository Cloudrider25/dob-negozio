'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperInstance } from 'swiper/types'
import 'swiper/css'
import styles from './RoutineBuilderSplitSection.module.css'

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

export function RoutineBuilderSplitSection({
  productAreas,
  routineTimings,
  routineSkinTypes,
  routineNeeds,
  routineTemplates,
  routineSteps,
  routineStepRules,
  routineStep1Title,
  routineStep2Title,
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
  routineStep2Title?: string | null
  shopAllProducts: FilterProduct[]
}) {
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
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null)
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<Set<string>>(new Set())
  const [selectedBrandId, setSelectedBrandId] = useState<string>('multibrand')
  const [routineMode, setRoutineMode] = useState<'preset' | 'custom'>('preset')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const leftSwiperRef = useRef<SwiperInstance | null>(null)
  const rightSwiperRef = useRef<SwiperInstance | null>(null)
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
    if (!selectedArea?.id || !activeTiming?.id || selectedSkinTypes.size === 0) return []
    const ids = new Set<string>()
    for (const product of shopAllProducts) {
      const matchesArea = product.productAreas.some((area) => area.id === selectedArea.id)
      if (!matchesArea) continue
      const matchesTiming = product.timingProducts.some((timing) => timing.id === activeTiming.id)
      if (!matchesTiming) continue
      const matchesSkin = product.skinTypes.some((skin) => selectedSkinTypes.has(skin.id))
      if (!matchesSkin) continue
      for (const need of product.needs) ids.add(need.id)
    }
    return Array.from(ids)
  }, [activeTiming?.id, selectedArea?.id, selectedSkinTypes, shopAllProducts])

  const needsForSelection = useMemo(() => {
    const map = new Map(routineNeeds.map((need) => [need.id, need]))
    return filteredNeedIds
      .map((id) => map.get(id))
      .filter((need): need is NeedItem => Boolean(need))
  }, [filteredNeedIds, routineNeeds])

  const activeNeed = needsForSelection.find((need) => need.id === activeNeedId) ?? needsForSelection[0]
  const needMedia = needsForSelection.find((need) => need.id === activeNeed?.id && need.media?.url)

  const filteredTemplates = useMemo(() => {
    if (!selectedArea?.id || !activeTiming?.id || !selectedNeedId) return []
    return routineTemplates.filter((template) => {
      if (template.productArea?.id && template.productArea.id !== selectedArea.id) return false
      if (template.timing.id !== activeTiming.id) return false
      if (template.need.id !== selectedNeedId) return false
      if (selectedBrandId === 'multibrand') return template.isMultibrand
      return template.brand?.id === selectedBrandId
    })
  }, [activeTiming?.id, routineTemplates, selectedArea?.id, selectedBrandId, selectedNeedId])

  const selectedTemplate =
    filteredTemplates.find((template) => template.id === selectedTemplateId) ?? filteredTemplates[0]

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
    if (selectedSkinTypes.size > 0) {
      for (const rule of routineStepRules) {
        if (!rule.skinTypeId) continue
        if (!selectedSkinTypes.has(rule.skinTypeId)) continue
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
  }, [activeTiming?.id, routineStepRules, routineSteps, selectedArea?.id, selectedSkinTypes])

  const customProductsByStep = useMemo(() => {
    if (!selectedArea?.id || !activeTiming?.id || !selectedNeedId) return new Map<string, FilterProduct[]>()
    const base = shopAllProducts.filter((product) => {
      const matchesArea = product.productAreas.some((area) => area.id === selectedArea.id)
      if (!matchesArea) return false
      const matchesTiming = product.timingProducts.some((timing) => timing.id === activeTiming.id)
      if (!matchesTiming) return false
      const matchesSkin = product.skinTypes.some((skin) => selectedSkinTypes.has(skin.id))
      if (!matchesSkin) return false
      const matchesNeed = product.needs.some((need) => need.id === selectedNeedId)
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
  }, [activeTiming?.id, customSteps, selectedArea?.id, selectedNeedId, selectedSkinTypes, shopAllProducts])

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
      setSelectedNeedId(needsForSelection[0].id)
    }
  }, [activeNeedId, needsForSelection])

  useEffect(() => {
    if (!selectedTemplateId && filteredTemplates.length > 0) {
      setSelectedTemplateId(filteredTemplates[0].id)
    }
  }, [filteredTemplates, selectedTemplateId])

  useEffect(() => {
    if (selectedSkinTypes.size === 0 && skinTypesForArea.length > 0) {
      setSelectedSkinTypes(new Set())
    }
  }, [selectedSkinTypes.size, skinTypesForArea.length])

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

  return (
    <section
      className={styles.section}
      style={{ ['--routine-slide-duration' as string]: '1000ms' }}
    >
      <div className={styles.panel}>
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
                <p className={styles.heading}>
                  {routineStep1Title || 'Quando vuoi usare la routine?'}
                </p>
                <p
                  key={`${activeArea?.id}-desc`}
                  className={`${styles.bodyText} ${styles.slideInRight}`}
                >
                  {activeArea?.description ||
                    'Seleziona il timing ideale per te: mattina, sera o entrambi. Così possiamo personalizzare i passaggi in base al momento della giornata.'}
                </p>
                <div className={`${styles.circleList} ${getCircleSizeClass(orderedAreas.length)}`}>
                  {orderedAreas.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      className={`${styles.circleItem} ${
                        area.id === activeAreaId ? styles.circleItemActive : ''
                      } ${activeAreaId && area.id !== activeAreaId ? styles.circleItemDim : ''}`}
                      onClick={() => goToNeeds(area.id)}
                      onMouseEnter={() => setActiveAreaId(area.id)}
                      onMouseLeave={() => setActiveAreaId(selectedAreaId)}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <p className={styles.heading}>
                  {routineStep2Title || 'Quando vuoi usare la routine?'}
                </p>
                <p key={`${activeTiming?.id}-desc`} className={`${styles.bodyText} ${styles.slideInRight}`}>
                  {activeTiming?.description ||
                    'Seleziona il timing ideale per te: mattina, sera o entrambi. Così possiamo personalizzare i passaggi in base al momento della giornata.'}
                </p>
                <div className={`${styles.circleList} ${getCircleSizeClass(routineTimings.length)}`}>
                  {routineTimings.length > 0 ? (
                    routineTimings.map((timing) => (
                      <button
                        key={timing.id}
                        type="button"
                        className={`${styles.circleItem} ${
                          timing.id === activeTimingId ? styles.circleItemActive : ''
                        } ${activeTimingId && timing.id !== activeTimingId ? styles.circleItemDim : ''}`}
                        onMouseEnter={() => setActiveTimingId(timing.id)}
                        onFocus={() => setActiveTimingId(timing.id)}
                        onClick={() => goToSkinTypes(timing.id)}
                      >
                        {timing.label}
                      </button>
                    ))
                  ) : (
                    <div className={styles.mediaPlaceholder} />
                  )}
                </div>
                <div className={styles.stepActions}>
                  <button type="button" className={styles.backButton} onClick={goBackToAreas}>
                    Torna indietro
                  </button>
                  <button
                    type="button"
                    className={styles.nextButton}
                    onClick={() => goToSkinTypes(activeTimingId || routineTimings[0]?.id || '')}
                  >
                    Prosegui
                  </button>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <p className={styles.heading}>Che tipo di pelle hai?</p>
                <p key={`${activeSkinType?.id}-desc`} className={`${styles.bodyText} ${styles.slideInRight}`}>
                  {activeSkinType?.description ||
                    'Seleziona il tipo di pelle per personalizzare ulteriormente la routine.'}
                </p>
                <div className={`${styles.circleList} ${getCircleSizeClass(skinTypesForArea.length)}`}>
                  {skinTypesForArea.length > 0 ? (
                    skinTypesForArea.map((skin) => (
                      <button
                        key={skin.id}
                        type="button"
                        className={`${styles.circleItem} ${
                          skin.id === activeSkinType?.id ? styles.circleItemActive : ''
                        } ${activeSkinType?.id && skin.id !== activeSkinType?.id ? styles.circleItemDim : ''} ${
                          selectedSkinTypes.has(skin.id) ? styles.circleItemSelected : ''
                        }`}
                        onMouseEnter={() => setActiveSkinTypeId(skin.id)}
                        onFocus={() => setActiveSkinTypeId(skin.id)}
                        onClick={() => {
                          setActiveSkinTypeId(skin.id)
                          setSelectedSkinTypes((prev) => {
                            const next = new Set(prev)
                            if (next.has(skin.id)) {
                              next.delete(skin.id)
                            } else {
                              next.add(skin.id)
                            }
                            return next
                          })
                        }}
                      >
                        {skin.label}
                      </button>
                    ))
                  ) : (
                    <div className={styles.mediaPlaceholder} />
                  )}
                </div>
                <div className={styles.stepActions}>
                  <button type="button" className={styles.backButton} onClick={goBackToTimings}>
                    Torna indietro
                  </button>
                  <button
                    type="button"
                    className={styles.nextButton}
                    disabled={selectedSkinTypes.size === 0}
                    onClick={goToNeedsStep}
                  >
                    Prosegui
                  </button>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <p className={styles.heading}>Quali esigenze vuoi trattare?</p>
                <p key={`${activeNeed?.id}-desc`} className={`${styles.bodyText} ${styles.slideInRight}`}>
                  {activeNeed?.description ||
                    'Seleziona le esigenze principali per completare la routine.'}
                </p>
                <div className={`${styles.circleList} ${getCircleSizeClass(needsForSelection.length)}`}>
                  {needsForSelection.length > 0 ? (
                    needsForSelection.map((need) => (
                      <button
                        key={need.id}
                        type="button"
                        className={`${styles.circleItem} ${
                          need.id === activeNeed?.id ? styles.circleItemActive : ''
                        } ${activeNeed?.id && need.id !== activeNeed?.id ? styles.circleItemDim : ''} ${
                          selectedNeedId === need.id ? styles.circleItemSelected : ''
                        }`}
                        onMouseEnter={() => setActiveNeedId(need.id)}
                        onFocus={() => setActiveNeedId(need.id)}
                        onClick={() => {
                          setActiveNeedId(need.id)
                          setSelectedNeedId(need.id)
                        }}
                      >
                        {need.label}
                      </button>
                    ))
                  ) : (
                    <div className={styles.mediaPlaceholder} />
                  )}
                </div>
                <div className={styles.stepActions}>
                  <button type="button" className={styles.backButton} onClick={goBackToSkinTypes}>
                    Torna indietro
                  </button>
                  <button
                    type="button"
                    className={styles.nextButton}
                    disabled={!selectedNeedId}
                    onClick={goToRoutinesStep}
                  >
                    Prosegui
                  </button>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <p className={styles.heading}>Routine consigliate</p>
                <p className={styles.bodyText}>
                  Scegli se partire da una routine prestabilita o creare una routine personalizzata.
                </p>
                <div className={styles.choiceGroup}>
                  <button
                    type="button"
                    className={`${styles.choicePill} ${routineMode === 'preset' ? styles.choicePillActive : ''}`}
                    onClick={() => setRoutineMode('preset')}
                  >
                    Routine prestabilita
                  </button>
                  <button
                    type="button"
                    className={`${styles.choicePill} ${routineMode === 'custom' ? styles.choicePillActive : ''}`}
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
                      className={`${styles.choicePill} ${selectedBrandId === brand.id ? styles.choicePillActive : ''}`}
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
                          <p className={styles.routineCardTitle}>{template.name}</p>
                          {template.description ? (
                            <p className={styles.routineCardDescription}>{template.description}</p>
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <p className={styles.bodyText}>Nessuna routine disponibile per i filtri selezionati.</p>
                    )
                  ) : (
                    <p className={styles.bodyText}>
                      Modalità personalizzata: ti guideremo passo per passo nella selezione dei prodotti.
                    </p>
                  )}
                </div>
                <div className={styles.stepActions}>
                  <button type="button" className={styles.backButton} onClick={goBackToNeeds}>
                    Torna indietro
                  </button>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
      <div className={`${styles.panel} ${styles.panelMedia}`}>
        <div className={styles.panelContentMedia}>
          <Swiper
            className={styles.mediaSwiper}
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
                <img
                  key={`${activeArea.id}-media`}
                  className={`${styles.areaMedia} ${styles.slideInRight}`}
                  src={activeArea.media.url}
                  alt={activeArea.media.alt || activeArea.label}
                  loading="lazy"
                />
              ) : (
                <div className={styles.mediaPlaceholder} />
              )}
            </SwiperSlide>
            <SwiperSlide className={styles.mediaSlide}>
              {timingMedia?.media?.url ? (
                <img
                  key={`${timingMedia.id}-media`}
                  className={`${styles.areaMedia} ${styles.slideInRight}`}
                  src={timingMedia.media.url}
                  alt={timingMedia.media.alt || timingMedia.label}
                  loading="lazy"
                />
              ) : (
                <div className={styles.mediaPlaceholder} />
              )}
            </SwiperSlide>
            <SwiperSlide className={styles.mediaSlide}>
              {skinTypeMedia?.media?.url ? (
                <img
                  key={`${skinTypeMedia.id}-media`}
                  className={`${styles.areaMedia} ${styles.slideInRight}`}
                  src={skinTypeMedia.media.url}
                  alt={skinTypeMedia.media.alt || skinTypeMedia.label}
                  loading="lazy"
                />
              ) : (
                <div className={styles.mediaPlaceholder} />
              )}
            </SwiperSlide>
            <SwiperSlide className={styles.mediaSlide}>
              {needMedia?.media?.url ? (
                <img
                  key={`${needMedia.id}-media`}
                  className={`${styles.areaMedia} ${styles.slideInRight}`}
                  src={needMedia.media.url}
                  alt={needMedia.media.alt || needMedia.label}
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
                      <span className={styles.routineBreadcrumbNode}>
                        <span className={styles.routineBreadcrumbStep}>Area</span>
                        {selectedArea.label}
                      </span>
                    ) : null}
                    {activeTiming?.label ? (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={styles.routineBreadcrumbNode}>
                          <span className={styles.routineBreadcrumbStep}>Timing</span>
                          {activeTiming.label}
                        </span>
                      </>
                    ) : null}
                    {selectedSkinTypes.size > 0 ? (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={styles.routineBreadcrumbNode}>
                          <span className={styles.routineBreadcrumbStep}>Tipo di pelle</span>
                          {skinTypesForArea
                            .filter((skin) => selectedSkinTypes.has(skin.id))
                            .map((skin) => skin.label)
                            .join(' · ')}
                        </span>
                      </>
                    ) : null}
                    {selectedNeedId ? (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={styles.routineBreadcrumbNode}>
                          <span className={styles.routineBreadcrumbStep}>Esigenza</span>
                          {activeNeed?.label || 'Esigenza'}
                        </span>
                      </>
                    ) : null}
                    {routineMode === 'preset' ? (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={styles.routineBreadcrumbNode}>
                          <span className={styles.routineBreadcrumbStep}>Routine</span>
                          Prestabilita
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={styles.routineBreadcrumbNode}>
                          <span className={styles.routineBreadcrumbStep}>Routine</span>
                          Personalizzata
                        </span>
                      </>
                    )}
                    {selectedBrandId && selectedBrandId !== 'multibrand' ? (
                      <>
                        <span className={styles.routineBreadcrumbSeparator} />
                        <span className={styles.routineBreadcrumbNode}>
                          <span className={styles.routineBreadcrumbStep}>Brand</span>
                          {availableBrands.find((brand) => brand.id === selectedBrandId)?.label || 'Brand'}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className={styles.routineMediaList}>
                  {routineMode === 'preset' && selectedTemplate ? (
                    presetSteps.map((step) => (
                      <div key={step.id} className={styles.routineStepGroup}>
                        <p className={styles.routineStepTitle}>
                          {step.label}
                          {step.slug === 'esfoliante' && step.required === false ? ' (facoltativo)' : ''}
                        </p>
                        <div className={styles.routineStepBlock}>
                          {step.products.length > 0 ? (
                            <div className={styles.routineThumbs}>
                              {step.products.slice(0, 1).map((product) => {
                                const media = product.coverImage ?? product.images?.[0]
                                return (
                                  <div key={product.id} className={styles.routineProductRow}>
                                    <div className={styles.routineThumb}>
                                      {media?.url ? (
                                        <img
                                          src={media.url}
                                          alt={media.alt || product.title}
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className={styles.routineThumbFallback} />
                                      )}
                                    </div>
                                    <p className={styles.routineProductTitle}>{product.title}</p>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className={styles.bodyText}>Nessun prodotto assegnato per questo step.</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : routineMode === 'custom' ? (
                    customSteps.length > 0 ? (
                      customSteps.map((step) => (
                        <div key={step.id} className={styles.routineStepGroup}>
                          <p className={styles.routineStepTitle}>
                            {step.label}
                            {step.required ? '' : ' (facoltativo)'}
                            {step.warn ? ' · attenzione' : ''}
                          </p>
                          <div className={styles.routineStepBlock}>
                            {customProductsByStep.get(step.id)?.length ? (
                              <div className={styles.routineThumbs}>
                                {customProductsByStep.get(step.id)?.map((product) => {
                                  const media = product.coverImage ?? product.images?.[0]
                                  return (
                                    <div key={product.id} className={styles.routineProductRow}>
                                      <div className={styles.routineThumb}>
                                        {media?.url ? (
                                          <img
                                            src={media.url}
                                            alt={media.alt || product.title || ''}
                                            loading="lazy"
                                          />
                                        ) : (
                                          <div className={styles.routineThumbFallback} />
                                        )}
                                      </div>
                                      <p className={styles.routineProductTitle}>{product.title ?? ''}</p>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <p className={styles.bodyText}>
                                Nessun prodotto disponibile per questo step.
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles.bodyText}>
                        Nessuno step disponibile per questa combinazione.
                      </p>
                    )
                  ) : (
                    <p className={styles.bodyText}>
                      Seleziona una routine prestabilita per vedere i passaggi e i prodotti consigliati.
                    </p>
                  )}
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </section>
  )
}
