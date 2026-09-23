import { DAY, HOUR, MINUTE, SECOND } from "@/demo/server/time"
import type { Linkage, MockRow } from "@/demo/server/types"
import type { EnvironmentKey, SeedContext } from "./context"
import { MOCK_ACCOUNT } from "./universe"
import {
  LICENSE_SUBSCRIPTIONS,
  MACHINE_SUBSCRIPTIONS,
  USER_SUBSCRIPTIONS,
  WEBHOOK_ENDPOINT_URLS,
} from "./webhook-endpoints"

const TYPE = "webhook-events"
const ENDPOINT_TYPE = "webhook-endpoints"
const RETIRED_ENDPOINT_URL = "https://hooks.ecorp.example/keygen/v1"
const RETIRED_API_VERSION = "1.5"
const DEFAULT_API_VERSION = "1.8"
const IDEMPOTENCY_TOKEN_LENGTH = 32
const HEARTBEAT_DURATION = 600 * SECOND
const EXPIRING_WINDOW = 30 * DAY
const HIDDEN_ATTRIBUTES = new Set([
  "password",
  "passwordResetToken",
  "passwordResetSentAt",
  "lastDeathEventSentAt",
])

const WebhookEventStatus = {
  Delivering: "DELIVERING",
  Delivered: "DELIVERED",
  Failing: "FAILING",
  Failed: "FAILED",
} as const

type OutcomeKind =
  | "delivered"
  | "failing"
  | "failed"
  | "timedOut"
  | "delivering"

interface Response {
  code: number | null
  body: string | null
}

interface Outcome {
  status: string
  response: Response
  settleMillis: number
}

interface DeliveryPlan {
  url: string
  events: readonly string[]
  environment: EnvironmentKey | null
  outcomes: readonly (readonly [OutcomeKind, number])[]
  apiVersion?: string
  ageDays?: readonly [number, number]
}

interface WebhookEventSeed {
  endpoint: MockRow | undefined
  url: string
  apiVersion: string
  event: string
  payload: string
  environment: Linkage | null
  kind: OutcomeKind
  created: string
  idempotencyToken?: string
  response?: Response
}

interface State {
  seed: SeedContext
  account: Linkage
  rows: Map<string, MockRow[]>
  byId: Map<string, MockRow>
}

const EVENT_RESOURCE_TYPES = new Map<string, string>([
  ["license", "licenses"],
  ["machine", "machines"],
  ["user", "users"],
  ["policy", "policies"],
  ["release", "releases"],
  ["artifact", "artifacts"],
])

const TO_MANY_COLLECTIONS = new Map<string, readonly string[]>([
  ["licenses", ["users", "machines", "entitlements", "tokens"]],
  ["machines", ["components", "processes"]],
  ["users", ["licenses", "machines", "tokens"]],
  ["policies", ["licenses", "entitlements"]],
  ["releases", ["artifacts", "constraints"]],
])

const DELIVERED_RESPONSES: readonly (readonly [Response, number])[] = [
  [{ code: 200, body: '{"received":true}' }, 6],
  [{ code: 200, body: "OK" }, 3],
  [{ code: 200, body: "RES_BODY_TOO_LARGE" }, 1],
  [{ code: 201, body: '{"queued":true}' }, 1],
  [{ code: 202, body: "" }, 1],
  [{ code: 204, body: "" }, 1],
]

const FAILING_RESPONSES: readonly (readonly [Response, number])[] = [
  [{ code: 503, body: "<html>503 Service Unavailable</html>" }, 3],
  [{ code: 500, body: '{"error":"internal"}' }, 3],
  [{ code: 429, body: "Too Many Requests" }, 2],
  [{ code: 404, body: "Not Found" }, 1],
  [{ code: 302, body: "" }, 1],
  [{ code: null, body: "SSL_ERROR" }, 1],
  [{ code: null, body: "REQ_TIMEOUT" }, 1],
]

const FAILED_RESPONSES: readonly (readonly [Response, number])[] = [
  [{ code: 500, body: '{"error":"boom"}' }, 4],
  [{ code: 410, body: "Gone" }, 1],
  [{ code: 530, body: "" }, 1],
  [{ code: 404, body: "Tunnel ecorp-relay.ngrok.io not found" }, 1],
  [{ code: null, body: "CONN_REFUSED" }, 2],
  [{ code: null, body: "DNS_ERROR" }, 1],
  [{ code: null, body: "HOST_UNREACH" }, 1],
  [{ code: null, body: "EOF_ERROR" }, 1],
]

