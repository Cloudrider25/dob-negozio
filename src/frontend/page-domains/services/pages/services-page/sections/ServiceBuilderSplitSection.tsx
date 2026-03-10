'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import type { NavigatorData } from '@/frontend/page-domains/services/pages/services-page/sections/navigator-data-context'
import { SectionSubtitle } from '@/frontend/components/ui/primitives/section-subtitle'
import { SectionTitle } from '@/frontend/components/ui/primitives/section-title'
import { Button } from '@/frontend/components/ui/primitives/button'
import { ButtonLink } from '@/frontend/components/ui/primitives/button-link'
import { StateCircleButton } from '@/frontend/components/ui/primitives/StateCircleButton'
import { SplitSection } from '@/frontend/components/ui/compositions/SplitSection'
import { Swiper, SwiperSlide, type UISwiperInstance } from '@/frontend/components/ui/primitives/swiper'
import { formatServicePrice } from '@/lib/frontend/services/format'
import styles from './ServiceBuilderSplitSection.module.css'

type ServiceBuilderSplitSectionProps = {
  data: NavigatorData
  locale: string
  step0Config?: {
    heading?: string | null
    description?: string | null
    mediaPlaceholder?: string | null
    mediaUrl?: string | null
    mediaAlt?: string | null
  }
}

const formatPrice = (price?: number) => {
  return formatServicePrice(price, {
    locale: 'it-IT',
    currency: 'EUR',
    invalidValue: null,
  })
}

