import { rowLinkage, text } from "@/demo/server"
import type { SeedContext } from "./context"
import type { Linkage, MockRow } from "@/demo/server/types"
import { DAY, HOUR, MINUTE, SECOND, millis } from "@/demo/server/time"
import {
  MOCK_ACCOUNT,
  MOCK_ADMIN,
  MOCK_FIRST_NAMES,
  MOCK_HERO_LICENSE,
} from "./universe"
import {
  PORTAL_IP,
  accountPath,
  insertRequestLog,
  licenseDocument,
  notBefore,
  resourceDocument,
  validateKeyBody,
  validationDocument,
  validationOutcome,
  type RequestLogSeed,
  type ValidationOutcome,
} from "./request-logs"

const WINDOW_DAYS = 45
const CREATED_EVENTS_PER_TYPE = 8
const HEARTBEAT_GRACE = 10 * MINUTE
const EXPIRING_SOON_LEAD = 3 * DAY

const EventPrefixes: Readonly<Record<string, string>> = {
  licenses: "license",
  machines: "machine",
  users: "user",
  products: "product",
  policies: "policy",
  entitlements: "entitlement",
  releases: "release",
  artifacts: "artifact",
  packages: "package",
  components: "component",
  processes: "process",
  groups: "group",
  environments: "environment",
}

const LIMIT_ATTRIBUTES = [
  "maxMachines",
  "maxProcesses",
  "maxUsers",
  "maxCores",
  "maxUses",
  "maxLicenses",
] as const

const TOGGLE_ATTRIBUTES = [
  "suspended",
  "protected",
  "floating",
  "strict",
  "requireHeartbeat",
  "requireCheckIn",
  "encrypted",
] as const

type Change = readonly [string, [unknown, unknown]]
type LinkedRequest = Omit<RequestLogSeed, "created">

interface EventSeed {
  event: string
  resource: Linkage
  created: string
  whodunnit: Linkage | null
  environment: Linkage | null
  metadata?: Record<string, unknown>
  request?: LinkedRequest
}

interface Universe {
  seed: SeedContext
  admin: MockRow | undefined
  team: MockRow[]
  users: MockRow[]
  licenses: MockRow[]
  machines: MockRow[]
  products: MockRow[]
  policies: MockRow[]
  entitlements: MockRow[]
  tokens: MockRow[]
  releases: MockRow[]
  artifacts: MockRow[]
  packages: MockRow[]
  components: MockRow[]
  processes: MockRow[]
  groups: MockRow[]
  environments: MockRow[]
  secondFactors: MockRow[]
  accounts: MockRow[]
  licenseEntitlements: MockRow[]
  policyEntitlements: MockRow[]
}

type Generator = (universe: Universe) => void

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function iso(value: number): string {
  return new Date(value).toISOString()
}

function environmentOf(row: MockRow): Linkage | null {
  return row.refs.environment ?? null
}

function pick(seed: SeedContext, rows: MockRow[]): MockRow | undefined {
  return rows.length === 0 ? undefined : seed.rng.pick(rows)
}

function sample(seed: SeedContext, rows: MockRow[], count: number): MockRow[] {
  return seed.rng.sample(rows, Math.min(count, rows.length))
}

function withinWindow(universe: Universe, value: string | null): boolean {
  const at = millis(value)
  const { now } = universe.seed
  return at != null && at <= now && at >= now - WINDOW_DAYS * DAY
}

function eventTime(seed: SeedContext, floor: string | null): string {
  const bucket = seed.rng.weighted<"hours" | "days" | "spread">([
    ["hours", 25],
    ["days", 20],
    ["spread", 55],
  ])
  const ago =
    bucket === "hours"
      ? seed.rng.float(0, 24 * HOUR)
      : bucket === "days"
        ? seed.rng.float(DAY, 3 * DAY)
        : seed.rng.float(3 * DAY, WINDOW_DAYS * DAY)
  return notBefore(seed, floor, iso(seed.now - ago))
}

function updateTime(universe: Universe, row: MockRow): string {
  if (row.updated !== row.created && withinWindow(universe, row.updated)) {
    return row.updated
  }
  return eventTime(universe.seed, row.created)
}

function portalActor(universe: Universe): Linkage | null {
  const { seed, admin, team } = universe
  if (admin && (team.length === 0 || seed.rng.chance(0.65))) {
    return rowLinkage(admin)
  }
  const member = pick(seed, team)
  return member ? rowLinkage(member) : admin ? rowLinkage(admin) : null
}

function productActor(universe: Universe, row: MockRow): Linkage | null {
  const productId = row.refs.product?.id
  const product =
    universe.products.find((candidate) => candidate.id === productId) ??
    pick(universe.seed, universe.products)
  return product ? rowLinkage(product) : portalActor(universe)
}

function licenseOfMachine(
  universe: Universe,
  machine: MockRow,
): MockRow | undefined {
  const id = machine.refs.license?.id
  return universe.licenses.find((row) => row.id === id)
}

function machineOf(universe: Universe, child: MockRow): MockRow | undefined {
  const id = child.refs.machine?.id
  return universe.machines.find((row) => row.id === id)
}

function licenseActor(universe: Universe, machine: MockRow): Linkage | null {
  const license = licenseOfMachine(universe, machine)
  return license ? rowLinkage(license) : null
}

