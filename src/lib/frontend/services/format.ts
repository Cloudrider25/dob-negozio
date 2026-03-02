type FormatCurrencyOptions<TInvalid> = {
  locale?: string
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  invalidValue?: TInvalid
}

export const formatServicePrice = <TInvalid = null>(
  value?: number | null,
  options?: FormatCurrencyOptions<TInvalid>,
) => {
  const invalidValue = (options?.invalidValue ?? null) as TInvalid
  if (typeof value !== 'number' || Number.isNaN(value)) return invalidValue

  const formatter = new Intl.NumberFormat(options?.locale ?? 'it-IT', {
    style: 'currency',
    currency: options?.currency ?? 'EUR',
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits,
  })

  return formatter.format(value)
}

export const formatServiceDuration = <TInvalid = undefined>(
  minutes?: number | null,
  invalidValue?: TInvalid,
) => {
  if (typeof minutes !== 'number' || Number.isNaN(minutes) || minutes <= 0) {
    return invalidValue as TInvalid
  }
  return `${minutes} min`
}
