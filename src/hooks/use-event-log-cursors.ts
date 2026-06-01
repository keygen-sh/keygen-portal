import { useState, useCallback } from "react"

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

export function useEventLogCursors(
  page: number,
  setPage: (page: number) => void,
) {
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
