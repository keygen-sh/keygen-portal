import { rowLinkage, text } from "@/demo/server"
import type { SeedContext } from "./context"
import type { Linkage, MockRow } from "@/demo/server/types"
import { DAY, millis } from "@/demo/server/time"
import { MOCK_ACCOUNT, MOCK_ADMIN, MOCK_ENVIRONMENTS } from "./universe"

const REQUEST_LOG_COUNT = 400
const SPREAD_DAYS = 45
const BURST_DAYS = [2, 9, 23, 31, 40]
const BURST_WEIGHT = 4
const SLUG_URL_CHANCE = 0.1
const API_VERSION = "1.8"
const HOST = "api.keygen.sh"
const PORTAL_ORIGIN = "https://app.keygen.sh"
const ZERO_UUID = "00000000-0000-0000-0000-000000000000"
const JSON_API = "application/vnd.api+json"
const JSON_API_UTF8 = "application/vnd.api+json; charset=utf-8"

export const PORTAL_IP = "198.51.100.7"

const IP_POOL: readonly (readonly [string, number])[] = [
  ["203.0.113.42", 14],
  ["203.0.113.17", 9],
  ["203.0.113.88", 6],
  ["203.0.113.5", 4],
  ["198.51.100.23", 8],
  ["198.51.100.61", 5],
  ["198.51.100.140", 3],
  ["192.0.2.10", 7],
  ["192.0.2.77", 4],
  ["192.0.2.201", 2],
  ["185.199.108.153", 3],
  ["151.101.1.69", 2],
  ["104.16.132.229", 2],
  ["172.67.74.152", 2],
  ["34.117.59.81", 3],
  ["52.94.236.248", 3],
  ["13.107.42.14", 2],
  ["66.249.66.1", 1],
  ["2001:db8::1", 3],
  ["2001:db8:85a3::8a2e:370:7334", 2],
  ["2001:db8:2::42", 1],
  ["2001:db8:cafe::17", 1],
  ["45.33.32.156", 2],
  ["81.2.69.142", 2],
  ["89.160.20.112", 1],
]

const SDK_USER_AGENTS = [
  "keygen-go/1.11.0 (linux/amd64)",
  "keygen-node/2.4.1 (darwin/arm64)",
  "Keygen.NET/2.3.0 (win-x64)",
  "keygen-sdk/3.1.0 python/3.12.4",
  "keygen-rust/0.4.2 (x86_64-unknown-linux-gnu)",
  "Ecoin-Wallet/6.2.0 (Windows NT 10.0; x64)",
  "Ecoin-Wallet/6.2.0 (macOS 15.1; arm64)",
  "Ecoin-Wallet/6.1.4 (Linux; x86_64)",
  "PaymentsGateway/2.0.3 (Tauri; Linux)",
  "curl/8.7.1",
  "python-requests/2.32.3",
  "okhttp/4.12.0",
] as const

const PORTAL_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
] as const

const SERVER_USER_AGENTS = [
  "keygen-go/1.11.0 (linux/amd64)",
  "keygen-node/2.4.1 (linux/x64)",
  "Go-http-client/2.0",
  "node-fetch/3.3.2",
] as const

const VALIDATION_DETAILS: Readonly<Record<string, string>> = {
  VALID: "is valid",
  EXPIRED: "is expired",
  SUSPENDED: "is suspended",
  BANNED: "is banned",
  NO_MACHINES: "must have at least 1 associated machine",
  NO_MACHINE: "must have exactly 1 associated machine",
  TOO_MANY_MACHINES: "has too many associated machines",
  FINGERPRINT_SCOPE_MISMATCH: "fingerprint scope does not match",
  HEARTBEAT_DEAD: "machine heartbeat is dead",
  NOT_FOUND: "does not exist",
}

export interface RequestLogSeed {
  method: string
  url: string
  status: number
  created: string
  requestor: Linkage | null
  resource: Linkage | null
  environment: Linkage | null
  ip?: string | null
  userAgent?: string | null
  requestBody?: string | null
  responseBody?: string | null
}

export interface ValidationOutcome {
  code: string
  detail: string
  valid: boolean
}

function environmentCode(environment: Linkage | null): string | null {
  const match = Object.values(MOCK_ENVIRONMENTS).find(
    (candidate) => candidate.id === environment?.id,
  )
  return match?.code ?? null
}

export function accountPath(seed: SeedContext): string {
  const identifier = seed.rng.chance(SLUG_URL_CHANCE)
    ? MOCK_ACCOUNT.slug
    : MOCK_ACCOUNT.id
  return `/v1/accounts/${identifier}`
}

export function maskKey(value: unknown): string {
  const key = text(value)
  if (!key || key.length < 12) return "[FILTERED]"
  return `${key.slice(0, 6)}…${key.slice(-3)}`
}

export function pickIp(seed: SeedContext): string {
  return seed.rng.weighted(IP_POOL)
}

function pickUserAgent(seed: SeedContext, requestor: Linkage | null): string {
  if (requestor?.type === "users") return seed.rng.pick(PORTAL_USER_AGENTS)
  if (requestor?.type === "products" || requestor?.type === "environments") {
    return seed.rng.pick(SERVER_USER_AGENTS)
  }
  return seed.rng.pick(SDK_USER_AGENTS)
}

function defaultIp(seed: SeedContext, requestor: Linkage | null): string {
  if (requestor?.type === "users" && seed.rng.chance(0.8)) return PORTAL_IP
  return pickIp(seed)
}

