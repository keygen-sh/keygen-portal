import { useState, useEffect } from "react"

interface DotsProps {
  color?: string
}

/**
 * Renders loading animation with three dots that fade in and out.
 *
 * @param {string} color - Optional color class for dots
 * @returns {JSX.Element}
 */
export default function Dots({ color = "bg-primary" }: DotsProps) {
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
        className={`h-2 w-2 rounded-full ${color} transition-opacity duration-500 ${
          visibleDot === 0 ? "opacity-100" : "opacity-20"
        }`}
      ></span>
      <span
        className={`h-2 w-2 rounded-full ${color} transition-opacity duration-500 ${
          visibleDot === 1 ? "opacity-100" : "opacity-20"
        }`}
      ></span>
      <span
        className={`h-2 w-2 rounded-full ${color} transition-opacity duration-500 ${
          visibleDot === 2 ? "opacity-100" : "opacity-20"
        }`}
      ></span>
    </div>
  )
}
