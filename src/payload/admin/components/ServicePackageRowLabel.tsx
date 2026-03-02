'use client'

import { useRowLabel } from '@payloadcms/ui'

type PackageRowData = {
  nomePacchetto?: string | null
  numeroSedute?: number | null
}

export default function ServicePackageRowLabel() {
  const { data, rowNumber } = useRowLabel<PackageRowData>()
  const fallback = `Pacchetto ${typeof rowNumber === 'number' ? rowNumber + 1 : ''}`.trim()

  if (typeof data?.nomePacchetto === 'string' && data.nomePacchetto.trim()) {
    return <span>{data.nomePacchetto}</span>
  }

  if (typeof data?.numeroSedute === 'number' && Number.isFinite(data.numeroSedute)) {
    return <span>{`Pacchetto ${data.numeroSedute} sedute`}</span>
  }

  return <span>{fallback}</span>
}
