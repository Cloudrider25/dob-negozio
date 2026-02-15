'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type {
  Area,
  Goal,
  NavigatorState,
  SelectedServiceItem,
  ServiceFinal,
  Treatment,
} from '@/components/service-navigator/types/navigator'
import { ColumnArea } from '@/components/service-navigator/components/columns/ColumnArea'
import { ColumnGoal } from '@/components/service-navigator/components/columns/ColumnGoal'
import { ColumnTreatment } from '@/components/service-navigator/components/columns/ColumnTreatment'
import { ColumnServices } from '@/components/service-navigator/components/columns/ColumnServices'
import { SidePreview } from '@/components/service-navigator/components/SidePreview'
import { PathBreadcrumb } from '@/components/service-navigator/components/PathBreadcrumb'
import { CenterImageDisplay } from '@/components/service-navigator/components/CenterImageDisplay'
import { TreatmentHoverCard } from '@/components/service-navigator/components/TreatmentHoverCard'
import { GoalHoverCard } from '@/components/service-navigator/components/GoalHoverCard'
import { useNavigatorData } from '@/components/service-navigator/data/navigator-data-context'
import styles from '@/components/service-navigator/components/NavigatorGrid.module.css'

interface NavigatorGridProps {
  state: NavigatorState
  onUpdateState: (updates: Partial<NavigatorState>) => void
  onBookNow: () => void
  onSkinAnalyzer: () => void
}

