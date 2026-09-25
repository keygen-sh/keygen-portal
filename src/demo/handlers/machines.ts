import {
  MOCK_ACCOUNT,
  accountRelationship,
  accountRows,
  assertWritable,
  badRequest,
  baseError,
  baseRefs,
  bodyAttributes,
  bodyMeta,
  bodyRelationship,
  camelize,
  type MockContext,
  destroyMock,
  destroyMockWhere,
  diffMetadata,
  emitMockEvent,
  environmentRelationship,
  errors,
  fail,
  hasMockSerializer,
  inAccount,
  inScope,
  iso,
  isRecord,
  isUuid,
  type Linkage,
  makeMockRow,
  millis,
  normalizeMetadata,
  notFound,
  nowIso,
  paginateMock,
  queryNested,
  type MockRefs,
  registerMockDestroyer,
  registerMockSerializer,
  rejectAttribute,
  rejectUnpermitted,
  relationshipError,
  type MockResource,
  resource,
  resourcePath,
  type MockResult,
  mockRoute,
  type MockRow,
  rowLinkage,
  scoped,
  SECOND,
  serializeMock,
  shift,
  mockStore,
  stringOrNull,
  toMany,
  toOne,
  typeMismatch,
  unprocessable,
  uuid,
  visible,
} from "@/demo/server"
import { entitlementsForLicense } from "@/demo/handlers/entitlements"
import {
  assertGroupCapacity,
  assertGroupCompatible,
  requestedGroup,
} from "@/demo/handlers/groups"

const TYPE = "machines"
const LABEL = "machine"
const FILE_TYPE = "machine-files"
const RESERVED_FINGERPRINTS = ["actions", "action"]
const MAX_FINGERPRINT_LENGTH = 4096
const MAX_STRING_LENGTH = 255
const MAX_CORES = 2_147_483_647
const METADATA_MAX_BYTES = 16384
const METADATA_MAX_DEPTH = 4
const METADATA_MAX_KEYS = 64
const DEFAULT_HEARTBEAT_DURATION = 600
const HEARTBEAT_DRIFT = 30 * SECOND
const DEFAULT_CHECKOUT_TTL = 2_629_746
const MIN_CHECKOUT_TTL = 3600
const CERTIFICATE_LINE_LENGTH = 60
const SIGNATURE_BYTES = 64
const IV_BYTES = 12
const TAG_BYTES = 16
const DEFAULT_SIGNING_ALGORITHM = "ed25519"
const ENCRYPTION_ALGORITHM = "aes-256-gcm"
const ENCODING_ALGORITHMS = ["base64", ENCRYPTION_ALGORITHM]
const SIGNING_ALGORITHMS = [
  DEFAULT_SIGNING_ALGORITHM,
  "rsa-pss-sha256",
  "rsa-sha256",
  "ecdsa-p256",
]
const LEGACY_USER_INCLUDE = "license.user"
const OWNER_INCLUDE = "license.owner"
const STRING_ATTRIBUTES = ["name", "ip", "hostname", "platform"]
const HARDWARE_ATTRIBUTES = ["cores", "memory", "disk"]
const PRIVILEGED_ATTRIBUTES = [...HARDWARE_ATTRIBUTES, "metadata"]
const CREATE_ATTRIBUTES = [
  "fingerprint",
  ...STRING_ATTRIBUTES,
  ...PRIVILEGED_ATTRIBUTES,
]
const UPDATE_ATTRIBUTES = [...STRING_ATTRIBUTES, ...PRIVILEGED_ATTRIBUTES]
const HARDWARE_ROLES = ["admin", "developer", "sales-agent"]
const HARDWARE_BEARER_TYPES = ["products", "environments"]
const ALWAYS_ALLOW_OVERAGE = "ALWAYS_ALLOW_OVERAGE"
const PER_USER_LEASING = "PER_USER"
const HEARTBEAT_FROM_CREATION = "FROM_CREATION"
const NO_REVIVE = "NO_REVIVE"
const ALWAYS_REVIVE = "ALWAYS_REVIVE"
const UNIQUE_PER_ACCOUNT = "UNIQUE_PER_ACCOUNT"
const UNIQUE_PER_POLICY = "UNIQUE_PER_POLICY"
const UNIQUE_PER_LICENSE = "UNIQUE_PER_LICENSE"

const HeartbeatStatus = {
  NotStarted: "NOT_STARTED",
  Alive: "ALIVE",
  Dead: "DEAD",
  Resurrected: "RESURRECTED",
} as const

type HeartbeatStatus = (typeof HeartbeatStatus)[keyof typeof HeartbeatStatus]

const OVERAGE_MULTIPLIERS: Readonly<Record<string, number>> = {
  ALLOW_1_25X_OVERAGE: 1.25,
  ALLOW_1_5X_OVERAGE: 1.5,
  ALLOW_2X_OVERAGE: 2,
}

const LAZARUS_TTL_SECONDS: Readonly<Record<string, number>> = {
  "1_MINUTE_REVIVE": 60,
  "2_MINUTE_REVIVE": 120,
  "5_MINUTE_REVIVE": 300,
  "10_MINUTE_REVIVE": 600,
  "15_MINUTE_REVIVE": 900,
}

