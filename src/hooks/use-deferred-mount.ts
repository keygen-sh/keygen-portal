import { useState, useEffect } from "react"

interface UseDeferredMountProps {
  delay?: number
}

// this hook can be used to improve performance when mounting a large number
// of components, e.g. the policy edit form's fields.
export function useDeferredMount({ delay = 500 }: UseDeferredMountProps = {}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let frame: number

    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(() => setReady(true))
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(frame)
    }
  }, [delay])

  return ready
}
