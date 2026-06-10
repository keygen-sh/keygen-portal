import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { cn } from "@/lib/utils"

export default function AnalyticsCard({
  title,
  action,
  children,
  className,
  actionClassName,
  contentClassName,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  actionClassName?: string
  contentClassName?: string
}) {
  return (
    <Card
      className={cn(
        "group/card min-w-0 gap-0 rounded-md border-accent bg-background p-0",
        className,
      )}
    >
      <CardHeader className="border-b border-accent px-4 pt-3 [.border-b]:pb-2">
        <CardTitle className="text-sm font-medium text-content-muted">
          {title}
        </CardTitle>
        {action && (
          <CardAction className={actionClassName}>{action}</CardAction>
        )}
      </CardHeader>
      <CardContent className={cn("min-w-0 p-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
