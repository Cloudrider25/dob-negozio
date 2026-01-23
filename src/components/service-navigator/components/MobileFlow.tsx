'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type {
  NavigatorState,
} from '@/components/service-navigator/types/navigator'
import { useNavigatorData } from '@/components/service-navigator/data/navigator-data-context'
import { ChevronLeft, X } from '@/components/service-navigator/icons'

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
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="p-2 text-white/60 hover:text-white transition-colors"
            disabled={state.step === "area"}
          >
            {state.step !== "area" && <ChevronLeft className="w-5 h-5" />}
          </button>

          <div className="flex-1 text-center">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
              {state.step === "area" && "Seleziona Area"}
              {state.step === "goal" && "Seleziona Obiettivo"}
              {state.step === "treatment" && "Seleziona Trattamento"}
              {state.step === "final" && "Scegli Servizio"}
            </div>
            {getBreadcrumb() && (
              <div className="text-xs text-white/60 capitalize">
                {getBreadcrumb()}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {/* Area Step */}
          {state.step === "area" && (
            <motion.div
              key="area"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
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
                  className="w-full p-5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-all duration-300 text-left"
                >
                  <div className="text-lg font-medium text-white mb-1">
                    {area.label}
                  </div>
                  {area.description && (
                    <div className="text-sm text-white/50">
                      {area.description}
                    </div>
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
              className="space-y-3"
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
                  className="w-full p-5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-all duration-300 text-left"
                >
                  <div className="text-lg font-medium text-white mb-1">
                    {goal.label}
                  </div>
                  {goal.description && (
                    <div className="text-sm text-white/50">
                      {goal.description}
                    </div>
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
              className="space-y-3"
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
                  className="w-full p-5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-all duration-300 text-left"
                >
                  <div className="text-lg font-medium text-white mb-1">
                    {treatment.label}
                  </div>
                  {treatment.description && (
                    <div className="text-sm text-white/50">
                      {treatment.description}
                    </div>
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
              className="space-y-3 pb-32"
            >
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    onUpdateState({ selectedService: service });
                  }}
                  className={`
                    w-full p-5 rounded-lg border transition-all duration-300 text-left
                    ${
                      state.selectedService?.id === service.id
                        ? "border-cyan-500/40 bg-white/5 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                    }
                  `}
                >
                  <div className="text-lg font-medium text-white mb-2">
                    {service.title}
                  </div>
                  {service.description && (
                    <div className="text-sm text-white/50 mb-3">
                      {service.description}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-white/40 mb-3">
                    <span>{service.durationMin} min</span>
                    {service.price && <span>€ {service.price}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-white/5 text-white/60 border border-white/10"
                      >
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
          className="sticky bottom-0 bg-black/95 backdrop-blur-lg border-t border-white/10 p-4"
        >
          <button
            onClick={onBookNow}
            className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300"
          >
            Prenota {state.selectedService.title}
          </button>
        </motion.div>
      )}
    </div>
  );
}
