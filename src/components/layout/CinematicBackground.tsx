import type { ComponentProps } from "react"

import { cn } from "@/lib/cn"
import styles from "./CinematicBackground.module.css"

type CinematicBackgroundProps = ComponentProps<"div">

export const CinematicBackground = ({ className, ...props }: CinematicBackgroundProps) => {
  return <div className={cn(styles.cinematic, className)} {...props} />
}
