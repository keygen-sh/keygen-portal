import { useCallback } from "react"
import { useSearch, useNavigate } from "@tanstack/react-router"

export function useFilterSearch<T extends Record<string, unknown>>(
  defaults?: Partial<T>,
): [T, (next: T) => void] {
  const search = useSearch({ strict: false }) as T
  const navigate = useNavigate()

  const filters = { ...defaults, ...search } as T

  const setFilters = useCallback(
    (next: T) => {
      void navigate({ search: next })
    },
    [navigate],
  )

  return [filters, setFilters]
}
