import { type ReactElement } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"

import { cn } from "@/lib/utils"

export type DiffEntry = {
  key: string
  before: unknown
  after: unknown
}

interface DiffProps {
  entries: DiffEntry[]
  className?: string
}

function stringifyDiffValue(value: unknown): string {
  const json = JSON.stringify(value, null, 2)

  return json ?? "null"
}

function jsonPropertyLines(
  key: string,
  value: unknown,
  trailingComma: boolean,
): string[] {
  const lines = stringifyDiffValue(value).split("\n")
  const property = JSON.stringify(key)

  if (lines.length === 1) {
    return [`  ${property}: ${lines[0]}${trailingComma ? "," : ""}`]
  }

  const result = [
    `  ${property}: ${lines[0]}`,
    ...lines.slice(1).map((line) => `  ${line}`),
  ]

  if (trailingComma) {
    result[result.length - 1] = `${result[result.length - 1]},`
  }

  return result
}

function diffLines(
  prefix: "-" | "+",
  lines: string[],
  key: string,
): ReactElement[] {
  return lines.map((line, index) => (
    <div
      key={`${key}-${prefix}-${index}`}
      className={cn(
        "flex px-3 py-0.5",
        prefix === "-"
          ? "bg-destructive/10 text-destructive"
          : "bg-primary/10 text-primary",
      )}
    >
      <span className="w-8 shrink-0 text-center select-none">{prefix}</span>
      <span className="whitespace-pre">{line}</span>
    </div>
  ))
}

function jsonLine(line: string): ReactElement {
  return (
    <div className="flex px-3">
      <span className="w-8 shrink-0" />
      <span className="whitespace-pre">{line}</span>
    </div>
  )
}

function diffEntryLines(entry: DiffEntry, trailingComma: boolean) {
  const before = jsonPropertyLines(entry.key, entry.before, trailingComma)
  const after = jsonPropertyLines(entry.key, entry.after, trailingComma)

  return (
    <div key={entry.key}>
      {diffLines("-", before, entry.key)}
      {diffLines("+", after, entry.key)}
    </div>
  )
}

export default function Diff({ entries, className }: DiffProps): ReactElement {
  return (
    <div className={cn("p-4", className)}>
      {entries.length > 0 ? (
        <div className="relative">
          <ScrollArea
            className="max-h-64 rounded border border-accent"
            orientation="both"
          >
            <div className="w-max min-w-full py-3 font-mono text-sm leading-snug">
              {jsonLine("{")}
              {entries.map((entry, index) =>
                diffEntryLines(entry, index < entries.length - 1),
              )}
              {jsonLine("}")}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <p className="rounded border border-accent p-3 font-mono text-sm text-content-muted">
          {"{}"}
        </p>
      )}
    </div>
  )
}
