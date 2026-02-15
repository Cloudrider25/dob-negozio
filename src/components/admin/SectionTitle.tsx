import type { UIFieldServerComponent } from 'payload'

const SectionTitle: UIFieldServerComponent = ({ field }) => {
  const label = field?.label
  return (
    <div style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1.2rem' }}>
      {typeof label === 'string' ? label : 'Section'}
    </div>
  )
}

export default SectionTitle