export function ServiceBuilderSplitSection({ data, locale, step0Config }: ServiceBuilderSplitSectionProps) {
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
  const [committedAreaId, setCommittedAreaId] = useState<string | null>(null)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [committedGoalId, setCommittedGoalId] = useState<string | null>(null)
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null)
  const [committedTreatmentId, setCommittedTreatmentId] = useState<string | null>(null)
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null)

  const leftSwiperRef = useRef<UISwiperInstance | null>(null)
  const rightSwiperRef = useRef<UISwiperInstance | null>(null)
  const goalOptionsSwiperRef = useRef<UISwiperInstance | null>(null)
  const treatmentOptionsSwiperRef = useRef<UISwiperInstance | null>(null)
  const serviceOptionsSwiperRef = useRef<UISwiperInstance | null>(null)

  const selectedArea =
    orderedAreas.find((area) => area.id === selectedAreaId) ?? orderedAreas[0] ?? null
  const activeArea =
    orderedAreas.find((area) => area.id === activeAreaId) ?? selectedArea ?? null
  const committedArea =
    orderedAreas.find((area) => area.id === committedAreaId) ?? null

  const goalsForArea = useMemo(() => {
    if (!committedArea?.id) return []
    return data.goals.filter((goal) => goal.areaId === committedArea.id)
  }, [data.goals, committedArea?.id])

  const selectedGoal =
    goalsForArea.find((goal) => goal.id === selectedGoalId) ?? goalsForArea[0] ?? null

  const treatmentsForSelection = useMemo(() => {
    if (!committedArea?.id) return []
    if (!committedGoalId) return []
    const goalIdsForArea = new Set(goalsForArea.map((goal) => goal.id))
    if (goalsForArea.length > 0) {
      return data.treatments.filter((treatment) => {
        const refs = treatment.referenceIds || []
        const matchesAreaContext =
          refs.includes(committedArea.id) || refs.some((referenceId) => goalIdsForArea.has(referenceId))
        if (!matchesAreaContext) return false
        return refs.includes(committedGoalId)
      })
    }
    return data.treatments.filter((treatment) => treatment.referenceIds.includes(committedArea.id))
  }, [data.treatments, goalsForArea, committedArea?.id, committedGoalId])

  const selectedTreatment =
    treatmentsForSelection.find((treatment) => treatment.id === selectedTreatmentId) ??
    treatmentsForSelection[0] ??
    null

  const servicesForTreatment = useMemo(() => {
    if (!committedTreatmentId) return []
    return data.services.filter((service) => service.treatmentIds.includes(committedTreatmentId))
  }, [data.services, committedTreatmentId])

  const activeService =
    servicesForTreatment.find((service) => service.id === activeServiceId) ??
    servicesForTreatment[0] ??
    null

  useEffect(() => {
    if (!committedArea?.id) {
      setSelectedGoalId(null)
      return
    }
    if (goalsForArea.length > 0) {
      setSelectedGoalId(goalsForArea[0]?.id ?? null)
    } else {
      setSelectedGoalId(null)
    }
  }, [committedArea?.id, goalsForArea])

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

  useEffect(() => {
    if (!selectedGoal?.id) return
    const index = goalsForArea.findIndex((goal) => goal.id === selectedGoal.id)
    if (index >= 0) goalOptionsSwiperRef.current?.slideTo(index, 0)
  }, [goalsForArea, selectedGoal?.id])

  useEffect(() => {
    if (!selectedTreatment?.id) return
    const index = treatmentsForSelection.findIndex((treatment) => treatment.id === selectedTreatment.id)
    if (index >= 0) treatmentOptionsSwiperRef.current?.slideTo(index, 0)
  }, [treatmentsForSelection, selectedTreatment?.id])

  useEffect(() => {
    if (!activeService?.id) return
    const index = servicesForTreatment.findIndex((service) => service.id === activeService.id)
    if (index >= 0) serviceOptionsSwiperRef.current?.slideTo(index, 0)
  }, [servicesForTreatment, activeService?.id])

  const goToStep = (step: number) => {
    leftSwiperRef.current?.slideTo(step)
    rightSwiperRef.current?.slideTo(step)
  }

  const renderSummaryRow = ({
    showArea = false,
    showGoal = false,
    showTreatment = false,
  }: {
    showArea?: boolean
    showGoal?: boolean
    showTreatment?: boolean
  }) => (
    <div className={styles.summaryRow}>
      {showArea && selectedArea?.label ? (
        <span className={`${styles.summaryPill} typo-caption-upper`}>Area: {selectedArea.label}</span>
      ) : null}
      {showGoal && selectedGoal?.label ? (
        <span className={`${styles.summaryPill} typo-caption-upper`}>Obiettivo: {selectedGoal.label}</span>
      ) : null}
      {showTreatment && selectedTreatment?.label ? (
        <span className={`${styles.summaryPill} typo-caption-upper`}>Trattamento: {selectedTreatment.label}</span>
      ) : null}
    </div>
  )

  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId)
    setActiveAreaId(areaId)
    setCommittedGoalId(null)
    setCommittedTreatmentId(null)
    setSelectedGoalId(null)
    setSelectedTreatmentId(null)
    setActiveServiceId(null)
  }

  const handleProceedFromArea = () => {
    if (!selectedAreaId) return
    setCommittedAreaId(selectedAreaId)
    goToStep(2)
  }

  const handleProceedFromGoal = () => {
    if (!selectedGoalId) return
    setCommittedGoalId(selectedGoalId)
    setCommittedTreatmentId(null)
    setSelectedTreatmentId(null)
    setActiveServiceId(null)
    goToStep(3)
  }

  const handleProceedFromTreatment = () => {
    if (!selectedTreatmentId) return
    setCommittedTreatmentId(selectedTreatmentId)
    setActiveServiceId(null)
    goToStep(4)
  }

  return (
    <SplitSection
      className={styles.split}
      mobileOrder="right-first"
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
                  {step0Config?.heading || 'Scegli il risultato. Al resto pensiamo noi.'}
                </SectionTitle>
                <SectionSubtitle className={styles.bodyText}>
                  {step0Config?.description ||
                    'Seleziona l&apos;area, definisci l&apos;obiettivo, scopri il trattamento più adatto.'}
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
                  <button type="button" className={`${styles.backLink} typo-small`} onClick={() => goToStep(0)}>
                    Torna indietro
                  </button>
                  <Button
                    kind="main"
                    size="sm"
                    interactive
                    type="button"
                    className={styles.navButton}
                    disabled={!selectedAreaId}
                    onClick={handleProceedFromArea}
                  >
                    Prosegui
                  </Button>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <SectionTitle as="h2" size="h2" uppercase className={styles.heading}>
                  Definisci l&apos;obiettivo
                </SectionTitle>
                <SectionSubtitle className={styles.bodyText}>
                  {selectedGoal?.description || 'Scegli il risultato che vuoi ottenere.'}
                </SectionSubtitle>

                {goalsForArea.length > 0 ? (
                  <div className={styles.block}>
                    <p className={`${styles.blockLabel} typo-caption-upper`}>Obiettivo</p>
                    <Swiper
                      key={`goal-slider-${selectedArea?.id || 'none'}`}
                      className={styles.optionSlider}
                      nested
                      slidesPerView={'auto'}
                      spaceBetween={12}
                      onSwiper={(swiper) => {
                        goalOptionsSwiperRef.current = swiper
                      }}
                      onSlideChange={(swiper) => {
                        const goal = goalsForArea[swiper.activeIndex]
                        if (goal) setSelectedGoalId(goal.id)
                      }}
                    >
                      {goalsForArea.map((goal) => (
                        <SwiperSlide key={goal.id} className={styles.optionSlide}>
                          <button
                            type="button"
                            aria-pressed={selectedGoal?.id === goal.id}
                            className={`${styles.optionCard} ${
                              selectedGoal?.id === goal.id ? styles.optionCardActive : ''
                            }`}
                            onClick={() => setSelectedGoalId(goal.id)}
                          >
                            <SectionSubtitle className={styles.optionCardLabel}>
                              {goal.cardTitle || goal.label}
                            </SectionSubtitle>
                            {goal.cardDescription || goal.description ? (
                              <SectionSubtitle className={styles.optionCardBody}>
                                {goal.cardDescription || goal.description}
                              </SectionSubtitle>
                            ) : null}
                          </button>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ) : (
                  <SectionSubtitle className={styles.emptyState}>
                    Nessun obiettivo disponibile per l&apos;area selezionata.
                  </SectionSubtitle>
                )}

                <div className={styles.stepActions}>
                  <button type="button" className={`${styles.backLink} typo-small`} onClick={() => goToStep(1)}>
                    Torna indietro
                  </button>
                  <Button
                    kind="main"
                    size="sm"
                    interactive
                    type="button"
                    className={styles.navButton}
                    disabled={!selectedGoalId}
                    onClick={handleProceedFromGoal}
                  >
                    Prosegui
                  </Button>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className={styles.leftSlide}>
              <div className={styles.column}>
                <SectionTitle as="h2" size="h2" uppercase className={styles.heading}>
                  Scegli il trattamento
                </SectionTitle>
                <SectionSubtitle className={styles.bodyText}>
                  {selectedTreatment?.description ||
                    'Seleziona il trattamento più adatto al risultato scelto.'}
                </SectionSubtitle>

                <div className={styles.block}>
                  <p className={`${styles.blockLabel} typo-caption-upper`}>Trattamento</p>
                  <Swiper
                    key={`treatment-slider-${selectedArea?.id || 'none'}-${selectedGoal?.id || 'none'}`}
                    className={styles.optionSlider}
                    nested
                    slidesPerView={'auto'}
                    spaceBetween={12}
                    onSwiper={(swiper) => {
                      treatmentOptionsSwiperRef.current = swiper
                    }}
                    onSlideChange={(swiper) => {
                      const treatment = treatmentsForSelection[swiper.activeIndex]
                      if (treatment) setSelectedTreatmentId(treatment.id)
                    }}
                  >
                    {treatmentsForSelection.map((treatment) => (
                      <SwiperSlide key={treatment.id} className={styles.optionSlide}>
                        <button
                          type="button"
                          aria-pressed={selectedTreatment?.id === treatment.id}
                          className={`${styles.optionCard} ${
                            selectedTreatment?.id === treatment.id ? styles.optionCardActive : ''
                          }`}
                          onClick={() => setSelectedTreatmentId(treatment.id)}
                        >
                          <SectionSubtitle className={styles.optionCardLabel}>
                            {treatment.cardTitle || treatment.label}
                          </SectionSubtitle>
                          {treatment.cardDescription || treatment.description ? (
                            <SectionSubtitle className={styles.optionCardBody}>
                              {treatment.cardDescription || treatment.description}
                            </SectionSubtitle>
                          ) : null}
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                <div className={styles.stepActions}>
                  <button type="button" className={`${styles.backLink} typo-small`} onClick={() => goToStep(2)}>
                    Torna indietro
                  </button>
                  <Button
                    kind="main"
                    size="sm"
                    interactive
                    type="button"
                    className={styles.navButton}
                    disabled={!selectedTreatment}
                    onClick={handleProceedFromTreatment}
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
                <Swiper
                  key={`service-slider-${selectedTreatment?.id || 'none'}`}
                  className={styles.optionSlider}
                  nested
                  slidesPerView={'auto'}
                  spaceBetween={12}
                  onSwiper={(swiper) => {
                    serviceOptionsSwiperRef.current = swiper
                  }}
                  onSlideChange={(swiper) => {
                    const service = servicesForTreatment[swiper.activeIndex]
                    if (service) setActiveServiceId(service.id)
                  }}
                >
                  {servicesForTreatment.length > 0 ? (
                    servicesForTreatment.map((service) => (
                      <SwiperSlide key={service.id} className={styles.optionSlide}>
                        <button
                          type="button"
                          aria-pressed={activeService?.id === service.id}
                          className={`${styles.optionCard} ${
                            activeService?.id === service.id ? styles.optionCardActive : ''
                          }`}
                          onClick={() => setActiveServiceId(service.id)}
                        >
                          <SectionSubtitle className={styles.optionCardLabel}>{service.title}</SectionSubtitle>
                          <p className={`${styles.optionCardMeta} typo-small`}>
                            {service.durationMin > 0 ? `${service.durationMin} min` : 'Durata su richiesta'}
                            {service.price ? ` · ${formatPrice(service.price)}` : ''}
                          </p>
                          {service.description ? (
                            <SectionSubtitle className={styles.optionCardBody}>{service.description}</SectionSubtitle>
                          ) : null}
                        </button>
                      </SwiperSlide>
                    ))
                  ) : (
                    <SectionSubtitle className={styles.emptyState}>
                      Nessun servizio disponibile per la selezione corrente.
                    </SectionSubtitle>
                  )}
                </Swiper>
                <div className={styles.stepActions}>
                  <button type="button" className={`${styles.backLink} typo-small`} onClick={() => goToStep(3)}>
                    Torna indietro
                  </button>
                  {activeService?.slug ? (
                    <ButtonLink
                      href={`/${locale}/services/service/${activeService.slug}`}
                      kind="main"
                      size="sm"
                      interactive
                      className={styles.navButton}
                    >
                      Dettagli
                    </ButtonLink>
                  ) : null}
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
              {step0Config?.mediaUrl ? (
                <div
                  className={styles.mediaImage}
                  role="img"
                  aria-label={step0Config.mediaAlt || step0Config.heading || 'Inizia il percorso'}
                  style={{ backgroundImage: `url(${step0Config.mediaUrl})` }}
                />
              ) : (
                <div className={`${styles.mediaPlaceholder} typo-small-upper`}>
                  {step0Config?.mediaPlaceholder || 'Inizia il percorso'}
                </div>
              )}
            </SwiperSlide>

            <SwiperSlide className={styles.mediaSlide}>
              {activeArea?.imageUrl ? (
                <div className={styles.summaryPanel}>
                  <div
                    key={`${activeArea.id}-media`}
                    className={styles.mediaImage}
                    role="img"
                    aria-label={activeArea.label}
                    style={{ backgroundImage: `url(${activeArea.imageUrl})` }}
                  />
                </div>
              ) : (
                <div className={`${styles.mediaPlaceholder} typo-small-upper`}>Anteprima area</div>
              )}
            </SwiperSlide>

            <SwiperSlide className={styles.mediaSlide}>
              {selectedGoal?.imageUrl ? (
                <div className={styles.summaryPanel}>
                  <div
                    key={`${selectedGoal?.id || 'goal'}-media`}
                    className={styles.mediaImage}
                    role="img"
                    aria-label={selectedGoal?.label || 'Anteprima obiettivo'}
                    style={{ backgroundImage: `url(${selectedGoal?.imageUrl})` }}
                  />
                  {renderSummaryRow({ showArea: true })}
                </div>
              ) : (
                <div className={`${styles.mediaPlaceholder} typo-small-upper`}>Anteprima obiettivo</div>
              )}
            </SwiperSlide>

            <SwiperSlide className={styles.mediaSlide}>
              {selectedTreatment?.imageUrl ? (
                <div className={styles.summaryPanel}>
                  <div
                    key={`${selectedTreatment?.id || 'treatment'}-media`}
                    className={styles.mediaImage}
                    role="img"
                    aria-label={selectedTreatment?.label || 'Anteprima trattamento'}
                    style={{ backgroundImage: `url(${selectedTreatment?.imageUrl})` }}
                  />
                  {renderSummaryRow({ showArea: true, showGoal: true })}
                </div>
              ) : (
                <div className={`${styles.mediaPlaceholder} typo-small-upper`}>Anteprima trattamento</div>
              )}
            </SwiperSlide>

            <SwiperSlide className={styles.mediaSlide}>
              <div className={styles.summaryPanel}>
                {renderSummaryRow({ showArea: true, showGoal: true, showTreatment: true })}

                {activeService?.imageUrl ? (
                  <div
                    className={styles.serviceImage}
                    role="img"
                    aria-label={activeService.title}
                    style={{ backgroundImage: `url(${activeService.imageUrl})` }}
                  />
                ) : (
                  <div className={`${styles.mediaPlaceholder} typo-small-upper`}>Anteprima servizio</div>
                )}

              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      }
    />
  )
}
