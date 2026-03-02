import Image from 'next/image'

import styles from './StoryTeamSection.module.css'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'

export type StoryTeamItem = {
  name?: string | null
  role?: string | null
  bio?: string | null
  image?: { url: string; alt?: string | null } | null
}

type StoryTeamSectionProps = {
  title?: string | null
  description?: string | null
  items: StoryTeamItem[]
}

export const StoryTeamSection = ({ title, description, items }: StoryTeamSectionProps) => {
  if (!items.length && !title && !description) {
    return null
  }

  return (
    <section className={styles.section} aria-label={title || 'Meet the team'}>
      <div className={styles.header}>
        {title ? <SectionTitle as="h2" size="h2" className={styles.title}>{title}</SectionTitle> : null}
        {description ? <SectionSubtitle className={styles.description}>{description}</SectionSubtitle> : null}
      </div>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <article key={`${item.name || 'member'}-${index}`} className={styles.card}>
            <div className={styles.imageWrap}>
              {item.image?.url ? (
                <Image
                  src={item.image.url}
                  alt={item.image.alt || item.name || ''}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  loading="lazy"
                  fetchPriority="auto"
                />
              ) : (
                <div className={styles.imagePlaceholder} />
              )}
            </div>
            {item.name ? (
              <SectionTitle as="h3" size="h3" uppercase className={styles.name}>
                {item.name}
              </SectionTitle>
            ) : null}
            {item.role ? <SectionSubtitle as="p" size="body-lg" className={styles.role}>{item.role}</SectionSubtitle> : null}
            {item.bio ? <SectionSubtitle as="div" className={styles.bio}>{item.bio}</SectionSubtitle> : null}
          </article>
        ))}
      </div>
    </section>
  )
}
