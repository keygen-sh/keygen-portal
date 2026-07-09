import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useController, FieldPath, FieldValues } from "react-hook-form"

import { CircleAlert, CurlyBraces, Text } from "lucide-react"

import {
  metadataPairsToRecord,
  parseMetadataObjectText,
  recordToMetadataPairs,
  type MetadataPair,
} from "@/schemas/metadata"

import * as Forms from "@/components/forms"
import CodeInput from "@/components/code-input"
import KeyValueInput from "@/components/key-value-input"

import { cn } from "@/lib/utils"

type MetadataMode = "fields" | "raw"

const RAW_INVALID_PAIR: MetadataPair = {
  id: "__raw_invalid__",
  key: "",
  type: "integer",
  value: "",
}

interface MetadataInputProps<TFormValues extends FieldValues> {
  name: FieldPath<TFormValues>
  label?: string
  tooltip?: string | null
  optional?: boolean
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export default function MetadataInput<
  TFormValues extends Record<string, unknown>,
>({
  name,
  label = "Metadata",
  tooltip,
  optional,
  disabled,
  autoFocus,
  className,
}: MetadataInputProps<TFormValues>): React.ReactElement {
  const { field } = useController<TFormValues, FieldPath<TFormValues>>({ name })

  const rows = useMemo(
    () => (field.value as MetadataPair[] | undefined) ?? [],
    [field.value],
  )

  const [mode, setMode] = useState<MetadataMode>("fields")
  const [rawText, setRawText] = useState("")
  const [rawError, setRawError] = useState<string | null>(null)

  // last structured pairs we know to be valid
  const lastValidRows = useRef<MetadataPair[]>(rows)

  const enterRaw = () => {
    lastValidRows.current = rows

    const record = metadataPairsToRecord(rows)
    setRawText(
      Object.keys(record).length > 0 ? JSON.stringify(record, null, 2) : "",
    )
    setRawError(null)
    setMode("raw")
  }

  const enterFields = () => {
    // valid raw edit already synced into field value
    if (rawError) {
      field.onChange(lastValidRows.current)
      setRawError(null)
    }
    setMode("fields")
  }

  const changeMode = (next: MetadataMode) => {
    if (next === mode) return

    if (next === "raw") {
      enterRaw()
    } else {
      enterFields()
    }
  }

  const onRawChange = (text: string) => {
    setRawText(text)

    const result = parseMetadataObjectText(text)
    if (result.ok) {
      const pairs = recordToMetadataPairs(result.value)
      lastValidRows.current = pairs
      setRawError(null)
      field.onChange(pairs)
    } else {
      setRawError(result.error)
      field.onChange([{ ...RAW_INVALID_PAIR }])
    }
  }

  return (
    <Forms.Field.Header
      label={label}
      variant="stacking"
      optional={optional}
      tooltip={tooltip}
      className={className}
      action={
        <ModeToggle mode={mode} onChange={changeMode} disabled={disabled} />
      }
    >
      {mode === "raw" ? (
        <div className="space-y-2">
          <CodeInput
            value={rawText}
            onChange={onRawChange}
            disabled={disabled}
            autoFocus
            placeholder={'{\n  "key": "value"\n}'}
            invalid={!!rawError}
          />
          {rawError ? (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <CircleAlert className="mt-0.25 h-4 w-4 shrink-0" />
              {rawError}
            </p>
          ) : null}
        </div>
      ) : (
        <KeyValueInput<TFormValues>
          name={name}
          autoFocus={autoFocus}
          disabled={disabled}
        />
      )}
    </Forms.Field.Header>
  )
}

const MODE_OPTIONS: {
  value: MetadataMode
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: "fields", label: "Fields", icon: Text },
  { value: "raw", label: "Raw", icon: CurlyBraces },
]

function ModeToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: MetadataMode
  onChange: (mode: MetadataMode) => void
  disabled?: boolean
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const mounted = useRef(false)

  // slide pill to active option
  const placeIndicator = useCallback(() => {
    const active = listRef.current?.querySelector<HTMLElement>(
      `[data-mode="${mode}"]`,
    )
    const indicator = indicatorRef.current
    if (!active || !indicator) {
      return
    }

    if (!mounted.current) {
      indicator.style.transition = "none"
    }

    indicator.style.left = `${active.offsetLeft}px`
    indicator.style.width = `${active.offsetWidth}px`

    if (!mounted.current) {
      indicator.getBoundingClientRect()
      indicator.style.transition = ""
      mounted.current = true
    }
  }, [mode])

  useLayoutEffect(placeIndicator, [placeIndicator])

  useEffect(() => {
    window.addEventListener("resize", placeIndicator)
    return () => window.removeEventListener("resize", placeIndicator)
  }, [placeIndicator])

  return (
    <div
      ref={listRef}
      aria-label="Metadata editor mode"
      className="relative inline-flex items-center gap-0.5 rounded-md bg-background-1 p-0.5 text-xs"
    >
      <span
        ref={indicatorRef}
        aria-hidden
        className="pointer-events-none absolute inset-y-0.5 left-0 w-0 rounded-sm bg-background-2 shadow-sm transition-[left,width] duration-200 ease-out motion-reduce:transition-none"
      />
      {MODE_OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = mode === value

        return (
          <button
            key={value}
            type="button"
            data-mode={value}
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(value)}
            className={cn(
              "relative z-10 flex items-center gap-1 rounded-sm px-2 py-1 transition-colors disabled:opacity-50",
              selected
                ? "text-content-loud"
                : "cursor-pointer text-content-subdued hover:text-content-muted",
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
