export class ApiClientError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

export async function parseApiError(response: Response, fallbackMessage: string) {
  const data = (await response.json().catch(() => ({}))) as {
    error?: string
    message?: string
    errors?: Array<{ message?: string }>
  }

  return (
    data.error ||
    data.message ||
    data.errors?.find((entry) => typeof entry?.message === 'string')?.message ||
    fallbackMessage
  )
}

export const toErrorMessage = (error: unknown, fallbackMessage: string) =>
  error instanceof Error ? error.message : fallbackMessage
