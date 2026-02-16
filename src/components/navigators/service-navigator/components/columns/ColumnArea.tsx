import type { Area } from '@/components/navigators/service-navigator/types/navigator'
import { useNavigatorData } from '@/components/services/navigator-data-context'
import { EmptyState } from '@/components/navigators/service-navigator/components/EmptyState'
import { ColumnList } from '@/components/navigators/service-navigator/components/columns/ColumnList'

interface ColumnAreaProps {
  selectedArea?: Area;
  onSelectArea: (area: Area) => void;
  onHoverArea?: (area: Area | undefined) => void;
}

export function ColumnArea({ selectedArea, onSelectArea, onHoverArea }: ColumnAreaProps) {
  const { getAreas } = useNavigatorData()
  const areas = getAreas()

  return (
    <ColumnList
      title="Area"
      items={areas.map((area) => ({
        id: area.id,
        title: area.label,
        description: area.description,
        isSelected: selectedArea === area.id,
        onClick: () => onSelectArea(area.id),
        onHover: (active) => onHoverArea?.(active ? area.id : undefined),
      }))}
      emptyState={
        <EmptyState
          title="Nessuna area disponibile"
          description="Aggiungi aree con obiettivi o trattamenti collegati."
        />
      }
    />
  )
}
