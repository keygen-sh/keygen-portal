import { motion } from "motion/react"

interface MotionContentProps {
  className?: string
  children: React.ReactNode
}

export default function MotionContent({
  className,
  children,
}: MotionContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 0 }}
      transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
