import { type KeyboardEvent } from "react"
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

import { type SearchInputState } from "@/types/palette"

import Pending from "./pending-chip"
import Committed from "./committed-chip"

export interface ChipInputProps {
  state: SearchInputState
  onChange: (next: SearchInputState) => void
  placeholder?: string
}

export default function ChipInput({
  state,
  onChange,
  placeholder = "Search...",
}: ChipInputProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === " " && state.pending) {
      e.preventDefault()
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

  return (
    <div
      data-slot="command-input-wrapper"
      className="flex min-h-12 items-center gap-2 border-b px-3 py-2"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {state.chips.map((chip, i) => (
          <Committed
            key={`${chip.keyword}:${chip.value}:${i}`}
            chip={chip}
            onRemove={() => onChange(removeChipAt(state, i))}
          />
        ))}
        {state.pending && <Pending keyword={state.pending} />}
        <CommandPrimitive.Input
          autoFocus
          value={state.text}
          onValueChange={(v) => onChange(reduceInputText(state, v))}
          onKeyDown={handleKeyDown}
          placeholder={isInputEmpty(state) ? placeholder : ""}
          className={cn(
            "min-w-[80px] flex-1 bg-transparent py-3 text-sm outline-hidden",
            "placeholder:text-muted-foreground",
          )}
        />
      </div>
    </div>
  )
}
