import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MenuLink } from '@/components/layout/header/MenuLink'
import { useSearchDrawerData } from '@/components/layout/search/hooks/useSearchDrawerData'
import {
  fetchLiveSearchData,
  fetchSearchDrawerData,
} from '@/components/layout/search/client-api/searchDrawer'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string
    children: ReactNode
    className?: string
    onClick?: () => void
  }) =>
    createElement(
      'button',
      { type: 'button', className, onClick, 'data-href': href },
      children,
    ),
}))

vi.mock('@/components/layout/search/client-api/searchDrawer', () => ({
  fetchSearchDrawerData: vi.fn(),
  fetchLiveSearchData: vi.fn(),
}))

describe('layout menu link navigation callback', () => {
  it('calls onNavigate for internal links', () => {
    const onNavigate = vi.fn()
    render(createElement(MenuLink, { href: '/it/shop', onNavigate, children: 'Shop' }))

    fireEvent.click(document.querySelector('button[data-href="/it/shop"]') as HTMLButtonElement)
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it('calls onNavigate for external links', () => {
    const onNavigate = vi.fn()
    render(
      createElement(
        MenuLink,
        { href: '#external', external: true, onNavigate, children: 'External' },
      ),
    )

    fireEvent.click(document.querySelector('a[href="#external"]') as HTMLAnchorElement)
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })
})

describe('useSearchDrawerData', () => {
  beforeEach(() => {
    vi.mocked(fetchSearchDrawerData).mockReset()
    vi.mocked(fetchLiveSearchData).mockReset()
  })

  it('loads suggestions/recommendation when drawer opens', async () => {
    vi.mocked(fetchSearchDrawerData).mockResolvedValue({
      ok: true,
      suggestions: ['kit', 'cleanser'],
      recommendation: {
        type: 'product',
        title: 'Kit',
        subtitle: 'Top',
        href: '/it/shop/kit',
        image: null,
        cta: 'Scopri',
      },
    })

    const { result } = renderHook(() =>
      useSearchDrawerData({
        open: true,
        query: '',
        locale: 'it',
      }),
    )

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(['kit', 'cleanser'])
      expect(result.current.recommendation?.title).toBe('Kit')
    })
  })

  it('debounces live search and resets state when query is shorter than 2 chars', async () => {
    vi.useFakeTimers()
    vi.mocked(fetchSearchDrawerData).mockResolvedValue({
      ok: true,
      suggestions: [],
      recommendation: null,
    })
    vi.mocked(fetchLiveSearchData).mockResolvedValue({
      ok: true,
      query: 'kit',
      options: [
        {
          id: '1',
          kind: 'product-list',
          label: 'Kit',
          href: '/it/shop?section=shop-all&q=kit',
          tags: ['prodotto'],
        },
      ],
      productCount: 1,
      serviceCount: 0,
    })

    const { result, rerender } = renderHook(
      ({ query }) =>
        useSearchDrawerData({
          open: true,
          query,
          locale: 'it',
        }),
      {
        initialProps: { query: 'kit' },
      },
    )

    expect(fetchLiveSearchData).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(180)
      await Promise.resolve()
    })
    expect(fetchLiveSearchData).toHaveBeenCalledTimes(1)
    expect(result.current.liveOptions).toHaveLength(1)
    expect(result.current.liveProductCount).toBe(1)
    expect(result.current.liveServiceCount).toBe(0)

    rerender({ query: 'k' })
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.liveOptions).toEqual([])
    expect(result.current.liveProductCount).toBe(0)
    expect(result.current.liveServiceCount).toBe(0)
    vi.useRealTimers()
  })
})
