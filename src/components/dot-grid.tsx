import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const RGBA: [number, number, number, number] = [78, 90, 104, 0.15]
const SPACING = 16
const RADIUS = 1

export default function DotGrid({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const raf = requestAnimationFrame

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      let { width, height } = rect

      // adjust for resolution
      width = Math.floor(width * dpr)
      height = Math.floor(height * dpr)

      canvas.width = width
      canvas.height = height
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = `rgba(${RGBA.join(",")})`

      const cols = Math.ceil(width / SPACING) + 1
      const rows = Math.ceil(height / SPACING) + 1
      const offsetX = (width - (cols - 1) * SPACING) / 2
      const offsetY = (height - (rows - 1) * SPACING) / 2

      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          ctx.beginPath()
          ctx.arc(
            offsetX + ix * SPACING,
            offsetY + iy * SPACING,
            RADIUS,
            0,
            Math.PI * 2,
          )
          ctx.fill()
        }
      }
    }

    // initial draw
    raf(draw)

    // resize draws
    const ro = new ResizeObserver(() => raf(draw))
    ro.observe(canvas)

    return () => ro.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  )
}
