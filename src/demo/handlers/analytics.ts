import {
  ANALYTICS,
  accountRows,
  badRequest,
  DAY,
  dateOnly,
  endpointNotFound,
  fail,
  isRecord,
  isUuid,
  millis,
  mockRoute,
  scoped,
  startOfDay,
  mockStore,
  type MockContext,
  type MockResult,
  type MockRow,
} from "@/demo/server"
import { EventTypes } from "@/types/events"

const LICENSES_TYPE = "licenses"
const CUSTOMER_ROLE = "user"
const EXPIRATIONS_HEATMAP = "expirations"
const REQUESTS_GAUGE = "requests"
const VALID_METRIC = "validations.valid"
const ACTIVITY_WINDOW = 90 * DAY
const ACTIVITY_ATTRIBUTES = ["lastValidated", "lastCheckOut", "lastCheckIn"]
const VALIDATION_EVENTS = [
  "license.validation.succeeded",
  "license.validation.failed",
]
const DEFAULT_SERIES_DAYS = 14
const DEFAULT_HEATMAP_DAYS = 365
const DEFAULT_LEADERBOARD_LIMIT = 10
const MAX_LEADERBOARD_LIMIT = 100
const DATE_PATTERN = /^(\d{4})-(\d{1,2})-(\d{1,2})/
const KNOWN_EVENTS: readonly string[] = EventTypes
const GAUGE_METRICS = ["licenses", "machines", "users", "alus"] as const
const LEADERBOARDS = ["ips", "urls", "licenses", "user-agents"] as const
const REQUEST_STATUSES: Readonly<Record<string, readonly string[]>> = {
  "requests.2xx": ["200", "201", "202", "204"],
  "requests.3xx": ["301", "302", "303", "304", "307", "308"],
  "requests.4xx": [
    "400",
    "401",
    "402",
    "403",
    "404",
    "405",
    "406",
    "409",
    "410",
    "413",
    "422",
    "429",
  ],
  "requests.5xx": ["500", "501", "502", "503", "504"],
}
const REQUEST_METRICS = Object.keys(REQUEST_STATUSES)

type GaugeMetric = (typeof GAUGE_METRICS)[number]
type Leaderboard = (typeof LEADERBOARDS)[number]
type Counter = (ctx: MockContext, at: number) => number
type Discriminator = (row: MockRow) => string | null
type Buckets = Map<string, Map<string, number>>

interface DateRange {
  start: string
  end: string
}

interface DateShift {
  days?: number
  months?: number
  years?: number
}

interface GaugeEntry {
  metric: string
  count: number
}

interface SparkEntry extends GaugeEntry {
  date: string
}

interface LeaderboardEntry {
  discriminator: string
  count: number
}

interface HeatmapCell {
  date: string
  x: number
  y: number
  temperature: number
  count: number
}

const licenses = () => mockStore.table(LICENSES_TYPE)
const licenseUsers = () => mockStore.table("license-users")
const users = () => mockStore.table("users")

function ok<T>(data: T[]): MockResult {
  return { status: 200, body: { data } }
}

