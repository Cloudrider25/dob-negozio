import type { Area } from '@/components/service-navigator/types/navigator'
import { useNavigatorData } from '@/components/service-navigator/data/navigator-data-context'
import { EmptyState } from '@/components/service-navigator/components/EmptyState'
import { ColumnList } from '@/components/service-navigator/components/columns/ColumnList'

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
