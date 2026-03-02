import Link from 'next/link'

import styles from '@/frontend/page-domains/checkout/page/CheckoutClient.module.css'
import type { CheckoutCopy } from '@/frontend/page-domains/checkout/shared/contracts'

type CheckoutFooterLinksProps = {
  locale: string
  copy: CheckoutCopy
}

export function CheckoutFooterLinks({ locale, copy }: CheckoutFooterLinksProps) {
  return (
    <div className={`${styles.footerLinks} typo-small`}>
      <Link href={`/${locale}/refund`} className={styles.footerLink}>
        {copy.footer.refundPolicy}
      </Link>
      <Link href={`/${locale}/shipping`} className={styles.footerLink}>
        {copy.footer.shipping}
      </Link>
      <Link href={`/${locale}/privacy`} className={styles.footerLink}>
        {copy.footer.privacyPolicy}
      </Link>
      <Link href={`/${locale}/terms`} className={styles.footerLink}>
        {copy.footer.termsOfService}
      </Link>
      <Link href={`/${locale}/contact`} className={styles.footerLink}>
        {copy.footer.contact}
      </Link>
    </div>
  )
}
