import { useCallback, useContext, useState } from "react"
import {
  FilterBarContext,
  type FilterState,
} from "@/contexts/filter-bar-context"

export type { FilterState }

type DraftState<T> = {
  value: T
  initialValue: T | undefined
}

type UseFilterStateResult<T> = {
  state: FilterState
  value: T
  handleDraft: () => void
  handleActivate: () => void
  handleDeactivate: () => void
  handleChange: (nextValue: T) => void
  handleDraftChange: (nextValue: T) => void
}

export function useFilterState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange: (value: T | undefined) => void,
): UseFilterStateResult<T> {
  const { remeasure } = useContext(FilterBarContext)
  const [draft, setDraft] = useState<DraftState<T> | null>(null)

  // a draft is only valid while the external value still matches
  // the value that was present when draft mode started
  const isDraft = draft != null && value === draft.initialValue

  const state: FilterState = isDraft
    ? "draft"
    : value != null
      ? "active"
      : "inactive"

  const currentValue = isDraft ? draft.value : (value ?? defaultValue)

  const handleDraft = useCallback(() => {
    setDraft({
      value: value ?? defaultValue,
      initialValue: value,
    })
    remeasure()
  }, [defaultValue, remeasure, value])

  const handleActivate = useCallback(() => {
    if (draft == null) {
      return
    }

    onChange(draft.value)
    setDraft(null)
    remeasure()
  }, [draft, onChange, remeasure])

  const handleDeactivate = useCallback(() => {
    onChange(undefined)
    setDraft(null)
    remeasure()
  }, [onChange, remeasure])

  // applies immediately when the next selection fully defines the filter value
  const handleChange = useCallback(
    (nextValue: T) => {
      onChange(nextValue)

      if (draft != null) {
        setDraft(null)
        remeasure()
      }
    },
    [draft, onChange, remeasure],
  )

  // updates only the local draft while the filter is still incomplete
  // if no draft exists yet, this starts one from the current external value
  const handleDraftChange = useCallback(
    (nextValue: T) => {
      setDraft((currentDraft) => ({
        value: nextValue,
        initialValue: currentDraft?.initialValue ?? value,
      }))
      remeasure()
    },
    [remeasure, value],
  )

  return {
    state,
    value: currentValue,
    handleDraft,
    handleActivate,
    handleDeactivate,
    handleChange,
    handleDraftChange,
  }
}