function insertEvent(seed: SeedContext, input: EventSeed): MockRow {
  const request = input.request
    ? insertRequestLog(seed, { ...input.request, created: input.created })
    : null

  return seed.insert(
    "event-logs",
    { event: input.event, metadata: input.metadata ?? {} },
    {
      account: seed.accountRef(),
      environment: input.environment,
      whodunnit: input.whodunnit,
      resource: input.resource,
      request: request ? { type: "request-logs", id: request.id } : null,
    },
    { created: input.created },
  )
}

function shiftIso(value: string, byMillis: number): string {
  return iso(Date.parse(value) + byMillis)
}

function candidateChanges(seed: SeedContext, row: MockRow): Change[] {
  const attributes = row.attributes
  const changes: Change[] = []

  const name = text(attributes.name)
  if (name) {
    const previous = seed.rng.pick([
      `${name} (trial)`,
      `${name} (pending)`,
      name.toUpperCase(),
    ])
    changes.push(["name", [previous, name]])
  }

  const expiry = text(attributes.expiry)
  if (expiry) {
    const previous = shiftIso(expiry, -seed.rng.pick([30, 90, 365]) * DAY)
    changes.push(["expiry", [previous, expiry]])
  }

  if (isRecord(attributes.metadata)) {
    const keys = Object.keys(attributes.metadata)
    const before = { ...attributes.metadata }
    if (keys.length > 0) delete before[seed.rng.pick(keys)]
    else before.legacyId = `crm_${seed.rng.hex(8)}`
    changes.push(["metadata", [before, attributes.metadata]])
  }

  for (const attribute of LIMIT_ATTRIBUTES) {
    const value = attributes[attribute]
    if (!(attribute in attributes)) continue
    if (value === null || typeof value === "number") {
      const previous =
        typeof value === "number"
          ? value + seed.rng.pick([1, 5, 10])
          : seed.rng.pick([1, 3, 5])
      changes.push([attribute, [previous, value]])
    }
  }

  for (const attribute of TOGGLE_ATTRIBUTES) {
    const value = attributes[attribute]
    if (typeof value === "boolean") changes.push([attribute, [!value, value]])
  }

  if (Array.isArray(attributes.permissions)) {
    const permissions: unknown[] = attributes.permissions
    const before =
      permissions.length > 1
        ? permissions.slice(0, -1)
        : [...permissions, "license.validate"]
    changes.push(["permissions", [before, permissions]])
  }

  if (Array.isArray(attributes.platforms)) {
    const platforms: unknown[] = attributes.platforms
    changes.push(["platforms", [platforms.slice(0, -1), platforms]])
  }

  const email = text(attributes.email)
  if (email) changes.push(["email", [`legacy.${email}`, email]])

  const firstName = text(attributes.firstName)
  if (firstName) {
    changes.push(["firstName", [seed.rng.pick(MOCK_FIRST_NAMES), firstName]])
  }

  const role = text(attributes.role)
  if (role) {
    changes.push(["role", [role === "user" ? "read-only" : "user", role]])
  }

  const url = text(attributes.url)
  if (url) changes.push(["url", [url.replace(/^https:/, "http:"), url]])

  const description = text(attributes.description)
  if (description) changes.push(["description", ["", description]])

  const hostname = text(attributes.hostname)
  if (hostname) changes.push(["hostname", [`${hostname}-old`, hostname]])

  const ip = text(attributes.ip)
  if (ip) {
    const previous = `10.0.${seed.rng.int(0, 255)}.${seed.rng.int(1, 254)}`
    changes.push(["ip", [previous, ip]])
  }

  const cores = attributes.cores
  if (typeof cores === "number") {
    changes.push(["cores", [Math.max(1, Math.floor(cores / 2)), cores]])
  }

  const duration = attributes.duration
  if ("duration" in attributes) {
    if (duration === null || typeof duration === "number") {
      changes.push(["duration", [(duration ?? 0) + 30 * 86400, duration]])
    }
  }

  const status = text(attributes.status)
  if (status && status !== "DRAFT") changes.push(["status", ["DRAFT", status]])

  const tag = text(attributes.tag)
  if (tag) changes.push(["tag", [null, tag]])

  const distribution = text(attributes.distributionStrategy)
  if (distribution) {
    const previous = distribution === "OPEN" ? "LICENSED" : "OPEN"
    changes.push(["distributionStrategy", [previous, distribution]])
  }

  return changes
}

function diffFor(
  seed: SeedContext,
  row: MockRow,
  updatedAt: string,
): Record<string, unknown> {
  const candidates = seed.rng.shuffle(candidateChanges(seed, row))
  const wanted = seed.rng.chance(0.4) ? 1 : seed.rng.int(3, 6)
  const diff: Record<string, [unknown, unknown]> = {}
  for (const [attribute, pair] of candidates.slice(0, wanted)) {
    diff[attribute] = pair
  }
  const before =
    Date.parse(row.created) < Date.parse(updatedAt)
      ? seed.between(row.created, updatedAt)
      : row.created
  diff.updated = [before, updatedAt]
  return { diff }
}

function entitlementCodes(
  universe: Universe,
  joins: MockRow[],
  parentKey: string,
  parentId: string,
): string[] {
  const { seed, entitlements } = universe
  const attached = joins
    .filter((join) => join.refs[parentKey]?.id === parentId)
    .map((join) =>
      entitlements.find((row) => row.id === join.refs.entitlement?.id),
    )
    .filter((row): row is MockRow => row != null)
  const pool = attached.length > 0 ? attached : sample(seed, entitlements, 2)
  return sample(seed, pool, seed.rng.int(1, 3))
    .map((row) => text(row.attributes.code))
    .filter((code): code is string => code != null)
}

