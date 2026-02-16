'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

import styles from './SectionSwitcher.module.css'

type SectionItem = {
  key: string
  label: ReactNode
}

type SectionAction = {
  key: string
  label: ReactNode
  active?: boolean
  onClick: () => void
}

export function SectionSwitcher({
  items,
  activeKey,
  onChange,
  actions = [],
}: {
  items: SectionItem[]
  activeKey: string
  onChange: (nextKey: string) => void
  actions?: SectionAction[]
}) {
  return (
    <section className={styles.pills}>
      {items.map((item) => (
        <Button
          key={item.key}
          kind="main"
          size="md"
          interactive
          aria-pressed={activeKey === item.key}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </Button>
      ))}
      {actions.map((action) => (
        <Button
          key={action.key}
          kind="main"
          size="md"
          interactive
          aria-pressed={action.active}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </section>
  )
}
