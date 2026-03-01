import { describe, expect, it } from 'vitest'

import { toConsultationSubmitPayload } from '@/components/forms/shared/payload'
import { toggleConcernSelection } from '@/components/forms/shared/state'

describe('forms domain payload', () => {
  it('sanitizes required and optional fields before submit', () => {
    const payload = toConsultationSubmitPayload({
      firstName: '  Mario  ',
      lastName: '  Rossi ',
      email: '  mario@example.com  ',
      phone: '  +39 333 0000000 ',
      skinType: '  ',
      concerns: [],
      message: '   ',
    })

    expect(payload).toEqual({
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario@example.com',
      phone: '+39 333 0000000',
      skinType: undefined,
      concerns: undefined,
      message: undefined,
    })
  })

  it('keeps optional fields when meaningful values are provided', () => {
    const payload = toConsultationSubmitPayload({
      firstName: 'Luca',
      lastName: 'Bianchi',
      email: 'luca@example.com',
      phone: '+39 320 1112222',
      skinType: 'mista',
      concerns: ['Acne', 'Pelle opaca'],
      message: 'Vorrei un check approfondito.',
    })

    expect(payload.skinType).toBe('mista')
    expect(payload.concerns).toEqual(['Acne', 'Pelle opaca'])
    expect(payload.message).toBe('Vorrei un check approfondito.')
  })
})

describe('forms concern selection', () => {
  it('adds concern when not selected and removes when already selected', () => {
    const added = toggleConcernSelection([], 'Acne')
    expect(added).toEqual(['Acne'])

    const removed = toggleConcernSelection(added, 'Acne')
    expect(removed).toEqual([])
  })

  it('preserves existing order while appending new concern', () => {
    const concerns = toggleConcernSelection(['Macchie', 'Rossore'], 'Acne')
    expect(concerns).toEqual(['Macchie', 'Rossore', 'Acne'])
  })
})
