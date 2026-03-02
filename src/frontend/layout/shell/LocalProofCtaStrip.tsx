import Link from 'next/link'

import styles from './LocalProofCtaStrip.module.css'

type LocalProofCtaStripProps = {
  locale: string
  addressDisplay?: string | null
  whatsappLink?: string
  phoneLink?: string
}

export const LocalProofCtaStrip = ({
  locale,
  addressDisplay,
  whatsappLink,
  phoneLink,
}: LocalProofCtaStripProps) => {
  const isItalian = locale === 'it'
  const fallbackHref = `/${locale}/contact`
  const primaryHref = whatsappLink || phoneLink || fallbackHref
  const primaryIsInternal = primaryHref.startsWith('/')
  const proofText =
    isItalian
      ? `Centro estetico a Milano${addressDisplay ? ` - ${addressDisplay}` : ''}`
      : `Beauty center in Milan${addressDisplay ? ` - ${addressDisplay}` : ''}`

  return (
    <section className={styles.wrap} aria-label={isItalian ? 'Prova locale e prenotazione' : 'Local proof and booking'}>
      <div className={styles.inner}>
        <p className={styles.proof}>{proofText}</p>
        <div className={styles.actions}>
          {primaryIsInternal ? (
            <Link href={primaryHref} className={styles.primary}>
              {isItalian ? 'Prenota consulenza' : 'Book consultation'}
            </Link>
          ) : (
            <a href={primaryHref} className={styles.primary}>
              {isItalian ? 'Prenota consulenza' : 'Book consultation'}
            </a>
          )}
          <Link href={fallbackHref} className={styles.secondary}>
            {isItalian ? 'Contattaci' : 'Contact us'}
          </Link>
        </div>
      </div>
    </section>
  )
}
