import { Skeleton } from "@/components/ui/skeleton"

interface ResourceCellProps {
  isEmpty: boolean
  isLoading: boolean
  children: React.ReactNode
}

export default function ResourceCell({
  isEmpty,
  isLoading,
  children,
}: ResourceCellProps) {
  if (isEmpty) return <span className="text-content-normal">--</span>
  if (isLoading) return <Skeleton className="h-6 w-full rounded-sm md:w-2/3" />
  return children
}
