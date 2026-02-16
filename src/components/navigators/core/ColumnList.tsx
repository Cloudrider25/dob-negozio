'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export type ColumnListItemCore = {
  id: string
  title: string
  description?: string
  isSelected?: boolean
  onClick: () => void
  onHover?: (active: boolean) => void
  rightSlot?: ReactNode
  className?: string
}

type ColumnListClassNames = {
  column: string
  heading: string
  title: string
  list: string
  listCompact: string
  items: string
  itemsScrollable?: string
  itemButton: string
  itemContent: string
  itemText: string
  itemTitle: string
  itemDescription: string
  itemSelected?: string
}

type ColumnListProps = {
  title: string
  items: ColumnListItemCore[]
  emptyState?: ReactNode
  scrollable?: boolean
  classNames: ColumnListClassNames
  itemButtonExtraClassName?: string
  renderItemShell?: (content: ReactNode, item: ColumnListItemCore) => ReactNode
}

const joinClassNames = (...classNames: Array<string | undefined>) => classNames.filter(Boolean).join(' ')

export function ColumnListCore({
  title,
  items,
  emptyState,
  scrollable = false,
  classNames,
  itemButtonExtraClassName,
  renderItemShell,
}: ColumnListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
      className={classNames.column}
    >
      <div className={classNames.heading}>
        <h3 className={classNames.title}>{title}</h3>
      </div>

      <div className={scrollable ? classNames.list : classNames.listCompact}>
        {items.length === 0 ? (
          emptyState ?? null
        ) : (
          <div
            className={joinClassNames(
              classNames.items,
              scrollable ? classNames.itemsScrollable : undefined,
            )}
          >
            {items.map((item) => {
              const itemContent = (
                <div className={classNames.itemContent}>
                  <div className={classNames.itemText}>
                    <div className={classNames.itemTitle}>{item.title}</div>
                    {item.description && <div className={classNames.itemDescription}>{item.description}</div>}
                  </div>
                  {item.rightSlot}
                </div>
              )
              return (
                <motion.button
                  key={item.id}
                  onClick={item.onClick}
                  onMouseEnter={() => item.onHover?.(true)}
                  onMouseLeave={() => item.onHover?.(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={joinClassNames(
                    classNames.itemButton,
                    itemButtonExtraClassName,
                    item.isSelected ? classNames.itemSelected : undefined,
                    item.className,
                  )}
                >
                  {renderItemShell ? renderItemShell(itemContent, item) : itemContent}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
