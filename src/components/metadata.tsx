import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { copyToClipboard } from "@/lib/clipboard"

interface HasMetadata {
  attributes: {
    metadata: Record<string, unknown>
  }
}

interface MetadataProps {
  resource: HasMetadata
  className?: string
}

export default function Metadata({
  resource,
  className,
}: MetadataProps): React.ReactElement {
  return (
    <div className={cn("p-4", className)}>
      {resource.attributes.metadata &&
      Object.keys(resource.attributes.metadata).length > 0 ? (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              copyToClipboard(
                JSON.stringify(resource.attributes.metadata, null, 2),
              )
            }
            className="absolute top-3 right-3 z-10 h-7 w-7"
          >
            <Copy className="size-3.5" />
          </Button>

          <ScrollArea
            className="max-h-64 rounded border border-accent"
            orientation="both"
          >
            <pre className="w-max min-w-full p-3 font-mono text-sm leading-snug whitespace-pre">
              {JSON.stringify(resource.attributes.metadata, null, 2)}
            </pre>
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
