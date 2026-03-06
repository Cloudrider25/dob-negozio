export const PASSWORD_MIN_LENGTH = 10
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/

export type PasswordRequirementKey = 'minLength' | 'lowercase' | 'uppercase' | 'digit' | 'special'

export const isStrongPassword = (password: string) =>
  password.length >= PASSWORD_MIN_LENGTH && PASSWORD_REGEX.test(password)

const passwordRequirementChecks: Array<{
  key: PasswordRequirementKey
  met: (password: string) => boolean
}> = [
  {
    key: 'minLength',
    met: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    key: 'lowercase',
    met: (password) => /[a-z]/.test(password),
  },
  {
    key: 'uppercase',
    met: (password) => /[A-Z]/.test(password),
  },
  {
    key: 'digit',
    met: (password) => /[0-9]/.test(password),
  },
  {
    key: 'special',
    met: (password) => /[^A-Za-z0-9]/.test(password),
  },
]

export const getPasswordMissingRequirementKeys = (password: string): PasswordRequirementKey[] =>
  passwordRequirementChecks.filter((requirement) => !requirement.met(password)).map((requirement) => requirement.key)

export const getPasswordValidationFailureKey = (password: string): PasswordRequirementKey | null =>
  getPasswordMissingRequirementKeys(password)[0] ?? null
