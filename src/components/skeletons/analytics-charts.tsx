import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { cn } from "@/lib/utils"

function StaticSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("animate-none", className)} />
}

function Activity() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {["Requests", "Validations"].map((title) => (
        <Card
          key={title}
          className="gap-0 rounded-md border-accent bg-background p-0"
        >
          <div className="border-b border-accent px-4 pt-3 pb-2">
            <StaticSkeleton className="h-4 w-24" />
          </div>
          <div className="p-4">
            <StaticSkeleton className="h-64 w-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function Events() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          className="gap-0 rounded-md border-accent bg-background p-0"
        >
          <div className="border-b border-accent px-4 pt-3 pb-2">
            <StaticSkeleton className="h-5 w-36" />
          </div>
          <div className="p-3">
            <StaticSkeleton className="h-36 w-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function Leaderboards() {
  return (
    <Card className="gap-0 rounded-md border-accent bg-background p-0">
      <div className="p-4">
        <StaticSkeleton className="h-80 w-full" />
      </div>
    </Card>
  )
}

function Heatmap() {
  return (
    <div className="w-full overflow-hidden">
      <Skeleton className="mb-3 h-4 w-28" />
      <div className="grid grid-cols-[34px_repeat(53,minmax(16px,1fr))] grid-rows-[auto_repeat(7,8px)] gap-0.5">
        {Array.from({ length: 8 * 54 }).map((_, index) => {
          const isLabelColumn = index % 54 === 0
          const isMonthRow = index < 54

          return (
            <Skeleton
              key={index}
              className={cn(
                "rounded-none",
                isLabelColumn || isMonthRow
                  ? "h-3 bg-transparent"
                  : "h-2 w-full",
              )}
            />
          )
        })}
      </div>
      <div className="mt-3 flex justify-end gap-1.5">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-2 w-5 rounded-none" />
        ))}
      </div>
    </div>
  )
}

function Dashboard({ staticSkeletons = false }: { staticSkeletons?: boolean }) {
  const Placeholder = staticSkeletons ? StaticSkeleton : Skeleton

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-md border-accent bg-background p-4"
          >
            <Placeholder className="mb-5 h-4 w-20" />
            <Placeholder className="h-8 w-24" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Placeholder className="h-72 rounded-md" />
        <Placeholder className="h-72 rounded-md" />
      </div>
      <Placeholder className="h-96 rounded-md" />
    </div>
  )
}

export { Activity, Dashboard, Events, Heatmap, Leaderboards }