const FINGERPRINT_TAKEN_DETAILS: Readonly<Record<string, string>> = {
  UNIQUE_PER_ACCOUNT: "has already been taken for this account",
  UNIQUE_PER_PRODUCT: "has already been taken for this product",
  UNIQUE_PER_POLICY: "has already been taken for this policy",
  UNIQUE_PER_LICENSE: "has already been taken",
}

const SCHEME_SIGNING_ALGORITHMS: Readonly<Record<string, string>> = {
  RSA_2048_PKCS1_PSS_SIGN_V2: "rsa-pss-sha256",
  RSA_2048_PKCS1_PSS_SIGN: "rsa-pss-sha256",
  RSA_2048_PKCS1_SIGN_V2: "rsa-sha256",
  RSA_2048_PKCS1_SIGN: "rsa-sha256",
  RSA_2048_PKCS1_ENCRYPT: "rsa-sha256",
  RSA_2048_JWT_RS256: "rsa-sha256",
  ED25519_SIGN: "ed25519",
  ECDSA_P256_SIGN: "ecdsa-p256",
}

interface HardwareLimit {
  attribute: string
  limit: string
  code: string
  label: string
}

const HARDWARE_LIMITS: readonly HardwareLimit[] = [
  {
    attribute: "cores",
    limit: "maxCores",
    code: "MACHINE_CORE_LIMIT_EXCEEDED",
    label: "machine core count",
  },
  {
    attribute: "memory",
    limit: "maxMemory",
    code: "MACHINE_MEMORY_LIMIT_EXCEEDED",
    label: "machine memory",
  },
  {
    attribute: "disk",
    limit: "maxDisk",
    code: "MACHINE_DISK_LIMIT_EXCEEDED",
    label: "machine disk",
  },
]

interface Heartbeat {
  duration: number
  required: boolean
  last: string | null
  next: string | null
  status: HeartbeatStatus
}

interface CheckoutOptions {
  algorithm: string
  encrypted: boolean
  includes: string[]
  ttl: number | null
}

type IncludeResolver = (
  machine: MockRow,
  license: MockRow | undefined,
) => MockRow[]

const machines = () => mockStore.table(TYPE)
const licenses = () => mockStore.table("licenses")
const users = () => mockStore.table("users")
const groups = () => mockStore.table("groups")
const licenseUsers = () => mockStore.table("license-users")
const components = () => mockStore.table("components")

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" ? value : null
}

function refRow(linkage: Linkage | null | undefined): MockRow | undefined {
  return linkage ? mockStore.table(linkage.type).get(linkage.id) : undefined
}

function rowsOf(row: MockRow | undefined): MockRow[] {
  return row ? [row] : []
}

function licenseOf(row: MockRow): MockRow | undefined {
  return refRow(row.refs.license)
}

function policyOf(license: MockRow | undefined): MockRow | undefined {
  return refRow(license?.refs.policy)
}

function effectiveLimit(
  license: MockRow,
  policy: MockRow | undefined,
  key: string,
): number | null {
  return (
    numberOrNull(license.attributes[key]) ??
    numberOrNull(policy?.attributes[key])
  )
}

function licenseUserIds(license: MockRow): Set<string> {
  const ids = new Set(
    licenseUsers()
      .where((join) => join.refs.license?.id === license.id)
      .map((join) => join.refs.user?.id ?? "")
      .filter((id) => id !== ""),
  )
  const ownerId = license.refs.owner?.id
  if (ownerId) ids.add(ownerId)
  return ids
}

function componentsOf(machineId: string): MockRow[] {
  return components().where((row) => row.refs.machine?.id === machineId)
}

function heartbeatOf(
  row: MockRow,
  policy: MockRow | undefined,
  at: number = Date.now(),
): Heartbeat {
  const duration =
    numberOrNull(policy?.attributes.heartbeatDuration) ??
    DEFAULT_HEARTBEAT_DURATION
  const last = stringOrNull(row.attributes.lastHeartbeat)
  const required = policy?.attributes.requireHeartbeat === true || last != null
  const next = last ? shift(last, duration * SECOND) : null
  const nextMillis = millis(next)
  const createdMillis = millis(row.created) ?? at

  let status: HeartbeatStatus = HeartbeatStatus.Dead
  if (nextMillis == null) {
    if (!required || createdMillis >= at - duration * SECOND) {
      status = HeartbeatStatus.NotStarted
    }
  } else if (nextMillis >= at) {
    status = HeartbeatStatus.Alive
  }

  return { duration, required, last, next, status }
}

function resurrectable(
  heartbeat: Heartbeat,
  policy: MockRow | undefined,
  at: number,
): boolean {
  const strategy = stringOrNull(
    policy?.attributes.heartbeatResurrectionStrategy,
  )
  if (strategy == null || strategy === NO_REVIVE) return false
  if (strategy === ALWAYS_REVIVE) return true

  const next = millis(heartbeat.next)
  if (next == null || !heartbeat.required) return false

  const lazarus =
    strategy in LAZARUS_TTL_SECONDS ? LAZARUS_TTL_SECONDS[strategy] : 0
  return at <= next + lazarus * SECOND
}

