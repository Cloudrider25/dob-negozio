'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import type { NavigatorData } from '@/components/services/navigator-data-context'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { Button } from '@/components/ui/button'
import { StateCircleButton } from '@/components/ui/StateCircleButton'
import { SplitSection } from '@/components/ui/SplitSection'
import { Swiper, SwiperSlide, type UISwiperInstance } from '@/components/ui/swiper'
import styles from './ServiceBuilderSplitSection.module.css'

type ServiceBuilderSplitSectionProps = {
  data: NavigatorData
}

const formatPrice = (price?: number) => {
  if (typeof price !== 'number') return null
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price)
}

export function ServiceBuilderSplitSection({ data }: ServiceBuilderSplitSectionProps) {
  const orderedAreas = useMemo(() => {
    const list = [...data.areas]
    list.sort((a, b) => {
      const aIsViso = a.label.toLowerCase() === 'viso' ? 0 : 1
      const bIsViso = b.label.toLowerCase() === 'viso' ? 0 : 1
      if (aIsViso !== bIsViso) return aIsViso - bIsViso
      return a.label.localeCompare(b.label)
    })
    return list
  }, [data.areas])

  const defaultAreaId = orderedAreas[0]?.id ?? null
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(defaultAreaId)
  const [activeAreaId, setActiveAreaId] = useState<string | null>(defaultAreaId)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null)
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null)

  const leftSwiperRef = useRef<UISwiperInstance | null>(null)
  const rightSwiperRef = useRef<UISwiperInstance | null>(null)

  const selectedArea =
    orderedAreas.find((area) => area.id === selectedAreaId) ?? orderedAreas[0] ?? null
  const activeArea =
    orderedAreas.find((area) => area.id === activeAreaId) ?? selectedArea ?? null

  const goalsForArea = useMemo(() => {
    if (!selectedArea?.id) return []
    return data.goals.filter((goal) => goal.areaId === selectedArea.id)
  }, [data.goals, selectedArea?.id])

  const selectedGoal =
    goalsForArea.find((goal) => goal.id === selectedGoalId) ?? goalsForArea[0] ?? null

  const treatmentsForSelection = useMemo(() => {
    if (!selectedArea?.id) return []
    const goalIdsForArea = new Set(goalsForArea.map((goal) => goal.id))
    if (goalsForArea.length > 0) {
      return data.treatments.filter((treatment) => {
        const refs = treatment.referenceIds || []
        const matchesAreaContext =
          refs.includes(selectedArea.id) || refs.some((referenceId) => goalIdsForArea.has(referenceId))
        if (!matchesAreaContext) return false
        if (!selectedGoal?.id) return true
        return refs.includes(selectedGoal.id)
      })
    }
    return data.treatments.filter((treatment) => treatment.referenceIds.includes(selectedArea.id))
  }, [data.treatments, goalsForArea, selectedArea?.id, selectedGoal?.id])

  const selectedTreatment =
    treatmentsForSelection.find((treatment) => treatment.id === selectedTreatmentId) ??
    treatmentsForSelection[0] ??
    null

  const servicesForTreatment = useMemo(() => {
    if (!selectedTreatment?.id) return []
    return data.services.filter((service) => service.treatmentIds.includes(selectedTreatment.id))
  }, [data.services, selectedTreatment?.id])

  const activeService =
    servicesForTreatment.find((service) => service.id === activeServiceId) ??
    servicesForTreatment[0] ??
    null

  useEffect(() => {
    if (!selectedArea?.id) return
    if (goalsForArea.length > 0) {
      setSelectedGoalId(goalsForArea[0]?.id ?? null)
    } else {
      setSelectedGoalId(null)
    }
  }, [selectedArea?.id, goalsForArea])

  useEffect(() => {
    if (treatmentsForSelection.length === 0) {
      setSelectedTreatmentId(null)
      return
    }
    setSelectedTreatmentId((current) => {
      if (current && treatmentsForSelection.some((item) => item.id === current)) return current
      return treatmentsForSelection[0]?.id ?? null
    })
  }, [treatmentsForSelection])

  useEffect(() => {
    if (servicesForTreatment.length === 0) {
      setActiveServiceId(null)
      return
    }
    setActiveServiceId((current) => {
      if (current && servicesForTreatment.some((item) => item.id === current)) return current
      return servicesForTreatment[0]?.id ?? null
    })
  }, [servicesForTreatment])

  const goToStep = (step: number) => {
    leftSwiperRef.current?.slideTo(step)
    rightSwiperRef.current?.slideTo(step)
  }

  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId)
    setActiveAreaId(areaId)
  }

  return (
    <SplitSection
      className={styles.split}
      leftClassName={styles.panel}
      rightClassName={`${styles.panel} ${styles.panelMedia}`}
      left={
        <div className={styles.panelContent}>
          <Swiper
            className={styles.leftSwiper}
            slidesPerView={1}
            spaceBetween={0}
            allowTouchMove={false}
            speed={700}
            onSwiper={(swiper) => {
              leftSwiperRef.current = swiper
            }}
          >
            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <SectionTitle as="h2" size="h2" uppercase className={styles.heading}>
                  Scegli il risultato. Al resto pensiamo noi.
                </SectionTitle>
                <SectionSubtitle className={styles.bodyText}>
                  Seleziona l&apos;area, definisci l&apos;obiettivo, scopri il trattamento più adatto.
                </SectionSubtitle>
                <div className={styles.stepActions}>
                  <span className={styles.stepActionSpacer} aria-hidden="true" />
                  <Button kind="main" size="sm" interactive type="button" className={styles.navButton} onClick={() => goToStep(1)}>
                    Inizia
                  </Button>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <SectionTitle as="h2" size="h2" uppercase className={styles.heading}>
                  Parti dall&apos;area da trattare
                </SectionTitle>
                <SectionSubtitle className={styles.bodyText}>
                  {activeArea?.description ||
                    "Seleziona l'area su cui vuoi intervenire per iniziare la configurazione."}
                </SectionSubtitle>
                <div className={styles.circleList}>
                  {orderedAreas.map((area) => (
                    <StateCircleButton
                      key={area.id}
                      baseClassName={styles.circleItem}
                      typographyClassName="typo-small-upper"
                      active={area.id === activeAreaId}
                      selected={selectedAreaId === area.id}
                      onMouseEnter={() => setActiveAreaId(area.id)}
                      onFocus={() => setActiveAreaId(area.id)}
                      onMouseLeave={() => setActiveAreaId(selectedAreaId)}
                      onClick={() => handleAreaSelect(area.id)}
                    >
                      {area.label}
                    </StateCircleButton>
                  ))}
                </div>
                <div className={styles.stepActions}>
                  <Button kind="main" size="sm" interactive type="button" className={styles.navButton} onClick={() => goToStep(0)}>
                    Torna indietro
                  </Button>
                  <Button
                    kind="main"
                    size="sm"
                    interactive
                    type="button"
                    className={styles.navButton}
                    disabled={!selectedAreaId}
                    onClick={() => goToStep(2)}
                  >
                    Prosegui
                  </Button>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <SectionTitle as="h2" size="h2" uppercase className={styles.heading}>
                  Definisci obiettivo e trattamento
                </SectionTitle>
                <SectionSubtitle className={styles.bodyText}>
                  {selectedGoal?.description ||
                    selectedTreatment?.description ||
                    'Scegli il percorso più adatto al risultato che vuoi ottenere.'}
                </SectionSubtitle>

                {goalsForArea.length > 0 ? (
                  <div className={styles.block}>
                    <p className={`${styles.blockLabel} typo-caption-upper`}>Obiettivo</p>
                    <div className={styles.pillList}>
                      {goalsForArea.map((goal) => (
                        <Button
                          kind="main"
                          size="sm"
                          interactive
                          key={goal.id}
                          type="button"
                          className={`${styles.pillItem} ${
                            selectedGoal?.id === goal.id ? styles.pillItemActive : ''
                          }`}
                          onClick={() => setSelectedGoalId(goal.id)}
                        >
                          {goal.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className={styles.block}>
                  <p className={`${styles.blockLabel} typo-caption-upper`}>Trattamento</p>
                  <div className={styles.pillList}>
                    {treatmentsForSelection.map((treatment) => (
                      <Button
                        kind="main"
                        size="sm"
                        interactive
                        key={treatment.id}
                        type="button"
                        className={`${styles.pillItem} ${
                          selectedTreatment?.id === treatment.id ? styles.pillItemActive : ''
                        }`}
                        onClick={() => setSelectedTreatmentId(treatment.id)}
                      >
                        {treatment.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className={styles.stepActions}>
                  <Button kind="main" size="sm" interactive type="button" className={styles.navButton} onClick={() => goToStep(1)}>
                    Torna indietro
                  </Button>
                  <Button
                    kind="main"
                    size="sm"
                    interactive
                    type="button"
                    className={styles.navButton}
                    disabled={!selectedTreatment}
                    onClick={() => goToStep(3)}
                  >
                    Prosegui
                  </Button>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <SectionTitle as="h2" size="h2" uppercase className={styles.heading}>
                  Servizi suggeriti
                </SectionTitle>
                <SectionSubtitle className={styles.bodyText}>
                  {selectedTreatment
                    ? `Seleziona un servizio per ${selectedTreatment.label.toLowerCase()}.`
                    : 'Seleziona prima un trattamento.'}
                </SectionSubtitle>
                <div className={styles.serviceList}>
                  {servicesForTreatment.length > 0 ? (
                    servicesForTreatment.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        className={`${styles.serviceCard} ${
                          activeService?.id === service.id ? styles.serviceCardActive : ''
                        }`}
                        onClick={() => setActiveServiceId(service.id)}
                      >
                        <SectionSubtitle className={styles.serviceTitle}>{service.title}</SectionSubtitle>
                        <p className={`${styles.serviceMeta} typo-small`}>
                          {service.durationMin > 0 ? `${service.durationMin} min` : 'Durata su richiesta'}
                          {service.price ? ` · ${formatPrice(service.price)}` : ''}
                        </p>
                      </button>
                    ))
                  ) : (
                    <SectionSubtitle className={styles.emptyState}>
                      Nessun servizio disponibile per la selezione corrente.
                    </SectionSubtitle>
                  )}
                </div>
                <div className={styles.stepActions}>
                  <Button kind="main" size="sm" interactive type="button" className={styles.navButton} onClick={() => goToStep(2)}>
                    Torna indietro
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      }
      right={
        <div className={styles.panelContentMedia}>
          <Swiper
            className={styles.mediaSwiper}
            slidesPerView={1}
            spaceBetween={0}
            allowTouchMove={false}
            speed={700}
            onSwiper={(swiper) => {
              rightSwiperRef.current = swiper
            }}
          >
            <SwiperSlide className={styles.mediaSlide}>
              <div className={`${styles.mediaPlaceholder} typo-small-upper`}>Inizia il percorso</div>
            </SwiperSlide>

            <SwiperSlide className={styles.mediaSlide}>
              {activeArea?.imageUrl ? (
                <img
                  key={`${activeArea.id}-media`}
                  className={styles.mediaImage}
                  src={activeArea.imageUrl}
                  alt={activeArea.label}
                  loading="lazy"
                />
              ) : (
                <div className={`${styles.mediaPlaceholder} typo-small-upper`}>Anteprima area</div>
              )}
            </SwiperSlide>

            <SwiperSlide className={styles.mediaSlide}>
              {selectedGoal?.imageUrl || selectedTreatment?.imageUrl ? (
                <img
                  key={`${selectedGoal?.id || 'goal'}-${selectedTreatment?.id || 'treatment'}-media`}
                  className={styles.mediaImage}
                  src={selectedGoal?.imageUrl || selectedTreatment?.imageUrl || ''}
                  alt={selectedGoal?.label || selectedTreatment?.label || 'Anteprima trattamento'}
                  loading="lazy"
                />
              ) : (
                <div className={`${styles.mediaPlaceholder} typo-small-upper`}>Anteprima obiettivo/trattamento</div>
              )}
            </SwiperSlide>

            <SwiperSlide className={styles.mediaSlide}>
              <div className={styles.summaryPanel}>
                <div className={styles.summaryRow}>
                  {selectedArea?.label ? <span className={`${styles.summaryPill} typo-caption-upper`}>Area: {selectedArea.label}</span> : null}
                  {selectedGoal?.label ? <span className={`${styles.summaryPill} typo-caption-upper`}>Obiettivo: {selectedGoal.label}</span> : null}
                  {selectedTreatment?.label ? (
                    <span className={`${styles.summaryPill} typo-caption-upper`}>Trattamento: {selectedTreatment.label}</span>
                  ) : null}
                </div>

                {activeService?.imageUrl ? (
                  <img
                    className={styles.serviceImage}
                    src={activeService.imageUrl}
                    alt={activeService.title}
                    loading="lazy"
                  />
                ) : (
                  <div className={`${styles.mediaPlaceholder} typo-small-upper`}>Anteprima servizio</div>
                )}

                {activeService ? (
                  <div className={styles.serviceInfo}>
                    <SectionSubtitle size="body-lg" className={styles.serviceInfoTitle}>
                      {activeService.title}
                    </SectionSubtitle>
                    <p className={`${styles.serviceInfoMeta} typo-small`}>
                      {activeService.durationMin > 0
                        ? `${activeService.durationMin} min`
                        : 'Durata su richiesta'}
                      {activeService.price ? ` · ${formatPrice(activeService.price)}` : ''}
                    </p>
                    {activeService.description ? (
                      <SectionSubtitle className={styles.serviceInfoDescription}>
                        {activeService.description}
                      </SectionSubtitle>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      }
    />
  )
}
