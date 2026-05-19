import type { ParsedSearch, SearchInputState } from "@/types/palette"
import { isInputEmpty } from "@/lib/palette"

import ChipInput from "./chip-input"
import ChipTip from "./chip-tip"

export interface HeaderProps {
  state: SearchInputState
  onChange: (next: SearchInputState) => void
  parsed: ParsedSearch
  placeholder?: string
  hideTip?: boolean
}

export default function Header({
  state,
  onChange,
  parsed,
  placeholder = "Search...",
  hideTip = false,
}: HeaderProps) {
  const showTip =
    !hideTip &&
    (isInputEmpty(state) ||
      (parsed.type != null && !state.pending && state.text === ""))

  return (
    <>
      <ChipInput state={state} onChange={onChange} placeholder={placeholder} />
      {showTip && <ChipTip resource={parsed.type} />}
    </>
  )
}
