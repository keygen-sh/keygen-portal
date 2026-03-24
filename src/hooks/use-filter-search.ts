import { useCallback } from "react"
import { useSearch, useNavigate } from "@tanstack/react-router"

export function useFilterSearch<T extends Record<string, unknown>>(): [
  T,
  (next: T) => void,
] {
  const filters = useSearch({ strict: false }) as T
  const navigate = useNavigate()

  const setFilters = useCallback(
    (next: T) => {
      void navigate({ search: next })
    },
    [navigate],
  )

  return [filters, setFilters]
}
