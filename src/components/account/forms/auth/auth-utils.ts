type PayloadErrorResponse = {
  message?: unknown
  errors?: Array<{ message?: unknown }>
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
