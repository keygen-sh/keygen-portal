import type { MockContext } from "./context"
import { fail, forbidden, notFound } from "./errors"
import type { MockTable } from "./store"
import type { Linkage, MockRow } from "./types"

import { IsolationStrategy } from "@/types/environments"

export { IsolationStrategy }

function environmentId(row: MockRow): string | null {
  return row.refs.environment?.id ?? null
}

export function inAccount(ctx: MockContext, row: MockRow): boolean {
  return row.refs.account?.id === ctx.accountId
}

export function inScope(ctx: MockContext, row: MockRow): boolean {
  if (!inAccount(ctx, row)) return false

  const rowEnvironment = environmentId(row)
  if (ctx.environment == null) return rowEnvironment == null
  if (rowEnvironment === ctx.environment.id) return true

  return (
    ctx.environment.attributes.isolationStrategy === IsolationStrategy.Shared &&
    rowEnvironment == null
  )
}

export function scoped(ctx: MockContext, rows: MockRow[]): MockRow[] {
  return rows.filter((row) => inScope(ctx, row))
}

export function accountRows(ctx: MockContext, rows: MockRow[]): MockRow[] {
  return rows.filter((row) => inAccount(ctx, row))
}

export function visible(
  ctx: MockContext,
  table: MockTable,
  id: string,
): MockRow | undefined {
  const row = table.get(id)
  return row && inScope(ctx, row) ? row : undefined
}

export function requireVisible(
  ctx: MockContext,
  table: MockTable,
  id: string,
  label: string,
): MockRow {
  const row = visible(ctx, table, id)
  if (!row) fail(notFound(label, id))
  return row
}

export function assertWritable(ctx: MockContext, row: MockRow): void {
  if (ctx.environment == null) return
  if (environmentId(row) === ctx.environment.id) return

  fail(
    forbidden(
      "You do not have permission to complete the request (record environment is not compatible with the current environment)",
    ),
  )
}

export function environmentRef(ctx: MockContext): Linkage | null {
  return ctx.environment
    ? { type: "environments", id: ctx.environment.id }
    : null
}

export function accountRef(ctx: MockContext): Linkage {
  return { type: "accounts", id: ctx.accountId }
}

export function baseRefs(ctx: MockContext): Record<string, Linkage | null> {
  return { account: accountRef(ctx), environment: environmentRef(ctx) }
}

export function sameEnvironment(a: MockRow, b: MockRow): boolean {
  return environmentId(a) === environmentId(b)
}

export function compatibleEnvironment(
  parent: MockRow,
  child: MockRow,
): boolean {
  const parentEnvironment = environmentId(parent)
  const childEnvironment = environmentId(child)
  return parentEnvironment == null || parentEnvironment === childEnvironment
}
