'use client'

import { useState } from 'react'

import styles from './service-detail.module.css'

type FaqItem = {
  question: string
  answerHtml: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string>(items[0]?.question ?? '')

  return (
    <div className={styles.faqList}>
      {items.map((item) => {
        const isOpen = item.question === openId
        return (
          <div key={item.question} className={styles.faqItem}>
            <button
              type="button"
              className={styles.faqTrigger}
              onClick={() => setOpenId(isOpen ? '' : item.question)}
              aria-expanded={isOpen}
            >
              <span className={styles.faqQuestionRow}>
                <span>{item.question}</span>
                <span className={styles.faqIcon}>{isOpen ? '−' : '+'}</span>
              </span>
            </button>
            {isOpen && item.answerHtml ? (
              <div
                className={styles.faqAnswer}
                dangerouslySetInnerHTML={{ __html: item.answerHtml }}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
