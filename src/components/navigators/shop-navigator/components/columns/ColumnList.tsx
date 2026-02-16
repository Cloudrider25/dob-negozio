'use client'

import shared from './columns-shared.module.css'
import styles from './ColumnList.module.css'
import { ColumnListCore, type ColumnListItemCore } from '@/components/navigators/core/ColumnList'

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
      itemButtonExtraClassName={shared.box}
      classNames={{
        column: styles.column,
        heading: styles.heading,
        title: styles.title,
        list: styles.list,
        listCompact: styles.listCompact,
        items: styles.items,
        itemsScrollable: styles.itemsScrollable,
        itemButton: styles.itemButton,
        itemSelected: styles.itemSelected,
        itemContent: styles.itemContent,
        itemText: styles.itemText,
        itemTitle: styles.itemTitle,
        itemDescription: styles.itemDescription,
      }}
    />
  )
}
