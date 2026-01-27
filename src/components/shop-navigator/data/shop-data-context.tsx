'use client'

import { createContext, useContext, useMemo } from 'react'

import type {
  CategoryData,
  CategoryId,
  LineData,
  LineId,
  NeedData,
  NeedId,
  ProductCard,
  RoutineStepData,
  RoutineStepId,
  TextureData,
  TextureId,
} from '@/components/shop-navigator/types/navigator'

export type ShopNavigatorData = {
  needs: NeedData[]
  categories: CategoryData[]
  routineSteps: RoutineStepData[]
  lines: LineData[]
  textures: TextureData[]
  products: ProductCard[]
}

export type ShopFilters = {
  needId?: NeedId
  categoryId?: CategoryId
  routineStepId?: RoutineStepId
  lineId?: LineId
  textureId?: TextureId
}

type ShopDataContextValue = {
  data: ShopNavigatorData
  getNeeds: () => NeedData[]
  getNeedById: (id?: NeedId) => NeedData | undefined
  getCategoriesForNeed: (needId: NeedId) => CategoryData[]
  getCategoryById: (id?: CategoryId) => CategoryData | undefined
  getRoutineStepsForFilters: (filters: ShopFilters) => RoutineStepData[]
  getRoutineStepById: (id?: RoutineStepId) => RoutineStepData | undefined
  getLinesForFilters: (filters: ShopFilters) => LineData[]
  getLineById: (id?: LineId) => LineData | undefined
  getTexturesForFilters: (filters: ShopFilters) => TextureData[]
  getTextureById: (id?: TextureId) => TextureData | undefined
  getProductsForFilters: (filters: ShopFilters) => ProductCard[]
  getProductCount: (filters: ShopFilters) => number
}

const ShopDataContext = createContext<ShopDataContextValue | null>(null)

const sortByOrder = <T extends { order?: number; label: string }>(items: T[]) =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label))

const toId = (value: unknown) => (value ? String(value) : undefined)

export function ShopNavigatorDataProvider({
  data,
  children,
}: {
  data: ShopNavigatorData
  children: React.ReactNode
}) {
  const value = useMemo<ShopDataContextValue>(() => {
    const categoriesByParent = new Map<string, CategoryData[]>()
    const categoriesById = new Map<string, CategoryData>()

    for (const category of data.categories) {
      categoriesById.set(category.id, category)
      const parentId = toId(category.parentId)
      if (!parentId) continue
      const list = categoriesByParent.get(parentId) ?? []
      list.push(category)
      categoriesByParent.set(parentId, list)
    }

    const categoryDescendants = new Map<string, Set<string>>()
    const categoryVisiting = new Set<string>()

    const buildDescendants = (id: string): Set<string> => {
      const cached = categoryDescendants.get(id)
      if (cached) return cached
      if (categoryVisiting.has(id)) {
        return new Set([id])
      }
      categoryVisiting.add(id)
      const descendants = new Set<string>()
      descendants.add(id)
      const children = categoriesByParent.get(id) ?? []
      for (const child of children) {
        buildDescendants(child.id).forEach((childId) => descendants.add(childId))
      }
      categoryVisiting.delete(id)
      categoryDescendants.set(id, descendants)
      return descendants
    }

    const productMatchesFilters = (product: ProductCard, filters: ShopFilters) => {
      if (filters.needId && !product.needIds.includes(filters.needId)) return false
      if (filters.categoryId) {
        const descendants = buildDescendants(filters.categoryId)
        const hasCategory = product.categoryIds.some((id) => descendants.has(id))
        if (!hasCategory) return false
      }
      if (filters.routineStepId && !product.routineStepIds.includes(filters.routineStepId)) return false
      if (filters.lineId && !product.lineIds.includes(filters.lineId)) return false
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

    const getCategoriesForNeed = (needId: NeedId) => {
      const eligible = data.categories.filter((category) =>
        getProductCount({ needId, categoryId: category.id }) > 0,
      )
      return sortByOrder(eligible)
    }

    const getCategoryById = (id?: CategoryId) => data.categories.find((category) => category.id === id)

    const getRoutineStepsForFilters = (filters: ShopFilters) => {
      const eligible = data.routineSteps.filter((step) =>
        getProductCount({ ...filters, routineStepId: step.id }) > 0,
      )
      return sortByOrder(eligible)
    }

    const getRoutineStepById = (id?: RoutineStepId) =>
      data.routineSteps.find((step) => step.id === id)

    const getLinesForFilters = (filters: ShopFilters) => {
      const eligible = data.lines.filter((line) =>
        getProductCount({ ...filters, lineId: line.id }) > 0,
      )
      return sortByOrder(eligible)
    }

    const getLineById = (id?: LineId) => data.lines.find((line) => line.id === id)

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
      getCategoriesForNeed,
      getCategoryById,
      getRoutineStepsForFilters,
      getRoutineStepById,
      getLinesForFilters,
      getLineById,
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
