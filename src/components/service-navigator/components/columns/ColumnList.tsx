'use client'

import { motion } from 'framer-motion'

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
      className="navigator-column"
    >
      <div className="mb-1">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          {title}
        </h3>
      </div>

      <div
        className={scrollable ? 'overflow-visible' : 'space-y-3'}
      >
        {items.length === 0 ? (
          emptyState ?? null
        ) : (
          <div
            className={
              scrollable
                ? 'space-y-3 max-h-[600px] overflow-y-auto overflow-x-visible pr-1'
                : 'space-y-3'
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
                className={`group relative p-4 rounded-lg transition-all duration-300 w-full min-h-[120px] ${item.className ?? ''} navigator-box`}
              >
                <div className="relative flex items-start justify-between gap-4">
                  <div className="text-left flex-1">
                    <div className="text-base font-medium text-text-primary mb-1">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-sm text-text-muted">{item.description}</div>
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
