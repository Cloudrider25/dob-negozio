'use client'

import { motion } from "framer-motion";
import type { NavigatorState, Step } from "@/components/service-navigator/types/navigator";
import { useNavigatorData } from "@/components/service-navigator/data/navigator-data-context";
import { ChevronLeft } from "@/components/service-navigator/icons";
import { GlassCard } from "@/components/service-navigator/components/GlassCard";

interface PathBreadcrumbProps {
  state: NavigatorState;
  onNavigateToStep: (step: Step) => void;
  onBack: () => void;
}

export function PathBreadcrumb({
  state,
  onNavigateToStep,
  onBack,
}: PathBreadcrumbProps) {
  const { getAreaById, getGoalById, getTreatmentById } = useNavigatorData();
  const { selectedArea, selectedGoal, selectedTreatment, selectedService } =
    state;

  const areaData = getAreaById(selectedArea);

  // Costruisci i nodi progressivamente in base alle selezioni
  const nodes: { label: string; step: Step; active: boolean }[] = [];
  
  // Aggiungi area se selezionata
  if (selectedArea && areaData) {
    nodes.push({ 
      label: areaData.label, 
      step: "area" as Step, 
      active: true 
    });
  }
  
  // Aggiungi goal se selezionato (solo per viso/corpo)
  if (selectedGoal) {
    nodes.push({ 
      label: getGoalById(selectedGoal)?.label || selectedGoal, 
      step: "goal" as Step, 
      active: true 
    });
  }
  
  // Aggiungi treatment se selezionato
  if (selectedTreatment) {
    nodes.push({ 
      label: getTreatmentById(selectedTreatment)?.label || selectedTreatment, 
      step: "treatment" as Step, 
      active: true 
    });
  }
  
  // Aggiungi service se selezionato
  if (selectedService) {
    nodes.push({ 
      label: selectedService.title, 
      step: "final" as Step, 
      active: true 
    });
  }

  // Determina il messaggio guida in base allo step corrente
  const getGuideMessage = () => {
    if (!selectedArea) {
      return "Seleziona un'area per iniziare la tua scelta";
    }
    if ((selectedArea === "viso" || selectedArea === "corpo") && !selectedGoal) {
      return "Scegli il tuo obiettivo per continuare";
    }
    if (!selectedTreatment) {
      return "Seleziona un trattamento";
    }
    if (!selectedService) {
      return "Scegli il servizio che preferisci";
    }
    return "";
  };

  const guideMessage = getGuideMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <GlassCard className="w-full min-h-[88px]" paddingClassName="p-6">
        {nodes.length > 0 ? (
          <div className="w-full">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Pulsante Indietro */}
              <button
                onClick={onBack}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4 text-accent-cyan" />
                <span className="text-sm text-text-primary">Indietro</span>
              </button>
              
              {/* Connector line dopo il pulsante indietro */}
              <div className="w-8 h-[2px] bg-gradient-to-r from-cyan-500/50 to-cyan-500/20" />
              
              {nodes.map((node, index) => (
                <div key={index} className="flex items-center gap-3">
                  {/* Node */}
                  <button
                    onClick={() => onNavigateToStep(node.step)}
                    className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke transition-all duration-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_color-mix(in_srgb,var(--tech-cyan)_60%,transparent)]" />
                    <span className="text-sm text-text-primary capitalize">{node.label}</span>
                  </button>

                  {/* Connector line */}
                  {index < nodes.length - 1 && (
                    <div className="w-8 h-[2px] bg-gradient-to-r from-cyan-500/50 to-cyan-500/20" />
                  )}
                </div>
              ))}
              
              {/* Messaggio guida inline se non completo */}
              {guideMessage !== "" && (
                <>
                  <div className="w-8 h-[2px] bg-gradient-to-r from-cyan-500/50 to-cyan-500/20" />
                  <span className="text-sm text-accent-cyan">
                    {guideMessage}
                  </span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center w-full">
            <p className="text-accent-cyan text-sm">
              {guideMessage}
            </p>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
