import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"

interface MotionResizeProps {
  layoutKey: string
  className?: string
  children: React.ReactNode
}

export default function MotionResize({
  layoutKey,
  className,
  children,
}: MotionResizeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | "auto">("auto")

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setHeight(entry.contentRect.height)
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      animate={{ height }}
      transition={{ duration: 0.15, ease: [0.42, 0, 0.58, 1] }}
      className={cn("overflow-hidden", className)}
    >
      <div ref={ref}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={layoutKey}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.1, delay: 0.15 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
