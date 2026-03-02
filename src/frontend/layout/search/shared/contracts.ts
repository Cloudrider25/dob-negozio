export type DrawerRecommendation = {
  type: 'product' | 'service'
  title: string
  subtitle: string
  href: string
  image: string | null
  cta: string
}

export type SearchDrawerResponse = {
  ok?: boolean
  suggestions?: string[]
  recommendation?: DrawerRecommendation | null
}

export type LiveSearchOption = {
  id: string
  kind:
    | 'service-detail'
    | 'service-list'
    | 'product-detail'
    | 'product-list'
    | 'brand-list'
    | 'line-list'
  label: string
  subtitle?: string
  href: string
  tags: string[]
}

export type LiveSearchResponse = {
  ok?: boolean
  query?: string
  options?: LiveSearchOption[]
  productCount?: number
  serviceCount?: number
}
