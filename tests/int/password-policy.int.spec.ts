import { describe, expect, it } from 'vitest'

import { getPasswordMissingRequirementKeys, getPasswordValidationFailureKey, isStrongPassword } from '@/lib/shared/auth/passwordPolicy'

describe('password policy', () => {
  it('accepts a valid strong password with digits', () => {
    expect(isStrongPassword('DobMilano!123')).toBe(true)
  })

  it('rejects passwords without digits', () => {
    expect(isStrongPassword('DobMilano!abc')).toBe(false)
    expect(getPasswordValidationFailureKey('DobMilano!abc')).toBe('digit')
  })

  it('returns all missing requirement keys in deterministic order', () => {
    expect(getPasswordMissingRequirementKeys('short')).toEqual([
      'minLength',
      'uppercase',
      'digit',
      'special',
    ])
  })
})
