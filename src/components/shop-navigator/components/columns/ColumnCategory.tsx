import type { CategoryId, NeedId } from '@/components/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { EmptyState } from '@/components/shop-navigator/components/EmptyState'
import { ColumnList } from '@/components/shop-navigator/components/columns/ColumnList'

interface ColumnCategoryProps {
  needId: NeedId
  selectedCategory?: CategoryId
  onSelectCategory: (category: CategoryId) => void
  onHoverCategory?: (category: CategoryId | null) => void
}

export function ColumnCategory({
  needId,
  selectedCategory,
  onSelectCategory,
  onHoverCategory,
}: ColumnCategoryProps) {
  const { getCategoriesForNeed, getProductCount } = useShopNavigatorData()
  const categories = getCategoriesForNeed(needId)

  return (
    <ColumnList
      title="Categoria"
      items={categories.map((category) => ({
        id: category.id,
        title: category.label,
        description: category.boxTagline || category.description,
        isSelected: selectedCategory === category.id,
        onClick: () => onSelectCategory(category.id),
        onHover: (active) => onHoverCategory?.(active ? category.id : null),
        rightSlot: (
          <div className="text-sm text-text-muted">
            ({getProductCount({ needId, categoryId: category.id })})
          </div>
        ),
      }))}
      emptyState={
        <EmptyState
          title="Nessuna categoria disponibile"
          description="Collega prodotti a questa esigenza per mostrarli qui."
        />
      }
    />
  )
}
