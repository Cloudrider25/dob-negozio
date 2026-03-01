import styles from './ConsultationForm.module.css'

type SubmitStateProps = {
  submitStatus: 'idle' | 'success' | 'error'
  submitSuccessMessage: string
  submitErrorMessage: string
}

export function SubmitState({
  submitStatus,
  submitSuccessMessage,
  submitErrorMessage,
}: SubmitStateProps) {
  if (submitStatus === 'success') {
    return <p className={`${styles.submitSuccess} typo-small`}>{submitSuccessMessage}</p>
  }

  if (submitStatus === 'error') {
    return <p className={`${styles.submitError} typo-small`}>{submitErrorMessage}</p>
  }

  return null
}