function signature(seed: SeedContext): string {
  const encoded = `${seed.rng.hex(86)}==`
  return `keyid="${MOCK_ACCOUNT.id}", algorithm="ed25519", signature="${encoded}", headers="(request-target) host date digest"`
}

function digest(seed: SeedContext): string {
  return `sha-256=${seed.rng.hex(44)}`
}

export function errorDocument(
  title: string,
  detail: string,
  code?: string,
  source?: Record<string, string>,
): string {
  return JSON.stringify({
    errors: [
      {
        title,
        detail,
        ...(code ? { code } : {}),
        ...(source ? { source } : {}),
      },
    ],
  })
}

export function licenseDocument(
  license: MockRow,
  meta?: Record<string, unknown>,
): string {
  return JSON.stringify({
    data: {
      id: license.id,
      type: "licenses",
      attributes: {
        name: license.attributes.name ?? null,
        key: maskKey(license.attributes.key),
        expiry: license.attributes.expiry ?? null,
        suspended: license.attributes.suspended === true,
      },
      relationships: {
        policy: { data: license.refs.policy ?? null },
      },
    },
    ...(meta ? { meta } : {}),
  })
}

export function resourceDocument(row: MockRow, attributes: string[]): string {
  const picked: Record<string, unknown> = {}
  for (const attribute of attributes) {
    picked[attribute] = row.attributes[attribute] ?? null
  }
  return JSON.stringify({
    data: { id: row.id, type: row.type, attributes: picked },
  })
}

export function validationOutcome(
  seed: SeedContext,
  license: MockRow,
): ValidationOutcome {
  const expiry = millis(text(license.attributes.expiry))
  const code =
    license.attributes.suspended === true
      ? "SUSPENDED"
      : expiry != null && expiry < seed.now
        ? "EXPIRED"
        : seed.rng.weighted([
            ["VALID", 16],
            ["NO_MACHINES", 2],
            ["FINGERPRINT_SCOPE_MISMATCH", 2],
            ["TOO_MANY_MACHINES", 1],
            ["HEARTBEAT_DEAD", 1],
          ])
  return {
    code,
    detail: VALIDATION_DETAILS[code] ?? "is invalid",
    valid: code === "VALID",
  }
}

export function validateKeyBody(seed: SeedContext, license: MockRow): string {
  return JSON.stringify({
    meta: {
      key: maskKey(license.attributes.key),
      scope: { fingerprint: seed.rng.hex(40) },
    },
  })
}

export function validationDocument(
  license: MockRow,
  outcome: ValidationOutcome,
  created: string,
): string {
  return licenseDocument(license, {
    ts: created,
    valid: outcome.valid,
    detail: outcome.detail,
    code: outcome.code,
  })
}

export function sampleCreated(seed: SeedContext): string {
  const days = Array.from({ length: SPREAD_DAYS }, (_, day) => {
    const recency = 1 + 24 / (day + 2)
    const burst = BURST_DAYS.includes(day) ? BURST_WEIGHT : 1
    return [day, recency * burst] as const
  })
  const day = seed.rng.weighted(days)
  return new Date(seed.now - day * DAY - seed.rng.float(0, DAY)).toISOString()
}

export function notBefore(
  seed: SeedContext,
  floor: string | null,
  candidate: string,
): string {
  if (floor == null || Date.parse(candidate) >= Date.parse(floor)) {
    return candidate
  }
  return seed.between(floor, new Date(seed.now).toISOString())
}

export function insertRequestLog(
  seed: SeedContext,
  log: RequestLogSeed,
): MockRow {
  const preflight = log.method === "OPTIONS" || log.method === "HEAD"
  const requestBody = log.requestBody ?? null
  const responseBody =
    log.status === 204 || log.status === 303 ? null : (log.responseBody ?? null)
  const environment = environmentCode(log.environment)
  const date = new Date(log.created).toUTCString()
  const signed = !preflight && log.status !== 401 && log.status !== 429

  const requestHeaders = preflight
    ? {}
    : {
        Accept: JSON_API,
        ...(requestBody != null
          ? {
              "Content-Type": JSON_API,
              "Content-Length": String(requestBody.length),
            }
          : {}),
        Host: HOST,
        ...(log.requestor?.type === "users" ? { Origin: PORTAL_ORIGIN } : {}),
        "Keygen-Version": API_VERSION,
      }

  const responseHeaders = preflight
    ? {}
    : {
        "Content-Type": JSON_API_UTF8,
        "Content-Length": String(responseBody?.length ?? 0),
        Date: date,
        ...(signed ? { Digest: digest(seed) } : {}),
        "Keygen-Account": MOCK_ACCOUNT.id,
        ...(log.requestor ? { "Keygen-Bearer": log.requestor.type } : {}),
        "Keygen-Date": date,
        "Keygen-Edition": "EE",
        ...(environment ? { "Keygen-Environment": environment } : {}),
        "Keygen-Mode": "multiplayer",
        "Keygen-Version": API_VERSION,
      }

  const responseSignature = signed ? signature(seed) : null

  return seed.insert(
    "request-logs",
    {
      url: log.url,
      method: log.method,
      status: String(log.status),
      ip: log.ip === undefined ? defaultIp(seed, log.requestor) : log.ip,
      userAgent:
        log.userAgent === undefined
          ? pickUserAgent(seed, log.requestor)
          : log.userAgent,
      requestHeaders,
      requestBody,
      responseSignature,
      responseHeaders: {
        ...responseHeaders,
        ...(responseSignature ? { "Keygen-Signature": responseSignature } : {}),
      },
      responseBody,
    },
    {
      account: seed.accountRef(),
      environment: log.environment,
      requestor: log.requestor,
      resource: log.resource,
    },
    { created: log.created },
  )
}