function machineResource(
  ctx: MockContext,
  row: MockRow,
  status?: HeartbeatStatus,
): MockResource {
  const self = resourcePath(ctx, TYPE, row.id)
  const license = licenseOf(row)
  const policy = policyOf(license)
  const heartbeat = heartbeatOf(row, policy)
  const productId = policy?.refs.product?.id

  return resource(
    ctx,
    row,
    {
      fingerprint: row.attributes.fingerprint,
      cores: row.attributes.cores ?? null,
      memory: row.attributes.memory ?? null,
      disk: row.attributes.disk ?? null,
      ip: row.attributes.ip ?? null,
      hostname: row.attributes.hostname ?? null,
      platform: row.attributes.platform ?? null,
      name: row.attributes.name ?? null,
      requireHeartbeat: heartbeat.required,
      heartbeatStatus: status ?? heartbeat.status,
      heartbeatDuration: heartbeat.duration,
      maxProcesses: license
        ? effectiveLimit(license, policy, "maxProcesses")
        : null,
      lastCheckOut: row.attributes.lastCheckOut ?? null,
      lastHeartbeat: heartbeat.last,
      nextHeartbeat: heartbeat.next,
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      product: toOne(
        ctx,
        productId ? { type: "products", id: productId } : null,
        `${self}/product`,
      ),
      group: toOne(ctx, row.refs.group, `${self}/group`),
      license: toOne(ctx, row.refs.license, `${self}/license`),
      owner: toOne(ctx, row.refs.owner, `${self}/owner`),
      components: toMany(`${self}/components`),
      processes: toMany(`${self}/processes`),
    },
  )
}

export function serializeMockMachine(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return machineResource(ctx, row)
}

registerMockSerializer(TYPE, serializeMockMachine)

registerMockDestroyer(TYPE, (ctx, row) => {
  destroyMockWhere(
    ctx,
    "components",
    (component) => component.refs.machine?.id === row.id,
  )
  destroyMockWhere(
    ctx,
    "processes",
    (process) => process.refs.machine?.id === row.id,
  )

  machines().delete(row.id)
  emitMockEvent(ctx, "machine.deleted", { resource: row })
})

function settleHeartbeats(ctx: MockContext): void {
  const at = Date.now()

  for (const row of accountRows(ctx, machines().all())) {
    if (row.attributes.lastDeathEventSentAt != null) continue

    const heartbeat = heartbeatOf(row, policyOf(licenseOf(row)), at)
    if (heartbeat.status !== HeartbeatStatus.Dead || heartbeat.next == null) {
      continue
    }

    const diedAt = Math.min(
      (millis(heartbeat.next) ?? at) + HEARTBEAT_DRIFT,
      at,
    )
    machines().patch(
      row.id,
      { attributes: { lastDeathEventSentAt: iso(at) } },
      { touch: false },
    )
    emitMockEvent(null, "machine.heartbeat.dead", {
      resource: row,
      created: iso(diedAt),
    })
  }
}

function findMachine(ctx: MockContext, identifier: string): MockRow {
  if (isUuid(identifier)) {
    const byId = visible(ctx, machines(), identifier)
    if (byId) return byId
  }

  const byFingerprint = scoped(ctx, machines().all()).find(
    (row) => row.attributes.fingerprint === identifier,
  )
  if (!byFingerprint) fail(notFound(LABEL, identifier))
  return byFingerprint
}

function canUpdateHardware(ctx: MockContext): boolean {
  const subject = ctx.bearer?.subject
  if (!subject) return false
  if (HARDWARE_BEARER_TYPES.includes(subject.type)) return true
  return (
    subject.type === "users" &&
    HARDWARE_ROLES.includes(String(subject.attributes.role))
  )
}

function validateString(key: string, value: unknown): string | null {
  const pointer = `/data/attributes/${key}`

  if (value === null) return null
  if (typeof value !== "string") fail(typeMismatch(pointer, value, "string"))
  if (value.length > MAX_STRING_LENGTH) {
    rejectAttribute(
      key,
      "TOO_LONG",
      `is too long (maximum is ${MAX_STRING_LENGTH} characters)`,
    )
  }

  return value
}

function validateInteger(key: string, value: unknown): number | null {
  const pointer = `/data/attributes/${key}`

  if (value === null) return null
  if (typeof value !== "number" || !Number.isInteger(value)) {
    fail(typeMismatch(pointer, value, "integer"))
  }
  if (value < 1) {
    rejectAttribute(key, "INVALID", "must be greater than or equal to 1")
  }
  if (key === "cores" && value > MAX_CORES) {
    rejectAttribute(
      key,
      "INVALID",
      `must be less than or equal to ${MAX_CORES}`,
    )
  }

  return value
}

function stringChanges(
  attributes: Record<string, unknown>,
): Record<string, string | null> {
  const changes: Record<string, string | null> = {}
  for (const key of STRING_ATTRIBUTES) {
    if (key in attributes) changes[key] = validateString(key, attributes[key])
  }
  return changes
}

function hardwareChanges(
  attributes: Record<string, unknown>,
): Record<string, number | null> {
  const changes: Record<string, number | null> = {}
  for (const key of HARDWARE_ATTRIBUTES) {
    if (key in attributes) changes[key] = validateInteger(key, attributes[key])
  }
  return changes
}

function jsonChildren(value: unknown): unknown[] {
  if (Array.isArray(value)) return value as unknown[]
  if (isRecord(value)) return Object.values(value)
  return []
}

