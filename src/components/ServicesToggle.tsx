"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

type ServicesToggleProps = {
  currentType?: string
}

export const ServicesToggle = ({ currentType }: ServicesToggleProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateType = (value?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value) {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className="services-toggle" role="tablist" aria-label="Tipologia servizi">
      <button
        type="button"
        role="tab"
        aria-selected={!currentType}
        className={!currentType ? "active" : undefined}
        onClick={() => updateType()}
      >
        Tutti
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={currentType === "single"}
        className={currentType === "single" ? "active" : undefined}
        onClick={() => updateType("single")}
      >
        Singolo
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={currentType === "package"}
        className={currentType === "package" ? "active" : undefined}
        onClick={() => updateType("package")}
      >
        Pacchetto
      </button>
    </div>
  )
}
