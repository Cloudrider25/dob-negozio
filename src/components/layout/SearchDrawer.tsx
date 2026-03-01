'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { MediaThumb } from '@/components/shared/MediaThumb'
import styles from './SearchDrawer.module.css'
import { SideDrawer } from '@/components/ui/SideDrawer'
import { defaultLocale, isLocale } from '@/lib/i18n'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media/thumbnail'
import { SEARCH_DRAWER_OPEN_EVENT } from '@/lib/searchDrawer'

type DrawerRecommendation = {
  type: 'product' | 'service'
  title: string
  subtitle: string
  href: string
  image: string | null
  cta: string
}

type SearchDrawerResponse = {
  ok?: boolean
  suggestions?: string[]
  recommendation?: DrawerRecommendation | null
}

type LiveSearchOption = {
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

type LiveSearchResponse = {
  ok?: boolean
  query?: string
  options?: LiveSearchOption[]
  productCount?: number
  serviceCount?: number
}

export function SearchDrawer({ locale, initialOpen = false }: { locale: string; initialOpen?: boolean }) {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale
  const router = useRouter()
  const [open, setOpen] = useState(initialOpen)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recommendation, setRecommendation] = useState<DrawerRecommendation | null>(null)
  const [liveOptions, setLiveOptions] = useState<LiveSearchOption[]>([])
  const [liveProductCount, setLiveProductCount] = useState(0)
  const [liveServiceCount, setLiveServiceCount] = useState(0)

  const labels = useMemo(
    () => ({
      title:
        resolvedLocale === 'it'
          ? 'Cerca'
          : resolvedLocale === 'ru'
            ? 'Поиск'
            : 'Search',
      placeholder:
        resolvedLocale === 'it'
          ? 'Cerca prodotti o servizi'
          : resolvedLocale === 'ru'
            ? 'Поиск товаров и услуг'
            : 'Search products or services',
      suggestionsTitle:
        resolvedLocale === 'it'
          ? 'Ricerche suggerite'
          : resolvedLocale === 'ru'
            ? 'Популярные запросы'
            : 'Suggested searches',
      typingTitle:
        resolvedLocale === 'it'
          ? 'Risultati ricerca'
          : resolvedLocale === 'ru'
            ? 'Результаты поиска'
            : 'Search results',
      minChars:
        resolvedLocale === 'it'
          ? 'Inserisci almeno 2 caratteri'
          : resolvedLocale === 'ru'
            ? 'Введите минимум 2 символа'
            : 'Type at least 2 characters',
    }),
    [resolvedLocale],
  )

  useEffect(() => {
    const openDrawer = () => setOpen(true)
    window.addEventListener(SEARCH_DRAWER_OPEN_EVENT, openDrawer)
    return () => window.removeEventListener(SEARCH_DRAWER_OPEN_EVENT, openDrawer)
  }, [])

  useEffect(() => {
    if (initialOpen) setOpen(true)
  }, [initialOpen])

  useEffect(() => {
    if (!open) return

    const controller = new AbortController()
    const params = new URLSearchParams({ locale: resolvedLocale })

    const run = async () => {
      try {
        const response = await fetch(`/api/search/drawer?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = (await response.json()) as SearchDrawerResponse
        if (!response.ok || !data.ok) return
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
  }, [open, resolvedLocale])

  useEffect(() => {
    if (!open) return
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setLiveOptions([])
      setLiveProductCount(0)
      setLiveServiceCount(0)
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({ locale: resolvedLocale, q: trimmed })

    const run = async () => {
      try {
        const response = await fetch(`/api/search/live?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = (await response.json()) as LiveSearchResponse
        if (!response.ok || !data.ok) return
        setLiveOptions(Array.isArray(data.options) ? data.options : [])
        setLiveProductCount(typeof data.productCount === 'number' ? data.productCount : 0)
        setLiveServiceCount(typeof data.serviceCount === 'number' ? data.serviceCount : 0)
      } catch {
        if (!controller.signal.aborted) {
          setLiveOptions([])
          setLiveProductCount(0)
          setLiveServiceCount(0)
        }
      }
    }

    void run()
    return () => controller.abort()
  }, [open, query, resolvedLocale])

  const visibleSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return suggestions
    return suggestions.filter((item) => item.toLowerCase().includes(q))
  }, [query, suggestions])

  const executeSearch = (term: string) => {
    const q = term.trim()
    if (!q) return
    setOpen(false)
    if (q.length >= 2 && liveServiceCount > 0 && liveProductCount === 0) {
      router.push(`/${resolvedLocale}/services?view=listino&q=${encodeURIComponent(q)}`)
      return
    }
    router.push(`/${resolvedLocale}/shop?section=shop-all&q=${encodeURIComponent(q)}`)
  }

  const executeOption = (option: LiveSearchOption) => {
    setOpen(false)
    router.push(option.href)
  }

  return (
    <SideDrawer open={open} onClose={() => setOpen(false)} ariaLabel="Search drawer" title={labels.title}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          executeSearch(query)
        }}
      >
        <input
          className={`${styles.searchBar} typo-small-upper`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={labels.placeholder}
          aria-label={labels.placeholder}
        />
      </form>

      <section className={styles.section}>
        <h2 className={`${styles.sectionTitle} typo-caption-upper`}>
          {query.trim().length >= 2 ? labels.typingTitle : labels.suggestionsTitle}
        </h2>
        {query.trim().length < 2 ? (
          <>
            {query.trim().length > 0 ? <div className={`${styles.sectionTitle} typo-caption`}>{labels.minChars}</div> : null}
            <div className={styles.suggestions}>
              {visibleSuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`${styles.suggestion} typo-caption-upper`}
                  onClick={() => executeSearch(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.liveResults}>
            {liveOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={styles.liveResult}
                onClick={() => executeOption(option)}
              >
                <div className="typo-small-upper">{option.label}</div>
                {option.subtitle ? <div className={`${styles.liveResultMeta} typo-caption`}>{option.subtitle}</div> : null}
                {Array.isArray(option.tags) && option.tags.length > 0 ? (
                  <div className={styles.liveTags}>
                    {option.tags.map((tag) => (
                      <span key={`${option.id}:${tag}`} className={`${styles.liveTag} typo-caption-upper`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </section>

      {recommendation ? (
        <div className={styles.recommendation}>
          <MediaThumb
            src={normalizeThumbnailSrc(recommendation.image)}
            alt={recommendation.title}
            sizes="52px"
            className={styles.recommendationThumb}
            imageClassName={styles.recommendationThumbImage}
            unoptimized={isRemoteThumbnailSrc(recommendation.image)}
          />
          <div className={styles.recommendationInfo}>
            <p className={`${styles.recommendationTitle} typo-caption-upper`}>{recommendation.title}</p>
            <div className={`${styles.recommendationMeta} typo-caption`}>{recommendation.subtitle}</div>
          </div>
          <Link className={`${styles.recommendationButton} typo-caption-upper`} href={recommendation.href} onClick={() => setOpen(false)}>
            {recommendation.cta}
          </Link>
        </div>
      ) : null}
    </SideDrawer>
  )
}
