import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { copyToClipboard } from "@/lib/clipboard"

export default function ClipboardValue({ value }: { value: string }) {
  return (
    <div className="group relative">
      <pre className="overflow-auto rounded border border-accent bg-background-1 p-3 pr-12 font-mono text-xs break-all whitespace-pre-wrap text-content-muted">
        {value}
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-7"
        onClick={() => copyToClipboard(value)}
      >
        <Copy className="size-3" />
      </Button>
    </div>
  )
}