function scopedRows(ctx: MockContext, type: string): MockRow[] {
  return scoped(ctx, mockStore.table(type).all())
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function formatLocalDate(date: Date): string {
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  return `${date.getFullYear()}-${month}-${day}`
}

function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function localDateOf(at: number): string {
  return formatLocalDate(new Date(at))
}

function shiftLocalDate(
  date: string,
  { days = 0, months = 0, years = 0 }: DateShift,
): string {
  const shifted = parseLocalDate(date)
  shifted.setFullYear(
    shifted.getFullYear() + years,
    shifted.getMonth() + months,
    shifted.getDate() + days,
  )
  return formatLocalDate(shifted)
}

function endOfLocalDay(date: string): number {
  return parseLocalDate(shiftLocalDate(date, { days: 1 })).getTime() - 1
}

function eachLocalDate(range: DateRange): string[] {
  const dates: string[] = []
  for (
    let date = range.start;
    date <= range.end;
    date = shiftLocalDate(date, { days: 1 })
  ) {
    dates.push(date)
  }
  return dates
}

function normalizeDate(raw: string): string | null {
  const match = DATE_PATTERN.exec(raw.trim())
  if (!match) return null

  const [, year, month, day] = match.map(Number)
  const parsed = new Date(year, month - 1, day)
  if (parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return null

  return formatLocalDate(parsed)
}

function dateParameter(ctx: MockContext, name: string): string | null {
  const raw = ctx.query.get(name)
  if (raw == null || raw.trim() === "") return null

  const date = normalizeDate(raw)
  if (date == null) {
    fail(
      badRequest("type mismatch (received string expected date)", {
        parameter: name,
      }),
    )
  }
  return date
}

function seriesRange(ctx: MockContext, today: string): DateRange {
  const start =
    dateParameter(ctx, "date[start]") ??
    shiftLocalDate(today, { days: -DEFAULT_SERIES_DAYS })
  const end = dateParameter(ctx, "date[end]") ?? today

  const earliest = shiftLocalDate(today, { years: -1 })
  if (start < earliest) {
    fail(
      badRequest(`must be greater than or equal to ${earliest}`, {
        parameter: "date[start]",
      }),
    )
  }

  return { start, end }
}

function heatmapRange(ctx: MockContext, today: string): DateRange {
  const start = dateParameter(ctx, "date[start]") ?? today
  const end =
    dateParameter(ctx, "date[end]") ??
    shiftLocalDate(today, { days: DEFAULT_HEATMAP_DAYS - 1 })

  const earliest = shiftLocalDate(today, { months: -1 })
  if (start < earliest) {
    fail(
      badRequest(`must be greater than or equal to ${earliest}`, {
        parameter: "date[start]",
      }),
    )
  }
  const latest = shiftLocalDate(today, { years: 1 })
  if (end > latest) {
    fail(
      badRequest(`must be less than or equal to ${latest}`, {
        parameter: "date[end]",
      }),
    )
  }

  return { start, end }
}

function limitParameter(ctx: MockContext): number {
  const raw = ctx.query.get("limit")
  if (raw == null || raw === "") return DEFAULT_LEADERBOARD_LIMIT

  const limit = Number(raw)
  if (!Number.isInteger(limit)) {
    fail(
      badRequest("type mismatch (received string expected integer)", {
        parameter: "limit",
      }),
    )
  }
  if (limit > MAX_LEADERBOARD_LIMIT) {
    fail(
      badRequest(`must be less than or equal to ${MAX_LEADERBOARD_LIMIT}`, {
        parameter: "limit",
      }),
    )
  }
  return Math.max(0, limit)
}

function licenseParameter(ctx: MockContext): string | null {
  const raw = ctx.query.get("license")
  if (raw == null || raw === "") return null

  if (!isUuid(raw)) {
    fail(
      badRequest("type mismatch (received string expected uuid)", {
        parameter: "license",
      }),
    )
  }
  return raw
}

function stringAttribute(row: MockRow, key: string): string | null {
  const value = row.attributes[key]
  return typeof value === "string" ? value : null
}

function presentAttribute(row: MockRow, key: string): string | null {
  const value = stringAttribute(row, key)
  return value == null || value.trim() === "" ? null : value
}

function statusOf(row: MockRow): string | null {
  const status = row.attributes.status
  if (typeof status === "number") return String(status)
  return typeof status === "string" ? status : null
}

function createdOn(row: MockRow): string {
  return localDateOf(Date.parse(row.created))
}

function createdWithin(range: DateRange): (row: MockRow) => boolean {
  return (row) => {
    const date = createdOn(row)
    return date >= range.start && date <= range.end
  }
}

function countBy(
  rows: MockRow[],
  keyOf: (row: MockRow) => string | null,
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = keyOf(row)
    if (key == null) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

function bucketize(
  rows: MockRow[],
  metricOf: (row: MockRow) => string | null,
): Buckets {
  const buckets: Buckets = new Map()
  for (const row of rows) {
    const metric = metricOf(row)
    if (metric == null) continue

    const dates = buckets.get(metric) ?? new Map<string, number>()
    const date = createdOn(row)
    dates.set(date, (dates.get(date) ?? 0) + 1)
    buckets.set(metric, dates)
  }
  return buckets
}

function toSparks(
  buckets: Buckets,
  metrics: readonly string[],
  range: DateRange,
): SparkEntry[] {
  return metrics.flatMap((metric) => {
    const entries = [...(buckets.get(metric) ?? [])]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ metric, date, count }))
    if (entries.length > 0) return entries
    return [{ metric, date: range.end, count: 0 }]
  })
}

