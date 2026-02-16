import type { Goal, Area } from '@/components/navigators/service-navigator/types/navigator'
import { useNavigatorData } from '@/components/services/navigator-data-context'
import { EmptyState } from '@/components/navigators/service-navigator/components/EmptyState'
import { ColumnList } from '@/components/navigators/service-navigator/components/columns/ColumnList'

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
  const { getGoalsForArea } = useNavigatorData()
  const goals = getGoalsForArea(area)

  return (
    <ColumnList
      title="Obiettivo"
      items={goals.map((goal) => ({
        id: goal.id,
        title: goal.label,
        description: goal.description,
        isSelected: selectedGoal === goal.id,
        onClick: () => onSelectGoal(goal.id),
        onHover: (active) => onHoverGoal?.(active ? goal.id : null),
      }))}
      emptyState={
        <EmptyState
          title="Nessun obiettivo disponibile"
          description="Collega trattamenti a questa area per mostrarli qui."
        />
      }
    />
  )
}
