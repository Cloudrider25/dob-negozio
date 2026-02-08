'use client'

import { ServiceCarouselCard } from '@/components/ServiceCarouselCard'
import type { ServicesCarouselItem } from '@/components/service-carousel/types'
import styles from './ShopAllSection.module.css'

export function ShopAllSection({ items }: { items: ServicesCarouselItem[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <ServiceCarouselCard key={`${item.title}-${index}`} item={item} />
        ))}
      </div>
    </section>
  )
}