function presentEntries(
  metrics: readonly string[],
  counts: Map<string, number>,
): GaugeEntry[] {
  return metrics.flatMap((metric) => {
    const count = counts.get(metric)
    return count == null ? [] : [{ metric, count }]
  })
}

function countCreatedBy(rows: MockRow[], at: number): number {
  return rows.filter((row) => Date.parse(row.created) <= at).length
}

function isCustomer(row: MockRow): boolean {
  return row.attributes.role === CUSTOMER_ROLE
}

function hasActivityBetween(
  row: MockRow,
  from: number,
  until: number,
): boolean {
  const timestamps = [
    Date.parse(row.created),
    ...ACTIVITY_ATTRIBUTES.map((attribute) =>
      millis(stringAttribute(row, attribute)),
    ),
  ]
  return timestamps.some((at) => at != null && at >= from && at <= until)
}

function isOwnerBanned(row: MockRow): boolean {
  const owner = row.refs.owner
  return owner != null && users().get(owner.id)?.attributes.bannedAt != null
}

function licenseeIndex(): Map<string, string[]> {
  const index = new Map<string, string[]>()
  for (const join of licenseUsers().all()) {
    const licenseId = join.refs.license?.id
    const userId = join.refs.user?.id
    if (!licenseId || !userId) continue
    index.set(licenseId, [...(index.get(licenseId) ?? []), userId])
  }
  return index
}

function activeLicensedUserCount(ctx: MockContext, at: number): number {
  const licensees = licenseeIndex()
  const licensed = new Set<string>()
  let unassigned = 0

  for (const license of accountRows(ctx, licenses().all())) {
    if (isOwnerBanned(license)) continue
    if (!hasActivityBetween(license, at - ACTIVITY_WINDOW, at)) continue

    const owner = license.refs.owner
    const userIds = [
      ...(owner ? [owner.id] : []),
      ...(licensees.get(license.id) ?? []),
    ]
    if (userIds.length === 0) {
      unassigned += 1
      continue
    }
    for (const id of userIds) licensed.add(id)
  }

  return licensed.size + unassigned
}

const GaugeCounters: Readonly<Record<GaugeMetric, Counter>> = {
  licenses: (ctx, at) => countCreatedBy(scopedRows(ctx, LICENSES_TYPE), at),
  machines: (ctx, at) => countCreatedBy(scopedRows(ctx, "machines"), at),
  users: (ctx, at) =>
    countCreatedBy(scopedRows(ctx, "users").filter(isCustomer), at),
  alus: activeLicensedUserCount,
}

function isGaugeMetric(value: string): value is GaugeMetric {
  return GAUGE_METRICS.some((metric) => metric === value)
}

function isLeaderboard(value: string): value is Leaderboard {
  return LEADERBOARDS.some((leaderboard) => leaderboard === value)
}

function statusClassOf(row: MockRow): string | null {
  const status = statusOf(row)
  if (status == null) return null
  const metric = REQUEST_METRICS.find((candidate) =>
    REQUEST_STATUSES[candidate].includes(status),
  )
  return metric ?? null
}

