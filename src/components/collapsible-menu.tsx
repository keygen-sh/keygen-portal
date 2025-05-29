import { useState } from "react"

import { cn } from "@/lib/utils"

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"

import { ChevronDown, ChevronUp } from "lucide-react"

interface CollapsibleMenuProps {
  title: string
  defaultOpen?: boolean
  children?: React.ReactNode
  className?: string
}

export default function CollapsibleMenu({
  title,
  defaultOpen = true,
  children,
  className,
}: CollapsibleMenuProps): React.ReactElement {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="group flex w-full items-center gap-2">
        <div className="rounded-full bg-background-2 p-0.5 text-content-normal transition-colors duration-200 group-hover:bg-background-3 group-hover:text-content-loud">
          {open ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </div>
        <span className="text-content-loud">{title}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className={cn("mt-4", className)}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
