import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { recomposeVersion } from "@/lib/releases"
import { cn } from "@/lib/utils"
import { ReleaseChannel, ReleaseChannelLabels } from "@/types/releases"

const CHANNELS: ReleaseChannel[] = [
  ReleaseChannel.Stable,
  ReleaseChannel.Rc,
  ReleaseChannel.Beta,
  ReleaseChannel.Alpha,
  ReleaseChannel.Dev,
]

interface VersionInputProps {
  value: string
  onChange: (version: string) => void
  channel: ReleaseChannel
  onChannelChange?: (channel: ReleaseChannel) => void
  invalid: boolean
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export default function VersionInput({
  value,
  onChange,
  channel,
  onChannelChange,
  invalid,
  disabled,
  autoFocus,
  className,
}: VersionInputProps) {
  const mainRef = useRef<HTMLInputElement>(null)
  const preRef = useRef<HTMLInputElement>(null)
  const [channelOpen, setChannelOpen] = useState(false)
  const [focused, setFocused] = useState(false)

  const isPrerelease = channel !== ReleaseChannel.Stable
  const separator = `-${channel}.`
  const separatorIdx = value.indexOf(separator)
  const mainValue = separatorIdx !== -1 ? value.slice(0, separatorIdx) : value
  const preValue =
    separatorIdx !== -1 ? value.slice(separatorIdx + separator.length) : ""

  function handleMainChange(next: string) {
    if (preValue) {
      onChange(`${next}${separator}${preValue}`)
    } else {
      onChange(next)
    }
  }

  function handlePreChange(next: string) {
    onChange(`${mainValue}${separator}${next}`)
  }

  function handleChannelChange(next: ReleaseChannel) {
    onChannelChange?.(next)
    onChange(recomposeVersion(value, channel, next))
    setChannelOpen(false)
  }

  return (
    <div className={cn("flex items-stretch", className)}>
      <div
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "flex h-9 w-full min-w-0 items-center rounded-l-md border border-accent bg-transparent shadow-xs transition-colors duration-300 dark:bg-input/30",
          focused && "border-content-subdued",
          invalid && "border-destructive!",
          disabled && "pointer-events-none cursor-not-allowed opacity-50",
        )}
      >
        <div
          className={cn(
            "inline-grid min-w-[3ch] items-center pl-3",
            !isPrerelease && "w-full pr-3",
          )}
        >
          <input
            ref={mainRef}
            type="text"
            value={mainValue}
            onChange={(e) => handleMainChange(e.target.value)}
            onKeyDown={(e) => {
              if (!isPrerelease) {
                return
              }

              if (
                e.key === "ArrowRight" &&
                e.currentTarget.selectionStart === mainValue.length
              ) {
                e.preventDefault()
                preRef.current?.focus()
                preRef.current?.setSelectionRange(0, 0)
              }
            }}
            placeholder="1.2.3"
            disabled={disabled}
            autoFocus={autoFocus}
            autoComplete="off"
            size={1}
            className="col-[1/2] row-[1/2] w-full min-w-0 bg-transparent text-sm caret-white outline-none placeholder:text-content-subdued"
          />
          {isPrerelease && (
            <span className="invisible col-[1/2] row-[1/2] py-1 text-sm whitespace-pre">
              {mainValue || "1.2.3"}
            </span>
          )}
        </div>

        {isPrerelease && (
          <>
            <span className="shrink-0 text-sm text-content-muted select-none">
              {separator}
            </span>

            <input
              ref={preRef}
              type="text"
              value={preValue}
              onChange={(e) => handlePreChange(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "ArrowLeft" &&
                  e.currentTarget.selectionStart === 0
                ) {
                  e.preventDefault()
                  mainRef.current?.focus()
                  mainRef.current?.setSelectionRange(
                    mainValue.length,
                    mainValue.length,
                  )
                } else if (e.key === "Backspace" && !preValue) {
                  e.preventDefault()
                  mainRef.current?.focus()
                }
              }}
              placeholder="1"
              disabled={disabled}
              autoComplete="off"
              className="min-w-[2ch] flex-1 bg-transparent pr-3 text-sm caret-white outline-none placeholder:text-content-subdued"
            />
          </>
        )}
      </div>

      <Popover open={channelOpen} onOpenChange={setChannelOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || !onChannelChange}
            className="rounded-l-none border-l-0 bg-background-1 text-content-muted"
          >
            {ReleaseChannelLabels[channel]}
          </Button>
        </PopoverTrigger>
        {onChannelChange && (
          <PopoverContent className="w-32 p-1">
            <ul className="h-fit">
              {CHANNELS.map((ch) => (
                <li key={ch}>
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded px-2 py-1 text-left text-sm hover:bg-accent",
                      ch === channel && "bg-accent",
                    )}
                    onClick={() => handleChannelChange(ch)}
                  >
                    {ReleaseChannelLabels[ch]}
                  </button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}