interface Universe {
  seed: SeedContext
  licenses: MockRow[]
  machines: MockRow[]
  users: MockRow[]
  team: MockRow[]
  products: MockRow[]
  policies: MockRow[]
  tokens: MockRow[]
  releases: MockRow[]
  artifacts: MockRow[]
  entitlements: MockRow[]
  groups: MockRow[]
  packages: MockRow[]
  processes: MockRow[]
  components: MockRow[]
  secondFactors: MockRow[]
}

type Generator = (universe: Universe) => void

function pick(seed: SeedContext, rows: MockRow[]): MockRow | undefined {
  return rows.length === 0 ? undefined : seed.rng.pick(rows)
}

function pickTeamMember(universe: Universe): MockRow | undefined {
  const admin = universe.users.find((row) => row.id === MOCK_ADMIN.id)
  if (admin && universe.seed.rng.chance(0.6)) return admin
  return pick(universe.seed, universe.team) ?? admin
}

function linkedLicense(
  universe: Universe,
  machine: MockRow,
): MockRow | undefined {
  const id = machine.refs.license?.id
  return universe.licenses.find((row) => row.id === id)
}

function environmentOf(row: MockRow | undefined): Linkage | null {
  return row?.refs.environment ?? null
}

function createdFor(
  seed: SeedContext,
  ...rows: (MockRow | undefined)[]
): string {
  const floors = rows
    .map((row) => (row ? Date.parse(row.created) : Number.NaN))
    .filter((value) => !Number.isNaN(value))
  const floor =
    floors.length === 0 ? null : new Date(Math.max(...floors)).toISOString()
  return notBefore(seed, floor, sampleCreated(seed))
}

function isRecent(seed: SeedContext, row: MockRow): boolean {
  return Date.parse(row.created) >= seed.now - SPREAD_DAYS * DAY
}

function recentOrSampled(seed: SeedContext, row: MockRow): string {
  return isRecent(seed, row) ? row.created : createdFor(seed, row)
}

function tooManyRequestsDocument(): string {
  return errorDocument(
    "Too many requests",
    "Throttle limit has been reached for your IP address. Please slow down.",
    "TOO_MANY_REQUESTS",
  )
}

const validateKey: Generator = (universe) => {
  const { seed } = universe
  const license = pick(seed, universe.licenses)
  if (!license) return

  const created = createdFor(seed, license)
  const roll = seed.rng.weighted<"ok" | "throttled" | "missing" | "unknown">([
    ["ok", 40],
    ["throttled", 2],
    ["missing", 1],
    ["unknown", 2],
  ])
  const url = `${accountPath(seed)}/licenses/actions/validate-key`

  if (roll === "throttled") {
    insertRequestLog(seed, {
      method: "POST",
      url,
      status: 429,
      created,
      requestor: null,
      resource: null,
      environment: environmentOf(license),
      requestBody: validateKeyBody(seed, license),
      responseBody: tooManyRequestsDocument(),
    })
    return
  }

  if (roll === "missing") {
    insertRequestLog(seed, {
      method: "POST",
      url,
      status: 400,
      created,
      requestor: null,
      resource: null,
      environment: null,
      requestBody: JSON.stringify({ meta: {} }),
      responseBody: errorDocument("Bad request", "is missing", undefined, {
        pointer: "/meta/key",
      }),
    })
    return
  }

  if (roll === "unknown") {
    insertRequestLog(seed, {
      method: "POST",
      url,
      status: 200,
      created,
      requestor: null,
      resource: null,
      environment: null,
      requestBody: JSON.stringify({ meta: { key: "[FILTERED]" } }),
      responseBody: JSON.stringify({
        data: null,
        meta: {
          ts: created,
          valid: false,
          detail: "does not exist",
          code: "NOT_FOUND",
        },
      }),
    })
    return
  }

  const outcome = validationOutcome(seed, license)
  insertRequestLog(seed, {
    method: "POST",
    url,
    status: 200,
    created,
    requestor: null,
    resource: rowLinkage(license),
    environment: environmentOf(license),
    requestBody: validateKeyBody(seed, license),
    responseBody: validationDocument(license, outcome, created),
  })
}

const validateLicense: Generator = (universe) => {
  const { seed } = universe
  const license = pick(seed, universe.licenses)
  if (!license) return

  const created = createdFor(seed, license)
  const outcome = validationOutcome(seed, license)
  insertRequestLog(seed, {
    method: "POST",
    url: `${accountPath(seed)}/licenses/${license.id}/actions/validate`,
    status: 200,
    created,
    requestor: rowLinkage(license),
    resource: rowLinkage(license),
    environment: environmentOf(license),
    requestBody: JSON.stringify({
      meta: { scope: { fingerprint: seed.rng.hex(40) } },
    }),
    responseBody: validationDocument(license, outcome, created),
  })
}

