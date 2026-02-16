'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/navigators/service-navigator/components/GlassCard'
import { HoverCardTransition } from '@/components/navigators/core/HoverCardTransition'
import type { ReactNode } from 'react'

type HoverCardEntity = {
  id: string | number
  slug?: string
}

type HoverCardBaseClassNames = {
  wrapper: string
  card: string
  actions: string
  pill: string
  divider: string
}

type HoverCardBaseProps<T extends HoverCardEntity> = {
  item: T | null
  shouldSlideOut?: boolean
  onAnimationComplete?: () => void
  classNames: HoverCardBaseClassNames
  href: (current: T) => string
  initial?: { x?: number; opacity?: number }
  animate?: { x?: number; opacity?: number }
  exit?: { x?: number; opacity?: number }
  children: (current: T) => ReactNode
}

export function HoverCardBase<T extends HoverCardEntity>({
  item,
  shouldSlideOut = false,
  onAnimationComplete,
  classNames,
  href,
  initial,
  animate,
  exit,
  children,
}: HoverCardBaseProps<T>) {
  return (
    <HoverCardTransition
      value={item}
      shouldSlideOut={shouldSlideOut}
      onAnimationComplete={onAnimationComplete}
      className={classNames.wrapper}
      initial={initial}
      animate={animate}
      exit={exit}
    >
      {(current) => (
        <GlassCard className={`${classNames.card} service-hover-card`} paddingClassName="">
          {children(current)}

          <div className={classNames.actions}>
            <Link
              href={href(current)}
              className={`glass-pill ${classNames.pill}`}
              onClick={(event) => {
                if (!current.slug) event.preventDefault()
              }}
            >
              Scopri di più
            </Link>
          </div>

          <div className={classNames.divider} />
        </GlassCard>
      )}
    </HoverCardTransition>
  )
}
