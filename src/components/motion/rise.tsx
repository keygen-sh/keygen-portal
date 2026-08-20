import { type ReactNode } from "react"

import { motion } from "motion/react"

interface MotionRiseProps {
  children: ReactNode
  className?: string
  duration?: number
  offset?: number
  delay?: number
}

export default function MotionRise({
  children,
  className,
  duration = 0.16,
  offset = 16,
  delay = 0,
}: MotionRiseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
