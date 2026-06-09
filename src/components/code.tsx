import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { copyToClipboard } from "@/lib/clipboard"

interface CodeProps {
  value: string
  className?: string
}

export default function Code({
  value,
  className,
}: CodeProps): React.ReactElement {
  return (
    <div className={cn("p-4", className)}>
      {value ? (
        <div
          className="relative w-full min-w-0"
          style={{ contain: "inline-size" }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(value)}
            className="absolute top-3 right-3 z-10 h-7 w-7 bg-accent/60 md:bg-accent/0"
          >
            <Copy className="size-3.5" />
          </Button>

          <ScrollArea
            className="max-h-96 rounded border border-accent"
            orientation="both"
          >
            <pre className="w-max min-w-full p-3 pr-12 font-mono text-sm leading-snug whitespace-pre">
              {value}
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
