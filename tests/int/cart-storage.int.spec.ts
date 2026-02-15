import { afterEach, describe, expect, it, vi } from 'vitest'

import { parseCartItems } from '@/lib/cartStorage'

describe('cartStorage.parseCartItems', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns empty cart for invalid JSON payload without throwing', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const parsed = parseCartItems('{invalid-json')

    expect(parsed).toEqual([])
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('keeps only valid items when payload is partially malformed', () => {
    const parsed = parseCartItems(
      JSON.stringify([
        { id: 'p-1', title: 'Prodotto A', quantity: 2, price: 12.5, currency: 'EUR' },
        { id: '', title: 'Invalid item', quantity: 1 },
        { id: 'p-2', title: 'Prodotto B', quantity: -7 },
      ]),
    )

    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toMatchObject({
      id: 'p-1',
      title: 'Prodotto A',
      quantity: 2,
      price: 12.5,
      currency: 'EUR',
    })
    expect(parsed[1]).toMatchObject({
      id: 'p-2',
      title: 'Prodotto B',
      quantity: 1,
    })
  })
})
