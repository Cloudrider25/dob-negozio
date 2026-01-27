export type NeedId = string
export type CategoryId = string
export type RoutineStepId = string
export type LineId = string
export type TextureId = string
export type ProductId = string

export type Step = 'need' | 'category' | 'routine' | 'line' | 'texture' | 'products'

export type MediaRef = {
  url: string
  alt?: string | null
  mimeType?: string | null
}

export type TaxonomyBase = {
  id: string
  label: string
  description?: string
  slug?: string
  order?: number
  boxTagline?: string
  cardTitle?: string
  cardTagline?: string
  cardMedia?: MediaRef | null
}

export type NeedData = TaxonomyBase

export type CategoryData = TaxonomyBase & {
  parentId?: string
  isMakeupRoot?: boolean
}

export type RoutineStepData = TaxonomyBase
export type LineData = TaxonomyBase
export type TextureData = TaxonomyBase

export type ProductCard = {
  id: ProductId
  title: string
  slug?: string
  price?: number
  currency?: string
  brand?: string
  coverImage?: MediaRef | null
  images?: MediaRef[]
  needIds: NeedId[]
  categoryIds: CategoryId[]
  routineStepIds: RoutineStepId[]
  lineIds: LineId[]
  textureIds: TextureId[]
  createdAt?: string
}

export type NavigatorState = {
  step: Step
  selectedNeed?: NeedId
  selectedCategory?: CategoryId
  selectedRoutineStep?: RoutineStepId
  selectedLine?: LineId
  selectedTexture?: TextureId
  selectedProduct?: ProductCard
}
