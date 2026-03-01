'use client'

import { ArrowPathIcon, CheckIcon, ClockIcon, MinusIcon } from '@heroicons/react/24/outline'

import { SchedulePill } from '../../shared/SchedulePill'
import type { ServiceBookingRow } from '../../types'

type ServiceDataPillProps = {
  servicesStyles: Record<string, string>
  row: ServiceBookingRow
  scheduleText: string
  interactive?: boolean
  onClick?: () => void
}

export function ServiceDataPill({
  servicesStyles,
  row,
  scheduleText,
  interactive = true,
  onClick,
}: ServiceDataPillProps) {
  const statusMeta =
    row.appointmentStatus === 'confirmed' || row.appointmentStatus === 'confirmed_by_customer'
      ? { Icon: CheckIcon, toneClass: servicesStyles.statusIconConfirmed, label: 'Confermato' }
      : row.appointmentStatus === 'alternative_proposed'
        ? {
            Icon: ArrowPathIcon,
            toneClass: servicesStyles.statusIconProposed,
            label: 'Alternativa proposta',
          }
        : row.appointmentMode === 'requested_slot' || row.appointmentStatus === 'pending'
          ? { Icon: ClockIcon, toneClass: servicesStyles.statusIconPending, label: 'Pending' }
          : { Icon: MinusIcon, toneClass: servicesStyles.statusIconEmpty, label: 'Da definire' }

  return (
    <SchedulePill
      classNames={{
        root: servicesStyles.inlineDataPill,
        interactive: servicesStyles.inlineDataPillButton,
        statusIcon: servicesStyles.inlineStatusIcon,
        statusTone: statusMeta.toneClass,
        divider: servicesStyles.inlineDataDivider,
        text: servicesStyles.inlineDataText,
        dot: servicesStyles.inlineDataDot,
        actionIcon: servicesStyles.inlinePillIconButton,
      }}
      scheduleText={scheduleText}
      statusLabel={statusMeta.label}
      StatusIcon={statusMeta.Icon}
      interactive={interactive}
      aria-label="Apri modifica data"
      title="Apri modifica data"
      onClick={onClick}
    />
  )
}