const TIMED_OUT_RESPONSE: Response = { code: null, body: "REQ_TIMEOUT" }
const PENDING_RESPONSE: Response = { code: null, body: null }
const BOOM_RESPONSE: Response = { code: 500, body: '{"error":"boom"}' }
const RECOVERED_RESPONSE: Response = { code: 200, body: '{"received":true}' }

const VALIDATION_FAILURES = [
  ["is expired", "EXPIRED"],
  ["has no associated machines", "NO_MACHINES"],
  ["fingerprint is not activated (has no associated machines)", "NO_MACHINE"],
  ["is suspended", "SUSPENDED"],
] as const

const ALL_RESOURCE_EVENTS = [
  ...LICENSE_SUBSCRIPTIONS,
  ...MACHINE_SUBSCRIPTIONS,
  ...USER_SUBSCRIPTIONS,
]

const DELIVERY_PLANS: readonly DeliveryPlan[] = [
  {
    url: WEBHOOK_ENDPOINT_URLS.main,
    events: ALL_RESOURCE_EVENTS,
    environment: null,
    outcomes: [
      ["delivered", 10],
      ["failing", 1],
      ["failed", 1],
      ["delivering", 2],
    ],
  },
  {
    url: WEBHOOK_ENDPOINT_URLS.licenses,
    events: LICENSE_SUBSCRIPTIONS,
    environment: null,
    outcomes: [
      ["delivered", 5],
      ["failing", 2],
      ["delivering", 1],
    ],
  },
  {
    url: WEBHOOK_ENDPOINT_URLS.failing,
    events: MACHINE_SUBSCRIPTIONS,
    environment: null,
    outcomes: [
      ["failing", 2],
      ["failed", 3],
    ],
  },
  {
    url: WEBHOOK_ENDPOINT_URLS.timeout,
    events: USER_SUBSCRIPTIONS,
    environment: null,
    outcomes: [
      ["timedOut", 3],
      ["failing", 1],
      ["delivered", 1],
    ],
  },
  {
    url: WEBHOOK_ENDPOINT_URLS.sandbox,
    events: ALL_RESOURCE_EVENTS,
    environment: "sandbox",
    outcomes: [
      ["delivered", 3],
      ["delivering", 1],
    ],
  },
  {
    url: RETIRED_ENDPOINT_URL,
    events: LICENSE_SUBSCRIPTIONS,
    environment: null,
    outcomes: [
      ["delivered", 1],
      ["failed", 1],
    ],
    apiVersion: RETIRED_API_VERSION,
    ageDays: [18, 30],
  },
]

function text(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null
}

function relatedPath(linkage: Linkage): string {
  return `/v1/accounts/${MOCK_ACCOUNT.id}/${linkage.type}/${linkage.id}`
}

function toOneDocument(linkage: Linkage | null): Record<string, unknown> {
  return linkage
    ? { links: { related: relatedPath(linkage) }, data: linkage }
    : { links: { related: null }, data: null }
}

function toManyDocument(row: MockRow, name: string): Record<string, unknown> {
  return { links: { related: `${relatedPath(row)}/${name}` } }
}

function publicAttributes(row: MockRow): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row.attributes).filter(
      ([key]) => !HIDDEN_ATTRIBUTES.has(key),
    ),
  )
}

function licenseStatus(state: State, license: MockRow): string {
  if (license.attributes.suspended === true) return "SUSPENDED"
  const expiry = text(license.attributes.expiry)
  if (expiry == null) return "ACTIVE"
  const expiresAt = Date.parse(expiry)
  if (expiresAt < state.seed.now) return "EXPIRED"
  if (expiresAt < state.seed.now + EXPIRING_WINDOW) return "EXPIRING"
  return "ACTIVE"
}

function heartbeatStatus(state: State, machine: MockRow): string {
  const heartbeat = text(machine.attributes.lastHeartbeat)
  if (heartbeat == null) return "NOT_STARTED"
  return state.seed.now - Date.parse(heartbeat) > HEARTBEAT_DURATION
    ? "DEAD"
    : "ALIVE"
}

function fullName(user: MockRow): string | null {
  const parts = [
    text(user.attributes.firstName),
    text(user.attributes.lastName),
  ].filter((part): part is string => part != null)
  return parts.length > 0 ? parts.join(" ") : null
}

function derivedAttributes(
  state: State,
  row: MockRow,
): Record<string, unknown> {
  switch (row.type) {
    case "licenses":
      return { status: licenseStatus(state, row) }
    case "machines":
      return { heartbeatStatus: heartbeatStatus(state, row) }
    case "users":
      return {
        fullName: fullName(row),
        status: row.attributes.bannedAt ? "BANNED" : "ACTIVE",
      }
    default:
      return {}
  }
}

