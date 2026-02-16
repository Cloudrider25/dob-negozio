'use client'

import Image from 'next/image'
import { useState } from 'react'

import styles from './ValuesSection.module.css'
import { ButtonLink } from '@/components/ui/button-link'

export type ValuesSectionItem = {
  id: string
  label: string
  title: string
  ctaLabel?: string | null
  ctaHref?: string | null
}

type ValuesSectionProps = {
  items?: ValuesSectionItem[]
  media?: { url: string; alt?: string | null } | null
}

export const ValuesSection = ({ items, media }: ValuesSectionProps) => {
  const resolvedItems = items ?? []
  const [activeId, setActiveId] = useState<string>(resolvedItems[0]?.id ?? '')

  if (!resolvedItems.length) {
    return null
  }

  const active = resolvedItems.find((item) => item.id === activeId) ?? resolvedItems[0]

  return (
    <section className={styles.section} aria-label="Valori DOB">
      <div className={styles.card}>
        <div className={styles.contentTop}>
          <h2 className={styles.title}>{active.title}</h2>
          {active.ctaHref && active.ctaLabel ? (
            <ButtonLink href={active.ctaHref} className={styles.cta} kind="main" size="sm" interactive>
              {active.ctaLabel}
            </ButtonLink>
          ) : null}
        </div>
        <div className={styles.list}>
          {resolvedItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.listItem} ${activeId === item.id ? styles.listItemActive : ''}`}
              type="button"
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              onClick={() => setActiveId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.media}>
        <Image
          src={media?.url || '/media/hero_homepage_light.png'}
          alt={media?.alt || 'Texture DOB'}
          fill
          sizes="(max-width: 1024px) 100vw, 48vw"
        />
      </div>
    </section>
  )
}
