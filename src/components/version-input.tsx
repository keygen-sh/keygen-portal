import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ReleaseChannel, ReleaseChannelLabels } from "@/types/releases"

const AllChannels: ReleaseChannel[] = [
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
  const [channelOpen, setChannelOpen] = useState(false)

  return (
    <div className={cn("flex items-stretch", className)}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="1.0.0"
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        className={cn("rounded-r-none", invalid && "border-destructive!")}
      />

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
              {AllChannels.map((ch) => (
                <li key={ch}>
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded px-2 py-1 text-left text-sm hover:bg-accent",
                      ch === channel && "bg-accent",
                    )}
                    onClick={() => {
                      onChannelChange(ch)
                      setChannelOpen(false)
                    }}
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
