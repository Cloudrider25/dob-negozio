import { describe, expect, it } from 'vitest'

import { createMutationQueue } from '@/components/account/hooks/addresses/mutationQueue'

describe('account address mutation queue', () => {
  it('serializes tasks even when scheduled concurrently', async () => {
    const enqueue = createMutationQueue()
    const events: string[] = []

    const first = enqueue(async () => {
      events.push('first:start')
      await new Promise((resolve) => setTimeout(resolve, 20))
      events.push('first:end')
      return 'first'
    })

    const second = enqueue(async () => {
      events.push('second:start')
      events.push('second:end')
      return 'second'
    })

    await Promise.all([first, second])

    expect(events).toEqual(['first:start', 'first:end', 'second:start', 'second:end'])
  })

  it('continues processing queue after a failed task', async () => {
    const enqueue = createMutationQueue()
    const events: string[] = []

    await expect(
      enqueue(async () => {
        events.push('failed:start')
        throw new Error('boom')
      }),
    ).rejects.toThrow('boom')

    await enqueue(async () => {
      events.push('after-failure:start')
      events.push('after-failure:end')
    })

    expect(events).toEqual(['failed:start', 'after-failure:start', 'after-failure:end'])
  })
})
