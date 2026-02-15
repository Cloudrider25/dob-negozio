'use client'

import { motion } from 'framer-motion'
import shared from './columns-shared.module.css'
import styles from './ColumnList.module.css'

type ColumnListItem = {
  id: string
  title: string
  description?: string
  isSelected?: boolean
  onClick: () => void
  onHover?: (active: boolean) => void
  rightSlot?: React.ReactNode
  className?: string
}

interface ColumnListProps {
  title: string
  items: ColumnListItem[]
  emptyState?: React.ReactNode
  scrollable?: boolean
}

export function ColumnList({
  title,
  items,
  emptyState,
  scrollable = false,
}: ColumnListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
      className={styles.column}
    >
      <div className={styles.heading}>
        <h3 className={styles.title}>{title}</h3>
      </div>

      <div className={scrollable ? styles.list : styles.listCompact}>
        {items.length === 0 ? (
          emptyState ?? null
        ) : (
          <div
            className={`${styles.items} ${scrollable ? styles.itemsScrollable : ''}`}
          >
            {items.map((item) => (
              <motion.button
                key={item.id}
                onClick={item.onClick}
                onMouseEnter={() => item.onHover?.(true)}
                onMouseLeave={() => item.onHover?.(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${styles.itemButton} ${shared.box} ${
                  item.isSelected ? styles.itemSelected : ''
                } ${item.className ?? ''}`}
              >
                <div className={styles.itemContent}>
                  <div className={styles.itemText}>
                    <div className={styles.itemTitle}>{item.title}</div>
                    {item.description && (
                      <div className={styles.itemDescription}>{item.description}</div>
                    )}
                  </div>
                  {item.rightSlot}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