function derivedRelationships(
  state: State,
  row: MockRow,
): Record<string, unknown> {
  switch (row.type) {
    case "licenses": {
      const policy = state.byId.get(row.refs.policy?.id ?? "")
      return { product: toOneDocument(policy?.refs.product ?? null) }
    }
    case "machines": {
      const license = state.byId.get(row.refs.license?.id ?? "")
      const policy = state.byId.get(license?.refs.policy?.id ?? "")
      return {
        product: toOneDocument(policy?.refs.product ?? null),
        policy: toOneDocument(license?.refs.policy ?? null),
      }
    }
    default:
      return {}
  }
}

type RelationshipEntry = [string, Record<string, unknown>]

function directRelationships(row: MockRow): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row.refs)
      .filter(([name]) => name !== "account" && name !== "environment")
      .map(
        ([name, linkage]): RelationshipEntry => [name, toOneDocument(linkage)],
      ),
  )
}

function collectionRelationships(row: MockRow): Record<string, unknown> {
  return Object.fromEntries(
    (TO_MANY_COLLECTIONS.get(row.type) ?? []).map(
      (name): RelationshipEntry => [name, toManyDocument(row, name)],
    ),
  )
}

function documentFor(
  state: State,
  row: MockRow,
  meta?: Record<string, unknown>,
): string {
  return JSON.stringify({
    data: {
      id: row.id,
      type: row.type,
      attributes: {
        ...publicAttributes(row),
        ...derivedAttributes(state, row),
        created: row.created,
        updated: row.updated,
      },
      relationships: {
        account: {
          links: { related: `/v1/accounts/${MOCK_ACCOUNT.id}` },
          data: state.account,
        },
        environment: toOneDocument(row.refs.environment),
        ...derivedRelationships(state, row),
        ...directRelationships(row),
        ...collectionRelationships(row),
      },
      links: { self: relatedPath(row) },
    },
    ...(meta ? { meta } : {}),
  })
}

function validationMeta(
  seed: SeedContext,
  event: string,
  created: string,
): Record<string, unknown> | undefined {
  if (event === "license.validation.succeeded") {
    return { ts: created, valid: true, detail: "is valid", code: "VALID" }
  }
  if (event === "license.validation.failed") {
    const [detail, code] = seed.rng.pick(VALIDATION_FAILURES)
    return { ts: created, valid: false, detail, code }
  }
  return undefined
}

function resourceFor(
  state: State,
  event: string,
  environment: Linkage | null,
): MockRow | undefined {
  const type = EVENT_RESOURCE_TYPES.get(event.split(".")[0])
  if (!type) return undefined

  const rows = state.rows.get(type) ?? []
  const environmentId = environment?.id ?? null
  const local = rows.filter(
    (row) => (row.refs.environment?.id ?? null) === environmentId,
  )
  const global = rows.filter((row) => row.refs.environment == null)
  const candidates =
    local.length > 0 ? local : global.length > 0 ? global : rows
  return candidates.length > 0 ? state.seed.rng.pick(candidates) : undefined
}

function outcomeFor(seed: SeedContext, kind: OutcomeKind): Outcome {
  const { rng } = seed
  switch (kind) {
    case "delivered":
      return {
        status: WebhookEventStatus.Delivered,
        response: rng.weighted(DELIVERED_RESPONSES),
        settleMillis: rng.int(180, 2600),
      }
    case "failing":
      return {
        status: WebhookEventStatus.Failing,
        response: rng.weighted(FAILING_RESPONSES),
        settleMillis: rng.int(2, 180) * MINUTE,
      }
    case "failed":
      return {
        status: WebhookEventStatus.Failed,
        response: rng.weighted(FAILED_RESPONSES),
        settleMillis: rng.int(1, 26) * HOUR,
      }
    case "timedOut":
      return {
        status: WebhookEventStatus.Failed,
        response: TIMED_OUT_RESPONSE,
        settleMillis: rng.int(1, 26) * HOUR,
      }
    case "delivering":
      return {
        status: WebhookEventStatus.Delivering,
        response: PENDING_RESPONSE,
        settleMillis: 0,
      }
  }
}

