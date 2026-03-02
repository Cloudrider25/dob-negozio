import { cn } from '@/lib/shared/ui/cn'
import type { CheckoutCopy, CheckoutStep } from '@/frontend/page-domains/checkout/shared/contracts'
import styles from '@/frontend/page-domains/checkout/page/CheckoutClient.module.css'

type CheckoutStepHeaderProps = {
  activeStep: CheckoutStep
  copy: CheckoutCopy
}

export function CheckoutStepHeader({ activeStep, copy }: CheckoutStepHeaderProps) {
  return (
    <div className={styles.brand}>
      <p className={cn(styles.brandTitle, 'dob-font', 'typo-display-upper')}>dob</p>
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
