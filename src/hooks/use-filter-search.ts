import { useCallback } from "react"
import {
  type NavigateOptions,
  useSearch,
  useNavigate,
} from "@tanstack/react-router"

export function useFilterSearch<T extends Record<string, unknown>>(
  defaults?: Partial<T>,
): [T, (next: T) => void] {
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const filters = { ...defaults, ...search } as T

  const setFilters = useCallback(
    (next: T) => {
      void navigate({ search: () => next } as NavigateOptions)
    },
    [navigate],
  )

  return [filters, setFilters]
}
