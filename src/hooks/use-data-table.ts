import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

export type DataTableState = {
  page: number
  pageSize: number
}

export function usePageSize(): number {
  const isMobile = useMobile()

  return isMobile ? 15 : 20
}

// local page state for lists that aren't a route
// i.e. environments list dialog
export function useDataTable(): DataTableState & {
  setPage: (page: number) => void
} {
  const [page, setPage] = useState(1)
  const pageSize = usePageSize()

  return { page, setPage, pageSize }
}
