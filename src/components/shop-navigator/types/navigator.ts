export type NeedId = string
export type TextureId = string
export type ProductId = string

export type Step = 'need' | 'texture' | 'products'

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

export type TextureData = TaxonomyBase

export type ProductCard = {
  id: ProductId
  title: string
  description?: string
  slug?: string
  price?: number
  currency?: string
  brand?: string
  coverImage?: MediaRef | null
  images?: MediaRef[]
  needIds: NeedId[]
  textureIds: TextureId[]
  createdAt?: string
}

export type NavigatorState = {
  step: Step
  selectedNeed?: NeedId
  selectedTexture?: TextureId
  selectedProduct?: ProductCard
}
