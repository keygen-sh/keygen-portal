import type { MockContext } from "./context"
import { fail, invalidParameter } from "./errors"
import { isUuid } from "./ids"
import { newestFirst } from "./store"
import type { MockRow } from "./types"

export interface MockPage<T> {
  data: T[]
  links: Record<string, string | null>
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

function parseBounded(
  raw: string | null,
  parameter: string,
  fallback: number,
): number {
  if (raw == null || raw === "") return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 1 || value > MAX_LIMIT) {
    fail(
      invalidParameter(
        parameter,
        `${parameter} must be a number between 1 and ${MAX_LIMIT} (got ${raw})`,
      ),
    )
  }
  return value
}

function pageLink(ctx: MockContext, cursor: string, size: number): string {
  const query = new URLSearchParams(ctx.query)
  query.set("page[cursor]", cursor)
  query.set("page[size]", String(size))
  return `${ctx.path}?${query.toString()}`
}

export function paginateMock<T>(
  ctx: MockContext,
  rows: MockRow[],
  serialize: (row: MockRow) => T,
): MockPage<T> {
  const sorted = newestFirst(rows)
  const hasPageParams = [...ctx.query.keys()].some((key) =>
    key.startsWith("page["),
  )

  if (!hasPageParams) {
    const limit = parseBounded(ctx.query.get("limit"), "limit", DEFAULT_LIMIT)
    return { data: sorted.slice(0, limit).map(serialize), links: {} }
  }

  const size = parseBounded(
    ctx.query.get("page[size]"),
    "page[size]",
    DEFAULT_LIMIT,
  )
  const cursor = ctx.query.get("page[cursor]") ?? ""

  let start = 0
  if (cursor !== "") {
    if (!isUuid(cursor)) {
      fail(
        invalidParameter(
          "page[cursor]",
          `page cursor must be a valid UUID (got "${cursor}")`,
        ),
      )
    }
    const index = sorted.findIndex((row) => row.id === cursor)
    start = index === -1 ? sorted.length : index + 1
  }

  const slice = sorted.slice(start, start + size)
  const hasMore = start + size < sorted.length
  const last = slice[slice.length - 1]

  return {
    data: slice.map(serialize),
    links: {
      self: pageLink(ctx, cursor, size),
      next: hasMore && last ? pageLink(ctx, last.id, size) : null,
    },
  }
}

export function limited(ctx: MockContext, rows: MockRow[]): MockRow[] {
  const limit = parseBounded(ctx.query.get("limit"), "limit", DEFAULT_LIMIT)
  return newestFirst(rows).slice(0, limit)
}
