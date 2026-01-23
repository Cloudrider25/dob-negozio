'use client'

import { motion } from "framer-motion";
import type { Goal, Area } from "@/components/service-navigator/types/navigator";
import { useNavigatorData } from "@/components/service-navigator/data/navigator-data-context";
import { EmptyState } from "@/components/service-navigator/components/EmptyState";

interface ColumnGoalProps {
  area: Area;
  selectedGoal?: Goal;
  onSelectGoal: (goal: Goal) => void;
  onHoverGoal?: (goal: Goal | null) => void;
}

export function ColumnGoal({
  area,
  selectedGoal,
  onSelectGoal,
  onHoverGoal,
}: ColumnGoalProps) {
  const { getGoalsForArea } = useNavigatorData();
  const goals = getGoalsForArea(area);

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
          Obiettivo
        </h3>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-1">
        {goals.length === 0 ? (
          <EmptyState
            title="Nessun obiettivo disponibile"
            description="Collega trattamenti a questa area per mostrarli qui."
          />
        ) : (
          goals.map((goal) => {
            const isSelected = selectedGoal === goal.id;
            return (
              <motion.button
                key={goal.id}
                onClick={() => onSelectGoal(goal.id)}
                onMouseEnter={() => onHoverGoal?.(goal.id)}
                onMouseLeave={() => onHoverGoal?.(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  group relative p-4 rounded-lg border transition-all duration-300 w-full
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
                      {goal.label}
                    </div>
                    {goal.description && (
                      <div className="text-sm text-white/50">
                        {goal.description}
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
