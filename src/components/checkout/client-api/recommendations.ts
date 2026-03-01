import type { RecommendedProduct } from '@/components/checkout/shared/contracts'

type RecommendationsResponse = {
  ok?: boolean
  docs?: RecommendedProduct[]
}

export const fetchCheckoutRecommendations = async ({
  seedProductId,
  locale,
  excludeIds,
  signal,
}: {
  seedProductId: number
  locale: string
  excludeIds: string[]
  signal: AbortSignal
}): Promise<RecommendedProduct[]> => {
  const params = new URLSearchParams({
    productId: String(seedProductId),
    locale,
    limit: '2',
    exclude: excludeIds.join(','),
  })

  const response = await fetch(`/api/shop/recommendations?${params.toString()}`, {
    signal,
  })

  const data = (await response.json()) as RecommendationsResponse
  if (!response.ok || !data.ok || !Array.isArray(data.docs)) return []
  return data.docs.slice(0, 2)
}