function jsonDepth(value: unknown): number {
  if (!Array.isArray(value) && !isRecord(value)) return 0
  return 1 + Math.max(0, ...jsonChildren(value).map(jsonDepth))
}

function jsonKeyCount(value: unknown): number {
  const own = isRecord(value) ? Object.keys(value).length : 0
  return jsonChildren(value).reduce<number>(
    (sum, child) => sum + jsonKeyCount(child),
    own,
  )
}

function validateMetadata(metadata: unknown): Record<string, unknown> {
  const pointer = "/data/attributes/metadata"

  if (metadata === undefined || metadata === null) return {}
  if (!isRecord(metadata)) fail(typeMismatch(pointer, metadata, "hash"))

  const byteSize = new TextEncoder().encode(JSON.stringify(metadata)).length
  if (byteSize > METADATA_MAX_BYTES) {
    rejectAttribute(
      "metadata",
      "TOO_LONG",
      `too large (exceeded limit of ${METADATA_MAX_BYTES} bytes)`,
    )
  }
  if (jsonDepth(metadata) > METADATA_MAX_DEPTH) {
    rejectAttribute(
      "metadata",
      "TOO_LONG",
      `too many items (exceeded limit of ${METADATA_MAX_DEPTH} items)`,
    )
  }
  if (jsonKeyCount(metadata) > METADATA_MAX_KEYS) {
    rejectAttribute(
      "metadata",
      "TOO_LONG",
      `too many keys (exceeded limit of ${METADATA_MAX_KEYS} keys)`,
    )
  }

  return normalizeMetadata(metadata)
}

function uniquenessStrategy(policy: MockRow | undefined): string {
  const strategy = stringOrNull(policy?.attributes.machineUniquenessStrategy)
  return strategy != null && strategy in FINGERPRINT_TAKEN_DETAILS
    ? strategy
    : UNIQUE_PER_LICENSE
}

function sharesFingerprintScope(
  candidate: MockRow,
  strategy: string,
  policy: MockRow | undefined,
): boolean {
  if (strategy === UNIQUE_PER_ACCOUNT) return true
  if (strategy === UNIQUE_PER_LICENSE) return false

  const candidatePolicy = policyOf(licenseOf(candidate))
  if (!candidatePolicy || !policy) return false
  if (strategy === UNIQUE_PER_POLICY) return candidatePolicy.id === policy.id

  const productId = policy.refs.product?.id
  return productId != null && candidatePolicy.refs.product?.id === productId
}

function validateFingerprint(
  ctx: MockContext,
  value: unknown,
  license: MockRow,
  policy: MockRow | undefined,
): string {
  const pointer = "/data/attributes/fingerprint"

  if (value === undefined) fail(badRequest("is missing", { pointer }))
  if (value === null) fail(badRequest("cannot be null", { pointer }))
  if (typeof value !== "string") fail(typeMismatch(pointer, value, "string"))
  if (value.trim() === "") {
    rejectAttribute("fingerprint", "MISSING", "can't be blank")
  }
  if (RESERVED_FINGERPRINTS.includes(value.toLowerCase())) {
    rejectAttribute("fingerprint", "NOT_ALLOWED", "is reserved")
  }
  if (value.length > MAX_FINGERPRINT_LENGTH) {
    rejectAttribute(
      "fingerprint",
      "TOO_LONG",
      `is too long (maximum is ${MAX_FINGERPRINT_LENGTH} characters)`,
    )
  }

  const siblings = accountRows(ctx, machines().all())
  if (siblings.some((row) => row.id === value)) {
    rejectAttribute(
      "fingerprint",
      "CONFLICT",
      "must not conflict with another machine's identifier (UUID)",
    )
  }

  const matching = siblings.filter(
    (row) => row.attributes.fingerprint === value,
  )
  if (matching.some((row) => row.refs.license?.id === license.id)) {
    rejectAttribute(
      "fingerprint",
      "TAKEN",
      FINGERPRINT_TAKEN_DETAILS[UNIQUE_PER_LICENSE],
    )
  }

  const strategy = uniquenessStrategy(policy)
  if (matching.some((row) => sharesFingerprintScope(row, strategy, policy))) {
    rejectAttribute("fingerprint", "TAKEN", FINGERPRINT_TAKEN_DETAILS[strategy])
  }

  return value
}

function requireLicense(ctx: MockContext): MockRow {
  const { linkage } = bodyRelationship(ctx, "license")
  const license = linkage ? licenses().get(linkage.id) : undefined
  if (!license || !inScope(ctx, license)) {
    fail(unprocessable(relationshipError("license", "NOT_FOUND", "must exist")))
  }
  return license
}

function resolveOwner(
  ctx: MockContext,
  license: MockRow | undefined,
  id: string,
): MockRow {
  const owner = users().get(id)
  if (!owner || !inAccount(ctx, owner)) {
    fail(unprocessable(relationshipError("owner", "NOT_FOUND", "must exist")))
  }
  if (license && !licenseUserIds(license).has(owner.id)) {
    fail(
      unprocessable(
        relationshipError("owner", "INVALID", "must be a valid license user"),
      ),
    )
  }
  return owner
}

