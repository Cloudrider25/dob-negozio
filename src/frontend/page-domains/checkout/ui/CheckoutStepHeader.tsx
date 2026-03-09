import type { ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/shared/ui/cn'
import type { CheckoutCopy, CheckoutStep } from '@/frontend/page-domains/checkout/shared/contracts'
import styles from '@/frontend/page-domains/checkout/page/CheckoutClient.module.css'

type CheckoutStepHeaderProps = {
  activeStep: CheckoutStep
  copy: CheckoutCopy
  mobileSummary?: ReactNode
}

export function CheckoutStepHeader({ activeStep, copy, mobileSummary }: CheckoutStepHeaderProps) {
  return (
    <div className={styles.brand}>
      <div className={styles.brandLockup}>
        <span className={styles.brandMark}>
          <Image
            className={styles.logoDark}
            src="/brand/logo-black.png"
            alt=""
            width={54}
            height={54}
            priority
          />
          <Image
            className={styles.logoLight}
            src="/brand/logo-white.png"
            alt=""
            width={54}
            height={54}
            priority
          />
        </span>
        <p className={cn(styles.brandTitle, 'dob-font', 'typo-display-upper')}>DOB</p>
      </div>
      {mobileSummary}
      <div className={cn(styles.steps, 'typo-caption-upper')}>
        <span className={styles.stepItem}>{copy.stepper.cart}</span>
        <span className={styles.stepSeparator}>›</span>
        <span
          className={cn(
            styles.stepItem,
            activeStep === 'information' ? styles.stepItemActive : styles.stepItemDone,
          )}
        >
          {copy.stepper.information}
        </span>
        <span className={styles.stepSeparator}>›</span>
        <span
          className={cn(
            styles.stepItem,
            activeStep === 'shipping' && styles.stepItemActive,
            activeStep === 'payment' && styles.stepItemDone,
          )}
        >
          {copy.stepper.shipping}
        </span>
        <span className={styles.stepSeparator}>›</span>
        <span className={cn(styles.stepItem, activeStep === 'payment' && styles.stepItemActive)}>
          {copy.stepper.payment}
        </span>
      </div>
    </div>
  )
}
