import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

export type DataTableState = {
  page: number
  setPage: (page: number) => void
  pageSize: number
}

export function useDataTable(): DataTableState {
  const isMobile = useMobile()
  const [page, setPage] = useState(1)

  const pageSize = isMobile ? 15 : 20

  return { page, setPage, pageSize }
}
