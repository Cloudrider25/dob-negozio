'use client'

import { useState } from 'react'

export type DetailAccordionItem = {
  id: string
  title: string
  body: React.ReactNode
  cta?: React.ReactNode
}

type DetailAccordionClassNames = {
  root: string
  item: string
  trigger: string
  icon: string
  panel: string
  cta: string
}

type DetailAccordionProps = {
  items: DetailAccordionItem[]
  classNames: DetailAccordionClassNames
  iconClassName?: string
}

export function DetailAccordion({ items, classNames, iconClassName }: DetailAccordionProps) {
  const [openId, setOpenId] = useState(items[0]?.id ?? '')

  return (
    <div className={classNames.root}>
      {items.map((item) => {
        const isOpen = item.id === openId
        return (
          <div key={item.id} className={classNames.item}>
            <button
              type="button"
              className={`${classNames.trigger} typo-caption-upper`}
              onClick={() => setOpenId(isOpen ? '' : item.id)}
              aria-expanded={isOpen}
            >
              <span>{item.title}</span>
              <span
                className={[classNames.icon, iconClassName].filter(Boolean).join(' ')}
              >
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div className={`${classNames.panel} typo-body`}>
                {item.body}
                {item.cta && <div className={classNames.cta}>{item.cta}</div>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
