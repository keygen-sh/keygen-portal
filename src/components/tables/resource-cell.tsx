import { Skeleton } from "@/components/ui/skeleton"

import EmptyCell from "./empty-cell"

type ResourceCellProps =
  | { isEmpty: true; isLoading?: never; children?: never }
  | { isEmpty: boolean; isLoading: boolean; children: React.ReactNode }

export default function ResourceCell(
  props: ResourceCellProps,
): React.ReactNode {
  if (props.isLoading) {
    return <Skeleton className="h-6 w-full rounded-sm md:w-2/3" />
  }

  if (props.isEmpty) {
    return <EmptyCell label="None" />
  }

  return props.children
}
