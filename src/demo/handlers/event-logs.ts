import {
  MOCK_ACCOUNT,
  DAY,
  badRequest,
  endOfDay,
  environmentRelationship,
  fail,
  isUuid,
  millis,
  paginateMock,
  queryList,
  queryNested,
  registerMockSerializer,
  requireVisible,
  resource,
  mockRoute,
  scoped,
  startOfDay,
  mockStore,
  stripUuidDashes,
  toOne,
  type MockContext,
  type Linkage,
  type MockResource,
  type MockRow,
} from "@/demo/server"

const TYPE = "event-logs"
const LABEL = "event log"
const MIN_DATE_RANGE_DAYS = 1
const MAX_DATE_RANGE_DAYS = 31
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const IrregularResourceTypes: Readonly<Record<string, string>> = {
  policy: "policies",
  policies: "policies",
  process: "processes",
  processes: "processes",
  "machine-process": "processes",
  "machine-processes": "processes",
  component: "components",
  "machine-component": "components",
  "machine-components": "components",
  artifact: "artifacts",
  "release-artifact": "artifacts",
  "release-artifacts": "artifacts",
  arch: "arches",
  arches: "arches",
}

const eventLogs = () => mockStore.table(TYPE)

function nestedParam(nested: Record<string, string>, key: string): string {
  return key in nested ? nested[key].trim() : ""
}

export function normalizeResourceType(value: string): string {
  const type = value.trim().toLowerCase().replace(/_/g, "-")
  const irregular = IrregularResourceTypes[type]
  if (irregular) return irregular
  if (type === "" || type.endsWith("s")) return type
  return `${type}s`
}

export function matchesId(id: string, term: string): boolean {
  if (isUuid(term)) {
    return (
      stripUuidDashes(id).toLowerCase() === stripUuidDashes(term).toLowerCase()
    )
  }
  return id.toLowerCase().includes(term.toLowerCase())
}

export function linkageFilter(
  ctx: MockContext,
  key: string,
): (linkage: Linkage | null | undefined) => boolean {
  const nested = queryNested(ctx.query, key)
  const type = nestedParam(nested, "type")
  const nestedId = nestedParam(nested, "id")
  const id = nestedId === "" ? (ctx.query.get(key) ?? "").trim() : nestedId

  if (type === "" && id === "") return () => true

  const expectedType = type === "" ? null : normalizeResourceType(type)

  return (linkage) => {
    if (!linkage) return false
    if (expectedType && normalizeResourceType(linkage.type) !== expectedType) {
      return false
    }
    return id === "" || matchesId(linkage.id, id)
  }
}

export function dateRangeFilter(ctx: MockContext): (row: MockRow) => boolean {
  const range = queryNested(ctx.query, "date")
  const start = nestedParam(range, "start")
  const end = nestedParam(range, "end")

  if (start === "" || end === "") return () => true

  if (!DATE_PATTERN.test(start) || !DATE_PATTERN.test(end)) {
    fail(badRequest("invalid date range", { parameter: "date" }))
  }

  const from = startOfDay(start)
  const until = endOfDay(end)
  if (Number.isNaN(from) || Number.isNaN(until)) {
    fail(badRequest("invalid date range", { parameter: "date" }))
  }

  const days = Math.round((startOfDay(end) - from) / DAY)
  if (days < MIN_DATE_RANGE_DAYS || days > MAX_DATE_RANGE_DAYS) {
    fail(
      badRequest(
        `date range must be between ${MIN_DATE_RANGE_DAYS} and ${MAX_DATE_RANGE_DAYS} days (got ${days})`,
        { parameter: "date" },
      ),
    )
  }

  return (row) => {
    const created = millis(row.created)
    return created != null && created >= from && created <= until
  }
}

export function serializeMockEventLog(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return resource(
    ctx,
    row,
    {
      event: row.attributes.event,
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      request: toOne(ctx, row.refs.request),
      whodunnit: toOne(ctx, row.refs.whodunnit),
      resource: toOne(ctx, row.refs.resource),
    },
  )
}

registerMockSerializer(TYPE, serializeMockEventLog)

function eventFilter(ctx: MockContext): (row: MockRow) => boolean {
  const events = queryList(ctx.query, "events")
  if (events.length === 0) return () => true
  return (row) => events.includes(String(row.attributes.event))
}

function requestFilter(ctx: MockContext): (row: MockRow) => boolean {
  const term = (ctx.query.get("request") ?? "").trim()
  if (term === "") return () => true
  return (row) => {
    const request = row.refs.request
    return request != null && matchesId(request.id, term)
  }
}

mockRoute("GET", `${MOCK_ACCOUNT}/event-logs`, (ctx) => {
  const matchesEvent = eventFilter(ctx)
  const matchesRequest = requestFilter(ctx)
  const withinDates = dateRangeFilter(ctx)
  const matchesResource = linkageFilter(ctx, "resource")
  const matchesWhodunnit = linkageFilter(ctx, "whodunnit")

  const rows = scoped(ctx, eventLogs().all()).filter(
    (row) =>
      matchesEvent(row) &&
      matchesRequest(row) &&
      withinDates(row) &&
      matchesResource(row.refs.resource) &&
      matchesWhodunnit(row.refs.whodunnit),
  )

  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockEventLog(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/event-logs/:id`, (ctx) => {
  const row = requireVisible(ctx, eventLogs(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockEventLog(ctx, row) } }
})
