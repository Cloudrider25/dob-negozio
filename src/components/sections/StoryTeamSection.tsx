import Image from 'next/image'

import styles from './StoryTeamSection.module.css'

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
        {title ? <h2 className={`${styles.title} typo-h2`}>{title}</h2> : null}
        {description ? <p className={`${styles.description} typo-body`}>{description}</p> : null}
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
                />
              ) : (
                <div className={styles.imagePlaceholder} />
              )}
            </div>
            {item.name ? <h3 className={`${styles.name} typo-h3-upper`}>{item.name}</h3> : null}
            {item.role ? <h4 className={`${styles.role} typo-body-lg`}>{item.role}</h4> : null}
            {item.bio ? <div className={`${styles.bio} typo-body`}>{item.bio}</div> : null}
          </article>
        ))}
      </div>
    </section>
  )
}
