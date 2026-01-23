'use client'

import { motion } from "framer-motion";
import type { Area } from "@/components/service-navigator/types/navigator";
import { useNavigatorData } from "@/components/service-navigator/data/navigator-data-context";
import { EmptyState } from "@/components/service-navigator/components/EmptyState";

interface ColumnAreaProps {
  selectedArea?: Area;
  onSelectArea: (area: Area) => void;
  onHoverArea?: (area: Area | undefined) => void;
}

export function ColumnArea({ selectedArea, onSelectArea, onHoverArea }: ColumnAreaProps) {
  const { getAreas } = useNavigatorData();
  const areas = getAreas();
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
          Area
        </h3>
      </div>

      <div className="space-y-3 p-1">
        {areas.length === 0 ? (
          <EmptyState
            title="Nessuna area disponibile"
            description="Aggiungi aree con obiettivi o trattamenti collegati."
          />
        ) : (
          areas.map((area) => {
            const isSelected = selectedArea === area.id;
            return (
              <motion.button
                key={area.id}
                onClick={() => onSelectArea(area.id)}
                onMouseEnter={() => onHoverArea?.(area.id)}
                onMouseLeave={() => onHoverArea?.(undefined)}
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

                <div className="relative">
                  <div className="text-left">
                    <div className="text-base font-medium text-white mb-1">
                      {area.label}
                    </div>
                    {area.description && (
                      <div className="text-sm text-white/50">
                        {area.description}
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
