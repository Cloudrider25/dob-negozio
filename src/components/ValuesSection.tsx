 'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import styles from './ValuesSection.module.css'

export const ValuesSection = ({ locale }: { locale: string }) => {
  const items = [
    {
      id: 'mission',
      label: 'mission',
      title: 'Ridare equilibrio e forza alla pelle nel tempo.',
      body: 'Formule essenziali, risultati visibili e un approccio che rispetta la barriera cutanea.',
      ctaLabel: 'Scopri la mission',
      ctaHref: `/${locale}/our-story#mission`,
    },
    {
      id: 'philanthropy',
      label: 'philanthropy',
      title: 'Impegno reale, oltre il prodotto.',
      body: 'Supportiamo progetti e iniziative che promuovono benessere e consapevolezza.',
      ctaLabel: 'Scopri la philanthropy',
      ctaHref: `/${locale}/our-story#philanthropy`,
    },
    {
      id: 'sustainability',
      label: 'sustainability',
      title: 'Scelte responsabili, ogni giorno.',
      body: 'Packaging essenziale e ingredienti selezionati con attenzione.',
      ctaLabel: 'Scopri la sustainability',
      ctaHref: `/${locale}/our-story#sustainability`,
    },
  ] as const

  const [activeId, setActiveId] = useState<(typeof items)[number]['id']>(items[0].id)
  const active = items.find((item) => item.id === activeId) ?? items[0]

  return (
    <section className={styles.section} aria-label="Valori DOB">
      <div className={styles.card}>
        <p className={styles.kicker}>To RESTORE, PROTECT, and NURTURE</p>
        <h2 className={styles.title}>{active.title}</h2>
        <p className={styles.body}>{active.body}</p>
        <Link href={active.ctaHref} className={styles.cta}>
          {active.ctaLabel}
        </Link>
        <div className={styles.list}>
          {items.map((item) => (
            <button
              key={item.id}
              className={`${styles.listItem} ${
                activeId === item.id ? styles.listItemActive : ''
              }`}
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
          src="/media/hero_homepage_light.png"
          alt="Texture DOB"
          fill
          sizes="(max-width: 900px) 100vw, 48vw"
        />
      </div>
    </section>
  )
}
