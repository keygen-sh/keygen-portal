import { useState, useEffect } from "react"

interface UseDeferredMountProps {
  delay?: number
}

// this hook can be used to improve performance when mounting a large number
// of components, e.g. the policy edit form's fields.
export function useDeferredMount({ delay = 0 }: UseDeferredMountProps = {}) {
  const [componentShouldMount, setComponentShouldMount] = useState(delay === 0)

  useEffect(() => {
    if (delay === 0) {
      return
    }

    let frame: number

    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(() => setComponentShouldMount(true))
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(frame)
    }
  }, [delay])

  return componentShouldMount
}
