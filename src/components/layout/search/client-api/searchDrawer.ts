import type {
  LiveSearchResponse,
  SearchDrawerResponse,
} from '@/components/layout/search/shared/contracts'

const buildParams = (params: Record<string, string>) => new URLSearchParams(params).toString()

export const fetchSearchDrawerData = async ({
  locale,
  signal,
}: {
  locale: string
  signal: AbortSignal
}): Promise<SearchDrawerResponse | null> => {
  const response = await fetch(`/api/search/drawer?${buildParams({ locale })}`, { signal })
  const data = (await response.json()) as SearchDrawerResponse
  if (!response.ok || !data.ok) return null
  return data
}

export const fetchLiveSearchData = async ({
  locale,
  query,
  signal,
}: {
  locale: string
  query: string
  signal: AbortSignal
}): Promise<LiveSearchResponse | null> => {
  const response = await fetch(
    `/api/search/live?${buildParams({ locale, q: query })}`,
    { signal },
  )
  const data = (await response.json()) as LiveSearchResponse
  if (!response.ok || !data.ok) return null
  return data
}
