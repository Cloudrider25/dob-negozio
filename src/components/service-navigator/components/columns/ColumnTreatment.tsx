'use client'

import { motion } from "framer-motion";
import type { Treatment, Area, Goal } from "@/components/service-navigator/types/navigator";
import { useNavigatorData } from "@/components/service-navigator/data/navigator-data-context";
import { EmptyState } from "@/components/service-navigator/components/EmptyState";

interface ColumnTreatmentProps {
  area: Area;
  goal?: Goal;
  selectedTreatment?: Treatment;
  onSelectTreatment: (treatment: Treatment) => void;
  onHoverTreatment?: (treatment: Treatment | null) => void;
}

export function ColumnTreatment({
  area,
  goal,
  selectedTreatment,
  onSelectTreatment,
  onHoverTreatment,
}: ColumnTreatmentProps) {
  const { getTreatmentsForArea, getServicesForTreatment } = useNavigatorData();
  const treatments = getTreatmentsForArea(area, goal);
  
  // Filtra solo i trattamenti che hanno servizi associati
  const treatmentsWithServices = treatments.filter(treatment => {
    const services = getServicesForTreatment(treatment.id, goal);
    return services.length > 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
    >
      <div className="mb-2">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
          Trattamento
        </h3>
      </div>

      <div className="space-y-3 p-1">
        {treatmentsWithServices.length === 0 ? (
          <EmptyState
            title="Nessun trattamento disponibile"
            description="Collega servizi a un trattamento per renderlo selezionabile."
          />
        ) : (
          treatmentsWithServices.map((treatment) => {
            const isSelected = selectedTreatment === treatment.id;
            return (
              <motion.button
                key={treatment.id}
                onClick={() => onSelectTreatment(treatment.id)}
                onMouseEnter={() => onHoverTreatment?.(treatment.id)}
                onMouseLeave={() => onHoverTreatment?.(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  group relative p-4 rounded-lg border transition-all duration-300
                  ${
                    isSelected
                      ? "bg-white/5 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                      : "bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-white/20"
                  }
                `}
              >
                {/* Glow effect on selected */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
                )}

                <div className="relative flex items-start justify-between gap-4">
                  <div className="text-left flex-1">
                    <div className="text-base font-medium text-white mb-1">
                      {treatment.label}
                    </div>
                    {treatment.description && (
                      <div className="text-sm text-white/50">
                        {treatment.description}
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  {treatment.badge && (
                    <div
                      className={`
                        shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
                        ${
                          treatment.badge.type === "best-seller"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                            : treatment.badge.type === "economico"
                            ? "bg-green-500/10 text-green-400 border border-green-500/30"
                            : treatment.badge.type === "duraturo"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : treatment.badge.type === "novita"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            : treatment.badge.type === "premium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-white/10 text-white/60 border border-white/20"
                        }
                      `}
                    >
                      {treatment.badge.label}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