const createMachine: Generator = (universe) => {
  const { seed } = universe
  const machine = pick(seed, universe.machines)
  if (!machine) return
  const license = linkedLicense(universe, machine)
  if (!license) return

  const roll = seed.rng.weighted<"created" | "limit" | "crashed">([
    ["created", 12],
    ["limit", 2],
    ["crashed", 1],
  ])
  const created =
    roll === "created"
      ? recentOrSampled(seed, machine)
      : createdFor(seed, license)
  const requestBody = JSON.stringify({
    data: {
      type: "machines",
      attributes: {
        fingerprint: machine.attributes.fingerprint ?? seed.rng.hex(40),
        platform: machine.attributes.platform ?? null,
        name: machine.attributes.name ?? null,
      },
      relationships: {
        license: { data: { type: "licenses", id: license.id } },
      },
    },
  })
  const url = `${accountPath(seed)}/machines`

  if (roll === "limit") {
    insertRequestLog(seed, {
      method: "POST",
      url,
      status: 422,
      created,
      requestor: rowLinkage(license),
      resource: null,
      environment: environmentOf(license),
      requestBody,
      responseBody: errorDocument(
        "Unprocessable resource",
        "machine count has exceeded maximum allowed by current policy (1)",
        "MACHINE_LIMIT_EXCEEDED",
        { pointer: "/data" },
      ),
    })
    return
  }

  if (roll === "crashed") {
    insertRequestLog(seed, {
      method: "POST",
      url,
      status: 500,
      created,
      requestor: rowLinkage(license),
      resource: null,
      environment: environmentOf(license),
      requestBody,
      responseBody: errorDocument(
        "Internal server error",
        "Looks like something went wrong! Our engineers have been notified.",
      ),
    })
    return
  }

  insertRequestLog(seed, {
    method: "POST",
    url,
    status: 201,
    created,
    requestor: rowLinkage(license),
    resource: rowLinkage(machine),
    environment: environmentOf(machine),
    requestBody,
    responseBody: resourceDocument(machine, [
      "fingerprint",
      "name",
      "platform",
      "ip",
    ]),
  })
}

const pingHeartbeat: Generator = (universe) => {
  const { seed } = universe
  const machine = pick(seed, universe.machines)
  if (!machine) return
  const license = linkedLicense(universe, machine)
  const dead = seed.rng.chance(0.06)

  insertRequestLog(seed, {
    method: "POST",
    url: `${accountPath(seed)}/machines/${machine.id}/actions/ping-heartbeat`,
    status: dead ? 422 : 200,
    created: createdFor(seed, machine),
    requestor: license ? rowLinkage(license) : null,
    resource: rowLinkage(machine),
    environment: environmentOf(machine),
    responseBody: dead
      ? errorDocument(
          "Unprocessable resource",
          "is dead",
          "MACHINE_HEARTBEAT_DEAD",
          { pointer: "/data" },
        )
      : resourceDocument(machine, ["fingerprint", "name", "lastHeartbeat"]),
  })
}

const deleteMachine: Generator = (universe) => {
  const { seed } = universe
  const machine = pick(seed, universe.machines)
  if (!machine) return
  const license = linkedLicense(universe, machine)
  const member = pickTeamMember(universe)
  const requestor =
    license && seed.rng.chance(0.6)
      ? rowLinkage(license)
      : member
        ? rowLinkage(member)
        : null

  insertRequestLog(seed, {
    method: "DELETE",
    url: `${accountPath(seed)}/machines/${machine.id}`,
    status: 204,
    created: createdFor(seed, machine),
    requestor,
    resource: rowLinkage(machine),
    environment: environmentOf(machine),
  })
}

const checkOutMachine: Generator = (universe) => {
  const { seed } = universe
  const machine = pick(seed, universe.machines)
  if (!machine) return
  const license = linkedLicense(universe, machine)

  insertRequestLog(seed, {
    method: "POST",
    url: `${accountPath(seed)}/machines/${machine.id}/actions/check-out?encrypt=1&ttl=604800`,
    status: 200,
    created: createdFor(seed, machine),
    requestor: license ? rowLinkage(license) : null,
    resource: rowLinkage(machine),
    environment: environmentOf(machine),
    responseBody: JSON.stringify({
      data: {
        id: seed.rng.uuid(seed.now),
        type: "machine-files",
        attributes: {
          certificate: "[FILTERED]",
          issued: new Date(seed.now).toISOString(),
          ttl: 604800,
          includes: [],
        },
      },
    }),
  })
}

const checkOutLicense: Generator = (universe) => {
  const { seed } = universe
  const license = pick(seed, universe.licenses)
  if (!license) return

  insertRequestLog(seed, {
    method: "POST",
    url: `${accountPath(seed)}/licenses/${license.id}/actions/check-out?include=entitlements`,
    status: 200,
    created: createdFor(seed, license),
    requestor: rowLinkage(license),
    resource: rowLinkage(license),
    environment: environmentOf(license),
    responseBody: JSON.stringify({
      data: {
        id: seed.rng.uuid(seed.now),
        type: "license-files",
        attributes: {
          certificate: "[FILTERED]",
          issued: new Date(seed.now).toISOString(),
          ttl: 2592000,
          includes: ["entitlements"],
        },
      },
    }),
  })
}

