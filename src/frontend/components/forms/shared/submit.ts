export const mapSubmitErrorToStatus = (error: unknown): 'error' => {
  if (error instanceof Error) {
    return 'error'
  }

  return 'error'
}
