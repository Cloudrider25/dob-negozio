"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { SectionSwitcher } from "@/components/sections/SectionSwitcher"

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

  const activeKey = currentType === "single" || currentType === "package" ? currentType : "all"

  return (
    <SectionSwitcher
      items={[
        { key: "all", label: "Tutti" },
        { key: "single", label: "Singolo" },
        { key: "package", label: "Pacchetto" },
      ]}
      activeKey={activeKey}
      onChange={(nextKey) => {
        if (nextKey === "all") {
          updateType()
          return
        }
        if (nextKey === "single" || nextKey === "package") {
          updateType(nextKey)
        }
      }}
    />
  )
}