function requestedOwner(ctx: MockContext, license: MockRow): MockRow | null {
  const { linkage } = bodyRelationship(ctx, "owner")
  return linkage ? resolveOwner(ctx, license, linkage.id) : null
}

function requestedGroupRelationship(ctx: MockContext): MockRow | null {
  const { linkage } = bodyRelationship(ctx, "group")
  if (!linkage) return null

  const group = groups().get(linkage.id)
  if (!group || !inScope(ctx, group)) {
    fail(unprocessable(relationshipError("group", "NOT_FOUND", "must exist")))
  }
  return group
}

function requestedOwnerId(ctx: MockContext): string | null {
  const data = isRecord(ctx.body) ? ctx.body.data : undefined
  if (data === undefined) fail(badRequest("is missing", { pointer: "/data" }))
  if (data === null) return null

  const pointer = "/data/id"
  const id = isRecord(data) ? data.id : undefined
  if (id === undefined) fail(badRequest("is missing", { pointer }))
  if (!isUuid(id)) fail(typeMismatch(pointer, id, "uuid"))

  return id
}

function siblingMachines(
  licenseId: string,
  perUser: boolean,
  owner: Linkage | null,
  excludeId: string | null,
): MockRow[] {
  return machines().where(
    (row) =>
      row.refs.license?.id === licenseId &&
      row.id !== excludeId &&
      (!perUser || (row.refs.owner?.id ?? null) === (owner?.id ?? null)),
  )
}

function withinOverage(
  next: number,
  max: number,
  overage: string | null,
): boolean {
  if (next <= max) return true
  if (overage == null || !(overage in OVERAGE_MULTIPLIERS)) return false
  return next <= max * OVERAGE_MULTIPLIERS[overage]
}

function assertMachineLimit(
  license: MockRow,
  policy: MockRow | undefined,
  owner: Linkage | null,
): void {
  const overage = stringOrNull(policy?.attributes.overageStrategy)
  if (overage === ALWAYS_ALLOW_OVERAGE) return

  const max = effectiveLimit(license, policy, "maxMachines")
  if (max == null) return

  const perUser = policy?.attributes.machineLeasingStrategy === PER_USER_LEASING
  const count = siblingMachines(license.id, perUser, owner, null).length
  if (count === 0 || withinOverage(count + 1, max, overage)) return

  fail(
    unprocessable(
      baseError(
        "MACHINE_LIMIT_EXCEEDED",
        `machine count has exceeded maximum allowed for ${perUser ? "user" : "license"} (${max})`,
      ),
    ),
  )
}

function assertHardwareLimits(
  license: MockRow,
  policy: MockRow | undefined,
  attributes: Record<string, unknown>,
  owner: Linkage | null,
  excludeId: string | null,
): void {
  const overage = stringOrNull(policy?.attributes.overageStrategy)
  if (overage === ALWAYS_ALLOW_OVERAGE) return

  const perUser = policy?.attributes.machineLeasingStrategy === PER_USER_LEASING
  const siblings = siblingMachines(license.id, perUser, owner, excludeId)

  for (const rule of HARDWARE_LIMITS) {
    const max = effectiveLimit(license, policy, rule.limit)
    if (max == null) continue

    const total = siblings.reduce(
      (sum, row) => sum + (numberOrNull(row.attributes[rule.attribute]) ?? 0),
      numberOrNull(attributes[rule.attribute]) ?? 0,
    )
    if (withinOverage(total, max, overage)) continue

    fail(
      unprocessable(
        baseError(
          rule.code,
          `${rule.label} has exceeded maximum allowed for ${perUser ? "user" : "license"} (${max})`,
        ),
      ),
    )
  }
}

function statusMatches(
  row: MockRow,
  policy: MockRow | undefined,
  status: string,
  at: number,
): boolean {
  const current = heartbeatOf(row, policy, at).status
  if (status === HeartbeatStatus.Alive) return current !== HeartbeatStatus.Dead
  if (status === HeartbeatStatus.Dead) return current === HeartbeatStatus.Dead
  return false
}

function userMatches(id: string, term: string): boolean {
  return id === term || users().get(id)?.attributes.email === term
}

function castQueryValue(value: string): unknown {
  if (value === "true") return true
  if (value === "false") return false
  if (value === "null") return null
  if (/^\d+$/.test(value)) return Number.parseInt(value, 10)
  if (/^\d+\.\d+$/.test(value)) return Number.parseFloat(value)
  return value
}

function metadataMatches(
  metadata: unknown,
  key: string,
  value: string,
): boolean {
  if (!isRecord(metadata)) return false

  const name = camelize(key)
  if (!(name in metadata)) return false

  const stored = metadata[name]
  return stored === value || stored === castQueryValue(value)
}

