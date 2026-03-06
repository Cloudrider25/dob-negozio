import { describe, expect, it } from 'vitest'

import { getSignUpErrorFeedback } from '@/frontend/page-domains/account/forms/auth/auth-utils'

const feedbackCopy = {
  duplicateEmailTitle: 'Questa email è già registrata',
  duplicateEmailBody: 'Puoi accedere con questo account oppure reimpostare la password se non la ricordi.',
  emailInvalidTitle: 'Controlla il campo email',
  passwordInvalidTitle: 'La password non è valida',
  genericTitle: 'Registrazione non completata',
}

describe('auth utils', () => {
  it('maps duplicate email validation to an explicit signup message', () => {
    const result = getSignUpErrorFeedback(
      {
        errors: [
          {
            data: {
              errors: [{ path: 'email', message: 'A user with the given email is already registered.' }],
            },
            message: 'The following field is invalid: email',
          },
        ],
      },
      'fallback',
      feedbackCopy,
    )

    expect(result.title).toBe('Questa email è già registrata')
    expect(result.suggestLogin).toBe(true)
    expect(result.suggestResetPassword).toBe(true)
  })

  it('maps password-related errors to a password-specific title', () => {
    const result = getSignUpErrorFeedback(
      {
        message: 'La password deve contenere almeno un numero.',
      },
      'fallback',
      feedbackCopy,
    )

    expect(result.title).toBe('La password non è valida')
    expect(result.body).toContain('numero')
  })
})
