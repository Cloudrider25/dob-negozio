import type { ComponentProps } from "react"

import { cn } from "@/lib/cn"

export const Section = ({ className, ...props }: ComponentProps<"section">) => {
  return <section className={cn("py-16 md:py-24", className)} {...props} />
}
