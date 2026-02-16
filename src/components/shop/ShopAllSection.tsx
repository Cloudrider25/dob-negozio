'use client'

import { UICCarouselCard } from '@/components/UIC_CarouselCard'
import type { ServicesCarouselItem } from '@/components/service-carousel/types'
import styles from './ShopAllSection.module.css'

export function ShopAllSection({ items }: { items: ServicesCarouselItem[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <UICCarouselCard key={`${item.title}-${index}`} item={item} />
        ))}
      </div>
    </section>
  )
}
