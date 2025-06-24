import { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

export default function MotionSlide({
  direction,
  duration = 0.25,
  offset = 80,
  className,
  children,
}: {
  direction: 1 | -1
  duration?: number
  offset?: number
  className?: string
  children: ReactNode
}) {
  const slide = {
    enter: (d: 1 | -1) => ({
      x: d * offset,
      opacity: 0,
      pointerEvents: "none" as const,
    }),
    center: {
      x: 0,
      opacity: 1,
      pointerEvents: "auto" as const,
    },
    exit: (d: 1 | -1) => ({
      x: d * -offset,
      opacity: 0,
      pointerEvents: "none" as const,
      transitionEnd: { display: "none" },
    }),
  }

  return (
    <div
      className={cn("grid overflow-hidden", className)}
      style={{ gridTemplate: "1fr / 1fr" }}
    >
      <AnimatePresence custom={direction} initial={false} mode="wait">
        <motion.div
          key={(children as any)?.key ?? "slide"}
          custom={direction}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
          style={{ gridArea: "1 / 1 / 2 / 2" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
