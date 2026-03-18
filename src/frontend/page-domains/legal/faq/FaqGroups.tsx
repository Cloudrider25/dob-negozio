'use client'

import { useMemo, useState } from 'react'

import { FaqAccordion } from '@/frontend/components/ui/compositions/FaqAccordion'
import type { FaqGroup } from '@/lib/frontend/legal/faq'
import styles from './FaqPage.module.css'

type FaqGroupsProps = {
  groups: FaqGroup[]
}

export function FaqGroups({ groups }: FaqGroupsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const activeGroup = useMemo(() => groups[activeIndex] ?? groups[0] ?? null, [activeIndex, groups])
  if (!activeGroup) return null

  return (
    <section className={styles.faqPanel} aria-label="FAQ groups">
      <aside className={styles.groupNav}>
        <h2 className={`typo-h2 ${styles.groupNavTitle}`}>FAQ</h2>
        <div className={styles.groupTabs} role="tablist" aria-label="FAQ groups">
          {groups.map((group, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={`${group.label}-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.groupTab} ${isActive ? styles.groupTabActive : ''} typo-body-upper`}
                onClick={() => setActiveIndex(index)}
              >
                {group.label}
              </button>
            )
          })}
        </div>
      </aside>

      <div className={styles.groupContent}>
        <h2 className={`typo-h2 ${styles.groupTitle}`}>{activeGroup.title}</h2>
        <FaqAccordion items={activeGroup.items} />
      </div>
    </section>
  )
}