function licenseCodes(universe: Universe, license: MockRow): string[] {
  return entitlementCodes(
    universe,
    universe.licenseEntitlements,
    "license",
    license.id,
  )
}

function policyCodes(universe: Universe, policy: MockRow): string[] {
  return entitlementCodes(
    universe,
    universe.policyEntitlements,
    "policy",
    policy.id,
  )
}

function previousVersion(version: string): string {
  const parts = version.split(".")
  for (let index = parts.length - 1; index >= 0; index--) {
    const segment = Number(parts[index])
    if (Number.isInteger(segment) && segment > 0) {
      parts[index] = String(segment - 1)
      return parts.join(".")
    }
  }
  return "0.0.1"
}

function releaseMetadata(release: MockRow): Record<string, unknown> {
  return {
    product: release.refs.product?.id ?? null,
    package: release.refs.package?.id ?? null,
    version: release.attributes.version ?? null,
  }
}

function licenseCreateRequest(
  seed: SeedContext,
  license: MockRow,
  actor: Linkage | null,
): LinkedRequest {
  return {
    method: "POST",
    url: `${accountPath(seed)}/licenses`,
    status: 201,
    requestor: actor,
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
          ...(license.refs.owner
            ? { owner: { data: license.refs.owner } }
            : {}),
        },
      },
    }),
    responseBody: licenseDocument(license),
  }
}

function licenseActionRequest(
  seed: SeedContext,
  license: MockRow,
  actor: Linkage | null,
  action: string,
): LinkedRequest {
  return {
    method: "POST",
    url: `${accountPath(seed)}/licenses/${license.id}/actions/${action}`,
    status: 200,
    requestor: actor,
    resource: rowLinkage(license),
    environment: environmentOf(license),
    responseBody: licenseDocument(license),
  }
}

function licensePatchRequest(
  seed: SeedContext,
  license: MockRow,
  actor: Linkage | null,
  metadata: Record<string, unknown>,
): LinkedRequest {
  const diff = isRecord(metadata.diff) ? metadata.diff : {}
  const attributes: Record<string, unknown> = {}
  for (const [attribute, pair] of Object.entries(diff)) {
    if (attribute !== "updated" && Array.isArray(pair)) {
      const values: unknown[] = pair
      attributes[attribute] = values[1] ?? null
    }
  }
  return {
    method: "PATCH",
    url: `${accountPath(seed)}/licenses/${license.id}`,
    status: 200,
    requestor: actor,
    resource: rowLinkage(license),
    environment: environmentOf(license),
    requestBody: JSON.stringify({ data: { type: "licenses", attributes } }),
    responseBody: licenseDocument(license),
  }
}

function validationRequest(
  seed: SeedContext,
  license: MockRow,
  outcome: ValidationOutcome,
  created: string,
  viaKey: boolean,
): LinkedRequest {
  return {
    method: "POST",
    url: viaKey
      ? `${accountPath(seed)}/licenses/actions/validate-key`
      : `${accountPath(seed)}/licenses/${license.id}/actions/validate`,
    status: 200,
    requestor: viaKey ? null : rowLinkage(license),
    resource: rowLinkage(license),
    environment: environmentOf(license),
    requestBody: viaKey
      ? validateKeyBody(seed, license)
      : JSON.stringify({ meta: { scope: { fingerprint: seed.rng.hex(40) } } }),
    responseBody: validationDocument(license, outcome, created),
  }
}

function machineCreateRequest(
  seed: SeedContext,
  machine: MockRow,
  license: MockRow,
): LinkedRequest {
  return {
    method: "POST",
    url: `${accountPath(seed)}/machines`,
    status: 201,
    requestor: rowLinkage(license),
    resource: rowLinkage(machine),
    environment: environmentOf(machine),
    requestBody: JSON.stringify({
      data: {
        type: "machines",
        attributes: {
          fingerprint: machine.attributes.fingerprint ?? seed.rng.hex(40),
          platform: machine.attributes.platform ?? null,
          name: machine.attributes.name ?? null,
        },
        relationships: { license: { data: rowLinkage(license) } },
      },
    }),
    responseBody: resourceDocument(machine, [
      "fingerprint",
      "name",
      "platform",
    ]),
  }
}

function heartbeatRequest(
  seed: SeedContext,
  machine: MockRow,
  actor: Linkage | null,
): LinkedRequest {
  return {
    method: "POST",
    url: `${accountPath(seed)}/machines/${machine.id}/actions/ping-heartbeat`,
    status: 200,
    requestor: actor,
    resource: rowLinkage(machine),
    environment: environmentOf(machine),
    responseBody: resourceDocument(machine, [
      "fingerprint",
      "name",
      "lastHeartbeat",
    ]),
  }
}

function tokenRequest(
  seed: SeedContext,
  token: MockRow,
  actor: Linkage | null,
): LinkedRequest {
  return {
    method: "POST",
    url: `${accountPath(seed)}/tokens`,
    status: 201,
    requestor: actor,
    resource: rowLinkage(token),
    environment: environmentOf(token),
    ip: PORTAL_IP,
    requestBody: JSON.stringify({
      data: {
        type: "tokens",
        attributes: { name: token.attributes.name ?? null },
      },
    }),
    responseBody: JSON.stringify({
      data: {
        id: token.id,
        type: "tokens",
        attributes: {
          token: "[FILTERED]",
          name: token.attributes.name ?? null,
          expiry: token.attributes.expiry ?? null,
        },
      },
    }),
  }
}

