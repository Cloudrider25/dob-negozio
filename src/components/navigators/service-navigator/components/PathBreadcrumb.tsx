'use client'

import type { NavigatorState, Step } from '@/components/navigators/service-navigator/types/navigator'
import { useNavigatorData } from '@/components/navigators/service-navigator/data/navigator-data-context'
import { ChevronLeft } from '@/components/ui/icons'
import { PathBreadcrumbCore } from '@/components/navigators/core/PathBreadcrumb'
import styles from '@/components/navigators/core/PathBreadcrumb.module.css'

interface PathBreadcrumbProps {
  state: NavigatorState
  onNavigateToStep: (step: Step) => void
  onBack: () => void
}

export function PathBreadcrumb({ state, onNavigateToStep, onBack }: PathBreadcrumbProps) {
  const { getAreaById, getGoalById, getTreatmentById } = useNavigatorData()
  const { selectedArea, selectedGoal, selectedTreatment, selectedService } = state

  const nodes: Array<{ id: string; label: string; step: Step }> = []

  if (selectedArea) {
    const areaLabel = getAreaById(selectedArea)?.label
    if (areaLabel) {
      nodes.push({ id: `area-${selectedArea}`, label: areaLabel, step: 'area' })
    }
  }

  if (selectedGoal) {
    nodes.push({
      id: `goal-${selectedGoal}`,
      label: getGoalById(selectedGoal)?.label || selectedGoal,
      step: 'goal',
    })
  }

  if (selectedTreatment) {
    nodes.push({
      id: `treatment-${selectedTreatment}`,
      label: getTreatmentById(selectedTreatment)?.label || selectedTreatment,
      step: 'treatment',
    })
  }

  if (selectedService) {
    nodes.push({ id: `service-${selectedService.id}`, label: selectedService.title, step: 'final' })
  }

  const getGuideMessage = () => {
    if (!selectedArea) return "Seleziona un'area per iniziare la tua scelta"
    if ((selectedArea === 'viso' || selectedArea === 'corpo') && !selectedGoal) {
      return 'Scegli il tuo obiettivo per continuare'
    }
    if (!selectedTreatment) return 'Seleziona un trattamento'
    if (!selectedService) return 'Scegli il servizio che preferisci'
    return ''
  }

  return (
    <PathBreadcrumbCore
      nodes={nodes}
      guideMessage={getGuideMessage()}
      onNavigateToStep={onNavigateToStep}
      onBack={onBack}
      BackIcon={ChevronLeft}
      classNames={{
        root: styles.wrapper,
        row: styles.row,
        backButton: styles.backButton,
        backIcon: styles.backIcon,
        backLabel: styles.backLabel,
        connector: styles.connector,
        nodeWrap: styles.nodeWrap,
        nodeButton: styles.nodeButton,
        nodeDot: styles.nodeDot,
        nodeLabel: styles.nodeLabel,
        guide: styles.guide,
        empty: styles.empty,
        emptyText: styles.emptyText,
      }}
      renderContainer={(children) => (
        <div className={`${styles.breadcrumb} ${styles.card}`}>
          <div className={styles.cardPadding}>{children}</div>
        </div>
      )}
    />
  )
}