function requestEntries(rows: MockRow[]): GaugeEntry[] {
  const counts = countBy(rows, statusClassOf)
  return REQUEST_METRICS.map((metric) => ({
    metric,
    count: counts.get(metric) ?? 0,
  }))
}

function eventMetric(event: string): string {
  return `events.${event.replace(/[^a-z0-9]+/gi, "-")}`
}

function eventMetricOf(row: MockRow): string | null {
  const event = stringAttribute(row, "event")
  return event == null ? null : eventMetric(event)
}

function matchingEvents(pattern: string): string[] {
  const trimmed = pattern.trim()
  if (trimmed === "") return []
  if (trimmed.endsWith(".*")) {
    const prefix = trimmed.slice(0, -1)
    return KNOWN_EVENTS.filter((event) => event.startsWith(prefix))
  }
  return KNOWN_EVENTS.filter((event) => event === trimmed)
}

function eventRows(ctx: MockContext, events: readonly string[]): MockRow[] {
  const wanted = new Set(events)
  return scopedRows(ctx, "event-logs").filter((row) =>
    wanted.has(stringAttribute(row, "event") ?? ""),
  )
}

function validationRows(ctx: MockContext, licenseId: string | null): MockRow[] {
  return eventRows(ctx, VALIDATION_EVENTS).filter((row) => {
    if (licenseId == null) return true
    const target = row.refs.resource
    return (
      target != null && target.type === LICENSES_TYPE && target.id === licenseId
    )
  })
}

function validationMetricOf(row: MockRow): string | null {
  const metadata = row.attributes.metadata
  const code = isRecord(metadata) ? metadata.code : null
  if (typeof code !== "string") return null
  return `validations.${code.toLowerCase().replace(/_/g, "-")}`
}

const Discriminators: Readonly<Record<Leaderboard, Discriminator>> = {
  ips: (row) => presentAttribute(row, "ip"),
  urls: (row) => {
    const method = presentAttribute(row, "method")
    const url = presentAttribute(row, "url")
    return method != null && url != null ? `${method} ${url}` : null
  },
  licenses: (row) => {
    const requestor = row.refs.requestor
    if (requestor?.type === LICENSES_TYPE) return requestor.id
    const target = row.refs.resource
    return target?.type === LICENSES_TYPE ? target.id : null
  },
  "user-agents": (row) => presentAttribute(row, "userAgent"),
}

function weekStartOf(date: string): number {
  const start = startOfDay(date)
  return start - new Date(start).getUTCDay() * DAY
}

function expirationCells(rows: MockRow[], range: DateRange): HeatmapCell[] {
  const counts = countBy(rows, (row) => {
    const expiry = millis(stringAttribute(row, "expiry"))
    if (expiry == null) return null
    const date = dateOnly(expiry)
    return date >= range.start && date <= range.end ? date : null
  })
  const hottest = Math.max(1, ...counts.values())
  const gridStart = weekStartOf(range.start)

  return [...counts]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => {
      const day = startOfDay(date)
      return {
        date,
        x: Math.floor((day - gridStart) / DAY / 7),
        y: new Date(day).getUTCDay(),
        temperature: Math.round((count / hottest) * 10) / 10,
        count,
      }
    })
}

mockRoute("GET", `${ANALYTICS}/gauges/:metric`, (ctx) => {
  const metric = ctx.params.metric
  const now = Date.now()

  if (metric === REQUESTS_GAUGE) {
    const today = localDateOf(now)
    const rows = scopedRows(ctx, "request-logs").filter(
      (row) => createdOn(row) === today,
    )
    return ok(requestEntries(rows))
  }
  if (!isGaugeMetric(metric)) return endpointNotFound()

  return ok([{ metric, count: GaugeCounters[metric](ctx, now) }])
})

mockRoute("GET", `${ANALYTICS}/gauges/events/:event`, (ctx) => {
  const events = matchingEvents(ctx.params.event)
  const today = localDateOf(Date.now())
  const counts = countBy(
    eventRows(ctx, events).filter((row) => createdOn(row) === today),
    eventMetricOf,
  )
  return ok(presentEntries(events.map(eventMetric), counts))
})

