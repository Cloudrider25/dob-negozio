import { useEffect, useRef, useState } from 'react'

import {
  fetchLiveSearchData,
  fetchSearchDrawerData,
} from '@/components/layout/search/client-api/searchDrawer'
import type {
  DrawerRecommendation,
  LiveSearchOption,
} from '@/components/layout/search/shared/contracts'

type UseSearchDrawerDataParams = {
  open: boolean
  query: string
  locale: string
}

const EMPTY_LIVE_STATE = {
  options: [] as LiveSearchOption[],
  productCount: 0,
  serviceCount: 0,
}

export const useSearchDrawerData = ({
  open,
  query,
  locale,
}: UseSearchDrawerDataParams) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recommendation, setRecommendation] = useState<DrawerRecommendation | null>(null)
  const [liveOptions, setLiveOptions] = useState<LiveSearchOption[]>(EMPTY_LIVE_STATE.options)
  const [liveProductCount, setLiveProductCount] = useState(EMPTY_LIVE_STATE.productCount)
  const [liveServiceCount, setLiveServiceCount] = useState(EMPTY_LIVE_STATE.serviceCount)
  const liveRequestSeq = useRef(0)

  useEffect(() => {
    if (!open) return

    const controller = new AbortController()

    const run = async () => {
      try {
        const data = await fetchSearchDrawerData({ locale, signal: controller.signal })
        if (!data) return
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : [])
        setRecommendation(data.recommendation || null)
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([])
          setRecommendation(null)
        }
      }
    }

    void run()
    return () => controller.abort()
  }, [open, locale])

  useEffect(() => {
    if (!open) return
    const trimmedQuery = query.trim()
    if (trimmedQuery.length < 2) {
      setLiveOptions(EMPTY_LIVE_STATE.options)
      setLiveProductCount(EMPTY_LIVE_STATE.productCount)
      setLiveServiceCount(EMPTY_LIVE_STATE.serviceCount)
      return
    }

    const controller = new AbortController()
    const currentRequestSeq = liveRequestSeq.current + 1
    liveRequestSeq.current = currentRequestSeq

    const run = async () => {
      try {
        const data = await fetchLiveSearchData({
          locale,
          query: trimmedQuery,
          signal: controller.signal,
        })
        if (!data || liveRequestSeq.current !== currentRequestSeq) return
        setLiveOptions(Array.isArray(data.options) ? data.options : [])
        setLiveProductCount(typeof data.productCount === 'number' ? data.productCount : 0)
        setLiveServiceCount(typeof data.serviceCount === 'number' ? data.serviceCount : 0)
      } catch {
        if (!controller.signal.aborted && liveRequestSeq.current === currentRequestSeq) {
          setLiveOptions(EMPTY_LIVE_STATE.options)
          setLiveProductCount(EMPTY_LIVE_STATE.productCount)
          setLiveServiceCount(EMPTY_LIVE_STATE.serviceCount)
        }
      }
    }

    const debounceId = window.setTimeout(() => {
      void run()
    }, 180)

    return () => {
      controller.abort()
      window.clearTimeout(debounceId)
    }
  }, [open, query, locale])

  return {
    suggestions,
    recommendation,
    liveOptions,
    liveProductCount,
    liveServiceCount,
  }
}
