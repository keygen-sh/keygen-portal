import { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

type MotionSlideAxis = "x" | "y"

interface MotionSlideProps {
  direction: 1 | -1
  axis?: MotionSlideAxis
  duration?: number
  offset?: number
  className?: string
  children: ReactNode
}

export default function MotionSlide({
  direction,
  axis = "x",
  duration = 0.25,
  offset = 80,
  className,
  children,
}: MotionSlideProps): React.ReactElement {
  const translate = axis === "x" ? "translateX" : "translateY"

  const slide = {
    enter: (d: 1 | -1) => ({
      transform: `${translate}(${d * offset}px)`,
      opacity: 0,
    }),
    center: {
      transform: `${translate}(0px)`,
      opacity: 1,
      transitionEnd: { transform: "none" },
    },
    exit: (d: 1 | -1) => ({
      transform: `${translate}(${d * -offset}px)`,
      opacity: 0,
    }),
  }

  return (
    <div
      className={cn("grid overflow-hidden", className)}
      style={{ gridTemplate: "1fr / 1fr" }}
    >
      <AnimatePresence custom={direction} initial={false} mode="wait">
        <motion.div
          key={(children as React.ReactElement)?.key ?? "slide"}
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
