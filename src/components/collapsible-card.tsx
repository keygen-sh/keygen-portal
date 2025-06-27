import { useState, Fragment, Children } from "react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { ChevronDown, ChevronUp } from "lucide-react"

interface CollapsibleCardProps {
  title: string
  defaultOpen?: boolean
  children?: React.ReactNode
  className?: string
}

export default function CollapsibleCard({
  title,
  defaultOpen = true,
  children,
  className,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Card className="rounded-sm bg-background py-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader
          className={cn(
            "h-12 rounded-sm bg-background-1 p-0",
            open && "rounded-b-none border-b border-accent",
          )}
        >
          <CollapsibleTrigger className="group flex h-full w-full items-center justify-between p-3">
            <CardTitle className="text-content-loud">{title}</CardTitle>
            <div className="rounded-full bg-background-2 p-0.5 text-content-normal transition-colors duration-200 group-hover:bg-background-3 group-hover:text-content-loud">
              {open ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <AnimatePresence initial={false}>
          {open && (
            <CollapsibleContent asChild forceMount>
              <motion.div
                key="card-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0.15,
                  ease: [0.12, 0, 0.58, 1],
                }}
                className="overflow-hidden"
              >
                <CardContent className={cn("p-4", className)}>
                  {Children.map(children, (child, index) => (
                    <Fragment key={index}>
                      {child}
                      {index < Children.count(children) - 1 && (
                        <Separator className="my-4" />
                      )}
                    </Fragment>
                  ))}
                </CardContent>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    </Card>
  )
}
