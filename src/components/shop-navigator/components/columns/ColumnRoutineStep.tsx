import type { CategoryId, NeedId, RoutineStepId } from '@/components/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { EmptyState } from '@/components/shop-navigator/components/EmptyState'
import { ColumnList } from '@/components/shop-navigator/components/columns/ColumnList'

interface ColumnRoutineStepProps {
  needId: NeedId
  categoryId: CategoryId
  selectedRoutineStep?: RoutineStepId
  onSelectRoutineStep: (step: RoutineStepId) => void
  onHoverRoutineStep?: (step: RoutineStepId | null) => void
}

export function ColumnRoutineStep({
  needId,
  categoryId,
  selectedRoutineStep,
  onSelectRoutineStep,
  onHoverRoutineStep,
}: ColumnRoutineStepProps) {
  const { getRoutineStepsForFilters, getProductCount } = useShopNavigatorData()
  const steps = getRoutineStepsForFilters({ needId, categoryId })

  return (
    <ColumnList
      title="Routine"
      items={steps.map((step) => ({
        id: step.id,
        title: step.label,
        description: step.boxTagline || step.description,
        isSelected: selectedRoutineStep === step.id,
        onClick: () => onSelectRoutineStep(step.id),
        onHover: (active) => onHoverRoutineStep?.(active ? step.id : null),
        rightSlot: (
          <div className="text-sm text-text-muted">
            ({getProductCount({ needId, categoryId, routineStepId: step.id })})
          </div>
        ),
      }))}
      emptyState={
        <EmptyState
          title="Nessuno step disponibile"
          description="Collega routine ai prodotti per mostrarli qui."
        />
      }
    />
  )
}
