'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/service-navigator/components/GlassCard'
import styles from '@/components/service-navigator/components/columns/ColumnList.module.css'

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

export function ColumnList({ title, items, emptyState, scrollable = false }: ColumnListProps) {
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
          (emptyState ?? null)
        ) : (
          <div
            className={
              scrollable
                ? `${styles.items} ${styles.itemsScrollable}`
                : styles.items
            }
          >
            {items.map((item) => (
              <motion.button
                key={item.id}
                onClick={item.onClick}
                onMouseEnter={() => item.onHover?.(true)}
                onMouseLeave={() => item.onHover?.(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${styles.itemButton} ${item.className ?? ''}`}
              >
                <GlassCard className={styles.card} paddingClassName={styles.cardPadding}>
                  <div className={styles.itemContent}>
                    <div className={styles.itemText}>
                      <div className={styles.itemTitle}>{item.title}</div>
                      {item.description && (
                        <div className={styles.itemDescription}>{item.description}</div>
                      )}
                    </div>
                    {item.rightSlot}
                  </div>
                </GlassCard>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