function listPredicate(ctx: MockContext): (row: MockRow) => boolean {
  const query = ctx.query
  const status = query.get("status")?.toUpperCase() ?? ""
  const fingerprint = query.get("fingerprint") ?? ""
  const ip = query.get("ip") ?? ""
  const hostname = query.get("hostname") ?? ""
  const product = query.get("product") ?? ""
  const policy = query.get("policy") ?? ""
  const license = query.get("license") ?? ""
  const key = query.get("key") ?? ""
  const owner = query.get("owner") ?? ""
  const user = query.get("user") ?? ""
  const group = query.get("group") ?? ""
  const metadata = Object.entries(queryNested(query, "metadata"))
  const at = Date.now()

  return (row) => {
    const licenseRow = licenseOf(row)
    const policyRow = policyOf(licenseRow)

    if (fingerprint && row.attributes.fingerprint !== fingerprint) return false
    if (ip && row.attributes.ip !== ip) return false
    if (hostname && row.attributes.hostname !== hostname) return false
    if (license && row.refs.license?.id !== license) return false
    if (key && licenseRow?.attributes.key !== key) return false
    if (policy && licenseRow?.refs.policy?.id !== policy) return false
    if (product && policyRow?.refs.product?.id !== product) return false
    if (group && row.refs.group?.id !== group) return false
    if (owner) {
      const ownerId = row.refs.owner?.id
      if (!ownerId || !userMatches(ownerId, owner)) return false
    }
    if (user) {
      if (!licenseRow) return false
      const ids = [...licenseUserIds(licenseRow)]
      if (!ids.some((id) => userMatches(id, user))) return false
    }
    if (status && !statusMatches(row, policyRow, status, at)) return false

    return metadata.every(([name, value]) =>
      metadataMatches(row.attributes.metadata, name, value),
    )
  }
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : []
}

function checkoutError(
  parameter: string,
  code: string,
  detail: string,
): MockResult {
  return errors(400, {
    title: "Bad request",
    detail,
    code,
    source: { parameter },
  })
}

function defaultSigningAlgorithm(policy: MockRow | undefined): string {
  const scheme = stringOrNull(policy?.attributes.scheme)
  return scheme != null && scheme in SCHEME_SIGNING_ALGORITHMS
    ? SCHEME_SIGNING_ALGORITHMS[scheme]
    : DEFAULT_SIGNING_ALGORITHM
}

function requestedIncludes(
  ctx: MockContext,
  meta: Record<string, unknown>,
): string[] {
  const raw = [
    ...ctx.query.getAll("include"),
    ...ctx.query.getAll("include[]"),
    ...stringList(meta.include),
  ]
  const includes = raw
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "")
    .map((entry) => (entry === LEGACY_USER_INCLUDE ? OWNER_INCLUDE : entry))

  return [...new Set(includes)]
}

function requestedTtl(
  ctx: MockContext,
  meta: Record<string, unknown>,
): number | null {
  const raw = ctx.query.get("ttl")
  if (raw != null) {
    if (raw === "" || raw === "null") return null
    const parsed = Number(raw)
    if (!Number.isInteger(parsed)) {
      fail(
        badRequest("type mismatch (received string expected integer)", {
          parameter: "ttl",
        }),
      )
    }
    return parsed
  }

  if ("ttl" in meta) {
    const value = meta.ttl
    if (value === null) return null
    if (typeof value !== "number" || !Number.isInteger(value)) {
      fail(typeMismatch("/meta/ttl", value, "integer"))
    }
    return value
  }

  return DEFAULT_CHECKOUT_TTL
}

const INCLUDE_RESOLVERS: Readonly<Record<string, IncludeResolver>> = {
  license: (_, license) => rowsOf(license),
  "license.policy": (_, license) => rowsOf(policyOf(license)),
  "license.product": (_, license) =>
    rowsOf(refRow(policyOf(license)?.refs.product)),
  "license.owner": (_, license) => rowsOf(refRow(license?.refs.owner)),
  "license.users": (_, license) =>
    license
      ? [...licenseUserIds(license)].flatMap((id) => rowsOf(users().get(id)))
      : [],
  "license.entitlements": (_, license) =>
    license ? entitlementsForLicense(license) : [],
  components: (machine) => componentsOf(machine.id),
  environment: (machine) => rowsOf(refRow(machine.refs.environment)),
  group: (machine) => rowsOf(refRow(machine.refs.group)),
  owner: (machine) => rowsOf(refRow(machine.refs.owner)),
}

function checkoutOptions(
  ctx: MockContext,
  policy: MockRow | undefined,
): CheckoutOptions {
  const meta = bodyMeta(ctx)
  const encrypt = ctx.query.get("encrypt") === "true" || meta.encrypt === true
  const requested = ctx.query.get("algorithm") ?? stringOrNull(meta.algorithm)
  const algorithm =
    requested != null && requested !== ""
      ? requested
      : `${encrypt ? ENCRYPTION_ALGORITHM : "base64"}+${defaultSigningAlgorithm(policy)}`
  const [encoding, signing = ""] = algorithm.split("+", 2)

  if (!ENCODING_ALGORITHMS.includes(encoding)) {
    fail(
      checkoutError(
        "algorithm",
        "CHECKOUT_ALGORITHM_INVALID",
        "invalid encoding algorithm",
      ),
    )
  }
  if (!SIGNING_ALGORITHMS.includes(signing)) {
    fail(
      checkoutError(
        "algorithm",
        "CHECKOUT_ALGORITHM_INVALID",
        "invalid signing algorithm",
      ),
    )
  }

  const includes = requestedIncludes(ctx, meta)
  if (includes.some((include) => !(include in INCLUDE_RESOLVERS))) {
    fail(
      checkoutError("include", "CHECKOUT_INCLUDE_INVALID", "invalid includes"),
    )
  }

  const ttl = requestedTtl(ctx, meta)
  if (ttl != null && ttl < MIN_CHECKOUT_TTL) {
    fail(
      checkoutError(
        "ttl",
        "CHECKOUT_TTL_INVALID",
        `must be greater than or equal to ${MIN_CHECKOUT_TTL} (1 hour)`,
      ),
    )
  }

  return {
    algorithm,
    encrypted: encoding === ENCRYPTION_ALGORITHM,
    includes,
    ttl,
  }
}

