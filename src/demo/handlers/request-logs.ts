import {
  MOCK_ACCOUNT,
  type MockContext,
  environmentRelationship,
  paginateMock,
  registerMockSerializer,
  requireVisible,
  type MockResource,
  resource,
  mockRoute,
  type MockRow,
  scoped,
  mockStore,
  stringOrNull,
  toOne,
} from "@/demo/server"
import { dateRangeFilter, linkageFilter } from "./event-logs"

const TYPE = "request-logs"
const LABEL = "request log"

const requestLogs = () => mockStore.table(TYPE)

function buildRequestLog(
  ctx: MockContext,
  row: MockRow,
  includeBlobs: boolean,
): MockResource {
  return resource(
    ctx,
    row,
    {
      url: row.attributes.url,
      method: row.attributes.method,
      status: row.attributes.status,
      ip: row.attributes.ip ?? null,
      userAgent: row.attributes.userAgent ?? null,
      requestHeaders: includeBlobs
        ? (row.attributes.requestHeaders ?? null)
        : null,
      requestBody: includeBlobs ? (row.attributes.requestBody ?? null) : null,
      responseSignature: includeBlobs
        ? (row.attributes.responseSignature ?? null)
        : null,
      responseHeaders: includeBlobs
        ? (row.attributes.responseHeaders ?? null)
        : null,
      responseBody: includeBlobs ? (row.attributes.responseBody ?? null) : null,
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      requestor: toOne(ctx, row.refs.requestor),
      resource: toOne(ctx, row.refs.resource),
    },
  )
}

export function serializeMockRequestLog(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return buildRequestLog(ctx, row, true)
}

export function serializeMockRequestLogSummary(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return buildRequestLog(ctx, row, false)
}

registerMockSerializer(TYPE, serializeMockRequestLog)

function exactFilter(
  ctx: MockContext,
  key: string,
  attribute: string,
  normalize: (value: string) => string = (value) => value,
): (row: MockRow) => boolean {
  const term = (ctx.query.get(key) ?? "").trim()
  if (term === "") return () => true
  const expected = normalize(term)
  return (row) => stringOrNull(row.attributes[attribute]) === expected
}

function ipFilter(ctx: MockContext): (row: MockRow) => boolean {
  const term = (ctx.query.get("ip") ?? "").trim().toLowerCase()
  if (term === "") return () => true
  return (row) => {
    const ip = stringOrNull(row.attributes.ip)
    return ip != null && ip.toLowerCase().startsWith(term)
  }
}

function urlFilter(ctx: MockContext): (row: MockRow) => boolean {
  const term = ctx.query.get("url") ?? ""
  if (term.trim() === "") return () => true
  return (row) => {
    const url = stringOrNull(row.attributes.url)
    return url != null && url.includes(term)
  }
}

mockRoute("GET", `${MOCK_ACCOUNT}/request-logs`, (ctx) => {
  const matchesMethod = exactFilter(ctx, "method", "method", (value) =>
    value.toUpperCase(),
  )
  const matchesStatus = exactFilter(ctx, "status", "status")
  const matchesIp = ipFilter(ctx)
  const matchesUrl = urlFilter(ctx)
  const withinDates = dateRangeFilter(ctx)
  const matchesResource = linkageFilter(ctx, "resource")
  const matchesRequestor = linkageFilter(ctx, "requestor")

  const rows = scoped(ctx, requestLogs().all()).filter(
    (row) =>
      matchesMethod(row) &&
      matchesStatus(row) &&
      matchesIp(row) &&
      matchesUrl(row) &&
      withinDates(row) &&
      matchesResource(row.refs.resource) &&
      matchesRequestor(row.refs.requestor),
  )

  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) =>
      serializeMockRequestLogSummary(ctx, row),
    ),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/request-logs/:id`, (ctx) => {
  const row = requireVisible(ctx, requestLogs(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockRequestLog(ctx, row) } }
})
