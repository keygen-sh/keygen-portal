import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const suggestion = suggestions[0]
  const completion = getCompletionText(state, suggestion)
  const inputIsEmpty = isInputEmpty(state)
  const reserveInputWidth =
    inputIsEmpty || state.text !== "" || completion !== ""

  const updateOverflow = useCallback(() => {
    const scroll = scrollRef.current
    if (!scroll) return

    const maxScrollLeft = scroll.scrollWidth - scroll.clientWidth

    setCanScrollLeft(scroll.scrollLeft > 1)
    setCanScrollRight(
      maxScrollLeft > 1 && scroll.scrollLeft < maxScrollLeft - 1,
    )
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [focusKey, focusSignal])

  useLayoutEffect(() => {
    updateOverflow()
  }, [state.chips, state.pending, state.text, completion, updateOverflow])

  useEffect(() => {
    const scroll = scrollRef.current
    if (!scroll) return

    const observer = new ResizeObserver(updateOverflow)
    observer.observe(scroll)

    return () => observer.disconnect()
  }, [updateOverflow])

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
        "relative flex flex-1 items-center",
        reserveInputWidth ? "min-w-[80px]" : "min-w-0",
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
        placeholder={inputIsEmpty ? placeholder : ""}
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
        "flex min-h-12 min-w-0 items-center gap-2 px-1 py-2",
        bordered && "border-b",
      )}
    >
      {showIcon && <SearchIcon className="size-4 shrink-0 opacity-50" />}
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={updateOverflow}
          className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
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

        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-popover to-transparent transition-opacity duration-300 md:w-12",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-popover to-transparent transition-opacity duration-300 md:w-12",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />
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
