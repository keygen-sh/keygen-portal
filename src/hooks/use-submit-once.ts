import { useCallback, useRef } from "react"

export function useSubmitOnce<T extends (...args: never[]) => unknown>(
  handler: T,
) {
  const submittedRef = useRef(false)
  const handlerRef = useRef(handler)

  const submit = useCallback((...args: Parameters<T>) => {
    if (submittedRef.current) {
      return
    }

    submittedRef.current = true

    return handlerRef.current(...args)
  }, [])

  const reset = useCallback(() => {
    submittedRef.current = false
  }, [])

  return [submit, reset] as const
}
