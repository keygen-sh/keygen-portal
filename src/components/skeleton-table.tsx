import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonTable(): React.ReactElement {
  return (
    <div className="flex w-full flex-col justify-center space-y-4 p-4 md:pr-12">
      <Skeleton className="mb-4 h-6 w-full" />
      <Skeleton className="ml-4 h-8 w-3/4" />
      <Skeleton className="ml-4 h-8 w-1/2" />
      <Skeleton className="ml-4 h-8 w-1/4" />
      <Skeleton className="ml-4 h-8 w-1/3" />
      <div className="flex w-full justify-end">
        <Skeleton className="h-8 w-36" />
      </div>
    </div>
  )
}
