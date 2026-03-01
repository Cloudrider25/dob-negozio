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
import type { LiveSearchOption } from '@/components/layout/search/shared/contracts'
import { useSearchDrawerData } from '@/components/layout/search/hooks/useSearchDrawerData'

export function SearchDrawer({ locale, initialOpen = false }: { locale: string; initialOpen?: boolean }) {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale
  const router = useRouter()
  const [open, setOpen] = useState(initialOpen)
  const [query, setQuery] = useState('')
  const {
    suggestions,
    recommendation,
    liveOptions,
    liveProductCount,
    liveServiceCount,
  } = useSearchDrawerData({
    open,
    query,
    locale: resolvedLocale,
  })

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
