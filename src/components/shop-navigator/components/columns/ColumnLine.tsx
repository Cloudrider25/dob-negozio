import type { CategoryId, LineId, NeedId, RoutineStepId } from '@/components/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { EmptyState } from '@/components/shop-navigator/components/EmptyState'
import { ColumnList } from '@/components/shop-navigator/components/columns/ColumnList'

interface ColumnLineProps {
  needId: NeedId
  categoryId: CategoryId
  routineStepId?: RoutineStepId
  selectedLine?: LineId
  onSelectLine: (line: LineId) => void
  onHoverLine?: (line: LineId | null) => void
}

export function ColumnLine({
  needId,
  categoryId,
  routineStepId,
  selectedLine,
  onSelectLine,
  onHoverLine,
}: ColumnLineProps) {
  const { getLinesForFilters, getProductCount } = useShopNavigatorData()
  const lines = getLinesForFilters({ needId, categoryId, routineStepId })

  return (
    <ColumnList
      title="Linea"
      items={lines.map((line) => ({
        id: line.id,
        title: line.label,
        description: line.boxTagline || line.description,
        isSelected: selectedLine === line.id,
        onClick: () => onSelectLine(line.id),
        onHover: (active) => onHoverLine?.(active ? line.id : null),
        rightSlot: (
          <div className="text-sm text-text-muted">
            ({getProductCount({ needId, categoryId, routineStepId, lineId: line.id })})
          </div>
        ),
      }))}
      emptyState={
        <EmptyState
          title="Nessuna linea disponibile"
          description="Collega linee ai prodotti per mostrarle qui."
        />
      }
    />
  )
}
