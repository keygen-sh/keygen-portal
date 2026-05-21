import { useEffect, useRef, type KeyboardEvent } from "react"
import { Command as CommandPrimitive } from "cmdk"

import { SearchIcon } from "lucide-react"

import {
  removeChipAt,
  isInputEmpty,
  popLastInput,
  reduceInputText,
  commitPendingInput,
} from "@/lib/palette"
import { cn } from "@/lib/utils"

import { type SearchInputState, type SearchSuggestion } from "@/types/palette"

import Pending from "./pending"
import Committed from "./committed"

export interface InputProps {
  state: SearchInputState
  onChange: (next: SearchInputState) => void
  suggestions?: SearchSuggestion[]
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  invalidChipIndexes?: ReadonlySet<number>
  focusKey?: string
  focusSignal?: number
  placeholder?: string
  bordered?: boolean
  showIcon?: boolean
}

export default function Input({
  state,
  onChange,
  suggestions = [],
  onSuggestionSelect,
  invalidChipIndexes,
  focusKey,
  focusSignal,
  placeholder = "Search...",
  bordered = true,
  showIcon = true,
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestion = suggestions[0]
  const completion = getCompletionText(state, suggestion)

  useEffect(() => {
    inputRef.current?.focus()
  }, [focusKey, focusSignal])

  function acceptSuggestion() {
    if (!suggestion || !onSuggestionSelect) return false
    onSuggestionSelect(suggestion)
    return true
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (suggestion && e.key === "Tab" && acceptSuggestion()) {
      e.preventDefault()
      return
    }

    if (
      (e.key === " " || e.key === "Enter" || e.key === "Tab") &&
      state.pending
    ) {
      e.preventDefault()
      e.stopPropagation()
      onChange(commitPendingInput(state))
      return
    }
    if (e.key === "Backspace" && state.text === "") {
      if (state.pending || state.chips.length > 0) {
        e.preventDefault()
        onChange(popLastInput(state))
      }
    }
  }

  const inputControl = (
    <div
      className={cn(
        "relative flex min-w-[80px] flex-1 items-center",
        state.pending && "h-full min-w-0",
      )}
    >
      {completion && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center whitespace-pre",
            state.pending ? "px-1 text-xs" : "py-3 text-sm",
          )}
        >
          <span className="invisible">{state.text}</span>
          <span className="text-content-subdued">{completion}</span>
        </div>
      )}
      <CommandPrimitive.Input
        ref={inputRef}
        autoFocus
        value={state.text}
        onValueChange={(v) => onChange(reduceInputText(state, v))}
        onKeyDown={handleKeyDown}
        placeholder={isInputEmpty(state) ? placeholder : ""}
        className={cn(
          "relative min-w-0 flex-1 bg-transparent outline-hidden",
          "placeholder:text-muted-foreground",
          state.pending ? "h-6 px-1 text-xs" : "py-3 text-sm",
        )}
      />
    </div>
  )

  return (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        "flex min-h-12 items-center gap-2 px-1 py-2",
        bordered && "border-b",
      )}
    >
      {showIcon && <SearchIcon className="size-4 shrink-0 opacity-50" />}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {state.chips.map((chip, i) => (
          <Committed
            key={`${chip.keyword}:${chip.value}:${i}`}
            chip={chip}
            invalid={invalidChipIndexes?.has(i)}
            onRemove={() => onChange(removeChipAt(state, i))}
          />
        ))}
        {state.pending ? (
          <Pending keyword={state.pending}>{inputControl}</Pending>
        ) : (
          inputControl
        )}
        {completion && (
          <span className="sr-only">
            Press Tab to autocomplete {suggestion.label}.
          </span>
        )}
      </div>
    </div>
  )
}

function getCompletionText(
  state: SearchInputState,
  suggestion?: SearchSuggestion,
): string {
  if (!suggestion) return ""

  const typed = state.text.trim()
  const target =
    suggestion.kind === "type" ? suggestion.value : suggestion.keyword

  if (!typed) return target
  if (!target.toLowerCase().startsWith(typed.toLowerCase())) return ""

  return target.slice(typed.length)
}