function entitlementsAttachRequest(
  seed: SeedContext,
  license: MockRow,
  actor: Linkage | null,
  codes: string[],
): LinkedRequest {
  const ids = codes
    .map(
      (code) =>
        seed.rows("entitlements").find((row) => row.attributes.code === code)
          ?.id,
    )
    .filter((id): id is string => id != null)
  return {
    method: "POST",
    url: `${accountPath(seed)}/licenses/${license.id}/entitlements`,
    status: 200,
    requestor: actor,
    resource: rowLinkage(license),
    environment: environmentOf(license),
    requestBody: JSON.stringify({
      data: ids.map((id) => ({ type: "entitlements", id })),
    }),
    responseBody: JSON.stringify({
      data: ids.map((id) => ({
        id: seed.rng.uuid(seed.now),
        type: "license-entitlements",
        relationships: {
          entitlement: { data: { type: "entitlements", id } },
          license: { data: rowLinkage(license) },
        },
      })),
    }),
  }
}

function releasePublishRequest(
  seed: SeedContext,
  release: MockRow,
  actor: Linkage | null,
): LinkedRequest {
  return {
    method: "POST",
    url: `${accountPath(seed)}/releases/${release.id}/actions/publish`,
    status: 200,
    requestor: actor,
    resource: rowLinkage(release),
    environment: environmentOf(release),
    responseBody: resourceDocument(release, [
      "name",
      "version",
      "channel",
      "status",
    ]),
  }
}

function userBanRequest(
  seed: SeedContext,
  user: MockRow,
  actor: Linkage | null,
): LinkedRequest {
  return {
    method: "POST",
    url: `${accountPath(seed)}/users/${user.id}/actions/ban`,
    status: 200,
    requestor: actor,
    resource: rowLinkage(user),
    environment: environmentOf(user),
    ip: PORTAL_IP,
    responseBody: resourceDocument(user, ["email", "role", "bannedAt"]),
  }
}

function newestWithinWindow(
  universe: Universe,
  rows: MockRow[],
  limit: number,
): MockRow[] {
  return rows
    .filter((row) => withinWindow(universe, row.created))
    .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
    .slice(0, limit)
}

function actorByChance(
  universe: Universe,
  row: MockRow,
  productChance: number,
): Linkage | null {
  return universe.seed.rng.chance(productChance)
    ? productActor(universe, row)
    : portalActor(universe)
}

function createdActor(universe: Universe, row: MockRow): Linkage | null {
  switch (row.type) {
    case "machines":
      return licenseActor(universe, row)
    case "components":
    case "processes": {
      const machine = machineOf(universe, row)
      return machine ? licenseActor(universe, machine) : null
    }
    case "releases":
    case "artifacts":
      return actorByChance(universe, row, 0.6)
    case "users":
      return actorByChance(universe, row, 0.5)
    case "licenses":
      return actorByChance(universe, row, 0.3)
    default:
      return portalActor(universe)
  }
}

const createdEvents: Generator = (universe) => {
  const { seed } = universe
  const tables: (readonly [MockRow[], number])[] = [
    [universe.licenses, 6],
    [universe.machines, 5],
    [universe.users, 0],
    [universe.products, 0],
    [universe.policies, 0],
    [universe.entitlements, 0],
    [universe.releases, 0],
    [universe.artifacts, 0],
    [universe.packages, 0],
    [universe.components, 0],
    [universe.processes, 0],
    [universe.groups, 0],
    [universe.environments, 0],
  ]

  for (const [rows, linked] of tables) {
    const recent = newestWithinWindow(universe, rows, CREATED_EVENTS_PER_TYPE)
    recent.forEach((row, index) => {
      const prefix = EventPrefixes[row.type]
      if (!prefix) return
      const actor = createdActor(universe, row)
      const license =
        row.type === "machines" ? licenseOfMachine(universe, row) : undefined
      const request =
        index >= linked
          ? undefined
          : row.type === "licenses"
            ? licenseCreateRequest(seed, row, actor)
            : license
              ? machineCreateRequest(seed, row, license)
              : undefined

      insertEvent(seed, {
        event: `${prefix}.created`,
        resource: rowLinkage(row),
        created: row.created,
        whodunnit: actor,
        environment: environmentOf(row),
        request,
      })
    })
  }

  newestWithinWindow(universe, universe.tokens, 8).forEach((token, index) => {
    const bearer = token.refs.bearer
    const actor =
      bearer?.type === "users" ? bearer : (portalActor(universe) ?? bearer)
    insertEvent(seed, {
      event: "token.generated",
      resource: rowLinkage(token),
      created: token.created,
      whodunnit: actor,
      environment: environmentOf(token),
      request: index < 3 ? tokenRequest(seed, token, actor) : undefined,
    })
  })
}

const updatedEvents: Generator = (universe) => {
  const { seed } = universe
  const plan: (readonly [MockRow[], number])[] = [
    [universe.licenses, 14],
    [universe.machines, 8],
    [universe.users, 8],
    [universe.policies, 5],
    [universe.products, 3],
    [universe.entitlements, 4],
    [universe.releases, 4],
    [universe.packages, 2],
    [universe.groups, 3],
    [universe.environments, 2],
    [universe.artifacts, 4],
    [universe.components, 3],
  ]

  for (const [rows, count] of plan) {
    sample(seed, rows, count).forEach((row, index) => {
      const prefix = EventPrefixes[row.type]
      if (!prefix) return
      const created = updateTime(universe, row)
      const actor = portalActor(universe)
      const metadata = diffFor(seed, row, created)
      insertEvent(seed, {
        event: `${prefix}.updated`,
        resource: rowLinkage(row),
        created,
        whodunnit: actor,
        environment: environmentOf(row),
        metadata,
        request:
          row.type === "licenses" && index < 4
            ? licensePatchRequest(seed, row, actor, metadata)
            : undefined,
      })
    })
  }

  const deletedUserId = seed.rng.uuid(seed.now - 120 * DAY)
  const license = pick(seed, universe.licenses)
  if (license) {
    const created = eventTime(seed, license.created)
    insertEvent(seed, {
      event: "license.updated",
      resource: rowLinkage(license),
      created,
      whodunnit: { type: "users", id: deletedUserId },
      environment: environmentOf(license),
      metadata: diffFor(seed, license, created),
    })
  }
}

