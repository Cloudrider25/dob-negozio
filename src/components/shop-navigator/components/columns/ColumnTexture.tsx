import type {
  CategoryId,
  LineId,
  NeedId,
  RoutineStepId,
  TextureId,
} from '@/components/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { EmptyState } from '@/components/shop-navigator/components/EmptyState'
import { ColumnList } from '@/components/shop-navigator/components/columns/ColumnList'

interface ColumnTextureProps {
  needId: NeedId
  categoryId: CategoryId
  routineStepId?: RoutineStepId
  lineId?: LineId
  selectedTexture?: TextureId
  onSelectTexture: (texture: TextureId) => void
  onHoverTexture?: (texture: TextureId | null) => void
}

export function ColumnTexture({
  needId,
  categoryId,
  routineStepId,
  lineId,
  selectedTexture,
  onSelectTexture,
  onHoverTexture,
}: ColumnTextureProps) {
  const { getTexturesForFilters, getProductCount } = useShopNavigatorData()
  const textures = getTexturesForFilters({ needId, categoryId, routineStepId, lineId })

  return (
    <ColumnList
      title="Texture"
      items={textures.map((texture) => ({
        id: texture.id,
        title: texture.label,
        description: texture.boxTagline || texture.description,
        isSelected: selectedTexture === texture.id,
        onClick: () => onSelectTexture(texture.id),
        onHover: (active) => onHoverTexture?.(active ? texture.id : null),
        rightSlot: (
          <div className="text-sm text-text-muted">
            ({getProductCount({ needId, categoryId, routineStepId, lineId, textureId: texture.id })})
          </div>
        ),
      }))}
      emptyState={
        <EmptyState
          title="Nessuna texture disponibile"
          description="Collega texture ai prodotti per mostrarle qui."
        />
      }
    />
  )
}
