import { PencilSquareIcon } from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'

type SchedulePillClassNames = {
  root: string
  interactive: string
  statusIcon: string
  statusTone: string
  divider: string
  text: string
  dot: string
  actionIcon: string
}

type SchedulePillProps = {
  classNames: SchedulePillClassNames
  scheduleText: string
  statusLabel: string
  StatusIcon: ComponentType<SVGProps<SVGSVGElement>>
  interactive?: boolean
  ariaLabel?: string
  title?: string
  onClick?: () => void
}

export function SchedulePill({
  classNames,
  scheduleText,
  statusLabel,
  StatusIcon,
  interactive = true,
  ariaLabel,
  title,
  onClick,
}: SchedulePillProps) {
  const [datePart, timePart = ''] = scheduleText.split(' · ')
  const sharedClass = `${classNames.root} ${interactive ? classNames.interactive : ''} typo-small-upper`

  const content = (
    <>
      <span
        className={`${classNames.statusIcon} ${classNames.statusTone}`}
        aria-label={statusLabel}
        title={statusLabel}
      >
        <StatusIcon width={18} height={18} aria-hidden="true" />
      </span>
      <span className={classNames.divider} aria-hidden="true" />
      <span className={classNames.text}>
        <span>{datePart}</span>
        {timePart ? (
          <>
            <span className={classNames.dot} aria-hidden="true">
              ·
            </span>
            <span>{timePart}</span>
          </>
        ) : null}
      </span>
      <span className={classNames.divider} aria-hidden="true" />
      <span className={classNames.actionIcon} aria-hidden="true">
        <PencilSquareIcon width={16} height={16} aria-hidden="true" />
      </span>
    </>
  )

  if (!interactive) {
    return <span className={sharedClass}>{content}</span>
  }

  return (
    <button type="button" className={sharedClass} aria-label={ariaLabel} title={title} onClick={onClick}>
      {content}
    </button>
  )
}
