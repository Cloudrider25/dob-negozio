'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type {
  NavigatorState,
} from '@/components/service-navigator/types/navigator'
import { useNavigatorData } from '@/components/service-navigator/data/navigator-data-context'
import { ChevronLeft, X } from '@/components/service-navigator/icons'
import styles from '@/components/service-navigator/components/MobileFlow.module.css'

interface MobileFlowProps {
  state: NavigatorState;
  onUpdateState: (updates: Partial<NavigatorState>) => void;
  onBookNow: () => void;
  onClose: () => void;
}

export function MobileFlow({
  state,
  onUpdateState,
  onBookNow,
  onClose,
}: MobileFlowProps) {
  const {
    getAreas,
    getGoalsForArea,
    getTreatmentsForArea,
    getServicesForTreatment,
    getGoalById,
    getTreatmentById,
  } = useNavigatorData();
  const areas = getAreas();
  const handleBack = () => {
    if (state.step === "final") {
      onUpdateState({ step: "treatment", selectedService: undefined });
    } else if (state.step === "treatment") {
      if (state.selectedArea && getGoalsForArea(state.selectedArea).length > 0) {
        onUpdateState({
          step: "goal",
          selectedTreatment: undefined,
          selectedService: undefined,
        });
      } else {
        onUpdateState({
          step: "area",
          selectedTreatment: undefined,
          selectedService: undefined,
        });
      }
    } else if (state.step === "goal") {
      onUpdateState({
        step: "area",
        selectedGoal: undefined,
        selectedTreatment: undefined,
        selectedService: undefined,
      });
    }
  };

  const getBreadcrumb = () => {
    const parts: string[] = [];
    if (state.selectedArea) {
      parts.push(areas.find((a) => a.id === state.selectedArea)?.label || "");
    }
    if (state.selectedGoal) {
      parts.push(getGoalById(state.selectedGoal)?.label || state.selectedGoal);
    }
    if (state.selectedTreatment) {
      parts.push(getTreatmentById(state.selectedTreatment)?.label || state.selectedTreatment);
    }
    return parts.join(" → ");
  };

  // Get data for current step
  const goals =
    state.selectedArea && getGoalsForArea(state.selectedArea).length > 0
      ? getGoalsForArea(state.selectedArea)
      : [];

  const treatments =
    state.selectedArea
      ? getTreatmentsForArea(state.selectedArea, state.selectedGoal)
      : [];

  const services =
    state.selectedArea && state.selectedTreatment
      ? getServicesForTreatment(
          state.selectedTreatment,
          state.selectedGoal
        )
      : [];

  return (
    <div className={styles.overlay}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <button
            onClick={handleBack}
            className={styles.iconButton}
            disabled={state.step === "area"}
          >
            {state.step !== "area" && <ChevronLeft className={styles.icon} />}
          </button>

          <div className={styles.headerCenter}>
            <div className={styles.headerLabel}>
              {state.step === "area" && "Seleziona Area"}
              {state.step === "goal" && "Seleziona Obiettivo"}
              {state.step === "treatment" && "Seleziona Trattamento"}
              {state.step === "final" && "Scegli Servizio"}
            </div>
            {getBreadcrumb() && (
              <div className={styles.headerBreadcrumb}>{getBreadcrumb()}</div>
            )}
          </div>

          <button
            onClick={onClose}
            className={styles.iconButton}
          >
            <X className={styles.icon} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {/* Area Step */}
          {state.step === "area" && (
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
                    const needsGoal = getGoalsForArea(area.id).length > 0;
                    onUpdateState({
                      selectedArea: area.id,
                      step: needsGoal ? "goal" : "treatment",
                    });
                  }}
                  className={styles.stepButton}
                >
                  <div className={styles.stepTitle}>
                    {area.label}
                  </div>
                  {area.description && (
                    <div className={styles.stepDescription}>{area.description}</div>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {/* Goal Step */}
          {state.step === "goal" && (
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
                      step: "treatment",
                    });
                  }}
                  className={styles.stepButton}
                >
                  <div className={styles.stepTitle}>
                    {goal.label}
                  </div>
                  {goal.description && (
                    <div className={styles.stepDescription}>{goal.description}</div>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {/* Treatment Step */}
          {state.step === "treatment" && (
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
                      step: "final",
                    });
                  }}
                  className={styles.stepButton}
                >
                  <div className={styles.stepTitle}>
                    {treatment.label}
                  </div>
                  {treatment.description && (
                    <div className={styles.stepDescription}>{treatment.description}</div>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {/* Services Step */}
          {state.step === "final" && (
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
                    onUpdateState({ selectedService: service });
                  }}
                  className={styles.stepButton}
                >
                  <div className={styles.serviceTitle}>
                    {service.title}
                  </div>
                  {service.description && (
                    <div className={styles.serviceDescription}>{service.description}</div>
                  )}
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
      </div>

      {/* Bottom CTA (only in final step with selection) */}
      {state.step === "final" && state.selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.cta}
        >
          <button
            onClick={onBookNow}
            className={`button-base ${styles.ctaButton}`}
          >
            Prenota {state.selectedService.title}
          </button>
        </motion.div>
      )}
    </div>
  );
}
