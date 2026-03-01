'use client'

import { useState } from 'react'

import styles from '@/components/pages/frontend/service-detail/ServiceDetailPage.module.css'

type AccordionItem = {
  id: string
  title: string
  body: React.ReactNode
  cta?: React.ReactNode
}

export function ServiceAccordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState(items[0]?.id ?? '')

  return (
    <div className={styles.accordion}>
      {items.map((item) => {
        const isOpen = item.id === openId
        return (
          <div key={item.id} className={styles.accordionItem}>
            <button
              type="button"
              className={`${styles.accordionTrigger} typo-caption-upper`}
              onClick={() => setOpenId(isOpen ? '' : item.id)}
              aria-expanded={isOpen}
            >
              <span>{item.title}</span>
              <span className={`${styles.accordionIcon} typo-body`}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className={`${styles.accordionPanel} typo-body`}>
                {item.body}
                {item.cta && <div className={styles.accordionCta}>{item.cta}</div>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