const validationEvents: Generator = (universe) => {
  const { seed } = universe
  const hero = universe.licenses.find((row) => row.id === MOCK_HERO_LICENSE.id)
  const targets = [
    ...(hero ? Array.from({ length: 14 }, () => hero) : []),
    ...Array.from({ length: 46 }, () => pick(seed, universe.licenses)).filter(
      (row): row is MockRow => row != null,
    ),
  ]

  targets.forEach((license, index) => {
    const outcome = validationOutcome(seed, license)
    const viaKey = seed.rng.chance(0.5)
    const created = eventTime(seed, license.created)
    insertEvent(seed, {
      event: outcome.valid
        ? "license.validation.succeeded"
        : "license.validation.failed",
      resource: rowLinkage(license),
      created,
      whodunnit: viaKey ? null : rowLinkage(license),
      environment: environmentOf(license),
      metadata: { code: outcome.code },
      request:
        index % 10 === 0
          ? validationRequest(seed, license, outcome, created, viaKey)
          : undefined,
    })
  })
}

const licenseLifecycleEvents: Generator = (universe) => {
  const { seed, licenses } = universe
  if (licenses.length === 0) return

  const suspended = licenses.filter((row) => row.attributes.suspended === true)
  const expired = licenses.filter((row) => {
    const expiry = millis(text(row.attributes.expiry))
    if (expiry == null || expiry > seed.now) return false
    return withinWindow(universe, iso(expiry))
  })
  const expiring = licenses.filter((row) => {
    const expiry = millis(text(row.attributes.expiry))
    return expiry != null && expiry > seed.now && expiry < seed.now + 30 * DAY
  })

  sample(seed, licenses, 8).forEach((license, index) => {
    const actor = portalActor(universe)
    insertEvent(seed, {
      event: "license.renewed",
      resource: rowLinkage(license),
      created: eventTime(seed, license.created),
      whodunnit: actor,
      environment: environmentOf(license),
      request:
        index < 2
          ? licenseActionRequest(seed, license, actor, "renew")
          : undefined,
    })
  })

  const suspendable = suspended.length > 0 ? suspended : licenses
  sample(seed, suspendable, 5).forEach((license, index) => {
    const actor = portalActor(universe)
    insertEvent(seed, {
      event: "license.suspended",
      resource: rowLinkage(license),
      created: eventTime(seed, license.created),
      whodunnit: actor,
      environment: environmentOf(license),
      request:
        index === 0
          ? licenseActionRequest(seed, license, actor, "suspend")
          : undefined,
    })
  })

  const eventPlan: (readonly [
    string,
    number,
    "portal" | "license" | "none",
  ])[] = [
    ["license.reinstated", 5, "portal"],
    ["license.checked-in", 8, "license"],
    ["license.check-in-overdue", 4, "none"],
    ["license.usage.incremented", 7, "license"],
    ["license.usage.reset", 3, "portal"],
    ["license.policy.updated", 4, "portal"],
    ["license.owner.updated", 4, "portal"],
    ["license.group.updated", 3, "portal"],
    ["license.users.attached", 4, "portal"],
    ["license.users.detached", 3, "portal"],
  ]
  for (const [event, count, actorKind] of eventPlan) {
    for (const license of sample(seed, licenses, count)) {
      insertEvent(seed, {
        event,
        resource: rowLinkage(license),
        created: eventTime(seed, license.created),
        whodunnit:
          actorKind === "portal"
            ? portalActor(universe)
            : actorKind === "license"
              ? rowLinkage(license)
              : null,
        environment: environmentOf(license),
      })
    }
  }

  sample(seed, licenses, 6).forEach((license, index) => {
    insertEvent(seed, {
      event: "license.checked-out",
      resource: rowLinkage(license),
      created: eventTime(seed, license.created),
      whodunnit: rowLinkage(license),
      environment: environmentOf(license),
      request:
        index === 0
          ? {
              ...licenseActionRequest(
                seed,
                license,
                rowLinkage(license),
                "check-out",
              ),
              responseBody: JSON.stringify({
                data: {
                  id: seed.rng.uuid(seed.now),
                  type: "license-files",
                  attributes: { certificate: "[FILTERED]", ttl: 2592000 },
                },
              }),
            }
          : undefined,
    })
  })

  for (const license of sample(seed, expired, 5)) {
    insertEvent(seed, {
      event: "license.expired",
      resource: rowLinkage(license),
      created: notBefore(
        seed,
        license.created,
        text(license.attributes.expiry) ?? license.created,
      ),
      whodunnit: null,
      environment: environmentOf(license),
    })
  }

  for (const license of sample(seed, expiring, 5)) {
    const expiry = millis(text(license.attributes.expiry)) ?? seed.now
    const created = iso(
      Math.min(
        expiry - EXPIRING_SOON_LEAD,
        seed.now - seed.rng.float(0, 6 * HOUR),
      ),
    )
    insertEvent(seed, {
      event: "license.expiring-soon",
      resource: rowLinkage(license),
      created: notBefore(seed, license.created, created),
      whodunnit: null,
      environment: environmentOf(license),
    })
  }

  sample(seed, licenses, 5).forEach((license, index) => {
    const actor = portalActor(universe)
    const codes = licenseCodes(universe, license)
    insertEvent(seed, {
      event: "license.entitlements.attached",
      resource: rowLinkage(license),
      created: eventTime(seed, license.created),
      whodunnit: actor,
      environment: environmentOf(license),
      metadata: { codes },
      request:
        index === 0
          ? entitlementsAttachRequest(seed, license, actor, codes)
          : undefined,
    })
  })

  for (const license of sample(seed, licenses, 2)) {
    insertEvent(seed, {
      event: "license.entitlements.detached",
      resource: rowLinkage(license),
      created: eventTime(seed, license.created),
      whodunnit: portalActor(universe),
      environment: environmentOf(license),
      metadata: { codes: licenseCodes(universe, license) },
    })
  }
}

