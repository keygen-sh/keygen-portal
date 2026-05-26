import type { ReactElement, ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

type MotionTextProps = {
  value: ReactNode
  hoverValue?: ReactNode
  hovered: boolean
  wrap?: boolean
  className?: string
}

export default function MotionText({
  value,
  hoverValue,
  hovered,
  wrap = false,
  className,
}: MotionTextProps): ReactElement {
  const active = hovered && hoverValue != null

  return (
    <motion.span
      className={cn(
        "inline-flex cursor-default align-middle select-text",
        wrap ? "min-w-0 overflow-visible" : "overflow-hidden",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={active ? "hover" : "value"}
          className={cn(
            "items-center",
            wrap
              ? "inline min-w-0 whitespace-normal"
              : "inline whitespace-nowrap",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.2 },
          }}
        >
          {active ? hoverValue : value}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}
