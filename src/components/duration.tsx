import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { copyToClipboard } from "@/lib/clipboard"
import { secondsLabel, formatFullDurationLabel } from "@/lib/temporal"

export function DurationPopover({
  value,
  tooltip,
}: {
  value: number
  tooltip?: React.ReactNode
}) {
  const raw = String(value)

  return (
    <div className="flex flex-col text-xs">
      {tooltip && (
        <>
          <p className="text-pretty text-content-loud">{tooltip}</p>
          <Separator className="mt-3 mb-2.5" />
        </>
      )}
      <div className="flex items-center justify-between">
        <span className="min-w-0 flex-1 truncate text-content-muted">
          <span className="font-mono">{raw}</span> {secondsLabel(value)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          title="Copy duration in seconds"
          onClick={async (e) => {
            e.stopPropagation() // prevent click from propagating, e.g. selecting a table row
            await copyToClipboard(raw)
          }}
          className="-my-1 -mr-1 size-6 shrink-0"
        >
          <Copy className="size-3.5" />
        </Button>
      </div>
      <span className="min-w-0 text-pretty text-content-normal">
        {formatFullDurationLabel(value)}
      </span>
    </div>
  )
}
