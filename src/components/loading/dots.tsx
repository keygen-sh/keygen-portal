import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface DotsProps {
  color?: string
}

/**
 * Renders loading animation with three dots that fade in and out.
 */
export default function Dots({
  color = "bg-primary",
}: DotsProps): React.ReactElement {
  const [visibleDot, setVisibleDot] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleDot(1)
    }, 10)

    const interval = setInterval(() => {
      setVisibleDot((prev) => (prev + 1) % 3)
    }, 250)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="flex space-x-1">
      <span
        className={cn(
          "h-2 w-2 rounded-full transition-opacity duration-500",
          color,
          {
            "opacity-100": visibleDot === 0,
            "opacity-20": visibleDot !== 0,
          },
        )}
      ></span>
      <span
        className={cn(
          "h-2 w-2 rounded-full transition-opacity duration-500",
          color,
          {
            "opacity-100": visibleDot === 1,
            "opacity-20": visibleDot !== 1,
          },
        )}
      ></span>
      <span
        className={cn(
          "h-2 w-2 rounded-full transition-opacity duration-500",
          color,
          {
            "opacity-100": visibleDot === 2,
            "opacity-20": visibleDot !== 2,
          },
        )}
      ></span>
    </div>
  )
}
