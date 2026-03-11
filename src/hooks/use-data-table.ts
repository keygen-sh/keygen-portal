import { useState, useMemo } from "react"
import { useMobile } from "@/hooks/use-mobile"

export type DataTableState = {
  page: number
  setPage: (page: number) => void
  pageSize: number
}

export function useDataTable(): DataTableState {
  const isMobile = useMobile()
  const [page, setPage] = useState(1)

  const pageSize = useMemo(() => {
    return isMobile ? 15 : 20
  }, [isMobile])

  return { page, setPage, pageSize }
}
