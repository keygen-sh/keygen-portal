import { Skeleton } from "@/components/ui/skeleton"

import { cn } from "@/lib/utils"

const EVENT_LOG_FEED_SKELETON_ROWS = [
  ["w-32", "w-20", "w-16"],
  ["w-24", "w-16", "w-20"],
  ["w-16", "w-20", "w-24"],
  ["w-32", "w-16", "w-16"],
  ["w-24", "w-24", "w-20"],
  ["w-32", "w-16", "w-24"],
  ["w-16", "w-20", "w-16"],
  ["w-16", "w-16", "w-24"],
  ["w-24", "w-20", "w-20"],
  ["w-16", "w-16", "w-16"],
  ["w-8", "w-24", "w-20"],
  ["w-16", "w-16", "w-16"],
  ["w-16", "w-20", "w-16"],
  ["w-16", "w-16", "w-8"],
  ["w-24", "w-20", "w-20"],
  ["w-8", "w-24", "w-20"],
] as const

interface EventLogSkeletonRowProps {
  eventWidth: string
  timestampWidth: string
  changesWidth: string
}

function EventLogSkeletonRow({
  eventWidth,
  timestampWidth,
  changesWidth,
}: EventLogSkeletonRowProps) {
  return (
    <div className="flex gap-3 bg-background px-4 text-xs">
      <div className="min-w-0 flex-1 py-3">
        <Skeleton
          className={cn(
            "h-[14px] animate-none rounded-[3px] bg-secondary/20",
            eventWidth,
          )}
        />
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <Skeleton
            className={cn(
              "h-[10px] shrink-0 animate-none rounded-sm bg-accent",
              timestampWidth,
            )}
          />
          <Skeleton
            className={cn(
              "h-[10px] animate-none rounded-sm bg-accent/60",
              changesWidth,
            )}
          />
        </div>
      </div>
    </div>
  )
}

interface EventLogSkeletonProps {
  compact?: boolean
  className?: string
}

export default function EventLogSkeleton({
  compact = false,
  className,
}: EventLogSkeletonProps) {
  const skeletonRows = compact
    ? EVENT_LOG_FEED_SKELETON_ROWS.slice(0, 12)
    : EVENT_LOG_FEED_SKELETON_ROWS

  return (
    <div className={cn("pt-2", className)}>
      {skeletonRows.map(([eventWidth, timestampWidth, changesWidth], index) => (
        <EventLogSkeletonRow
          key={index}
          eventWidth={eventWidth}
          timestampWidth={timestampWidth}
          changesWidth={changesWidth}
        />
      ))}
    </div>
  )
}
