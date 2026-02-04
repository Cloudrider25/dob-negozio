'use client'

import { motion } from "framer-motion";
import type { NavigatorState, Step } from "@/components/service-navigator/types/navigator";
import { useNavigatorData } from "@/components/service-navigator/data/navigator-data-context";
import { ChevronLeft } from "@/components/service-navigator/icons";
import { GlassCard } from "@/components/service-navigator/components/GlassCard";
import styles from "@/components/service-navigator/components/PathBreadcrumb.module.css";

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
      className={styles.wrapper}
    >
      <GlassCard className={styles.card} paddingClassName={styles.cardPadding}>
        {nodes.length > 0 ? (
          <div>
            <div className={styles.row}>
              {/* Pulsante Indietro */}
              <button
                onClick={onBack}
                className={styles.backButton}
              >
                <ChevronLeft className={styles.backIcon} />
                <span className={styles.backLabel}>Indietro</span>
              </button>
              
              {/* Connector line dopo il pulsante indietro */}
              <div className={styles.connector} />
              
              {nodes.map((node, index) => (
                <div key={index} className={styles.nodeWrap}>
                  {/* Node */}
                  <button
                    onClick={() => onNavigateToStep(node.step)}
                    className={styles.nodeButton}
                  >
                    <div className={styles.nodeDot} />
                    <span className={styles.nodeLabel}>{node.label}</span>
                  </button>

                  {/* Connector line */}
                  {index < nodes.length - 1 && (
                    <div className={styles.connector} />
                  )}
                </div>
              ))}
              
              {/* Messaggio guida inline se non completo */}
              {guideMessage !== "" && (
                <>
                  <div className={styles.connector} />
                  <span className={styles.guide}>{guideMessage}</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>{guideMessage}</p>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
