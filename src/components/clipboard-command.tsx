import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { copyToClipboard } from "@/lib/clipboard"

interface ClipboardCommandProps {
  command: string
  className?: string
}

export default function ClipboardCommand({
  command,
  className,
}: ClipboardCommandProps): React.ReactElement {
  return (
    <div className={cn("relative", className)}>
      <pre className="max-h-64 overflow-auto rounded border p-3 pr-12 font-mono text-xs whitespace-pre-wrap">
        {command}
      </pre>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => copyToClipboard(command)}
        className="absolute top-1.5 right-1.5 h-7 w-7"
      >
        <Copy className="size-3.5" />
      </Button>
    </div>
  )
}