function base64(text: string): string {
  let binary = ""
  for (const byte of new TextEncoder().encode(text)) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function randomBase64(length: number): string {
  const bytes = Array.from({ length }, () => Math.floor(Math.random() * 256))
  return btoa(String.fromCharCode(...bytes))
}

function includedResources(
  ctx: MockContext,
  row: MockRow,
  license: MockRow | undefined,
  includes: string[],
): MockResource[] {
  return includes
    .flatMap((include) => INCLUDE_RESOLVERS[include](row, license))
    .filter((included) => hasMockSerializer(included.type))
    .map((included) => serializeMock(ctx, included))
}

function certificateFor(
  ctx: MockContext,
  row: MockRow,
  license: MockRow | undefined,
  options: CheckoutOptions,
  issued: string,
  expiry: string | null,
): string {
  const document = {
    meta: { issued, expiry, ttl: options.ttl },
    data: serializeMockMachine(ctx, row),
    included: includedResources(ctx, row, license, options.includes),
  }
  const encoded = base64(JSON.stringify(document))
  const enc = options.encrypted
    ? [encoded, randomBase64(IV_BYTES), randomBase64(TAG_BYTES)].join(".")
    : encoded
  const payload = base64(
    JSON.stringify({
      enc,
      sig: randomBase64(SIGNATURE_BYTES),
      alg: options.algorithm,
    }),
  )
  const lines = payload.match(
    new RegExp(`.{1,${CERTIFICATE_LINE_LENGTH}}`, "g"),
  )
  const wrapped = lines?.join("\n") ?? payload

  return `-----BEGIN MACHINE FILE-----\n${wrapped}\n-----END MACHINE FILE-----\n`
}

function machineFile(
  ctx: MockContext,
  row: MockRow,
  options: CheckoutOptions,
  issued: string,
  expiry: string | null,
  certificate: string,
): MockResource {
  return {
    id: uuid(),
    type: FILE_TYPE,
    attributes: {
      certificate,
      algorithm: options.algorithm,
      includes: options.includes,
      ttl: options.ttl,
      expiry,
      issued,
    },
    relationships: {
      account: accountRelationship(ctx),
      environment: environmentRelationship(ctx, row.refs.environment),
      license: toOne(ctx, row.refs.license),
      machine: toOne(ctx, rowLinkage(row)),
    },
    links: {},
  }
}

mockRoute("GET", `${MOCK_ACCOUNT}/machines`, (ctx) => {
  settleHeartbeats(ctx)

  const rows = scoped(ctx, machines().all()).filter(listPredicate(ctx))
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockMachine(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/machines/:id`, (ctx) => {
  settleHeartbeats(ctx)

  const row = findMachine(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockMachine(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/machines`, (ctx) => {
  const attributes = bodyAttributes(ctx)
  rejectUnpermitted(attributes, CREATE_ATTRIBUTES)

  const license = requireLicense(ctx)
  const policy = policyOf(license)
  const fingerprint = validateFingerprint(
    ctx,
    attributes.fingerprint,
    license,
    policy,
  )
  const strings = stringChanges(attributes)
  const hardware = hardwareChanges(attributes)
  const metadata = validateMetadata(attributes.metadata)
  const owner = requestedOwner(ctx, license)
  const group =
    requestedGroupRelationship(ctx) ??
    refRow(license.refs.group) ??
    refRow(owner?.refs.group) ??
    null
  const ownerLinkage = owner ? rowLinkage(owner) : null

  assertMachineLimit(license, policy, ownerLinkage)
  assertHardwareLimits(license, policy, hardware, ownerLinkage, null)

  const now = nowIso()
  const row = makeMockRow(
    TYPE,
    uuid(),
    {
      fingerprint,
      name: null,
      ip: null,
      hostname: null,
      platform: null,
      cores: null,
      memory: null,
      disk: null,
      ...strings,
      ...hardware,
      lastHeartbeat:
        policy?.attributes.heartbeatBasis === HEARTBEAT_FROM_CREATION
          ? now
          : null,
      lastCheckOut: null,
      lastDeathEventSentAt: null,
      metadata,
    },
    {
      ...baseRefs(ctx),
      environment: license.refs.environment ?? null,
      license: rowLinkage(license),
      owner: ownerLinkage,
      group: group ? rowLinkage(group) : null,
    },
    now,
  )

  if (group) {
    assertGroupCompatible(row, group)
    assertGroupCapacity(group, "machines")
  }

  machines().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "machine.created", { resource: row })

  return {
    status: 201,
    body: { data: serializeMockMachine(ctx, row) },
    headers: { Location: resourcePath(ctx, TYPE, row.id) },
  }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/machines/:id`, (ctx) => {
  const row = findMachine(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = bodyAttributes(ctx)
  rejectUnpermitted(
    attributes,
    canUpdateHardware(ctx) ? UPDATE_ATTRIBUTES : STRING_ATTRIBUTES,
  )

  const changes: Record<string, unknown> = {
    ...stringChanges(attributes),
    ...hardwareChanges(attributes),
  }
  if ("metadata" in attributes) {
    changes.metadata = validateMetadata(attributes.metadata)
  }

  const license = licenseOf(row)
  if (license) {
    assertHardwareLimits(
      license,
      policyOf(license),
      { ...row.attributes, ...changes },
      row.refs.owner,
      row.id,
    )
  }

  const before = { ...row.attributes }
  const changed = Object.keys(changes).some(
    (key) => JSON.stringify(changes[key]) !== JSON.stringify(before[key]),
  )
  machines().patch(row.id, { attributes: changes }, { touch: changed })

  emitMockEvent(ctx, "machine.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockMachine(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/machines/:id`, (ctx) => {
  const row = findMachine(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

mockRoute("PUT", `${MOCK_ACCOUNT}/machines/:id/owner`, (ctx) => {
  const row = findMachine(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const ownerId = requestedOwnerId(ctx)
  const owner =
    ownerId == null ? null : resolveOwner(ctx, licenseOf(row), ownerId)
  const changed = (row.refs.owner?.id ?? null) !== ownerId
  const refs: MockRefs = { owner: owner ? rowLinkage(owner) : null }

  if (changed && owner && row.refs.group == null) {
    const group = refRow(owner.refs.group)
    if (group) {
      assertGroupCapacity(group, "machines")
      refs.group = rowLinkage(group)
    }
  }

  machines().patch(row.id, { refs }, { touch: changed })

  emitMockEvent(ctx, "machine.owner.updated", { resource: row })

  return { status: 200, body: { data: serializeMockMachine(ctx, row) } }
})

mockRoute("PUT", `${MOCK_ACCOUNT}/machines/:id/group`, (ctx) => {
  const row = findMachine(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const group = requestedGroup(ctx)
  const changed = (row.refs.group?.id ?? null) !== (group?.id ?? null)

  if (changed && group) {
    assertGroupCompatible(row, group)
    assertGroupCapacity(group, "machines")
  }

  machines().patch(
    row.id,
    { refs: { group: group ? rowLinkage(group) : null } },
    { touch: changed },
  )

  emitMockEvent(ctx, "machine.group.updated", { resource: row })

  return { status: 200, body: { data: serializeMockMachine(ctx, row) } }
})

function ping(ctx: MockContext): MockResult {
  const row = findMachine(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }
  settleHeartbeats(ctx)

  const at = Date.now()
  const policy = policyOf(licenseOf(row))
  const heartbeat = heartbeatOf(row, policy, at)

  if (heartbeat.status === HeartbeatStatus.Dead) {
    if (!resurrectable(heartbeat, policy, at)) {
      fail(
        errors(422, {
          title: "Unprocessable resource",
          detail: "is dead",
          code: "MACHINE_HEARTBEAT_DEAD",
        }),
      )
    }

    machines().patch(row.id, {
      attributes: { lastHeartbeat: iso(at), lastDeathEventSentAt: null },
    })
    emitMockEvent(ctx, "machine.heartbeat.resurrected", { resource: row })

    return {
      status: 200,
      body: { data: machineResource(ctx, row, HeartbeatStatus.Resurrected) },
    }
  }

  machines().patch(row.id, { attributes: { lastHeartbeat: iso(at) } })
  emitMockEvent(ctx, "machine.heartbeat.ping", { resource: row })
  if (heartbeat.last != null) {
    emitMockEvent(ctx, "machine.heartbeat.pong", { resource: row })
  }

  return { status: 200, body: { data: serializeMockMachine(ctx, row) } }
}

function resetMock(ctx: MockContext): MockResult {
  const row = findMachine(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  machines().patch(row.id, { attributes: { lastHeartbeat: null } })
  emitMockEvent(ctx, "machine.heartbeat.reset", { resource: row })

  return { status: 200, body: { data: serializeMockMachine(ctx, row) } }
}

function checkOut(ctx: MockContext): MockResult {
  const row = findMachine(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }

  const license = licenseOf(row)
  const options = checkoutOptions(ctx, policyOf(license))
  const issued = nowIso()
  const expiry =
    options.ttl == null ? null : shift(issued, options.ttl * SECOND)
  const certificate = certificateFor(ctx, row, license, options, issued, expiry)

  machines().patch(row.id, { attributes: { lastCheckOut: issued } })
  emitMockEvent(ctx, "machine.checked-out", { resource: row })

  return {
    status: 200,
    body: { data: machineFile(ctx, row, options, issued, expiry, certificate) },
  }
}

mockRoute("POST", `${MOCK_ACCOUNT}/machines/:id/actions/ping`, ping)
mockRoute("POST", `${MOCK_ACCOUNT}/machines/:id/actions/ping-heartbeat`, ping)
mockRoute("POST", `${MOCK_ACCOUNT}/machines/:id/actions/reset`, resetMock)
mockRoute(
  "POST",
  `${MOCK_ACCOUNT}/machines/:id/actions/reset-heartbeat`,
  resetMock,
)
mockRoute("POST", `${MOCK_ACCOUNT}/machines/:id/actions/check-out`, checkOut)