const machineEvents: Generator = (universe) => {
  const { seed } = universe
  const machines = universe.machines.filter((row) => row.refs.license != null)
  if (machines.length === 0) return

  const pinged = Array.from({ length: 24 }, () => seed.rng.pick(machines))
  pinged.forEach((machine, index) => {
    const actor = licenseActor(universe, machine)
    insertEvent(seed, {
      event: "machine.heartbeat.ping",
      resource: rowLinkage(machine),
      created: eventTime(seed, machine.created),
      whodunnit: actor,
      environment: environmentOf(machine),
      request: index < 4 ? heartbeatRequest(seed, machine, actor) : undefined,
    })
  })

  const dead = machines.filter((row) => {
    const last = millis(text(row.attributes.lastHeartbeat))
    return last != null && last + HEARTBEAT_GRACE < seed.now
  })
  for (const machine of sample(seed, dead.length > 0 ? dead : machines, 8)) {
    const last = millis(text(machine.attributes.lastHeartbeat))
    const died = last != null ? iso(last + HEARTBEAT_GRACE) : null
    insertEvent(seed, {
      event: "machine.heartbeat.dead",
      resource: rowLinkage(machine),
      created:
        died && withinWindow(universe, died)
          ? died
          : eventTime(seed, machine.created),
      whodunnit: null,
      environment: environmentOf(machine),
    })
  }

  const plan: (readonly [string, number, "license" | "portal"])[] = [
    ["machine.heartbeat.pong", 8, "license"],
    ["machine.heartbeat.resurrected", 4, "license"],
    ["machine.heartbeat.reset", 3, "portal"],
    ["machine.checked-out", 4, "license"],
    ["machine.group.updated", 2, "portal"],
    ["machine.owner.updated", 2, "portal"],
    ["machine.proofs.generated", 2, "license"],
  ]
  for (const [event, count, actorKind] of plan) {
    for (const machine of sample(seed, machines, count)) {
      insertEvent(seed, {
        event,
        resource: rowLinkage(machine),
        created: eventTime(seed, machine.created),
        whodunnit:
          actorKind === "license"
            ? licenseActor(universe, machine)
            : portalActor(universe),
        environment: environmentOf(machine),
      })
    }
  }
}

const processEvents: Generator = (universe) => {
  const { seed, processes } = universe
  if (processes.length === 0) return

  const plan: (readonly [string, number, boolean])[] = [
    ["process.heartbeat.ping", 12, true],
    ["process.heartbeat.pong", 5, true],
    ["process.heartbeat.dead", 5, false],
  ]
  for (const [event, count, attributed] of plan) {
    const targets = Array.from({ length: count }, () =>
      seed.rng.pick(processes),
    )
    for (const processRow of targets) {
      const machine = machineOf(universe, processRow)
      insertEvent(seed, {
        event,
        resource: rowLinkage(processRow),
        created: eventTime(seed, processRow.created),
        whodunnit:
          attributed && machine ? licenseActor(universe, machine) : null,
        environment: environmentOf(processRow),
      })
    }
  }
}

const releaseEvents: Generator = (universe) => {
  const { seed, releases } = universe
  if (releases.length === 0) return

  const published = releases.filter(
    (row) => row.attributes.status === "PUBLISHED",
  )
  const yanked = releases.filter((row) => row.attributes.status === "YANKED")
  const publishable = published.length > 0 ? published : releases
  const yankable = yanked.length > 0 ? yanked : releases

  sample(seed, publishable, 5).forEach((release, index) => {
    const actor = actorByChance(universe, release, 0.5)
    insertEvent(seed, {
      event: "release.published",
      resource: rowLinkage(release),
      created: eventTime(seed, release.created),
      whodunnit: actor,
      environment: environmentOf(release),
      request:
        index < 2 ? releasePublishRequest(seed, release, actor) : undefined,
    })
  })

  for (const release of sample(seed, yankable, 2)) {
    const yankedAt = text(release.attributes.yanked)
    insertEvent(seed, {
      event: "release.yanked",
      resource: rowLinkage(release),
      created:
        yankedAt && withinWindow(universe, yankedAt)
          ? yankedAt
          : eventTime(seed, release.created),
      whodunnit: portalActor(universe),
      environment: environmentOf(release),
    })
  }

  for (const release of sample(seed, releases, 3)) {
    insertEvent(seed, {
      event: "release.uploaded",
      resource: rowLinkage(release),
      created: eventTime(seed, release.created),
      whodunnit: productActor(universe, release),
      environment: environmentOf(release),
    })
  }

  const downloaded = Array.from({ length: 8 }, () => seed.rng.pick(releases))
  for (const release of downloaded) {
    const license = pick(seed, universe.licenses)
    insertEvent(seed, {
      event: "release.downloaded",
      resource: rowLinkage(release),
      created: eventTime(seed, release.created),
      whodunnit: license ? rowLinkage(license) : null,
      environment: environmentOf(release),
      metadata: releaseMetadata(release),
    })
  }

  for (const release of sample(seed, releases, 3)) {
    const license = pick(seed, universe.licenses)
    const version = text(release.attributes.version) ?? "1.0.0"
    insertEvent(seed, {
      event: "release.upgraded",
      resource: rowLinkage(release),
      created: eventTime(seed, release.created),
      whodunnit: license ? rowLinkage(license) : null,
      environment: environmentOf(release),
      metadata: {
        product: release.refs.product?.id ?? null,
        package: release.refs.package?.id ?? null,
        prev: previousVersion(version),
        next: version,
      },
    })
  }

  const constrained = pick(seed, releases)
  if (constrained) {
    insertEvent(seed, {
      event: "release.constraints.attached",
      resource: rowLinkage(constrained),
      created: eventTime(seed, constrained.created),
      whodunnit: portalActor(universe),
      environment: environmentOf(constrained),
    })
  }
}

