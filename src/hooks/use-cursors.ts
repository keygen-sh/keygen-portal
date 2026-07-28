import { useState, useMemo, useCallback } from "react"
import {
  type NavigateOptions,
  useSearch,
  useNavigate,
} from "@tanstack/react-router"

import { cursorSearch } from "@/lib/pagination"

import { usePageSize, type DataTableState } from "@/hooks/use-data-table"

export function cursorFromLink(link?: string | null): string | null {
  if (!link) return null

  try {
    return new URL(link, window.location.origin).searchParams.get(
      "page[cursor]",
    )
  } catch {
    return null
  }
}

export function useCursors(page: number, setPage: (page: number) => void) {
  const [cursors, setCursors] = useState<(string | null)[]>([""])

  const cursor = cursors[page - 1] ?? ""

  const reset = useCallback(() => {
    setPage(1)
    setCursors([""])
  }, [setPage])

  const goToPage = useCallback(
    (nextPage: number, nextCursor: string | null) => {
      if (nextPage <= page) {
        setPage(Math.max(1, nextPage))
        return
      }

      if (!nextCursor) return

      setCursors((current) => {
        const next = current.slice(0, page)
        next[page] = nextCursor
        return next
      })
      setPage(nextPage)
    },
    [page, setPage],
  )

  return { cursor, reset, goToPage }
}

export type CursorSearchState = DataTableState & {
  cursor: string
  goToPage: (page: number, cursor: string | null) => void
}

// reads/updates cursor chain out of the route's search params
export function useCursorSearch(): CursorSearchState {
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const pageSize = usePageSize()

  const cursors = useMemo(() => cursorSearch(search).cursors ?? [], [search])

  const page = cursors.length + 1
  const cursor = cursors[cursors.length - 1] ?? ""

  const setCursors = useCallback(
    (next: string[]) => {
      void navigate({
        search: () => ({
          ...search,
          cursors: next.length > 0 ? next : undefined,
        }),
      } as NavigateOptions)
    },
    [navigate, search],
  )

  const goToPage = useCallback(
    (nextPage: number, nextCursor: string | null) => {
      if (nextPage === page) return

      if (nextPage < page) {
        setCursors(cursors.slice(0, Math.max(0, nextPage - 1)))
        return
      }

      if (!nextCursor) return

      setCursors([...cursors, nextCursor])
    },
    [page, cursors, setCursors],
  )

  return { page, pageSize, cursor, goToPage }
}
