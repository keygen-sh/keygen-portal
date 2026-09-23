import type { MockContext } from "./context"
import { subjectLinkage } from "./context"
import { makeMockRow, newestFirst, mockStore } from "./store"
import { nowIso } from "./time"
import type { MockResult } from "./types"

const MAX_REQUEST_LOGS = 500
const PRUNE_BATCH = 100
const MAX_BODY_LENGTH = 2048
const DEMO_IP = "203.0.113.42"

function truncate(value: string | null): string | null {
  if (value == null) return null
  return value.length > MAX_BODY_LENGTH ? "RES_BODY_TOO_LARGE" : value
}

export function recordMockRequest(
  ctx: MockContext,
  result: MockResult,
  requestBody: string | null,
): void {
  if (!ctx.accountId) return

  const responseBody =
    result.body == null || (ctx.method === "GET" && result.status < 400)
      ? null
      : truncate(JSON.stringify(result.body))
  const query = ctx.url.search
  const created = nowIso()

  const row = makeMockRow(
    "request-logs",
    ctx.requestId,
    {
      url: `${ctx.path}${query}`,
      method: ctx.method,
      status: String(result.status),
      ip: DEMO_IP,
      userAgent: navigator.userAgent,
      requestHeaders: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Keygen-Version": ctx.headers.get("keygen-version") ?? "1.8",
        ...(ctx.headers.get("keygen-environment")
          ? { "Keygen-Environment": ctx.headers.get("keygen-environment") }
          : {}),
      },
      requestBody: truncate(requestBody),
      responseSignature: null,
      responseHeaders: {
        "Content-Type": "application/vnd.api+json; charset=utf-8",
        "Keygen-Version": ctx.headers.get("keygen-version") ?? "1.8",
      },
      responseBody,
    },
    {
      account: { type: "accounts", id: ctx.accountId },
      environment: ctx.environment
        ? { type: "environments", id: ctx.environment.id }
        : null,
      requestor: subjectLinkage(ctx),
      resource: ctx.resource,
    },
    created,
  )

  const table = mockStore.table("request-logs")
  table.insert(row)

  if (table.count() > MAX_REQUEST_LOGS + PRUNE_BATCH) {
    const stale = newestFirst(table.all()).slice(MAX_REQUEST_LOGS)
    for (const old of stale) table.delete(old.id)
  }
}
