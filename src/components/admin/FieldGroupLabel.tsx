import type { UIFieldServerComponent } from 'payload'

const FieldGroupLabel: UIFieldServerComponent = ({ field }) => {
  const label = typeof field?.label === 'string' ? field.label : 'Label'

  return (
    <div
      style={{
        margin: '0 0 0.4rem',
        fontSize: '1.4rem',
        fontWeight: 700,
        lineHeight: 1.2,
      }}
    >
      {label}
    </div>
  )
}

export default FieldGroupLabel
