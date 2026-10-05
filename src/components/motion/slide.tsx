import { ReactNode, startTransition, useEffect, useState } from "react"
import {
  AnimatePresence,
  motion,
  useIsPresent,
  type Variants,
} from "motion/react"
import { cn } from "@/lib/utils"

type MotionSlideAxis = "x" | "y"

interface MotionSlideProps {
  direction: 1 | -1
  axis?: MotionSlideAxis
  duration?: number
  offset?: number
  prerender?: boolean
  className?: string
  children: ReactNode
}

interface MotionSlideItemProps {
  direction: 1 | -1
  variants: Variants
  duration: number
  waiting: boolean
  children: ReactNode
}

function MotionSlideItem({
  direction,
  variants,
  duration,
  waiting,
  children,
}: MotionSlideItemProps): React.ReactElement {
  const isPresent = useIsPresent()
  const [mounted, setMounted] = useState(!waiting)
  const [entered, setEntered] = useState(!waiting)

  if (mounted && !entered) {
    if (!isPresent) setMounted(false)
    else if (!waiting) setEntered(true)
  }

  useEffect(() => {
    if (!mounted && isPresent) startTransition(() => setMounted(true))
  }, [mounted, isPresent])

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate={entered ? "center" : "enter"}
      exit="exit"
      transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
      inert={!entered || !isPresent}
      style={{ gridArea: "1 / 1 / 2 / 2" }}
    >
      {mounted && children}
    </motion.div>
  )
}

export default function MotionSlide({
  direction,
  axis = "x",
  duration = 0.25,
  offset = 80,
  prerender = false,
  className,
  children,
}: MotionSlideProps): React.ReactElement {
  const key = (children as React.ReactElement)?.key ?? "slide"
  const [presentKey, setPresentKey] = useState(key)
  const [exiting, setExiting] = useState(false)

  if (prerender && presentKey !== key) {
    setPresentKey(key)
    setExiting(true)
  }

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
      <AnimatePresence
        custom={direction}
        initial={false}
        mode={prerender ? "sync" : "wait"}
        onExitComplete={() => setExiting(false)}
      >
        <MotionSlideItem
          key={key}
          direction={direction}
          variants={slide}
          duration={duration}
          waiting={exiting}
        >
          {children}
        </MotionSlideItem>
      </AnimatePresence>
    </div>
  )
}
