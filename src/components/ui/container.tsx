import type { ComponentProps } from "react"

import { cn } from "@/lib/cn"

export const Container = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn("mx-auto w-full max-w-[var(--container)] px-6 md:px-10 lg:px-[72px]", className)}
      {...props}
    />
  )
}
