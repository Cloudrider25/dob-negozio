'use client'

import type { ServiceBookingRow } from '../../types'
import { useServiceFilters } from './useServiceFilters'
import { useServiceScheduleMutations } from './useServiceScheduleMutations'

type UseAccountServicesArgs = {
  initialServiceRows: ServiceBookingRow[]
  locale: string
}

export function useAccountServices({ initialServiceRows, locale }: UseAccountServicesArgs) {
  const filters = useServiceFilters(initialServiceRows)
  const scheduleMutations = useServiceScheduleMutations({
    locale,
    mutateServiceRows: filters.mutateServiceRows,
  })

  return {
    ...filters,
    ...scheduleMutations,
  }
}
