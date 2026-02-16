import type { NeedId, TextureId } from '@/components/navigators/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/navigators/shop-navigator/data/shop-data-context'
import { EmptyState } from '@/components/navigators/shop-navigator/components/EmptyState'
import { ColumnList } from '@/components/navigators/shop-navigator/components/columns/ColumnList'
import metaStyles from '@/components/navigators/shop-navigator/components/columns/column-meta.module.css'

interface ColumnTextureProps {
  needId: NeedId
  selectedTexture?: TextureId
  onSelectTexture: (texture: TextureId) => void
  onHoverTexture?: (texture: TextureId | null) => void
}

export function ColumnTexture({
  needId,
  selectedTexture,
  onSelectTexture,
  onHoverTexture,
}: ColumnTextureProps) {
  const { getTexturesForFilters, getProductCount } = useShopNavigatorData()
  const textures = getTexturesForFilters({ needId })

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
          <div className={metaStyles.count}>
            ({getProductCount({ needId, textureId: texture.id })})
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