function createdFor(
  seed: SeedContext,
  kind: OutcomeKind,
  ageDays: readonly [number, number] | undefined,
): string {
  if (kind === "delivering") return seed.minutesAgo(0, 4)
  if (ageDays) return seed.daysAgo(ageDays[0], ageDays[1] - ageDays[0])

  const bucket = seed.rng.weighted([
    ["days", 7],
    ["hours", 2],
    ["minutes", 1],
  ])
  if (bucket === "days") return seed.daysAgo(1, 29)
  if (bucket === "hours") return seed.hoursAgo(1, 20)
  return seed.minutesAgo(5, 50)
}

function settledAt(seed: SeedContext, created: string, millis: number): string {
  return new Date(
    Math.min(seed.now, Date.parse(created) + millis),
  ).toISOString()
}

function apiVersionOf(endpoint: MockRow | undefined, fallback: string): string {
  return text(endpoint?.attributes.apiVersion) ?? fallback
}

function insertWebhookEvent(state: State, input: WebhookEventSeed): MockRow {
  const { seed } = state
  const outcome = outcomeFor(seed, input.kind)
  const response = input.response ?? outcome.response

  return seed.insert(
    TYPE,
    {
      endpoint: input.url,
      payload: input.payload,
      event: input.event,
      status: outcome.status,
      lastResponseCode: response.code,
      lastResponseBody: response.body,
      apiVersion: input.apiVersion,
      idempotencyToken:
        input.idempotencyToken ?? seed.rng.hex(IDEMPOTENCY_TOKEN_LENGTH),
    },
    {
      account: state.account,
      environment: input.environment,
      endpoint: input.endpoint
        ? { type: ENDPOINT_TYPE, id: input.endpoint.id }
        : null,
    },
    {
      created: input.created,
      updated: settledAt(seed, input.created, outcome.settleMillis),
    },
  )
}

function seedPlan(
  state: State,
  plan: DeliveryPlan,
  endpoint: MockRow | undefined,
): void {
  const { seed } = state
  const environment = seed.environmentRef(plan.environment)
  const apiVersion = apiVersionOf(
    endpoint,
    plan.apiVersion ?? DEFAULT_API_VERSION,
  )
  const events = plan.events.filter((event) =>
    EVENT_RESOURCE_TYPES.has(event.split(".")[0]),
  )
  const kinds = seed.rng.shuffle(
    plan.outcomes.flatMap(([kind, count]) =>
      Array.from({ length: count }, () => kind),
    ),
  )

  for (const kind of kinds) {
    const event = seed.rng.pick(events)
    const resource = resourceFor(state, event, environment)
    if (!resource) continue

    const created = createdFor(seed, kind, plan.ageDays)
    insertWebhookEvent(state, {
      endpoint,
      url: plan.url,
      apiVersion,
      event,
      payload: documentFor(
        state,
        resource,
        validationMeta(seed, event, created),
      ),
      environment,
      kind,
      created,
    })
  }
}

function seedRetriedPair(state: State, endpoint: MockRow | undefined): void {
  if (!endpoint) return

  const { seed } = state
  const event = "machine.heartbeat.dead"
  const resource = resourceFor(state, event, null)
  if (!resource) return

  const shared = {
    endpoint,
    url: WEBHOOK_ENDPOINT_URLS.failing,
    apiVersion: apiVersionOf(endpoint, DEFAULT_API_VERSION),
    event,
    payload: documentFor(state, resource),
    environment: null,
    idempotencyToken: seed.rng.hex(IDEMPOTENCY_TOKEN_LENGTH),
  }

  const original = insertWebhookEvent(state, {
    ...shared,
    kind: "failed",
    created: seed.daysAgo(3, 1),
    response: BOOM_RESPONSE,
  })
  insertWebhookEvent(state, {
    ...shared,
    kind: "delivered",
    created: seed.later(original.updated, 1),
    response: RECOVERED_RESPONSE,
  })
}

export function seedMockWebhookEvents(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const rows = new Map<string, MockRow[]>()
  const byId = new Map<string, MockRow>()
  for (const type of EVENT_RESOURCE_TYPES.values()) {
    const table = seed.rows(type)
    rows.set(type, table)
    for (const row of table) byId.set(row.id, row)
  }

  const state: State = { seed, account: seed.accountRef(), rows, byId }
  const endpointsByUrl = new Map(
    seed
      .rows(ENDPOINT_TYPE)
      .map((row) => [text(row.attributes.url) ?? "", row] as const),
  )

  for (const plan of DELIVERY_PLANS) {
    seedPlan(state, plan, endpointsByUrl.get(plan.url))
  }

  seedRetriedPair(state, endpointsByUrl.get(WEBHOOK_ENDPOINT_URLS.failing))
}
