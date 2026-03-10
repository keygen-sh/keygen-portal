import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  RefObject,
} from "react"

const MaxPageSize = 100 // API limit

export type DataTableState = {
  page: number
  pageSize: number
  isMeasured: boolean
  containerRef: RefObject<HTMLDivElement | null>
  onMeasure: (measurements: { rowHeight: number; headerHeight: number }) => void
  setPage: (page: number) => void
}

// Companion hook for DataTable that handles pagination and container measurement
export function useDataTable(): DataTableState {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageSize, setPageSize] = useState(1)
  const [page, setPage] = useState(1)
  const [isMeasured, setIsMeasured] = useState(false)
  const pageSizeRef = useRef(1)
  const measurementsRef = useRef<{
    rowHeight: number
    headerHeight: number
  } | null>(null)

  // Calculate how many rows fit in the container from measured row height and header height
  const recalculate = useCallback(() => {
    const container = containerRef.current
    const measurements = measurementsRef.current
    if (!container || !measurements || measurements.rowHeight === 0) return

    const available = container.clientHeight - measurements.headerHeight
    const next = Math.max(
      1,
      Math.min(MaxPageSize, Math.floor(available / measurements.rowHeight)),
    )

    if (pageSizeRef.current !== next) {
      pageSizeRef.current = next
      setPageSize(next)
    } else {
      setIsMeasured(true)
    }
  }, [])

  // Callback passed to DataTable to get row and header measurements
  const onMeasure = useCallback(
    (measurements: { rowHeight: number; headerHeight: number }) => {
      measurementsRef.current = measurements
      recalculate()
    },
    [recalculate],
  )

  // Recalculate on container resize
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    recalculate()

    const observer = new ResizeObserver(() => recalculate())
    observer.observe(container)
    return () => observer.disconnect()
  }, [recalculate])

  // Reset to first page when page size changes (e.g. container resize)
  useEffect(() => setPage(1), [pageSize])

  return { page, pageSize, isMeasured, onMeasure, setPage, containerRef }
}
