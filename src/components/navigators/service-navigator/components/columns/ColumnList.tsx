'use client'

import { GlassCard } from '@/components/navigators/service-navigator/components/GlassCard'
import { ColumnListCore, type ColumnListItemCore } from '@/components/navigators/core/ColumnList'
import styles from '@/components/navigators/service-navigator/components/columns/ColumnList.module.css'

type ColumnListItem = ColumnListItemCore

interface ColumnListProps {
  title: string
  items: ColumnListItem[]
  emptyState?: React.ReactNode
  scrollable?: boolean
}

export function ColumnList({ title, items, emptyState, scrollable = false }: ColumnListProps) {
  return (
    <ColumnListCore
      title={title}
      items={items}
      emptyState={emptyState}
      scrollable={scrollable}
      classNames={{
        column: styles.column,
        heading: styles.heading,
        title: styles.title,
        list: styles.list,
        listCompact: styles.listCompact,
        items: styles.items,
        itemsScrollable: styles.itemsScrollable,
        itemButton: styles.itemButton,
        itemContent: styles.itemContent,
        itemText: styles.itemText,
        itemTitle: styles.itemTitle,
        itemDescription: styles.itemDescription,
      }}
      renderItemShell={(content) => (
        <GlassCard className={styles.card} paddingClassName={styles.cardPadding}>
          {content}
        </GlassCard>
      )}
    />
  )
}