const artifactEvents: Generator = (universe) => {
  const { seed, artifacts } = universe
  if (artifacts.length === 0) return

  const releaseOf = (artifact: MockRow): MockRow | undefined =>
    universe.releases.find((row) => row.id === artifact.refs.release?.id)
  const uploaded = artifacts.filter(
    (row) => row.attributes.status === "UPLOADED",
  )
  const failed = artifacts.filter((row) => row.attributes.status === "FAILED")
  const uploadable = uploaded.length > 0 ? uploaded : artifacts
  const failable = failed.length > 0 ? failed : artifacts

  for (const artifact of sample(seed, uploadable, 5)) {
    insertEvent(seed, {
      event: "artifact.uploaded",
      resource: rowLinkage(artifact),
      created: eventTime(seed, artifact.created),
      whodunnit: productActor(universe, releaseOf(artifact) ?? artifact),
      environment: environmentOf(artifact),
    })
  }

  for (const artifact of sample(seed, uploadable, 2)) {
    const started = eventTime(seed, artifact.created)
    const actor = productActor(universe, releaseOf(artifact) ?? artifact)
    insertEvent(seed, {
      event: "artifact.upload.processing",
      resource: rowLinkage(artifact),
      created: started,
      whodunnit: actor,
      environment: environmentOf(artifact),
    })
    insertEvent(seed, {
      event: "artifact.upload.succeeded",
      resource: rowLinkage(artifact),
      created: iso(
        Math.min(seed.now, Date.parse(started) + seed.rng.int(2, 20) * SECOND),
      ),
      whodunnit: actor,
      environment: environmentOf(artifact),
    })
  }

  for (const artifact of sample(seed, failable, 2)) {
    insertEvent(seed, {
      event: "artifact.upload.failed",
      resource: rowLinkage(artifact),
      created: eventTime(seed, artifact.created),
      whodunnit: productActor(universe, releaseOf(artifact) ?? artifact),
      environment: environmentOf(artifact),
    })
  }

  const downloaded = Array.from({ length: 5 }, () => seed.rng.pick(artifacts))
  for (const artifact of downloaded) {
    const release = releaseOf(artifact)
    const license = pick(seed, universe.licenses)
    insertEvent(seed, {
      event: "artifact.downloaded",
      resource: rowLinkage(artifact),
      created: eventTime(seed, artifact.created),
      whodunnit: license ? rowLinkage(license) : null,
      environment: environmentOf(artifact),
      metadata: release
        ? releaseMetadata(release)
        : { product: null, package: null, version: null },
    })
  }
}

const tokenEvents: Generator = (universe) => {
  const { seed, tokens } = universe
  for (const token of sample(seed, tokens, 2)) {
    insertEvent(seed, {
      event: "token.regenerated",
      resource: rowLinkage(token),
      created: eventTime(seed, token.created),
      whodunnit: portalActor(universe),
      environment: environmentOf(token),
    })
  }
}

const userEvents: Generator = (universe) => {
  const { seed, users } = universe
  if (users.length === 0) return

  const banned = users.filter((row) => text(row.attributes.bannedAt) != null)
  sample(seed, banned.length > 0 ? banned : users, 3).forEach((user, index) => {
    const bannedAt = text(user.attributes.bannedAt)
    const actor = portalActor(universe)
    insertEvent(seed, {
      event: "user.banned",
      resource: rowLinkage(user),
      created:
        bannedAt && withinWindow(universe, bannedAt)
          ? bannedAt
          : eventTime(seed, user.created),
      whodunnit: actor,
      environment: environmentOf(user),
      request: index === 0 ? userBanRequest(seed, user, actor) : undefined,
    })
  })

  const unbanned = pick(
    seed,
    users.filter((row) => text(row.attributes.bannedAt) == null),
  )
  if (unbanned) {
    insertEvent(seed, {
      event: "user.unbanned",
      resource: rowLinkage(unbanned),
      created: eventTime(seed, unbanned.created),
      whodunnit: portalActor(universe),
      environment: environmentOf(unbanned),
    })
  }

  for (const user of sample(seed, users, 2)) {
    insertEvent(seed, {
      event: "user.password-reset",
      resource: rowLinkage(user),
      created: eventTime(seed, user.created),
      whodunnit: rowLinkage(user),
      environment: environmentOf(user),
    })
  }

  const grouped = pick(seed, users)
  if (grouped) {
    insertEvent(seed, {
      event: "user.group.updated",
      resource: rowLinkage(grouped),
      created: eventTime(seed, grouped.created),
      whodunnit: portalActor(universe),
      environment: environmentOf(grouped),
    })
  }

  for (const factor of sample(seed, universe.secondFactors, 1)) {
    const disabledAt = eventTime(seed, factor.created)
    const enabledAt = iso(
      Math.min(seed.now, Date.parse(disabledAt) + seed.rng.int(1, 40) * MINUTE),
    )
    for (const [event, created] of [
      ["second-factor.disabled", disabledAt],
      ["second-factor.enabled", enabledAt],
    ] as const) {
      insertEvent(seed, {
        event,
        resource: rowLinkage(factor),
        created,
        whodunnit: factor.refs.user ?? null,
        environment: null,
      })
    }
  }
}