const login: Generator = (universe) => {
  const { seed } = universe
  const user = pick(
    seed,
    universe.users.filter((row) => row.attributes.password != null),
  )
  if (!user) return
  const failed = seed.rng.chance(0.25)
  const token = universe.tokens.find((row) => {
    const bearer = row.refs.bearer
    return bearer != null && bearer.type === "users" && bearer.id === user.id
  })

  if (failed || !token || !isRecent(seed, token)) {
    insertRequestLog(seed, {
      method: "POST",
      url: `${accountPath(seed)}/tokens`,
      status: 401,
      created: createdFor(seed, user),
      requestor: null,
      resource: null,
      environment: null,
      ip: PORTAL_IP,
      userAgent: seed.rng.pick(PORTAL_USER_AGENTS),
      responseBody: errorDocument(
        "Unauthorized",
        "password must be valid",
        "PASSWORD_INVALID",
        { header: "Authorization" },
      ),
    })
    return
  }

  insertRequestLog(seed, {
    method: "POST",
    url: `${accountPath(seed)}/tokens`,
    status: 201,
    created: token.created,
    requestor: rowLinkage(user),
    resource: rowLinkage(token),
    environment: environmentOf(token),
    ip: PORTAL_IP,
    userAgent: seed.rng.pick(PORTAL_USER_AGENTS),
    responseBody: JSON.stringify({
      data: {
        id: token.id,
        type: "tokens",
        attributes: {
          kind: "admin-token",
          token: "[FILTERED]",
          expiry: token.attributes.expiry ?? null,
          name: token.attributes.name ?? null,
        },
      },
    }),
  })
}

const portalList: Generator = (universe) => {
  const { seed } = universe
  const member = pickTeamMember(universe)
  if (!member) return
  const policy = pick(seed, universe.policies)
  const product = pick(seed, universe.products)
  const base = accountPath(seed)
  const url = seed.rng.pick([
    `${base}/licenses?limit=100${policy ? `&policy=${policy.id}` : ""}`,
    `${base}/machines?page%5Bsize%5D=20&page%5Bcursor%5D=`,
    `${base}/users?limit=25`,
    `${base}/licenses?page%5Bsize%5D=20&page%5Bcursor%5D=&status=ACTIVE`,
    `${base}/policies?limit=100`,
    `${base}/products/${product?.id ?? ZERO_UUID}/policies`,
    `${base}/tokens?limit=100`,
    `${base}/releases?product=${product?.id ?? ZERO_UUID}&channel=stable`,
    `${base}/entitlements?limit=100`,
    `${base}/groups?page%5Bsize%5D=20&page%5Bcursor%5D=`,
  ])

  insertRequestLog(seed, {
    method: "GET",
    url,
    status: 200,
    created: createdFor(seed, member),
    requestor: rowLinkage(member),
    resource: null,
    environment: seed.rng.chance(0.75) ? null : seed.pickEnvironment(),
    responseBody: JSON.stringify({ data: [], links: {} }),
  })
}

const portalShow: Generator = (universe) => {
  const { seed } = universe
  const member = pickTeamMember(universe)
  if (!member) return
  const [row, segment, attributes] = seed.rng.weighted<
    readonly [MockRow | undefined, string, string[]]
  >([
    [[pick(seed, universe.licenses), "licenses", ["name", "expiry"]], 5],
    [[pick(seed, universe.policies), "policies", ["name", "duration"]], 2],
    [[pick(seed, universe.users), "users", ["email", "role"]], 2],
    [[pick(seed, universe.machines), "machines", ["fingerprint", "name"]], 3],
    [[pick(seed, universe.products), "products", ["name", "code"]], 1],
    [[pick(seed, universe.releases), "releases", ["name", "version"]], 1],
    [[pick(seed, universe.groups), "groups", ["name"]], 1],
    [[pick(seed, universe.packages), "packages", ["name", "key"]], 1],
  ])
  if (!row) return

  insertRequestLog(seed, {
    method: "GET",
    url: `${accountPath(seed)}/${segment}/${row.id}`,
    status: 200,
    created: createdFor(seed, member, row),
    requestor: rowLinkage(member),
    resource: rowLinkage(row),
    environment: environmentOf(row),
    responseBody: resourceDocument(row, attributes),
  })
}

