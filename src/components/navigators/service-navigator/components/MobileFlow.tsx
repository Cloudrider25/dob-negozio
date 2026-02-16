'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { NavigatorState } from '@/components/navigators/service-navigator/types/navigator'
import { useNavigatorData } from '@/components/navigators/service-navigator/data/navigator-data-context'
import { ChevronLeft, X } from '@/components/ui/icons'
import { MobileFlowShell } from '@/components/navigators/core/MobileFlowShell'
import { Button } from '@/components/ui/button'
import styles from '@/components/navigators/service-navigator/components/MobileFlow.module.css'

interface MobileFlowProps {
  state: NavigatorState
  onUpdateState: (updates: Partial<NavigatorState>) => void
  onBookNow: () => void
  onClose: () => void
}

export function MobileFlow({ state, onUpdateState, onBookNow, onClose }: MobileFlowProps) {
  const {
    getAreas,
    getGoalsForArea,
    getTreatmentsForArea,
    getServicesForTreatment,
    getGoalById,
    getTreatmentById,
  } = useNavigatorData()
  const areas = getAreas()

  const handleBack = () => {
    if (state.step === 'final') {
      onUpdateState({ step: 'treatment', selectedService: undefined })
    } else if (state.step === 'treatment') {
      if (state.selectedArea && getGoalsForArea(state.selectedArea).length > 0) {
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

  const getBreadcrumb = () => {
    const parts: string[] = []
    if (state.selectedArea) {
      parts.push(areas.find((a) => a.id === state.selectedArea)?.label || '')
    }
    if (state.selectedGoal) {
      parts.push(getGoalById(state.selectedGoal)?.label || state.selectedGoal)
    }
    if (state.selectedTreatment) {
      parts.push(getTreatmentById(state.selectedTreatment)?.label || state.selectedTreatment)
    }
    return parts.join(' → ')
  }

  const goals =
    state.selectedArea && getGoalsForArea(state.selectedArea).length > 0
      ? getGoalsForArea(state.selectedArea)
      : []

  const treatments = state.selectedArea ? getTreatmentsForArea(state.selectedArea, state.selectedGoal) : []

  const services =
    state.selectedArea && state.selectedTreatment
      ? getServicesForTreatment(state.selectedTreatment, state.selectedGoal)
      : []

  const stepLabel =
    state.step === 'area'
      ? 'Seleziona Area'
      : state.step === 'goal'
        ? 'Seleziona Obiettivo'
        : state.step === 'treatment'
          ? 'Seleziona Trattamento'
          : 'Scegli Servizio'

  return (
    <MobileFlowShell
      classNames={{
        overlay: styles.overlay,
        header: styles.header,
        headerRow: styles.headerInner,
        iconButton: styles.iconButton,
        icon: styles.icon,
        headerTitle: styles.headerCenter,
        stepLabel: styles.headerLabel,
        breadcrumb: styles.headerBreadcrumb,
        content: styles.content,
      }}
      stepLabel={stepLabel}
      breadcrumb={getBreadcrumb()}
      isRootStep={state.step === 'area'}
      onBack={handleBack}
      onClose={onClose}
      BackIcon={ChevronLeft}
      CloseIcon={X}
      footer={
        state.step === 'final' && state.selectedService ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.cta}>
            <Button onClick={onBookNow} className={styles.ctaButton} interactive kind="main">
              Prenota {state.selectedService.title}
            </Button>
          </motion.div>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        {state.step === 'area' && (
          <motion.div
            key="area"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.stepList}
          >
            {areas.map((area) => (
              <button
                key={area.id}
                onClick={() => {
                  const needsGoal = getGoalsForArea(area.id).length > 0
                  onUpdateState({
                    selectedArea: area.id,
                    step: needsGoal ? 'goal' : 'treatment',
                  })
                }}
                className={styles.stepButton}
              >
                <div className={styles.stepTitle}>{area.label}</div>
                {area.description && <div className={styles.stepDescription}>{area.description}</div>}
              </button>
            ))}
          </motion.div>
        )}

        {state.step === 'goal' && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.stepList}
          >
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => {
                  onUpdateState({
                    selectedGoal: goal.id,
                    step: 'treatment',
                  })
                }}
                className={styles.stepButton}
              >
                <div className={styles.stepTitle}>{goal.label}</div>
                {goal.description && <div className={styles.stepDescription}>{goal.description}</div>}
              </button>
            ))}
          </motion.div>
        )}

        {state.step === 'treatment' && (
          <motion.div
            key="treatment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.stepList}
          >
            {treatments.map((treatment) => (
              <button
                key={treatment.id}
                onClick={() => {
                  onUpdateState({
                    selectedTreatment: treatment.id,
                    step: 'final',
                  })
                }}
                className={styles.stepButton}
              >
                <div className={styles.stepTitle}>{treatment.label}</div>
                {treatment.description && <div className={styles.stepDescription}>{treatment.description}</div>}
              </button>
            ))}
          </motion.div>
        )}

        {state.step === 'final' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`${styles.stepList} ${styles.stepListWide}`}
          >
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  onUpdateState({ selectedService: service })
                }}
                className={styles.stepButton}
              >
                <div className={styles.serviceTitle}>{service.title}</div>
                {service.description && <div className={styles.serviceDescription}>{service.description}</div>}
                <div className={styles.serviceMeta}>
                  <span>{service.durationMin} min</span>
                  {service.price && <span>€ {service.price}</span>}
                </div>
                <div className={styles.tags}>
                  {service.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </MobileFlowShell>
  )
}
