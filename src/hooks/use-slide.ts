import { useState, useCallback } from "react"

export function useSlide<T>(
  order: readonly T[],
  initial: T = order[0],
): [T, 1 | -1, (next: T) => void] {
  const [current, setCurrent] = useState<T>(initial)
  const [direction, setDirection] = useState<1 | -1>(1)

  const goTo = useCallback(
    (next: T) => {
      setDirection(order.indexOf(next) > order.indexOf(current) ? 1 : -1)
      setCurrent(next)
    },
    [current, order],
  )

  return [current, direction, goTo]
}