const portalMutation: Generator = (universe) => {
  const { seed } = universe
  const member = pickTeamMember(universe)
  if (!member) return
  const license = pick(seed, universe.licenses)
  const user = pick(seed, universe.users)
  const policy = pick(seed, universe.policies)
  const token = pick(seed, universe.tokens)
  const base = accountPath(seed)

  const options: (readonly [RequestLogSeed | null, number])[] = [
    [
      license
        ? {
            method: "PATCH",
            url: `${base}/licenses/${license.id}`,
            status: 200,
            created: createdFor(seed, member, license),
            requestor: rowLinkage(member),
            resource: rowLinkage(license),
            environment: environmentOf(license),
            requestBody: JSON.stringify({
              data: {
                type: "licenses",
                attributes: { name: license.attributes.name ?? null },
              },
            }),
            responseBody: licenseDocument(license),
          }
        : null,
      4,
    ],
    [
      license && policy
        ? {
            method: "PUT",
            url: `${base}/licenses/${license.id}/policy`,
            status: 200,
            created: createdFor(seed, member, license),
            requestor: rowLinkage(member),
            resource: rowLinkage(license),
            environment: environmentOf(license),
            requestBody: JSON.stringify({
              data: { type: "policies", id: policy.id },
            }),
            responseBody: licenseDocument(license),
          }
        : null,
      2,
    ],
    [
      license
        ? {
            method: "POST",
            url: `${base}/licenses/${license.id}/actions/${seed.rng.pick([
              "renew",
              "suspend",
              "reinstate",
              "check-in",
              "increment-usage",
            ])}`,
            status: 200,
            created: createdFor(seed, member, license),
            requestor: rowLinkage(member),
            resource: rowLinkage(license),
            environment: environmentOf(license),
            responseBody: licenseDocument(license),
          }
        : null,
      4,
    ],
    [
      license
        ? {
            method: "POST",
            url: `${base}/licenses`,
            status: 201,
            created: recentOrSampled(seed, license),
            requestor: rowLinkage(member),
            resource: rowLinkage(license),
            environment: environmentOf(license),
            requestBody: JSON.stringify({
              data: {
                type: "licenses",
                attributes: {
                  name: license.attributes.name ?? null,
                  metadata: license.attributes.metadata ?? {},
                },
                relationships: {
                  policy: { data: license.refs.policy ?? null },
                },
              },
            }),
            responseBody: licenseDocument(license),
          }
        : null,
      3,
    ],
    [
      license
        ? {
            method: "DELETE",
            url: `${base}/licenses/${license.id}`,
            status: 204,
            created: createdFor(seed, member, license),
            requestor: rowLinkage(member),
            resource: rowLinkage(license),
            environment: environmentOf(license),
          }
        : null,
      1,
    ],
    [
      user
        ? {
            method: "PATCH",
            url: `${base}/users/${user.id}`,
            status: 200,
            created: createdFor(seed, member, user),
            requestor: rowLinkage(member),
            resource: rowLinkage(user),
            environment: environmentOf(user),
            requestBody: JSON.stringify({
              data: {
                type: "users",
                attributes: {
                  firstName: user.attributes.firstName ?? null,
                  lastName: user.attributes.lastName ?? null,
                },
              },
            }),
            responseBody: resourceDocument(user, [
              "email",
              "firstName",
              "lastName",
              "role",
            ]),
          }
        : null,
      2,
    ],
    [
      user
        ? {
            method: "POST",
            url: `${base}/users/${user.id}/actions/ban`,
            status: 200,
            created: createdFor(seed, member, user),
            requestor: rowLinkage(member),
            resource: rowLinkage(user),
            environment: environmentOf(user),
            responseBody: resourceDocument(user, ["email", "role"]),
          }
        : null,
      1,
    ],
    [
      policy
        ? {
            method: "PATCH",
            url: `${base}/policies/${policy.id}`,
            status: 200,
            created: createdFor(seed, member, policy),
            requestor: rowLinkage(member),
            resource: rowLinkage(policy),
            environment: environmentOf(policy),
            requestBody: JSON.stringify({
              data: {
                type: "policies",
                attributes: {
                  maxMachines: policy.attributes.maxMachines ?? null,
                },
              },
            }),
            responseBody: resourceDocument(policy, ["name", "maxMachines"]),
          }
        : null,
      2,
    ],
    [
      token
        ? {
            method: "DELETE",
            url: `${base}/tokens/${token.id}`,
            status: 204,
            created: createdFor(seed, member, token),
            requestor: rowLinkage(member),
            resource: rowLinkage(token),
            environment: environmentOf(token),
          }
        : null,
      1,
    ],
  ]

  const chosen = seed.rng.weighted(options)
  if (chosen) insertRequestLog(seed, chosen)
}

const downloadArtifact: Generator = (universe) => {
  const { seed } = universe
  const artifact = pick(seed, universe.artifacts)
  const license = pick(seed, universe.licenses)
  if (!artifact || !license) return
  const releaseId = artifact.refs.release?.id ?? ZERO_UUID

  insertRequestLog(seed, {
    method: "GET",
    url: `${accountPath(seed)}/releases/${releaseId}/artifacts/${artifact.id}`,
    status: 303,
    created: createdFor(seed, artifact, license),
    requestor: rowLinkage(license),
    resource: rowLinkage(artifact),
    environment: environmentOf(artifact),
  })
}

const productTraffic: Generator = (universe) => {
  const { seed } = universe
  const product = pick(seed, universe.products)
  if (!product) return
  const user = pick(seed, universe.users)
  const license = pick(seed, universe.licenses)
  const base = accountPath(seed)

  const options: (readonly [RequestLogSeed | null, number])[] = [
    [
      user
        ? {
            method: "POST",
            url: `${base}/users`,
            status: 201,
            created: recentOrSampled(seed, user),
            requestor: rowLinkage(product),
            resource: rowLinkage(user),
            environment: environmentOf(user),
            requestBody: JSON.stringify({
              data: {
                type: "users",
                attributes: {
                  email: user.attributes.email,
                  firstName: user.attributes.firstName ?? null,
                  lastName: user.attributes.lastName ?? null,
                  password: "[FILTERED]",
                },
              },
            }),
            responseBody: resourceDocument(user, [
              "email",
              "firstName",
              "lastName",
            ]),
          }
        : null,
      2,
    ],
    [
      {
        method: "GET",
        url: `${base}/licenses?key=%5BFILTERED%5D&limit=1`,
        status: 200,
        created: createdFor(seed, product),
        requestor: rowLinkage(product),
        resource: null,
        environment: null,
        responseBody: JSON.stringify({ data: [], links: {} }),
      },
      1,
    ],
    [
      license
        ? {
            method: "POST",
            url: `${base}/licenses`,
            status: 201,
            created: recentOrSampled(seed, license),
            requestor: rowLinkage(product),
            resource: rowLinkage(license),
            environment: environmentOf(license),
            requestBody: JSON.stringify({
              data: {
                type: "licenses",
                attributes: { name: license.attributes.name ?? null },
                relationships: {
                  policy: { data: license.refs.policy ?? null },
                },
              },
            }),
            responseBody: licenseDocument(license),
          }
        : null,
      2,
    ],
    [
      {
        method: "GET",
        url: `${base}/licenses?page%5Bsize%5D=100&page%5Bcursor%5D=&product=${product.id}`,
        status: 200,
        created: createdFor(seed, product),
        requestor: rowLinkage(product),
        resource: null,
        environment: environmentOf(product),
        responseBody: JSON.stringify({ data: [], links: {} }),
      },
      2,
    ],
  ]

  const chosen = seed.rng.weighted(options)
  if (chosen) insertRequestLog(seed, chosen)
}

