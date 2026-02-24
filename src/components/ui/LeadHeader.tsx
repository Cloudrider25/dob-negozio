import type { ReactNode } from 'react'

import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { cn } from '@/lib/cn'
import styles from './LeadHeader.module.css'

type LeadHeaderProps = {
  title: ReactNode
  badge?: ReactNode
  description?: ReactNode
  between?: ReactNode
  className?: string
  titleRowClassName?: string
  badgeClassName?: string
  descriptionClassName?: string
}

export const LeadHeader = ({
  title,
  badge,
  description,
  between,
  className,
  titleRowClassName,
  badgeClassName,
  descriptionClassName,
}: LeadHeaderProps) => {
  return (
    <div className={cn(styles.root, className)}>
      <div className={cn(styles.titleRow, titleRowClassName)}>
        {title}
        {badge ? <span className={badgeClassName}>{badge}</span> : null}
      </div>
      {between ? <div className={styles.between}>{between}</div> : null}
      {description ? (
        <SectionSubtitle className={cn(styles.description, descriptionClassName)}>
          {description}
        </SectionSubtitle>
      ) : null}
    </div>
  )
}
