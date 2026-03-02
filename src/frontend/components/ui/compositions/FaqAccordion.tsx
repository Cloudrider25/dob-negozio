'use client'

import { useState } from 'react'

import styles from './FaqAccordion.module.css'

export type FaqAccordionItem = {
  question: string
  answerHtml: string
}

type FaqAccordionProps = {
  items: FaqAccordionItem[]
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string>(items[0] ? 'faq-0' : '')

  return (
    <div className={styles.list}>
      {items.map((item, index) => {
        const itemId = `faq-${index}`
        const isOpen = itemId === openId
        return (
          <div key={itemId} className={`${styles.item} typo-body-upper`}>
            <button
              type="button"
              className={styles.trigger}
              onClick={() => setOpenId(isOpen ? '' : itemId)}
              aria-expanded={isOpen}
            >
              <span className={styles.questionRow}>
                <span>{item.question}</span>
                <span className={`${styles.icon} typo-body`}>{isOpen ? '−' : '+'}</span>
              </span>
            </button>
            {isOpen && item.answerHtml ? (
              <div
                className={`${styles.answer} typo-body`}
                dangerouslySetInnerHTML={{ __html: item.answerHtml }}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
