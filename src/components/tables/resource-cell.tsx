import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type ResourceCellProps =
  | { isEmpty: true }
  | { isEmpty: false; isLoading: boolean; children: React.ReactNode }

export default function ResourceCell(
  props: ResourceCellProps,
): React.ReactNode {
  if (props.isEmpty) return <Badge variant="disabled">Not set</Badge>
  if (props.isLoading)
    return <Skeleton className="h-6 w-full rounded-sm md:w-2/3" />
  return props.children
}
