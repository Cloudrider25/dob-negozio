'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'

import { fetchAccountServiceRows } from '../../client-api/services'
import { SERVICES_PRIMARY_OPTIONS, SERVICES_SUB_OPTIONS } from '../../constants'
import type { ServiceBookingRow, ServicesFilter, ServicesSubFilter } from '../../types'
import {
  filterServiceRows,
  findLatestServicePurchasedRow,
  findNextServiceAppointmentRow,
  groupServices,
} from './services-domain'

export function useServiceFilters(initialServiceRows: ServiceBookingRow[]) {
  const [servicesFilter, setServicesFilter] = useState<ServicesFilter>('not_used')
  const [servicesSubFilter, setServicesSubFilter] = useState<ServicesSubFilter>('all')
  const [expandedPackageGroups, setExpandedPackageGroups] = useState<Record<string, boolean>>({})
  const [showAllServicesBookings, setShowAllServicesBookings] = useState(false)
  const [servicesFilterDrawerOpen, setServicesFilterDrawerOpen] = useState(false)

  const {
    data: serviceRowsState = initialServiceRows,
    mutate: mutateServiceRows,
  } = useSWR<ServiceBookingRow[]>('account:service-sessions', fetchAccountServiceRows, {
    fallbackData: initialServiceRows,
    revalidateOnFocus: false,
    errorRetryCount: 1,
    dedupingInterval: 60_000,
  })

  const serviceRowsFiltered = useMemo(
    () => filterServiceRows(serviceRowsState, servicesFilter, servicesSubFilter),
    [serviceRowsState, servicesFilter, servicesSubFilter],
  )

  const groupedServiceTableRows = useMemo(() => groupServices(serviceRowsFiltered), [serviceRowsFiltered])

  const servicesPrimaryLabel =
    SERVICES_PRIMARY_OPTIONS.find((option) => option.value === servicesFilter)?.label ??
    'Non usufruiti'
  const servicesSubLabel =
    SERVICES_SUB_OPTIONS.find((option) => option.value === servicesSubFilter)?.label ?? 'Tutti'
  const servicesCurrentFilterLabel =
    servicesFilter === 'not_used' && servicesSubFilter !== 'all'
      ? `${servicesPrimaryLabel} · ${servicesSubLabel}`
      : servicesPrimaryLabel

  const nextServiceAppointmentRow = useMemo(
    () => findNextServiceAppointmentRow(serviceRowsState),
    [serviceRowsState],
  )

  const latestServicePurchasedRow = useMemo(
    () => findLatestServicePurchasedRow(serviceRowsState),
    [serviceRowsState],
  )

  return {
    servicesFilter,
    setServicesFilter,
    servicesSubFilter,
    setServicesSubFilter,
    expandedPackageGroups,
    setExpandedPackageGroups,
    showAllServicesBookings,
    setShowAllServicesBookings,
    servicesFilterDrawerOpen,
    setServicesFilterDrawerOpen,
    serviceRowsState,
    serviceRowsFiltered,
    groupedServiceTableRows,
    servicesCurrentFilterLabel,
    nextServiceAppointmentRow,
    latestServicePurchasedRow,
    mutateServiceRows,
  }
}
