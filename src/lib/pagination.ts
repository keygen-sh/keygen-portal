export type CursorSearch = {
  cursors?: string[]
}

const CURSOR_PATTERN =
  /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i

// returns cursors from a route's search params
export function cursorSearch(search: object): CursorSearch {
  const { cursors } = search as { cursors?: unknown }
  if (!Array.isArray(cursors)) return {}

  const walked: string[] = []
  for (const cursor of cursors) {
    if (typeof cursor !== "string" || !CURSOR_PATTERN.test(cursor)) break

    walked.push(cursor)
  }

  return walked.length > 0 ? { cursors: walked } : {}
}

// returns filters from a route's search params
export function omitCursorSearch(search: object): Record<string, unknown> {
  const { cursors, ...filters } = search as Record<string, unknown>

  return filters
}
