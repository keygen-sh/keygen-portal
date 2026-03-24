import { useState, useCallback, useContext } from "react"
import {
  FilterBarContext,
  type FilterState,
} from "@/contexts/filter-bar-context"

export type { FilterState }

export function useFilterState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange: (value: T | undefined) => void,
) {
  const { remeasure } = useContext(FilterBarContext)
  const [isDraft, setIsDraft] = useState(false)
  const [draftValue, setDraftValue] = useState<T>(defaultValue)
  // Snapshot of value when draft was entered — draft auto-invalidates
  // when value changes externally (e.g. "clear all"), no manual reset needed.
  const [draftSnapshot, setDraftSnapshot] = useState<T | undefined>(undefined)

  const inDraft = isDraft && value === draftSnapshot

  const filterState: FilterState = inDraft
    ? "draft"
    : value != null
      ? "active"
      : "inactive"

  const currentValue = inDraft ? draftValue : (value ?? defaultValue)

  const handleActivate = useCallback(() => {
    setDraftValue(value ?? defaultValue)
    setDraftSnapshot(value)
    setIsDraft(true)
    remeasure()
  }, [value, defaultValue, remeasure])

  const handleConfirm = useCallback(() => {
    onChange(draftValue)
    setIsDraft(false)
    remeasure()
  }, [draftValue, onChange, remeasure])

  const handleRemove = useCallback(() => {
    onChange(undefined)
    setIsDraft(false)
    setDraftValue(defaultValue)
    remeasure()
  }, [onChange, defaultValue, remeasure])

  // Auto-applies: use when the selection completes the filter value.
  const handleChange = useCallback(
    (next: T) => {
      onChange(next)
      if (isDraft) {
        setIsDraft(false)
        remeasure()
      }
    },
    [isDraft, onChange, remeasure],
  )

  // Draft-only update: use when the value is still incomplete (e.g. operator
  // changed but the value slot is now empty and needs user input).
  // Enters draft even from active state.
  const handleDraftChange = useCallback(
    (next: T) => {
      setDraftValue(next)
      setDraftSnapshot(value)
      setIsDraft(true)
      remeasure()
    },
    [value, remeasure],
  )

  return {
    filterState,
    currentValue,
    handleActivate,
    handleConfirm,
    handleRemove,
    handleChange,
    handleDraftChange,
  }
}
