import type { NeedId } from '@/components/navigators/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/navigators/shop-navigator/data/shop-data-context'
import { EmptyState } from '@/components/navigators/shop-navigator/components/EmptyState'
import { ColumnList } from '@/components/navigators/shop-navigator/components/columns/ColumnList'
import metaStyles from '@/components/navigators/shop-navigator/components/columns/column-meta.module.css'

interface ColumnNeedProps {
  selectedNeed?: NeedId
  onSelectNeed: (need: NeedId) => void
  onHoverNeed?: (need: NeedId | undefined) => void
}

export function ColumnNeed({ selectedNeed, onSelectNeed, onHoverNeed }: ColumnNeedProps) {
  const { getNeeds, getProductCount } = useShopNavigatorData()
  const needs = getNeeds()

  return (
    <ColumnList
      title="Esigenza"
      items={needs.map((need) => ({
        id: need.id,
        title: need.label,
        description: need.boxTagline || need.description,
        isSelected: selectedNeed === need.id,
        onClick: () => onSelectNeed(need.id),
        onHover: (active) => onHoverNeed?.(active ? need.id : undefined),
        rightSlot: (
          <div className={metaStyles.count}>({getProductCount({ needId: need.id })})</div>
        ),
      }))}
      emptyState={
        <EmptyState
          title="Nessuna esigenza disponibile"
          description="Aggiungi prodotti con esigenze per mostrarle qui."
        />
      }
    />
  )
}
