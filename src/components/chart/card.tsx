import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card"

import { cn } from "@/lib/utils"

interface ChartsCardProps {
  title: string
  description?: string
  className?: string
  children: React.ReactNode
  isLoading?: boolean
  action?: React.ReactNode
}

export default function ChartCard({
  title,
  description,
  className,
  children,
  isLoading,
  action,
}: ChartsCardProps) {
  return (
    <Card className={cn("w-fit border-accent bg-background p-0", className)}>
      <CardHeader className="items-center border-b border-accent px-4 pt-3 [.border-b]:pb-2">
        <CardTitle className="text-sm font-medium text-content-muted">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? <Skeleton className="h-40 w-3/4" /> : children}
      </CardContent>
    </Card>
  )
}