export function NavigatorGrid({
  state,
  onUpdateState,
  onBookNow,
  onSkinAnalyzer,
}: NavigatorGridProps) {
  const { getGoalsForArea, getGoalById, getTreatmentById, getServicesForTreatment } =
    useNavigatorData()
  const [hoveredArea, setHoveredArea] = useState<Area | undefined>(undefined)
  const [clickedArea, setClickedArea] = useState<Area | undefined>(undefined)
  const [isSlideOutAnimating, setIsSlideOutAnimating] = useState(false)
  const [hoveredTreatment, setHoveredTreatment] = useState<Treatment | null>(null)
  const [clickedTreatment, setClickedTreatment] = useState<Treatment | undefined>(undefined)
  const [isTreatmentSlideOutAnimating, setIsTreatmentSlideOutAnimating] = useState(false)
  const [hoveredGoal, setHoveredGoal] = useState<Goal | null>(null)
  const [clickedGoal, setClickedGoal] = useState<Goal | undefined>(undefined)
  const [isGoalSlideOutAnimating, setIsGoalSlideOutAnimating] = useState(false)

  const handleSelectArea = (area: Area) => {
    // If clicking on the same area, do nothing
    if (area === state.selectedArea) {
      return
    }

    // If we're in the initial "area" step, trigger slide-out immediatamente
    if (state.step === 'area') {
      setClickedArea(area)
      setIsSlideOutAnimating(true)
      // L'immagine inizia a fare slide immediatamente
    } else {
      // Traccia se l'area precedente aveva goal
      // If we're in a later step, navigate directly to the new area
      const needsGoal = getGoalsForArea(area).length > 0
      onUpdateState({
        selectedArea: area,
        selectedGoal: undefined,
        selectedTreatment: undefined,
        selectedService: undefined,
        step: needsGoal ? 'goal' : 'treatment',
      })
    }
  }

  const handleImageSlideOutComplete = () => {
    // After image slides out, proceed with navigation
    setIsSlideOutAnimating(false)
    if (clickedArea) {
      const needsGoal = getGoalsForArea(clickedArea).length > 0
      onUpdateState({
        selectedArea: clickedArea,
        selectedGoal: undefined,
        selectedTreatment: undefined,
        selectedService: undefined,
        step: needsGoal ? 'goal' : 'treatment',
      })
      setClickedArea(undefined)
      setHoveredArea(undefined)
    }
  }

  const handleSelectGoal = (goal: Goal) => {
    // Se clicchiamo sullo stesso goal selezionato, non fare nulla
    if (goal === state.selectedGoal) {
      return
    }

    // Triggera l'animazione di slide-out della card
    setClickedGoal(goal)
    setIsGoalSlideOutAnimating(true)
  }

  const handleGoalCardSlideOutComplete = () => {
    // Dopo che la card è uscita, procedi con la navigazione
    setIsGoalSlideOutAnimating(false)
    if (clickedGoal) {
      onUpdateState({
        selectedGoal: clickedGoal,
        selectedTreatment: undefined,
        selectedService: undefined,
        step: 'treatment',
      })
      setClickedGoal(undefined)
    }
  }

  const handleSelectTreatment = (treatment: Treatment) => {
    // Se clicchiamo sullo stesso trattamento selezionato, non fare nulla
    if (treatment === state.selectedTreatment) {
      return
    }

    // Se siamo già nello step finale o non c'è hover card, aggiorna subito
    if (state.step === 'final' || !hoveredTreatment) {
      onUpdateState({
        selectedTreatment: treatment,
        selectedService: undefined,
        step: 'final',
      })
      return
    }

    // Triggera l'animazione di slide-out della card
    setClickedTreatment(treatment)
    setIsTreatmentSlideOutAnimating(true)
  }

  const handleTreatmentCardSlideOutComplete = () => {
    // Dopo che la card è uscita, procedi con la navigazione
    setIsTreatmentSlideOutAnimating(false)
    if (clickedTreatment) {
      onUpdateState({
        selectedTreatment: clickedTreatment,
        selectedService: undefined,
        step: 'final',
      })
      setClickedTreatment(undefined)
    }
  }

  const handleSelectService = (service: ServiceFinal) => {
    onUpdateState({
      selectedService: service,
    })
  }

  const handleAddServiceToCart = (service: ServiceFinal) => {
    if (!state.selectedArea || !state.selectedTreatment) return
    const newItem = {
      area: state.selectedArea,
      goal: state.selectedGoal,
      treatment: state.selectedTreatment,
      service,
    }
    onUpdateState({
      cart: [...state.cart, newItem],
    })
  }

  const handleAddToCartItem = (item: SelectedServiceItem) => {
    onUpdateState({
      cart: [...state.cart, item],
    })
  }

  const handleRemoveFromCartItem = (item: SelectedServiceItem) => {
    const index = state.cart.findIndex((entry) => entry.service.id === item.service.id)
    if (index < 0) return
    const newCart = state.cart.filter((_, i) => i !== index)
    onUpdateState({
      cart: newCart,
    })
  }

  const handleResetSelection = () => {
    // Resetta la selezione corrente per ricominciare
    onUpdateState({
      step: 'area',
      selectedArea: undefined,
      selectedGoal: undefined,
      selectedTreatment: undefined,
      selectedService: undefined,
    })
  }

  const handleNavigateToStep = (step: typeof state.step) => {
    // Reset successive selections when going back
    if (step === 'area') {
      onUpdateState({
        step: 'area',
        selectedArea: undefined,
        selectedGoal: undefined,
        selectedTreatment: undefined,
        selectedService: undefined,
      })
    } else if (step === 'goal') {
      const needsGoal = state.selectedArea ? getGoalsForArea(state.selectedArea).length > 0 : false
      if (needsGoal) {
        onUpdateState({
          step: 'goal',
          selectedGoal: undefined,
          selectedTreatment: undefined,
          selectedService: undefined,
        })
      }
    } else if (step === 'treatment') {
      onUpdateState({
        step: 'treatment',
        selectedTreatment: undefined,
        selectedService: undefined,
      })
    }
  }

  const handleBack = () => {
    // Gestisce il pulsante indietro basandosi sullo step corrente
    if (state.step === 'final') {
      onUpdateState({
        step: 'treatment',
        selectedService: undefined,
      })
    } else if (state.step === 'treatment') {
      const needsGoal = state.selectedArea ? getGoalsForArea(state.selectedArea).length > 0 : false
      if (needsGoal) {
        onUpdateState({
          step: 'goal',
          selectedTreatment: undefined,
          selectedService: undefined,
        })
      } else {
        onUpdateState({
          step: 'area',
          selectedTreatment: undefined,
          selectedService: undefined,
        })
      }
    } else if (state.step === 'goal') {
      onUpdateState({
        step: 'area',
        selectedGoal: undefined,
        selectedTreatment: undefined,
        selectedService: undefined,
      })
    }
  }

  // Get services list for final step
  const services =
    state.selectedArea && state.selectedTreatment
      ? getServicesForTreatment(state.selectedTreatment, state.selectedGoal)
      : []

  return (
    <div className={styles.wrapper}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <PathBreadcrumb state={state} onNavigateToStep={handleNavigateToStep} onBack={handleBack} />
      </div>

      {/* Grid Layout */}
      <div className={styles.grid}>
        {/* Columns area - 9 cols */}
        <div className={styles.mainCol}>
          {state.step === 'area' ? (
            // Initial step: Area selection with center image
            <div className={styles.columnsGrid}>
              {/* Column 1: Area selection */}
              <div>
                <AnimatePresence mode="wait">
                  <ColumnArea
                    selectedArea={state.selectedArea}
                    onSelectArea={handleSelectArea}
                    onHoverArea={setHoveredArea}
                  />
                </AnimatePresence>
              </div>

              {/* Columns 2-3: Center Image Display */}
              <div className={`${styles.splitCol} navigator-column`}>
                <div className={styles.hiddenTitleWrap} aria-hidden="true">
                  <h3 className={styles.hiddenTitle}>
                    Spacer
                  </h3>
                </div>
                <div className={styles.mainContent}>
                  <CenterImageDisplay
                    hoveredArea={hoveredArea}
                    shouldSlideOut={isSlideOutAnimating}
                    onAnimationComplete={handleImageSlideOutComplete}
                  />
                </div>
              </div>
            </div>
          ) : state.step !== 'final' ? (
            // Normal navigation grid (3 columns) senza layout animations
            <div className={styles.relative}>
              <div className={styles.columnsGrid}>
                {/* Column 1: dinamica in base allo step */}
                {state.step === 'goal' ? (
                  // Step GOAL: mostra Area in col 1
                  <div>
                    <ColumnArea
                      selectedArea={state.selectedArea}
                      onSelectArea={handleSelectArea}
                      onHoverArea={setHoveredArea}
                    />
                  </div>
                ) : state.step === 'treatment' &&
                  state.selectedArea &&
                  getGoalsForArea(state.selectedArea).length > 0 ? (
                  // Step TREATMENT (con goal): mostra Goal in col 1 (no animation)
                  <div>
                    <ColumnGoal
                      area={state.selectedArea}
                      selectedGoal={state.selectedGoal}
                      onSelectGoal={handleSelectGoal}
                    />
                  </div>
                ) : state.step === 'treatment' && state.selectedArea ? (
                  // Step TREATMENT (senza goal): mostra Area in col 1
                  <div>
                    <ColumnArea
                      selectedArea={state.selectedArea}
                      onSelectArea={handleSelectArea}
                      onHoverArea={setHoveredArea}
                    />
                  </div>
                ) : null}

                {/* Column 2: dinamica in base allo step */}
                <AnimatePresence mode="wait">
                  {state.step === 'goal' &&
                  state.selectedArea &&
                  getGoalsForArea(state.selectedArea).length > 0 ? (
                    // Step GOAL: mostra Goal in col 2 (slide-in from right)
                    <motion.div
                      key="goal-column"
                      initial={{ x: 400, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -400, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <ColumnGoal
                        area={state.selectedArea}
                        selectedGoal={state.selectedGoal}
                        onSelectGoal={handleSelectGoal}
                        onHoverGoal={setHoveredGoal}
                      />
                    </motion.div>
                  ) : state.step === 'treatment' && state.selectedArea ? (
                    // Step TREATMENT: mostra Treatment in col 2 (slide-in from right)
                    <motion.div
                      key="treatment-column"
                      initial={{ x: 400, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -400, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <ColumnTreatment
                        area={state.selectedArea}
                        goal={state.selectedGoal}
                        selectedTreatment={state.selectedTreatment}
                        onSelectTreatment={handleSelectTreatment}
                        onHoverTreatment={setHoveredTreatment}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Column 3: Hover Card Space */}
                <div className={`${styles.hoverColumn} navigator-column`}>
                  <div className={styles.hiddenTitleWrap} aria-hidden="true">
                    <h3 className={styles.hiddenTitle}>
                      Spacer
                    </h3>
                  </div>
                  {state.step === 'goal' && state.selectedArea && (
                    <GoalHoverCard
                      goal={
                        hoveredGoal
                          ? {
                              id: hoveredGoal,
                              title:
                                getGoalById(hoveredGoal)?.cardTitle ||
                                getGoalById(hoveredGoal)?.label ||
                                hoveredGoal,
                              slug: getGoalById(hoveredGoal)?.slug,
                              subtitle:
                                getGoalById(hoveredGoal)?.cardTagline ||
                                getGoalById(hoveredGoal)?.subtitle,
                              description:
                                getGoalById(hoveredGoal)?.cardDescription ||
                                getGoalById(hoveredGoal)?.description ||
                                '',
                              benefits: getGoalById(hoveredGoal)?.benefits || [],
                            }
                          : null
                      }
                      shouldSlideOut={isGoalSlideOutAnimating}
                      onAnimationComplete={handleGoalCardSlideOutComplete}
                    />
                  )}
                  {state.step === 'treatment' && (
                    <TreatmentHoverCard
                      treatment={
                        hoveredTreatment
                          ? {
                              id: hoveredTreatment,
                              title:
                                getTreatmentById(hoveredTreatment)?.cardTitle ||
                                getTreatmentById(hoveredTreatment)?.label ||
                                hoveredTreatment,
                              slug: getTreatmentById(hoveredTreatment)?.slug,
                              subtitle:
                                getTreatmentById(hoveredTreatment)?.cardTagline ||
                                getTreatmentById(hoveredTreatment)?.subtitle,
                              description:
                                getTreatmentById(hoveredTreatment)?.cardDescription ||
                                getTreatmentById(hoveredTreatment)?.description ||
                                '',
                              imageUrl: getTreatmentById(hoveredTreatment)?.imageUrl || '',
                              features: [],
                              descriptionBullets:
                                getTreatmentById(hoveredTreatment)?.features || [],
                            }
                          : null
                      }
                      shouldSlideOut={isTreatmentSlideOutAnimating}
                      onAnimationComplete={handleTreatmentCardSlideOutComplete}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Final step: Services list con animazione coordinata
            <div className={styles.relative}>
              <div className={styles.columnsGrid}>
                {/* Column 1: Treatment (no animation, just appears) */}
                {state.selectedArea && state.selectedTreatment && (
                  <div>
                    <ColumnTreatment
                      area={state.selectedArea}
                      goal={state.selectedGoal}
                      selectedTreatment={state.selectedTreatment}
                      onSelectTreatment={handleSelectTreatment}
                      onHoverTreatment={setHoveredTreatment}
                    />
                  </div>
                )}

                {/* Column 2-3: Services (slide-in from right, span 2 cols) */}
                <AnimatePresence mode="wait">
                  {state.selectedTreatment && (
                    <motion.div
                      key="col2-services"
                      className={styles.splitCol}
                      initial={{ x: 400, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 400, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <ColumnServices
                        services={services}
                        selectedService={state.selectedService}
                        onSelectService={handleSelectService}
                        onAddToCartService={handleAddServiceToCart}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Side Preview - 3 cols */}
        <div className={`${styles.sideCol} navigator-column`}>
          <SidePreview
            state={state}
            onBookNow={onBookNow}
            onSkinAnalyzer={onSkinAnalyzer}
            onAddToCartItem={handleAddToCartItem}
            onRemoveFromCartItem={handleRemoveFromCartItem}
            onResetSelection={handleResetSelection}
          />
        </div>
      </div>
    </div>
  )
}
