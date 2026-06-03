import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  page: number
  // FIXME(cazden) refactor based on cursor-based pagination,
  // but for now support both cursor and page-based
  pageCount?: number
  hasNext?: boolean
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export default function Pagination({
  page,
  pageCount,
  hasNext,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const canNext = pageCount == null ? !!hasNext : page < pageCount

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-24 rounded-sm" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Page {page}
        {pageCount != null && ` of ${Math.max(1, pageCount)}`}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
