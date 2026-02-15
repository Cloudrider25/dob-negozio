import type { DocumentViewServerProps } from 'payload'
import { RoutineTemplateBuilderClient } from './RoutineTemplateBuilderClient'

export default function RoutineTemplateBuilder(props: DocumentViewServerProps) {
  const id = props.id ? String(props.id) : undefined
  const locale = props.locale ? String(props.locale) : undefined
  return <RoutineTemplateBuilderClient id={id} locale={locale} />
}
