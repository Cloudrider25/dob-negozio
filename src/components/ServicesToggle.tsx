"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/cn"

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
    <div
      className="inline-flex items-center gap-2 rounded-full border border-stroke bg-paper p-1 backdrop-blur shadow-soft"
      role="tablist"
      aria-label="Tipologia servizi"
    >
      <button
        type="button"
        role="tab"
        aria-selected={!currentType}
        className={cn(
          "relative appearance-none rounded-full border-0 bg-transparent px-5 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary outline-none after:absolute after:left-4 after:right-4 after:bottom-1 after:h-[2px] after:bg-[var(--ui-accent)] after:opacity-0 after:transition",
          !currentType &&
            "text-text-primary after:opacity-100",
        )}
        onClick={() => updateType()}
      >
        Tutti
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={currentType === "single"}
        className={cn(
          "relative appearance-none rounded-full border-0 bg-transparent px-5 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary outline-none after:absolute after:left-4 after:right-4 after:bottom-1 after:h-[2px] after:bg-[var(--ui-accent)] after:opacity-0 after:transition",
          currentType === "single" &&
            "text-text-primary after:opacity-100",
        )}
        onClick={() => updateType("single")}
      >
        Singolo
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={currentType === "package"}
        className={cn(
          "relative appearance-none rounded-full border-0 bg-transparent px-5 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary outline-none after:absolute after:left-4 after:right-4 after:bottom-1 after:h-[2px] after:bg-[var(--ui-accent)] after:opacity-0 after:transition",
          currentType === "package" &&
            "text-text-primary after:opacity-100",
        )}
        onClick={() => updateType("package")}
      >
        Pacchetto
      </button>
    </div>
  )
}
