export type ShopRouteParams = Promise<{ locale: string }>

export type ShopSearchParams = Promise<{
  q?: string
  brand?: string
  sort?: string
  perPage?: string
  page?: string
  view?: string
  section?: string
}>
