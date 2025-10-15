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
  subtitle?: React.ReactNode
  defaultOpen?: boolean
  children?: React.ReactNode
  containerClass?: string
  contentClass?: string
}

export default function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = true,
  children,
  containerClass,
  contentClass,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [transitioned, setTransitioned] = useState(!defaultOpen)

  return (
    <Card
      className={cn(
        "flex min-h-0 w-full min-w-0 flex-col rounded-sm bg-background py-0",
        containerClass,
      )}
    >
      <Collapsible
        open={open}
        onOpenChange={(value) => {
          if (value) setTransitioned(false)
          setOpen(value)
        }}
      >
        <CardHeader
          className={cn(
            "h-12 rounded-sm bg-background-1 p-0",
            (open || !transitioned) && "rounded-b-none border-b border-accent",
          )}
        >
          <CollapsibleTrigger className="group flex h-full w-full items-center justify-between p-3">
            <CardTitle className="text-content-loud">
              {title} {subtitle && subtitle}
            </CardTitle>

            <div className="rounded-full bg-background-2 p-0.5 text-content-normal transition-colors duration-200 group-hover:bg-background-3 group-hover:text-content-loud">
              {open ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <AnimatePresence
          initial={false}
          onExitComplete={() => setTransitioned(true)}
        >
          {open && (
            <CollapsibleContent asChild forceMount>
              <motion.div
                key="card-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.42, 0, 0.58, 1] }}
                className="overflow-hidden"
              >
                <CardContent className={cn("p-4", contentClass)}>
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
