import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

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
}: CollapsibleMenuProps) {
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

      <AnimatePresence initial={false}>
        {open && (
          <CollapsibleContent asChild forceMount>
            <motion.div
              key="menu-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.15,
                ease: [0.12, 0, 0.58, 1],
              }}
              className="overflow-hidden"
            >
              <div className={cn("mt-4", className)}>{children}</div>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  )
}
