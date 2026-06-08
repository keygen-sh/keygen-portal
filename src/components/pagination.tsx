import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  page: number
  hasNext?: boolean
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export default function Pagination({
  page,
  hasNext,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
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
      <span className="text-sm text-muted-foreground">Page {page}</span>

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
        disabled={!hasNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
