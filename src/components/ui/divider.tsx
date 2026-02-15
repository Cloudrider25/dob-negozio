import type { ComponentProps } from "react"

import { cn } from "@/lib/cn"

export const Divider = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cn("h-px w-full bg-[color:var(--stroke)]", className)} {...props} />
}