const failure: Generator = (universe) => {
  const { seed } = universe
  const license = pick(seed, universe.licenses)
  const readOnly = universe.team.find(
    (row) => row.attributes.role === "read-only",
  )
  const base = accountPath(seed)

  const options: (readonly [RequestLogSeed, number])[] = [
    [
      {
        method: "GET",
        url: `${base}/licenses/${ZERO_UUID}`,
        status: 404,
        created: sampleCreated(seed),
        requestor: license ? rowLinkage(license) : null,
        resource: null,
        environment: null,
        responseBody: errorDocument(
          "Not found",
          `The requested license '${ZERO_UUID}' was not found`,
          "NOT_FOUND",
        ),
      },
      3,
    ],
    [
      {
        method: "GET",
        url: `${base}/machines/${seed.rng.uuid(seed.now - 90 * DAY)}`,
        status: 404,
        created: sampleCreated(seed),
        requestor: license ? rowLinkage(license) : null,
        resource: null,
        environment: null,
        responseBody: errorDocument(
          "Not found",
          "The requested endpoint was not found (check your HTTP method, Accept header, and URL path)",
          "NOT_FOUND",
        ),
      },
      2,
    ],
    [
      {
        method: "GET",
        url: `${base}/licenses?limit=10`,
        status: 401,
        created: sampleCreated(seed),
        requestor: null,
        resource: null,
        environment: null,
        userAgent: "curl/8.7.1",
        responseBody: errorDocument(
          "Unauthorized",
          "Token is invalid",
          "TOKEN_INVALID",
        ),
      },
      3,
    ],
    [
      {
        method: "DELETE",
        url: `${base}/licenses/${license?.id ?? ZERO_UUID}`,
        status: 403,
        created: createdFor(seed, readOnly, license),
        requestor: readOnly ? rowLinkage(readOnly) : null,
        resource: license ? rowLinkage(license) : null,
        environment: environmentOf(license),
        responseBody: errorDocument(
          "Access denied",
          "You do not have permission to complete the request",
          "ACCESS_DENIED",
        ),
      },
      2,
    ],
    [
      {
        method: "POST",
        url: `${base}/licenses`,
        status: 400,
        created: sampleCreated(seed),
        requestor: license ? rowLinkage(license) : null,
        resource: null,
        environment: null,
        requestBody: JSON.stringify({ data: { type: "licenses" } }),
        responseBody: errorDocument("Bad request", "is missing", undefined, {
          pointer: "/data/relationships/policy",
        }),
      },
      2,
    ],
    [
      {
        method: "GET",
        url: `${base}/machines?limit=100`,
        status: 500,
        created: sampleCreated(seed),
        requestor: license ? rowLinkage(license) : null,
        resource: null,
        environment: null,
        responseBody: errorDocument(
          "Internal server error",
          "Looks like something went wrong! Our engineers have been notified.",
        ),
      },
      1,
    ],
    [
      {
        method: "POST",
        url: `${base}/licenses/actions/validate-key`,
        status: 429,
        created: sampleCreated(seed),
        requestor: null,
        resource: null,
        environment: null,
        requestBody: JSON.stringify({ meta: { key: "[FILTERED]" } }),
        responseBody: tooManyRequestsDocument(),
      },
      2,
    ],
  ]

  insertRequestLog(seed, seed.rng.weighted(options))
}

const GENERATORS: readonly (readonly [Generator, number])[] = [
  [validateKey, 24],
  [validateLicense, 8],
  [createMachine, 8],
  [pingHeartbeat, 14],
  [deleteMachine, 3],
  [checkOutMachine, 3],
  [checkOutLicense, 3],
  [login, 3],
  [portalList, 12],
  [portalShow, 8],
  [portalMutation, 7],
  [downloadArtifact, 4],
  [productTraffic, 4],
  [failure, 5],
]