mockRoute("GET", `${ANALYTICS}/gauges/validations`, (ctx) => {
  const licenseId = licenseParameter(ctx)
  const today = localDateOf(Date.now())
  const counts = countBy(
    validationRows(ctx, licenseId).filter((row) => createdOn(row) === today),
    validationMetricOf,
  )
  return ok(presentEntries([...counts.keys()].sort(), counts))
})

mockRoute("GET", `${ANALYTICS}/sparks/:metric`, (ctx) => {
  const metric = ctx.params.metric
  const now = Date.now()
  const today = localDateOf(now)
  const range = seriesRange(ctx, today)
  if (!isGaugeMetric(metric)) {
    fail(badRequest("is invalid", { parameter: "metrics" }))
  }

  const counter = GaugeCounters[metric]
  const dates = eachLocalDate({
    start: range.start,
    end: range.end < today ? range.end : today,
  })
  const entries: SparkEntry[] = []
  for (const date of dates) {
    const count = counter(ctx, Math.min(endOfLocalDay(date), now))
    if (count > 0) entries.push({ metric, date, count })
  }
  if (entries.length === 0) {
    entries.push({ metric, date: range.end, count: 0 })
  }

  return ok(entries)
})

mockRoute("GET", `${ANALYTICS}/sparks/requests`, (ctx) => {
  const range = seriesRange(ctx, localDateOf(Date.now()))
  const buckets = bucketize(
    scopedRows(ctx, "request-logs").filter(createdWithin(range)),
    statusClassOf,
  )
  return ok(toSparks(buckets, REQUEST_METRICS, range))
})

mockRoute("GET", `${ANALYTICS}/sparks/validations`, (ctx) => {
  const licenseId = licenseParameter(ctx)
  const range = seriesRange(ctx, localDateOf(Date.now()))
  const buckets = bucketize(
    validationRows(ctx, licenseId).filter(createdWithin(range)),
    validationMetricOf,
  )
  const metrics = [...buckets.keys()].sort()
  if (metrics.length === 0) metrics.push(VALID_METRIC)

  return ok(toSparks(buckets, metrics, range))
})

mockRoute("GET", `${ANALYTICS}/sparks/events/:event`, (ctx) => {
  const range = seriesRange(ctx, localDateOf(Date.now()))
  const events = matchingEvents(ctx.params.event)
  if (events.length === 0) {
    fail(badRequest("is invalid", { parameter: "event" }))
  }

  const buckets = bucketize(
    eventRows(ctx, events).filter(createdWithin(range)),
    eventMetricOf,
  )
  return ok(toSparks(buckets, events.map(eventMetric), range))
})

mockRoute("GET", `${ANALYTICS}/leaderboards/:leaderboard`, (ctx) => {
  const leaderboard = ctx.params.leaderboard
  if (!isLeaderboard(leaderboard)) return endpointNotFound()

  const limit = limitParameter(ctx)
  const range = seriesRange(ctx, localDateOf(Date.now()))
  const counts = countBy(
    scopedRows(ctx, "request-logs").filter(createdWithin(range)),
    Discriminators[leaderboard],
  )
  const data: LeaderboardEntry[] = [...counts]
    .sort(([a, countA], [b, countB]) =>
      countB !== countA ? countB - countA : a.localeCompare(b),
    )
    .slice(0, limit)
    .map(([discriminator, count]) => ({ discriminator, count }))

  return ok(data)
})

mockRoute("GET", `${ANALYTICS}/heatmaps/:heatmap`, (ctx) => {
  if (ctx.params.heatmap !== EXPIRATIONS_HEATMAP) return endpointNotFound()

  const range = heatmapRange(ctx, localDateOf(Date.now()))
  return ok(expirationCells(scopedRows(ctx, LICENSES_TYPE), range))
})
