import { Children } from "react"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface SectionCardProps {
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function SectionCard({
  title,
  actions,
  children,
  className,
}: SectionCardProps): React.ReactElement {
  return (
    <Card className={cn("rounded-sm bg-background pt-0", className)}>
      <CardHeader className="flex h-12 items-center justify-between rounded-t-sm border-b border-accent bg-background-1 p-3!">
        <CardTitle className="text-content-loud">{title}</CardTitle>
        {actions}
      </CardHeader>
      <CardContent className="p-4">
        {Children.map(children, (child, index) => (
          <>
            {child}
            {index < Children.count(children) - 1 && (
              <Separator className="my-6" />
            )}
          </>
        ))}
      </CardContent>
    </Card>
  )
}
