import { useCallback, useEffect, useRef, useState } from "react"

interface Pos {
  x: number
  y: number
}

export interface CursorFollowTooltip<T> {
  active: T | null
  tooltipRef: React.RefObject<HTMLDivElement | null>
  currentPos: Pos
  open: (item: T, event: React.MouseEvent) => void
  openAt: (item: T, pos: Pos) => void
  move: (event: React.MouseEvent) => void
  close: () => void
  closeNow: () => void
}

export function useCursorFollowTooltip<T>({
  paused = false,
  disabled = false,
  lingerMs = 100,
}: {
  paused?: boolean
  disabled?: boolean
  lingerMs?: number
} = {}): CursorFollowTooltip<T> {
  const [active, setActive] = useState<T | null>(null)
  const activeRef = useRef<T | null>(null)

  const targetPosRef = useRef<Pos>({ x: 0, y: 0 })
  const currentPosRef = useRef<Pos>({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const lingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const clearLinger = useCallback(() => {
    if (lingerTimerRef.current) {
      clearTimeout(lingerTimerRef.current)
      lingerTimerRef.current = null
    }
  }, [])

  const closeNow = useCallback(() => {
    clearLinger()
    activeRef.current = null
    setActive(null)
  }, [clearLinger])

  const close = useCallback(() => {
    clearLinger()
    lingerTimerRef.current = setTimeout(closeNow, lingerMs)
  }, [clearLinger, closeNow, lingerMs])

  const open = useCallback(
    (item: T, event: React.MouseEvent) => {
      clearLinger()
      const pos = { x: event.clientX, y: event.clientY }
      targetPosRef.current = pos
      // Snap to cursor on first open so tooltip doesn't lerp in from afar
      if (!activeRef.current) currentPosRef.current = { ...pos }
      activeRef.current = item
      setActive(item)
    },
    [clearLinger],
  )

  const openAt = useCallback(
    (item: T, pos: Pos) => {
      clearLinger()
      targetPosRef.current = pos
      currentPosRef.current = { ...pos }
      activeRef.current = item
      setActive(item)
    },
    [clearLinger],
  )

  const move = useCallback((event: React.MouseEvent) => {
    targetPosRef.current = { x: event.clientX, y: event.clientY }
  }, [])

  useEffect(() => clearLinger, [clearLinger])

  useEffect(() => {
    if (!active || paused || disabled) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const loop = () => {
      const target = targetPosRef.current
      const current = currentPosRef.current
      const factor = 0.15

      current.x += (target.x - current.x) * factor
      current.y += (target.y - current.y) * factor

      if (Math.abs(target.x - current.x) < 0.5) current.x = target.x
      if (Math.abs(target.y - current.y) < 0.5) current.y = target.y

      if (tooltipRef.current) {
        tooltipRef.current.style.left = `${current.x}px`
        tooltipRef.current.style.top = `${current.y}px`
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [active, paused, disabled])

  return {
    active,
    tooltipRef,
    currentPos: currentPosRef.current,
    open,
    openAt,
    move,
    close,
    closeNow,
  }
}
