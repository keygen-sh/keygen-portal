import { Badge } from "@/components/ui/badge"

import { type ZonedTimestamp } from "@/lib/timestamps"

export type RequestLogPreview = {
  relative: string
  utc: ZonedTimestamp
  local: ZonedTimestamp
}

export interface RequestLogPreviewHandlers {
  onOpenPreview: (preview: RequestLogPreview, event: React.MouseEvent) => void
  onMovePreview: (event: React.MouseEvent) => void
  onClosePreview: () => void
}

export function RequestLogPreviewContent({
  preview,
}: {
  preview: RequestLogPreview
}) {
  return (
    <div className="space-y-2.5">
      <p className="font-medium text-content-loud">{preview.relative}</p>
      {[preview.utc, preview.local].map((timestamp) => (
        <div key={timestamp.label} className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="shrink-0 bg-background-3 font-mono"
          >
            {timestamp.label}
          </Badge>
          <span className="min-w-0 flex-1 truncate text-content-muted">
            {timestamp.date}
          </span>
          <span className="shrink-0 font-mono text-content-normal">
            {timestamp.time}
          </span>
        </div>
      ))}
    </div>
  )
}
