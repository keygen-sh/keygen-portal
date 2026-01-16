import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Copy } from "lucide-react"

import { Group } from "@/types/groups"
import { Policy } from "@/types/policies"
import { Machine } from "@/types/machines"
import { Product } from "@/types/products"
import { License } from "@/types/licenses"
import { Component } from "@/types/components"
import { Entitlement } from "@/types/entitlements"

import { cn } from "@/lib/utils"
import { copyToClipboard } from "@/lib/clipboard"

interface InspectResourceProps {
  resource:
    | Policy
    | Product
    | License
    | Entitlement
    | Group
    | Machine
    | Component
  className?: string
}

export default function InspectResource({
  resource,
  className,
}: InspectResourceProps): React.ReactElement {
  return (
    <div
      className={cn(
        "relative m-2 min-h-0 min-w-0 flex-1 overflow-hidden rounded border border-accent",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => copyToClipboard(JSON.stringify(resource, null, 2))}
        className="absolute top-3 right-3 z-10 h-7 w-7 bg-accent/60 md:bg-accent/0"
      >
        <Copy className="size-3.5" />
      </Button>

      {/* FIXME(cazden) Text should be scrollable along X on smaller screens */}
      <ScrollArea className="size-full">
        <pre className="w-max min-w-full p-3 font-mono text-sm leading-snug whitespace-pre">
          {JSON.stringify(resource, null, 2)}
        </pre>
      </ScrollArea>
    </div>
  )
}
