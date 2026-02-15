'use client'

import { createContext, useContext, useMemo } from 'react'

import type {
  NeedData,
  NeedId,
  ProductCard,
  TextureData,
  TextureId,
} from '@/components/shop-navigator/types/navigator'

export type ShopNavigatorData = {
  needs: NeedData[]
  textures: TextureData[]
  products: ProductCard[]
}

export type ShopFilters = {
  needId?: NeedId
  textureId?: TextureId
}

type ShopDataContextValue = {
  data: ShopNavigatorData
  getNeeds: () => NeedData[]
  getNeedById: (id?: NeedId) => NeedData | undefined
  getTexturesForFilters: (filters: ShopFilters) => TextureData[]
  getTextureById: (id?: TextureId) => TextureData | undefined
  getProductsForFilters: (filters: ShopFilters) => ProductCard[]
  getProductCount: (filters: ShopFilters) => number
}

const ShopDataContext = createContext<ShopDataContextValue | null>(null)

const sortByOrder = <T extends { order?: number; label: string }>(items: T[]) =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label))

export function ShopNavigatorDataProvider({
  data,
  children,
}: {
  data: ShopNavigatorData
  children: React.ReactNode
}) {
  const value = useMemo<ShopDataContextValue>(() => {
    const productMatchesFilters = (product: ProductCard, filters: ShopFilters) => {
      if (filters.needId && !product.needIds.includes(filters.needId)) return false
      if (filters.textureId && !product.textureIds.includes(filters.textureId)) return false
      return true
    }

    const getProductsForFilters = (filters: ShopFilters) =>
      data.products.filter((product) => productMatchesFilters(product, filters))

    const getProductCount = (filters: ShopFilters) => getProductsForFilters(filters).length

    const getNeeds = () => {
      const eligible = data.needs.filter((need) => getProductCount({ needId: need.id }) > 0)
      return sortByOrder(eligible)
    }
    const getNeedById = (id?: NeedId) => data.needs.find((need) => need.id === id)

    const getTexturesForFilters = (filters: ShopFilters) => {
      const eligible = data.textures.filter((texture) =>
        getProductCount({ ...filters, textureId: texture.id }) > 0,
      )
      return sortByOrder(eligible)
    }

    const getTextureById = (id?: TextureId) => data.textures.find((texture) => texture.id === id)

    return {
      data,
      getNeeds,
      getNeedById,
      getTexturesForFilters,
      getTextureById,
      getProductsForFilters,
      getProductCount,
    }
  }, [data])

  return <ShopDataContext.Provider value={value}>{children}</ShopDataContext.Provider>
}

export function useShopNavigatorData() {
  const ctx = useContext(ShopDataContext)
  if (!ctx) {
    throw new Error('useShopNavigatorData must be used within ShopNavigatorDataProvider')
  }
  return ctx
}
