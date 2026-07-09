import { useRef } from "react"

import { Textarea } from "@/components/ui/textarea"

import { cn } from "@/lib/utils"

// characters that auto-close
const PAIRS: Readonly<Record<string, string>> = {
  "{": "}",
  "[": "]",
  "(": ")",
  '"': '"',
}

// subset that opens an indented block on newline
const BRACKETS: Readonly<Record<string, string>> = {
  "{": "}",
  "[": "]",
  "(": ")",
}

const CLOSERS: ReadonlySet<string> = new Set(Object.values(PAIRS))

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  spellCheck?: boolean
  invalid?: boolean
  minRows?: number
  indent?: string
  className?: string
}

export default function CodeInput({
  value,
  onChange,
  id,
  placeholder,
  disabled,
  autoFocus,
  spellCheck = false,
  invalid,
  minRows = 3,
  indent = "  ",
  className,
}: CodeInputProps): React.ReactElement {
  const ref = useRef<HTMLTextAreaElement>(null)

  // apply new value and restore caret/selection afterwards since the
  // textarea is controlled and React would otherwise reset it to the end
  const apply = (
    next: string,
    selectionStart: number,
    selectionEnd = selectionStart,
  ) => {
    onChange(next)

    requestAnimationFrame(() => {
      const el = ref.current
      if (el) {
        el.selectionStart = selectionStart
        el.selectionEnd = selectionEnd
      }
    })
  }

  // tab indent the current line or every line the selection touches
  const handleTab = (
    text: string,
    start: number,
    end: number,
    shift: boolean,
  ) => {
    const multiline = text.slice(start, end).includes("\n")

    if (!shift && !multiline) {
      apply(
        text.slice(0, start) + indent + text.slice(end),
        start + indent.length,
      )

      return
    }

    const blockStart = text.lastIndexOf("\n", start - 1) + 1
    const lines = text.slice(blockStart, end).split("\n")

    if (shift) {
      const dedent = new RegExp(`^ {1,${indent.length}}`)
      let removedFromFirst = 0
      let removedTotal = 0

      const dedented = lines
        .map((line, i) => {
          const removed = dedent.exec(line)?.[0].length ?? 0
          if (i === 0) removedFromFirst = removed
          removedTotal += removed

          return line.slice(removed)
        })
        .join("\n")

      apply(
        text.slice(0, blockStart) + dedented + text.slice(end),
        Math.max(blockStart, start - removedFromFirst),
        end - removedTotal,
      )

      return
    }

    const indented = lines.map((line) => indent + line).join("\n")
    apply(
      text.slice(0, blockStart) + indented + text.slice(end),
      start + indent.length,
      end + indent.length * lines.length,
    )
  }

  // open an indented block between a bracket and its closer
  const handleEnter = (text: string, start: number, end: number) => {
    const lineStart = text.lastIndexOf("\n", start - 1) + 1
    const currentIndent =
      /^[ \t]*/.exec(text.slice(lineStart, start))?.[0] ?? ""
    const before = text[start - 1]
    const after = text[end]

    if (before && BRACKETS[before]) {
      const inner = currentIndent + indent

      // if caret sits between an opener and its closer, expand into a block
      if (after === BRACKETS[before]) {
        apply(
          text.slice(0, start) +
            "\n" +
            inner +
            "\n" +
            currentIndent +
            text.slice(end),
          start + 1 + inner.length,
        )

        return
      }

      // if caret sits just after an opener, add one indent level
      apply(
        text.slice(0, start) + "\n" + inner + text.slice(end),
        start + 1 + inner.length,
      )

      return
    }

    apply(
      text.slice(0, start) + "\n" + currentIndent + text.slice(end),
      start + 1 + currentIndent.length,
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const {
      value: text,
      selectionStart: start,
      selectionEnd: end,
    } = e.currentTarget

    if (e.key === "Tab") {
      e.preventDefault()
      handleTab(text, start, end, e.shiftKey)

      return
    }

    if (e.key === "Enter") {
      e.preventDefault()
      handleEnter(text, start, end)

      return
    }

    // step over an auto-inserted closer instead of typing a second one
    if (start === end && CLOSERS.has(e.key) && text[start] === e.key) {
      e.preventDefault()
      apply(text, start + 1)

      return
    }

    // auto-close an opener, wrapping any selected text
    if (e.key in PAIRS) {
      e.preventDefault()
      const selected = text.slice(start, end)
      apply(
        text.slice(0, start) +
          e.key +
          selected +
          PAIRS[e.key] +
          text.slice(end),
        start + 1,
        end + 1,
      )

      return
    }

    // delete both halves of an empty pair together
    if (e.key === "Backspace" && start === end) {
      const before = text[start - 1]
      if (before && PAIRS[before] === text[start]) {
        e.preventDefault()
        apply(text.slice(0, start - 1) + text.slice(start + 1), start - 1)
      }
    }
  }

  return (
    <Textarea
      ref={ref}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      autoFocus={autoFocus}
      spellCheck={spellCheck}
      placeholder={placeholder}
      aria-invalid={invalid ? true : undefined}
      className={cn("resize-none font-mono text-xs", className)}
      style={{ minHeight: `calc(${minRows} * 1lh + 1rem + 2px)` }}
    />
  )
}