const accountEvents: Generator = (universe) => {
  const { seed } = universe
  const account = universe.accounts.find((row) => row.id === MOCK_ACCOUNT.id)
  const resource: Linkage = { type: "accounts", id: MOCK_ACCOUNT.id }
  const admin = universe.admin ? rowLinkage(universe.admin) : null

  for (let index = 0; index < 2; index++) {
    const updatedAt = eventTime(seed, null)
    insertEvent(seed, {
      event: "account.updated",
      resource,
      created: updatedAt,
      whodunnit: admin,
      environment: null,
      metadata: account ? diffFor(seed, account, updatedAt) : {},
    })
  }

  const plan: (readonly [string, number])[] = [
    ["account.settings.updated", 2],
    ["account.billing.updated", 1],
    ["account.plan.updated", 1],
  ]
  for (const [event, count] of plan) {
    for (let index = 0; index < count; index++) {
      insertEvent(seed, {
        event,
        resource,
        created: eventTime(seed, null),
        whodunnit: admin,
        environment: null,
      })
    }
  }
}

const policyEvents: Generator = (universe) => {
  const { seed, policies } = universe
  for (const policy of sample(seed, policies, 3)) {
    insertEvent(seed, {
      event: "policy.entitlements.attached",
      resource: rowLinkage(policy),
      created: eventTime(seed, policy.created),
      whodunnit: portalActor(universe),
      environment: environmentOf(policy),
      metadata: { codes: policyCodes(universe, policy) },
    })
  }
  for (const policy of sample(seed, policies, 2)) {
    insertEvent(seed, {
      event: "policy.entitlements.detached",
      resource: rowLinkage(policy),
      created: eventTime(seed, policy.created),
      whodunnit: portalActor(universe),
      environment: environmentOf(policy),
      metadata: { codes: policyCodes(universe, policy) },
    })
  }
}

const danglingEvents: Generator = (universe) => {
  const { seed } = universe
  const plan: (readonly [string, string, "portal" | "none"])[] = [
    ["license.deleted", "licenses", "portal"],
    ["machine.deleted", "machines", "none"],
    ["user.deleted", "users", "portal"],
    ["token.revoked", "tokens", "portal"],
    ["key.created", "keys", "portal"],
  ]
  for (const [event, type, actorKind] of plan) {
    const created = eventTime(seed, null)
    const resourceCreated = Date.parse(created) - seed.rng.int(1, 40) * DAY
    insertEvent(seed, {
      event,
      resource: { type, id: seed.rng.uuid(resourceCreated) },
      created,
      whodunnit: actorKind === "portal" ? portalActor(universe) : null,
      environment: null,
    })
  }
}

const GENERATORS: readonly Generator[] = [
  createdEvents,
  updatedEvents,
  validationEvents,
  licenseLifecycleEvents,
  machineEvents,
  processEvents,
  releaseEvents,
  artifactEvents,
  tokenEvents,
  userEvents,
  accountEvents,
  policyEvents,
  danglingEvents,
]

function withoutQuietest(rows: MockRow[], keep: string): MockRow[] {
  const quiet = [...rows]
    .filter((row) => row.id !== keep)
    .sort((a, b) => Date.parse(a.created) - Date.parse(b.created))
    .at(0)
  return quiet ? rows.filter((row) => row.id !== quiet.id) : rows
}

export function seedMockEventLogs(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const users = seed.rows("users")
  const universe: Universe = {
    seed,
    admin: users.find((row) => row.id === MOCK_ADMIN.id),
    team: users.filter(
      (row) => row.attributes.role !== "user" && row.id !== MOCK_ADMIN.id,
    ),
    users,
    licenses: withoutQuietest(seed.rows("licenses"), MOCK_HERO_LICENSE.id),
    machines: withoutQuietest(seed.rows("machines"), ""),
    products: seed.rows("products"),
    policies: seed.rows("policies"),
    entitlements: seed.rows("entitlements"),
    tokens: seed.rows("tokens"),
    releases: seed.rows("releases"),
    artifacts: seed.rows("artifacts"),
    packages: seed.rows("packages"),
    components: seed.rows("components"),
    processes: seed.rows("processes"),
    groups: seed.rows("groups"),
    environments: seed.rows("environments"),
    secondFactors: seed.rows("second-factors"),
    accounts: seed.rows("accounts"),
    licenseEntitlements: seed.rows("license-entitlements"),
    policyEntitlements: seed.rows("policy-entitlements"),
  }

  for (const generator of GENERATORS) generator(universe)
}
