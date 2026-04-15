import { useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Input } from "@/components/ui/input"

const DIGIT_COUNT = 6
const DIGIT_KEYS = Array.from(
  { length: DIGIT_COUNT },
  (_, i) => i,
) as readonly number[]

const otpVariants = cva("flex items-center", {
  variants: {
    size: {
      default: "gap-2",
      lg: "justify-between md:gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const digitVariants = cva("text-center", {
  variants: {
    size: {
      default: "h-9 w-9",
      lg: "h-15 w-12 md:h-16 md:w-13",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  error?: boolean
  autoFocus?: boolean
  disabled?: boolean
  className?: string
} & VariantProps<typeof otpVariants>

export function OtpInput({
  value,
  onChange,
  onComplete,
  error,
  autoFocus,
  disabled,
  size,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(DIGIT_COUNT, "").split("").slice(0, DIGIT_COUNT)

  const setDigit = (index: number, digit: string) => {
    const next = [...digits]
    next[index] = digit
    const joined = next.join("")
    onChange(joined)
    return joined
  }

  const handleChange = (index: number, inputValue: string) => {
    if (!/^\d?$/.test(inputValue)) return

    const joined = setDigit(index, inputValue)

    if (inputValue && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus()
    } else if (inputValue && index === DIGIT_COUNT - 1) {
      onComplete?.(joined)
    }
  }

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "")
    if (!pasteData) return

    const next = [...digits]
    let cursor = index

    for (let i = 0; i < pasteData.length && cursor < DIGIT_COUNT; i++) {
      next[cursor] = pasteData[i]
      cursor++
    }

    const joined = next.join("")
    onChange(joined)

    if (cursor >= DIGIT_COUNT) {
      onComplete?.(joined)
    } else {
      inputRefs.current[cursor]?.focus()
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className={otpVariants({ size, className })}>
      {DIGIT_KEYS.map((i) => (
        <Input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          autoFocus={autoFocus && i === 0}
          maxLength={1}
          aria-invalid={error ? "true" : "false"}
          variant={error ? "destructive" : "default"}
          fieldSize={size === "lg" ? "xl" : "default"}
          className={digitVariants({ size })}
          value={digits[i]}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onPaste={(e) => handlePaste(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
        />
      ))}
    </div>
  )
}
