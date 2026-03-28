import { createContext } from "react"

export type FilterBarContextValue = {
  remeasure: () => void
}

export const FilterBarContext = createContext<FilterBarContextValue>({
  remeasure: () => {},
})

export type FilterState = "inactive" | "draft" | "active"

export const FilterStateContext = createContext<FilterState>("inactive")
