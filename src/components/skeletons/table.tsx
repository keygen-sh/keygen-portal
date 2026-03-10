import { Skeleton } from "@/components/ui/skeleton"

import { cn } from "@/lib/utils"

interface SkeletonTableProps {
  className?: string
}

export default function SkeletonTable({
  className,
}: SkeletonTableProps): React.ReactNode {
  return (
    <div
      className={cn(
        "flex w-full flex-col justify-center space-y-4 p-4 md:pr-12",
        className,
      )}
    >
      <Skeleton className="mb-4 h-6 w-full rounded-sm" />
      <Skeleton className="ml-4 h-8 w-3/4" />
      <Skeleton className="ml-4 h-8 w-1/2" />
      <Skeleton className="ml-4 h-8 w-1/4" />
      <Skeleton className="ml-4 h-8 w-1/3" />
    </div>
  )
}