function seedFixedRows(universe: Universe): void {
  const { seed } = universe
  const license = pick(seed, universe.licenses)
  const machine = pick(seed, universe.machines)
  const secondFactor = pick(seed, universe.secondFactors)
  const processRow = pick(seed, universe.processes)
  const component = pick(seed, universe.components)
  const entitlement = pick(seed, universe.entitlements)
  const base = `/v1/accounts/${MOCK_ACCOUNT.id}`

  for (const path of [
    "/licenses/actions/validate-key",
    `/machines/${machine?.id ?? ZERO_UUID}/actions/ping-heartbeat`,
  ]) {
    insertRequestLog(seed, {
      method: "OPTIONS",
      url: `${base}${path}`,
      status: 204,
      created: sampleCreated(seed),
      requestor: null,
      resource: null,
      environment: null,
      userAgent: seed.rng.pick(PORTAL_USER_AGENTS),
    })
  }

  const deletedLicenseId = seed.rng.uuid(seed.now - 70 * DAY)
  for (let index = 0; index < 3; index++) {
    insertRequestLog(seed, {
      method: "POST",
      url: `${base}/licenses/${deletedLicenseId}/actions/validate`,
      status: 200,
      created: sampleCreated(seed),
      requestor: { type: "licenses", id: deletedLicenseId },
      resource: { type: "licenses", id: deletedLicenseId },
      environment: null,
      responseBody: JSON.stringify({
        data: { id: deletedLicenseId, type: "licenses" },
        meta: { valid: true, detail: "is valid", code: "VALID" },
      }),
    })
  }

  insertRequestLog(seed, {
    method: "GET",
    url: `${base}/machines?limit=100`,
    status: 500,
    created: sampleCreated(seed),
    requestor: license ? rowLinkage(license) : null,
    resource: null,
    environment: null,
    responseBody: errorDocument(
      "Internal server error",
      "Looks like something went wrong! Our engineers have been notified.",
    ),
  })

  if (license) {
    insertRequestLog(seed, {
      method: "POST",
      url: `${base}/licenses/actions/validate-key`,
      status: 200,
      created: sampleCreated(seed),
      requestor: null,
      resource: rowLinkage(license),
      environment: environmentOf(license),
      ip: null,
      requestBody: validateKeyBody(seed, license),
      responseBody: validationDocument(
        license,
        { code: "VALID", detail: "is valid", valid: true },
        new Date(seed.now).toISOString(),
      ),
    })
    insertRequestLog(seed, {
      method: "GET",
      url: `${base}/licenses/${license.id}`,
      status: 200,
      created: createdFor(seed, license),
      requestor: rowLinkage(license),
      resource: rowLinkage(license),
      environment: environmentOf(license),
      userAgent: null,
      responseBody: licenseDocument(license),
    })
  }

  if (secondFactor) {
    insertRequestLog(seed, {
      method: "PATCH",
      url: `${base}/users/${secondFactor.refs.user?.id ?? ZERO_UUID}/second-factors/${secondFactor.id}`,
      status: 200,
      created: createdFor(seed, secondFactor),
      requestor: secondFactor.refs.user ?? null,
      resource: rowLinkage(secondFactor),
      environment: null,
      ip: PORTAL_IP,
      userAgent: seed.rng.pick(PORTAL_USER_AGENTS),
      requestBody: JSON.stringify({
        data: { type: "second-factors", attributes: { enabled: true } },
        meta: { otp: "[FILTERED]" },
      }),
      responseBody: resourceDocument(secondFactor, ["enabled"]),
    })
  }

  const keyId = seed.rng.uuid(seed.now - 200 * DAY)
  insertRequestLog(seed, {
    method: "GET",
    url: `${base}/keys/${keyId}`,
    status: 200,
    created: sampleCreated(seed),
    requestor: { type: "users", id: MOCK_ADMIN.id },
    resource: { type: "keys", id: keyId },
    environment: null,
    ip: PORTAL_IP,
    userAgent: seed.rng.pick(PORTAL_USER_AGENTS),
    responseBody: JSON.stringify({
      data: { id: keyId, type: "keys", attributes: { key: "[FILTERED]" } },
    }),
  })

  if (processRow) {
    const machineRow = universe.machines.find(
      (row) => row.id === processRow.refs.machine?.id,
    )
    const licenseRow = machineRow ? linkedLicense(universe, machineRow) : null
    insertRequestLog(seed, {
      method: "POST",
      url: `${base}/processes/${processRow.id}/actions/ping`,
      status: 200,
      created: createdFor(seed, processRow),
      requestor: licenseRow ? rowLinkage(licenseRow) : null,
      resource: rowLinkage(processRow),
      environment: environmentOf(processRow),
      responseBody: resourceDocument(processRow, ["pid", "lastHeartbeat"]),
    })
  }

  if (component) {
    insertRequestLog(seed, {
      method: "GET",
      url: `${base}/components/${component.id}`,
      status: 200,
      created: createdFor(seed, component),
      requestor: { type: "users", id: MOCK_ADMIN.id },
      resource: rowLinkage(component),
      environment: environmentOf(component),
      ip: PORTAL_IP,
      userAgent: seed.rng.pick(PORTAL_USER_AGENTS),
      responseBody: resourceDocument(component, ["fingerprint", "name"]),
    })
  }

  if (entitlement) {
    insertRequestLog(seed, {
      method: "GET",
      url: `${base}/entitlements/${entitlement.id}`,
      status: 200,
      created: createdFor(seed, entitlement),
      requestor: { type: "users", id: MOCK_ADMIN.id },
      resource: rowLinkage(entitlement),
      environment: environmentOf(entitlement),
      ip: PORTAL_IP,
      userAgent: seed.rng.pick(PORTAL_USER_AGENTS),
      responseBody: resourceDocument(entitlement, ["name", "code"]),
    })
  }
}

export function seedMockRequestLogs(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const users = seed.rows("users")
  const universe: Universe = {
    seed,
    licenses: seed.rows("licenses"),
    machines: seed.rows("machines"),
    users,
    team: users.filter(
      (row) => row.attributes.role !== "user" && row.id !== MOCK_ADMIN.id,
    ),
    products: seed.rows("products"),
    policies: seed.rows("policies"),
    tokens: seed.rows("tokens"),
    releases: seed.rows("releases"),
    artifacts: seed.rows("artifacts"),
    entitlements: seed.rows("entitlements"),
    groups: seed.rows("groups"),
    packages: seed.rows("packages"),
    processes: seed.rows("processes"),
    components: seed.rows("components"),
    secondFactors: seed.rows("second-factors"),
  }

  seedFixedRows(universe)

  for (let index = 0; index < REQUEST_LOG_COUNT; index++) {
    const generator = seed.rng.weighted(GENERATORS)
    generator(universe)
  }
}
