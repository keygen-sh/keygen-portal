import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import { ScrollArea } from "@/components/ui/scroll-area"

import { cn } from "@/lib/utils"

import * as Motion from "@/components/motion"

const JSON_TOKEN =
  /(?<key>"(?:\\.|[^"\\])*")(?=\s*:)|(?<string>"(?:\\.|[^"\\])*")|(?<number>-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(?<boolean>true|false)|(?<nil>null)/g

function tokenClassName(groups: Record<string, string | undefined>): string {
  if (groups.key != null) return "text-content-normal"
  if (groups.string != null) return "text-primary"
  if (groups.number != null) return "text-secondary"
  if (groups.boolean != null) return "text-warning"

  return "text-content-disabled"
}

function highlightJson(json: string): React.ReactNode[] {
  const pattern = new RegExp(JSON_TOKEN.source, "g")
  const nodes: React.ReactNode[] = []

  let match: RegExpExecArray | null
  let cursor = 0
  let index = 0

  while ((match = pattern.exec(json)) !== null) {
    if (match.index > cursor) {
      nodes.push(json.slice(cursor, match.index))
    }

    nodes.push(
      <span key={index++} className={tokenClassName(match.groups ?? {})}>
        {match[0]}
      </span>,
    )

    cursor = match.index + match[0].length
  }

  if (cursor < json.length) {
    nodes.push(json.slice(cursor))
  }

  return nodes
}

type TerminalEntry =
  | { kind: "command"; text: string }
  | { kind: "output"; text: string }

export interface TerminalHandle {
  run: (command: string) => void
  print: (output: string) => void
}

interface TerminalProps {
  title?: string
  placeholder?: string
  onCommand: (command: string) => string | null | Promise<string | null>
  className?: string
  ref?: React.Ref<TerminalHandle>
}

export default function Terminal({
  title = "bash",
  placeholder,
  onCommand,
  className,
  ref,
}: TerminalProps): React.ReactElement {
  const [entries, setEntries] = useState<TerminalEntry[]>([])
  const [input, setInput] = useState("")
  const [running, setRunning] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // expand the input with its content
  useEffect(() => {
    const el = inputRef.current
    if (el) {
      el.style.height = "0"
      el.style.height = `${el.scrollHeight}px`
    }
  }, [input, running])

  // keep the latest lines in view as history grows
  // or a paste grows the prompt below the edge
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )
    viewport?.scrollTo({ top: viewport.scrollHeight })
  }, [entries, running, input])

  const prevRunning = useRef(false)

  useEffect(() => {
    if (prevRunning.current && !running) {
      inputRef.current?.focus()
    }
    prevRunning.current = running
  }, [running])

  const runCommand = useCallback(
    async (raw: string) => {
      const command = raw.trim()
      if (!command || running) return

      setEntries((prev) => [...prev, { kind: "command", text: command }])

      try {
        const result = onCommand(command)

        let output: string | null
        if (result instanceof Promise) {
          setRunning(true)
          output = await result
        } else {
          output = result
        }

        if (output != null) {
          setEntries((prev) => [...prev, { kind: "output", text: output }])
        }
      } catch (error) {
        console.error(error)
        setEntries((prev) => [
          ...prev,
          { kind: "output", text: "error: command failed" },
        ])
      } finally {
        setRunning(false)
      }
    },
    [running, onCommand],
  )

  const submit = useCallback(() => {
    const command = input.trim()
    if (!command || running) return

    setInput("")
    void runCommand(command)
  }, [input, running, runCommand])

  const print = useCallback((output: string) => {
    setEntries((prev) => [...prev, { kind: "output", text: output }])
  }, [])

  useImperativeHandle(ref, () => ({ run: runCommand, print }), [
    runCommand,
    print,
  ])

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-sm border border-accent bg-background-1",
        className,
      )}
      style={{ contain: "inline-size" }}
      onClick={() => {
        const selection = window.getSelection()
        if (selection && !selection.isCollapsed) return

        inputRef.current?.focus()
      }}
    >
      <div className="flex h-9 items-center gap-2 border-b border-accent px-3">
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-background-4" />
          <span className="size-2 rounded-full bg-background-4" />
          <span className="size-2 rounded-full bg-background-4" />
        </span>

        <span className="ml-1 font-mono text-xs text-content-subdued select-none">
          {title}
        </span>
      </div>

      <div ref={scrollRef}>
        <ScrollArea className="h-74">
          <div className="cursor-text p-3 font-mono text-xs leading-relaxed">
            {placeholder && (
              <div className="whitespace-pre-wrap text-content-disabled select-none">
                {placeholder}
              </div>
            )}

            {entries.map((entry, index) =>
              entry.kind === "command" ? (
                <div key={index} className="whitespace-pre-wrap">
                  <span className="mr-2 text-primary select-none">$</span>
                  <span className="text-content-muted">{entry.text}</span>
                </div>
              ) : (
                <pre
                  key={index}
                  className="my-2 whitespace-pre-wrap text-content-muted"
                >
                  {entry.text.trimStart().startsWith("{")
                    ? highlightJson(entry.text)
                    : entry.text}
                </pre>
              ),
            )}

            {running ? (
              <Motion.Terminal text="*keygen music intensifies*" active />
            ) : (
              <div className="flex items-start">
                <span className="mr-2 text-primary select-none">$</span>
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      void submit()
                    }
                  }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  className="min-h-0 flex-1 resize-none overflow-hidden border-none bg-transparent p-0 font-mono text-xs leading-relaxed text-content-muted caret-primary outline-none"
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
