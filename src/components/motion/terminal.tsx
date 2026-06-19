import { useState, useEffect } from "react"
import { motion } from "motion/react"

type Phase = "waiting" | "typing" | "done"

interface MotionTerminalProps {
  text: string
  active: boolean
  blinkDuration?: number
  blinkEndCount?: number
  blinkStartCount?: number
}

// animates a string of text as if typed in a terminal
export default function MotionTerminal({
  text,
  active,
  blinkDuration = 0.5,
  blinkStartCount = 3,
  blinkEndCount = Infinity,
}: MotionTerminalProps): React.ReactNode {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  // hold before typing begins
  useEffect(() => {
    if (!active) {
      setCount(0)
      setStarted(false)
      return
    }

    const timer = setTimeout(
      () => setStarted(true),
      blinkDuration * blinkStartCount * 1000,
    )
    return () => clearTimeout(timer)
  }, [active, blinkDuration, blinkStartCount])

  // type one character at a time
  useEffect(() => {
    if (!active || !started) return
    if (count >= text.length) return

    const timer = setTimeout(() => setCount((c) => c + 1), 50)
    return () => clearTimeout(timer)
  }, [active, started, count, text])

  const done = count >= text.length
  const phase: Phase = !started ? "waiting" : done ? "done" : "typing"

  return (
    <p className="grid font-mono text-xs font-medium whitespace-pre select-none">
      <span className="invisible col-start-1 row-start-1" aria-hidden>
        {text}▋
      </span>
      <span className="col-start-1 row-start-1">
        <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
          {text.slice(0, count)}
        </span>
        <motion.span
          aria-hidden
          className="text-brand-primary"
          animate={
            !active || phase === "typing"
              ? { opacity: 1 }
              : { opacity: [1, 1, 0, 0] }
          }
          transition={
            !active || phase === "typing"
              ? { duration: 0 }
              : phase === "waiting"
                ? {
                    duration: blinkDuration,
                    times: [0, 0.5, 0.5, 1],
                    repeat: blinkStartCount - 1,
                    ease: "linear",
                  }
                : {
                    duration: blinkDuration,
                    times: [0, 0.5, 0.5, 1],
                    repeat: blinkEndCount,
                    ease: "linear",
                  }
          }
        >
          ▋
        </motion.span>
      </span>
    </p>
  )
}
