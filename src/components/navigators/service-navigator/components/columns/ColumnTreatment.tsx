import type { Treatment, Area, Goal } from '@/components/navigators/service-navigator/types/navigator'
import { useNavigatorData } from '@/components/navigators/service-navigator/data/navigator-data-context'
import { EmptyState } from '@/components/navigators/service-navigator/components/EmptyState'
import { ColumnList } from '@/components/navigators/service-navigator/components/columns/ColumnList'

interface ColumnTreatmentProps {
  area: Area;
  goal?: Goal;
  selectedTreatment?: Treatment;
  onSelectTreatment: (treatment: Treatment) => void;
  onHoverTreatment?: (treatment: Treatment | null) => void;
}

export function ColumnTreatment({
  area,
  goal,
  selectedTreatment,
  onSelectTreatment,
  onHoverTreatment,
}: ColumnTreatmentProps) {
  const { getTreatmentsForArea, getServicesForTreatment } = useNavigatorData()
  const treatments = getTreatmentsForArea(area, goal);
  
  // Filtra solo i trattamenti che hanno servizi associati
  const treatmentsWithServices = treatments.filter(treatment => {
    const services = getServicesForTreatment(treatment.id, goal);
    return services.length > 0;
  });

  return (
    <ColumnList
      title="Trattamento"
      items={treatmentsWithServices.map((treatment) => ({
        id: treatment.id,
        title: treatment.label,
        description: treatment.description,
        isSelected: selectedTreatment === treatment.id,
        onClick: () => onSelectTreatment(treatment.id),
        onHover: (active) => onHoverTreatment?.(active ? treatment.id : null),
        rightSlot: treatment.badge ? (
          <div
            className={`
              shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
              ${
                treatment.badge.type === 'best-seller'
                  ? 'text-cyan-400 border border-cyan-500/30'
                  : treatment.badge.type === 'economico'
                  ? 'text-green-400 border border-green-500/30'
                  : treatment.badge.type === 'duraturo'
                  ? 'text-blue-400 border border-blue-500/30'
                  : treatment.badge.type === 'novita'
                  ? 'text-purple-400 border border-purple-500/30'
                  : treatment.badge.type === 'premium'
                  ? 'text-amber-400 border border-amber-500/30'
                  : 'text-text-muted border border-stroke'
              }
            `}
          >
            {treatment.badge.label}
          </div>
        ) : undefined,
      }))}
      emptyState={
        <EmptyState
          title="Nessun trattamento disponibile"
          description="Collega servizi a un trattamento per renderlo selezionabile."
        />
      }
    />
  )
}
