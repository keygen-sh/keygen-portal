import { Children } from "react"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface FormsSectionCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export default function FormsSectionCard({
  title,
  children,
  className,
}: FormsSectionCardProps): React.ReactElement {
  return (
    <Card className={cn("m-4 rounded-sm bg-background pt-0", className)}>
      <CardHeader className="h-9 rounded-t-sm border-b border-accent bg-background-1 px-4 py-1">
        <CardTitle className="text-content-loud">{title}</CardTitle>
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
