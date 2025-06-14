import { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

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
    enter: (d: 1 | -1) => ({ x: d * offset, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: 1 | -1) => ({ x: d * -offset, opacity: 0 }),
  }

  return (
    <div
      className={className ? `overflow-hidden ${className}` : "overflow-hidden"}
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
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
