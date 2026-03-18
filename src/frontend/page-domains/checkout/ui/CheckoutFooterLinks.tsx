import Link from 'next/link'

import styles from '@/frontend/page-domains/checkout/page/CheckoutClient.module.css'
import { buildLocalizedSeoHref } from '@/lib/frontend/seo/routes'
import type { CheckoutCopy } from '@/frontend/page-domains/checkout/shared/contracts'
import type { Locale } from '@/lib/i18n/core'

type CheckoutFooterLinksProps = {
  locale: string
  copy: CheckoutCopy
}

export function CheckoutFooterLinks({ locale, copy }: CheckoutFooterLinksProps) {
  return (
    <div className={`${styles.footerLinks} typo-small`}>
      <Link href={buildLocalizedSeoHref(locale as Locale, '/refund')} className={styles.footerLink}>
        {copy.footer.refundPolicy}
      </Link>
      <Link href={buildLocalizedSeoHref(locale as Locale, '/shipping')} className={styles.footerLink}>
        {copy.footer.shipping}
      </Link>
      <Link href={buildLocalizedSeoHref(locale as Locale, '/privacy')} className={styles.footerLink}>
        {copy.footer.privacyPolicy}
      </Link>
      <Link href={buildLocalizedSeoHref(locale as Locale, '/terms')} className={styles.footerLink}>
        {copy.footer.termsOfService}
      </Link>
      <Link href={buildLocalizedSeoHref(locale as Locale, '/contact')} className={styles.footerLink}>
        {copy.footer.contact}
      </Link>
    </div>
  )
}
