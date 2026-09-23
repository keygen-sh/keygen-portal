import type { MockContext } from "./context"
import { subjectLinkage } from "./context"
import { uuid } from "./ids"
import { makeMockRow, mockStore } from "./store"
import { nowIso } from "./time"
import type { MockAttributes, Linkage, MockRow } from "./types"

export interface MockEventOptions {
  resource: MockRow | Linkage
  metadata?: Record<string, unknown>
  whodunnit?: Linkage | null
  environment?: Linkage | null
  account?: Linkage
  created?: string
}

export type MockEmitListener = (
  ctx: MockContext | null,
  event: MockRow,
  resource: MockRow | null,
) => void

const listeners = new Set<MockEmitListener>()

export function onMockEvent(listener: MockEmitListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function isRow(value: MockRow | Linkage): value is MockRow {
  return "attributes" in value
}

export function emitMockEvent(
  ctx: MockContext | null,
  event: string,
  options: MockEventOptions,
): MockRow {
  const target = options.resource
  const resourceLinkage: Linkage = { type: target.type, id: target.id }
  const resourceRow = isRow(target)
    ? target
    : (mockStore.table(target.type).get(target.id) ?? null)

  const account =
    options.account ??
    (ctx ? { type: "accounts", id: ctx.accountId } : null) ??
    resourceRow?.refs.account ??
    null

  const environment =
    options.environment !== undefined
      ? options.environment
      : (resourceRow?.refs.environment ??
        (ctx ? environmentLinkage(ctx) : null))

  const created = options.created ?? nowIso()

  const row = makeMockRow(
    "event-logs",
    uuid(Date.parse(created)),
    {
      event,
      metadata: options.metadata ?? {},
    },
    {
      account,
      environment,
      whodunnit:
        options.whodunnit !== undefined
          ? options.whodunnit
          : ctx
            ? subjectLinkage(ctx)
            : null,
      resource: resourceLinkage,
      request: ctx ? { type: "request-logs", id: ctx.requestId } : null,
    },
    created,
  )

  mockStore.table("event-logs").insert(row)

  for (const listener of listeners) {
    listener(ctx, row, resourceRow)
  }

  return row
}

function environmentLinkage(ctx: MockContext): Linkage | null {
  return ctx.environment
    ? { type: "environments", id: ctx.environment.id }
    : null
}

export function diffMetadata(
  before: MockAttributes,
  after: MockAttributes,
  ignore: string[] = [],
): Record<string, unknown> {
  const diff: Record<string, [unknown, unknown]> = {}
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const key of keys) {
    if (ignore.includes(key)) continue
    const previous = before[key]
    const next = after[key]
    if (JSON.stringify(previous) !== JSON.stringify(next)) {
      diff[key] = [previous ?? null, next ?? null]
    }
  }

  return { diff }
}
