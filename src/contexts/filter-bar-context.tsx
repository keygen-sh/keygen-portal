import { useContext, createContext } from "react"

export type FilterState = "inactive" | "draft" | "active"

export type FilterBarContextValue = {
  remeasure: () => void
}

export const FilterBarContext = createContext<FilterBarContextValue>({
  remeasure: () => {},
})

export const FilterStateContext = createContext<FilterState>("inactive")

export function useFilterStateContext() {
  return useContext(FilterStateContext)
}
