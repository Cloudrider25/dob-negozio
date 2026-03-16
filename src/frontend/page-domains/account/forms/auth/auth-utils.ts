type PayloadErrorResponse = {
  message?: unknown
  errors?: Array<{ message?: unknown; path?: unknown }>
  data?: {
    errors?: Array<{ message?: unknown; path?: unknown }>
  }
}

export const resolveInternalRedirect = (redirect: string | null, locale: string) => {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return `/${locale}`
  }

  return redirect
}

export const getAuthErrorMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object') {
    const record = payload as PayloadErrorResponse

    if (typeof record.message === 'string' && record.message.trim().length > 0) {
      return record.message
    }

    if (Array.isArray(record.errors) && typeof record.errors[0]?.message === 'string') {
      return record.errors[0].message
    }
  }

  return fallback
}

export type SignUpErrorFeedback = {
  title: string
  body: string
  suggestLogin: boolean
  suggestResetPassword: boolean
}

type SignUpFeedbackCopy = {
  duplicateEmailTitle: string
  duplicateEmailBody: string
  emailInvalidTitle: string
  passwordInvalidTitle: string
  genericTitle: string
}

const collectErrors = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return []
  const record = payload as PayloadErrorResponse
  const topLevel = Array.isArray(record.errors) ? record.errors : []
  const nested = Array.isArray(record.data?.errors) ? record.data.errors : []
  const wrappedNested = topLevel.flatMap((error) => {
    if (!error || typeof error !== 'object' || !('data' in error)) return []
    const data = error.data
    if (!data || typeof data !== 'object' || !('errors' in data) || !Array.isArray(data.errors)) return []
    return data.errors
  })
  return [...topLevel, ...nested, ...wrappedNested]
}

export const getSignUpErrorFeedback = (
  payload: unknown,
  fallback: string,
  copy: SignUpFeedbackCopy,
): SignUpErrorFeedback => {
  const errors = collectErrors(payload)
  const duplicateEmail = errors.some(
    (error) =>
      error &&
      typeof error === 'object' &&
      error.path === 'email' &&
      typeof error.message === 'string' &&
      (error.message === 'Value must be unique' ||
        error.message.includes('already registered')),
  )

  if (duplicateEmail) {
    return {
      title: copy.duplicateEmailTitle,
      body: copy.duplicateEmailBody,
      suggestLogin: true,
      suggestResetPassword: true,
    }
  }

  const message = getAuthErrorMessage(payload, fallback)

  if (typeof message === 'string' && message.toLowerCase().includes('email')) {
    return {
      title: copy.emailInvalidTitle,
      body: message,
      suggestLogin: false,
      suggestResetPassword: false,
    }
  }

  if (typeof message === 'string' && message.toLowerCase().includes('password')) {
    return {
      title: copy.passwordInvalidTitle,
      body: message,
      suggestLogin: false,
      suggestResetPassword: false,
    }
  }

  return {
    title: copy.genericTitle,
    body: message,
    suggestLogin: false,
    suggestResetPassword: false,
  }
}
