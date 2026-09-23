import {
  MOCK_ACCOUNT,
  accountPath,
  accountRelationship,
  accountRows,
  type MockApiError,
  assertWritable,
  attributeError,
  badRequest,
  baseRefs,
  bodyAttributes,
  bodyDataList,
  bodyMeta,
  bodyRelationship,
  camelize,
  CheckInIntervalMillis,
  type MockContext,
  dateOnly,
  DAY,
  destroyMock,
  destroyMockWhere,
  diffMetadata,
  emitMockEvent,
  endOfDay,
  environmentRelationship,
  errors,
  fail,
  inAccount,
  iso,
  isRecord,
  isUuid,
  type Linkage,
  linkageOf,
  makeMockRow,
  millis,
  normalizeMetadata,
  notFound,
  nowIso,
  paginateMock,
  parseDuration,
  queryList,
  queryNested,
  randomHex,
  randomLicenseKey,
  registerMockDestroyer,
  registerMockSerializer,
  rejectUnpermitted,
  relationshipError,
  requireVisible,
  type MockResource,
  resource,
  type MockResult,
  mockRoute,
  type MockRow,
  scoped,
  serializeMock,
  shift,
  startOfDay,
  mockStore,
  stringOrNull,
  toMany,
  toOne,
  typeMismatch,
  unprocessable,
  uuid,
  visible,
} from "@/demo/server"
import { LicensePermissions, LicenseStatus } from "@/types/licenses"
import { entitlementsForLicense } from "./entitlements"

const TYPE = "licenses"
const LABEL = "license"
const FILE_TYPE = "license-files"
const USER_JOIN_TYPE = "license-users"
const WILDCARD = "*"
const RESERVED_KEYS = ["actions", "action"]
const MIN_KEY_LENGTH = 6
const MAX_KEY_LENGTH = 16384
const MAX_NAME_LENGTH = 1024
const MAX_METADATA_KEYS = 64
const MAX_INTEGER = 2147483647
const MAX_BIGINT = Number.MAX_SAFE_INTEGER
const MAX_JOIN_ITEMS = 100
const EXPIRING_WINDOW = 3 * DAY
const ACTIVITY_WINDOW = 90 * DAY
const DEFAULT_CHECKOUT_TTL = 2592000
const MIN_CHECKOUT_TTL = 3600
const CERTIFICATE_LINE_LENGTH = 60
const DEFAULT_ALGORITHM = "base64+ed25519"
const ENCRYPTION_ALGORITHM = "aes-256-gcm"
const ENCODING_ALGORITHMS = ["base64", ENCRYPTION_ALGORITHM]
const SIGNING_ALGORITHMS = [
  "ed25519",
  "ecdsa-p256",
  "rsa-pss-sha256",
  "rsa-sha256",
]
const CHECKOUT_INCLUDES = [
  "entitlements",
  "environment",
  "product",
  "policy",
  "group",
  "owner",
  "users",
]
const MINUTE_PRECISION_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const INTEGER_PATTERN = /^\d+$/
const ALWAYS_ALLOW_OVERAGE = "ALWAYS_ALLOW_OVERAGE"
const REVOKE_ACCESS = "REVOKE_ACCESS"
const EXPIRED_ACCESS_STRATEGIES = ["ALLOW_ACCESS", "MAINTAIN_ACCESS"]
const FROM_CREATION = "FROM_CREATION"
const FROM_FIRST_VALIDATION = "FROM_FIRST_VALIDATION"
const RESET_EXPIRY = "RESET_EXPIRY"
const PER_MACHINE = "PER_MACHINE"
const ACTIVITY_ATTRIBUTES = ["lastValidated", "lastCheckOut", "lastCheckIn"]
const LIMIT_ATTRIBUTES = [
  "maxMachines",
  "maxProcesses",
  "maxUsers",
  "maxCores",
  "maxMemory",
  "maxDisk",
  "maxUses",
] as const
const BYTE_LIMIT_ATTRIBUTES: readonly string[] = ["maxMemory", "maxDisk"]
const PERMITTED_ATTRIBUTES: readonly string[] = [
  "name",
  "key",
  "expiry",
  "suspended",
  "protected",
  "permissions",
  "metadata",
  ...LIMIT_ATTRIBUTES,
]
const CREATE_ONLY_ATTRIBUTES: readonly string[] = ["key"]
const LICENSE_PERMISSIONS = new Set<string>(LicensePermissions)

type LimitAttribute = (typeof LIMIT_ATTRIBUTES)[number]
type Predicate = (row: MockRow) => boolean
type Verdict = readonly [valid: boolean, detail: string, code: string]

const LimitMinimums: Readonly<Record<LimitAttribute, number>> = {
  maxMachines: 0,
  maxProcesses: 0,
  maxUsers: 0,
  maxCores: 1,
  maxMemory: 1,
  maxDisk: 1,
  maxUses: 0,
}

const OverageMultipliers: Readonly<Record<string, number>> = {
  ALLOW_1_25X_OVERAGE: 1.25,
  ALLOW_1_5X_OVERAGE: 1.5,
  ALLOW_2X_OVERAGE: 2,
}

const MachineUniquenessRanks: Readonly<Record<string, number>> = {
  UNIQUE_PER_LICENSE: 0,
  UNIQUE_PER_POLICY: 1,
  UNIQUE_PER_PRODUCT: 2,
  UNIQUE_PER_ACCOUNT: 3,
}

const ComponentUniquenessRanks: Readonly<Record<string, number>> = {
  UNIQUE_PER_MACHINE: 0,
  UNIQUE_PER_LICENSE: 1,
  UNIQUE_PER_POLICY: 2,
  UNIQUE_PER_PRODUCT: 3,
  UNIQUE_PER_ACCOUNT: 4,
}

const RequiredScopes: readonly (readonly [string, string, string])[] = [
  ["requireEnvironmentScope", "environment", "ENVIRONMENT_SCOPE_REQUIRED"],
  ["requireProductScope", "product", "PRODUCT_SCOPE_REQUIRED"],
  ["requirePolicyScope", "policy", "POLICY_SCOPE_REQUIRED"],
  ["requireUserScope", "user", "USER_SCOPE_REQUIRED"],
  ["requireMachineScope", "machine", "MACHINE_SCOPE_REQUIRED"],
  ["requireFingerprintScope", "fingerprint", "FINGERPRINT_SCOPE_REQUIRED"],
  ["requireComponentsScope", "components", "COMPONENTS_SCOPE_REQUIRED"],
  ["requireChecksumScope", "checksum", "CHECKSUM_SCOPE_REQUIRED"],
  ["requireVersionScope", "version", "VERSION_SCOPE_REQUIRED"],
]

const licenses = () => mockStore.table(TYPE)
const policies = () => mockStore.table("policies")
const users = () => mockStore.table("users")
const groups = () => mockStore.table("groups")
const machines = () => mockStore.table("machines")
const processes = () => mockStore.table("processes")
const licenseUsers = () => mockStore.table(USER_JOIN_TYPE)
const licenseEntitlements = () => mockStore.table("license-entitlements")

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  const entries: unknown[] = value
  if (!entries.every((entry): entry is string => typeof entry === "string")) {
    return null
  }
  return entries
}

function unprocessableEntity(detail: string, pointer?: string): MockResult {
  return errors(422, {
    title: "Unprocessable entity",
    detail,
    ...(pointer ? { source: { pointer } } : {}),
  })
}

function policyOf(row: MockRow): MockRow | null {
  const policyId = row.refs.policy?.id
  return policyId ? (policies().get(policyId) ?? null) : null
}

function ownerOf(row: MockRow): MockRow | null {
  const ownerId = row.refs.owner?.id
  return ownerId ? (users().get(ownerId) ?? null) : null
}

function licenseeJoins(licenseId: string): MockRow[] {
  return licenseUsers().where((join) => join.refs.license?.id === licenseId)
}

function licenseeIds(licenseId: string): string[] {
  return licenseeJoins(licenseId)
    .map((join) => join.refs.user?.id ?? "")
    .filter((id) => id !== "")
}

function usersOf(row: MockRow): MockRow[] {
  const ids = new Set(licenseeIds(row.id))
  const ownerId = row.refs.owner?.id
  if (ownerId) ids.add(ownerId)
  return [...ids]
    .map((id) => users().get(id))
    .filter((user): user is MockRow => user != null)
}

function usersCount(row: MockRow): number {
  return licenseeIds(row.id).length + (row.refs.owner ? 1 : 0)
}

function machinesOf(licenseId: string): MockRow[] {
  return machines().where((machine) => machine.refs.license?.id === licenseId)
}

function processesOf(machineIds: Set<string>): MockRow[] {
  return processes().where((process) =>
    machineIds.has(process.refs.machine?.id ?? ""),
  )
}

function countPerMachine(leased: MockRow[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const process of leased) {
    const machineId = process.refs.machine?.id ?? ""
    counts.set(machineId, (counts.get(machineId) ?? 0) + 1)
  }
  return counts
}

function sumAttribute(rows: MockRow[], attribute: string): number {
  return rows.reduce(
    (total, row) => total + (numberOrNull(row.attributes[attribute]) ?? 0),
    0,
  )
}

function machinesMeta(activations: MockRow[]): Record<string, number> {
  return {
    count: activations.length,
    cores: sumAttribute(activations, "cores"),
    memory: sumAttribute(activations, "memory"),
    disk: sumAttribute(activations, "disk"),
  }
}

function effectiveLimit(
  row: MockRow,
  policy: MockRow | null,
  attribute: LimitAttribute,
): number | null {
  return (
    numberOrNull(row.attributes[attribute]) ??
    (policy ? numberOrNull(policy.attributes[attribute]) : null)
  )
}

function isProtected(row: MockRow, policy: MockRow | null): boolean {
  if (typeof row.attributes.protected === "boolean") {
    return row.attributes.protected
  }
  return policy?.attributes.protected === true
}

function requiresCheckIn(policy: MockRow | null): boolean {
  return policy?.attributes.requireCheckIn === true
}

function checkInIntervalMillis(policy: MockRow): number | null {
  const interval = stringOrNull(policy.attributes.checkInInterval)
  const count = numberOrNull(policy.attributes.checkInIntervalCount)
  if (!interval || !count || !(interval in CheckInIntervalMillis)) return null
  return count * CheckInIntervalMillis[interval]
}

function nextCheckInAt(row: MockRow, policy: MockRow | null): string | null {
  if (!policy || !requiresCheckIn(policy)) return null
  const lastCheckIn = millis(stringOrNull(row.attributes.lastCheckIn))
  const interval = checkInIntervalMillis(policy)
  if (lastCheckIn == null || interval == null) return null
  return iso(lastCheckIn + interval)
}

function isCheckInOverdue(
  row: MockRow,
  policy: MockRow | null,
  at: number,
): boolean {
  const next = millis(nextCheckInAt(row, policy))
  return next != null && next < at
}

function isBanned(row: MockRow): boolean {
  const owner = ownerOf(row)
  return owner != null && owner.attributes.bannedAt != null
}

function expiryOf(row: MockRow): number | null {
  return millis(stringOrNull(row.attributes.expiry))
}

function isExpired(row: MockRow, at: number): boolean {
  const expiry = expiryOf(row)
  return expiry != null && expiry < at
}

function hasActivitySince(row: MockRow, threshold: number): boolean {
  if (Date.parse(row.created) >= threshold) return true
  return ACTIVITY_ATTRIBUTES.some((attribute) => {
    const at = millis(stringOrNull(row.attributes[attribute]))
    return at != null && at >= threshold
  })
}

function isActiveSince(row: MockRow, threshold: number): boolean {
  return !isBanned(row) && hasActivitySince(row, threshold)
}

function isInactiveSince(row: MockRow, threshold: number): boolean {
  return !isBanned(row) && !hasActivitySince(row, threshold)
}

export function licenseStatus(
  row: MockRow,
  at: number = Date.now(),
): LicenseStatus {
  if (isBanned(row)) return LicenseStatus.Banned
  if (row.attributes.suspended === true) return LicenseStatus.Suspended

  const expiry = expiryOf(row)
  if (expiry != null && expiry < at) return LicenseStatus.Expired
  if (expiry != null && expiry < at + EXPIRING_WINDOW) {
    return LicenseStatus.Expiring
  }

  return hasActivitySince(row, at - ACTIVITY_WINDOW)
    ? LicenseStatus.Active
    : LicenseStatus.Inactive
}

function hasStatus(row: MockRow, status: string, at: number): boolean {
  const derived: string = licenseStatus(row, at)
  return derived === status
}

function effectivePermissions(row: MockRow): string[] {
  const own = stringList(row.attributes.permissions) ?? [WILDCARD]
  return own.includes(WILDCARD) ? [...LicensePermissions] : own
}

function licensePath(ctx: MockContext, id: string): string {
  return `${accountPath(ctx)}/licenses/${id}`
}

export function serializeMockLicense(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const policy = policyOf(row)
  const base = licensePath(ctx, row.id)

  return resource(
    ctx,
    row,
    {
      name: stringOrNull(row.attributes.name),
      key: row.attributes.key,
      expiry: stringOrNull(row.attributes.expiry),
      status: licenseStatus(row),
      uses: numberOrNull(row.attributes.uses) ?? 0,
      suspended: row.attributes.suspended === true,
      protected: isProtected(row, policy),
      version: stringOrNull(row.attributes.version),
      scheme: policy ? stringOrNull(policy.attributes.scheme) : null,
      encrypted: policy?.attributes.encrypted === true,
      strict: policy?.attributes.strict === true,
      floating: policy?.attributes.floating === true,
      maxMachines: effectiveLimit(row, policy, "maxMachines"),
      maxProcesses: effectiveLimit(row, policy, "maxProcesses"),
      maxUsers: effectiveLimit(row, policy, "maxUsers"),
      maxCores: effectiveLimit(row, policy, "maxCores"),
      maxMemory: effectiveLimit(row, policy, "maxMemory"),
      maxDisk: effectiveLimit(row, policy, "maxDisk"),
      maxUses: effectiveLimit(row, policy, "maxUses"),
      requireHeartbeat: policy?.attributes.requireHeartbeat === true,
      requireCheckIn: requiresCheckIn(policy),
      lastValidated: stringOrNull(row.attributes.lastValidated),
      lastCheckOut: stringOrNull(row.attributes.lastCheckOut),
      lastCheckIn: stringOrNull(row.attributes.lastCheckIn),
      nextCheckIn: nextCheckInAt(row, policy),
      permissions: effectivePermissions(row),
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      product: toOne(ctx, policy?.refs.product ?? null, `${base}/product`),
      policy: toOne(ctx, row.refs.policy, `${base}/policy`),
      group: toOne(ctx, row.refs.group, `${base}/group`),
      owner: toOne(ctx, row.refs.owner, `${base}/owner`),
      users: toMany(`${base}/users`, { count: usersCount(row) }),
      machines: toMany(`${base}/machines`, machinesMeta(machinesOf(row.id))),
      tokens: toMany(`${base}/tokens`),
      entitlements: toMany(`${base}/entitlements`),
    },
  )
}

registerMockSerializer(TYPE, serializeMockLicense)

function serializeLicenseUser(ctx: MockContext, row: MockRow): MockResource {
  const licenseId = row.refs.license?.id ?? ""
  const userId = row.refs.user?.id ?? ""

  return resource(
    ctx,
    row,
    { created: row.created, updated: row.updated },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      license: { data: row.refs.license },
      user: { data: row.refs.user },
    },
    { links: { self: `${licensePath(ctx, licenseId)}/users/${userId}` } },
  )
}

registerMockSerializer(USER_JOIN_TYPE, serializeLicenseUser)

registerMockDestroyer(TYPE, (ctx, row) => {
  destroyMockWhere(
    ctx,
    "machines",
    (machine) => machine.refs.license?.id === row.id,
  )
  destroyMockWhere(ctx, "tokens", (token) => {
    const bearer = token.refs.bearer
    return bearer?.type === TYPE && bearer.id === row.id
  })
  for (const join of licenseeJoins(row.id)) {
    licenseUsers().delete(join.id)
  }
  for (const join of licenseEntitlements().where(
    (candidate) => candidate.refs.license?.id === row.id,
  )) {
    licenseEntitlements().delete(join.id)
  }

  licenses().delete(row.id)
  emitMockEvent(ctx, "license.deleted", { resource: row })
})

function findLicense(ctx: MockContext, identifier: string): MockRow {
  const byId = licenses().get(identifier)
  if (byId) return requireVisible(ctx, licenses(), byId.id, LABEL)

  const byKey = scoped(ctx, licenses().all()).find(
    (row) => row.attributes.key === identifier,
  )
  if (!byKey) fail(notFound(LABEL, identifier))
  return byKey
}

function licenseResponse(
  ctx: MockContext,
  row: MockRow,
  status = 200,
): MockResult {
  return { status, body: { data: serializeMockLicense(ctx, row) } }
}

function validateName(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "string") {
    fail(typeMismatch("/data/attributes/name", value, "string"))
  }
  if (value.length > MAX_NAME_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          "name",
          "TOO_LONG",
          `is too long (maximum is ${MAX_NAME_LENGTH} characters)`,
        ),
      ),
    )
  }
  return value
}

function validateKey(
  ctx: MockContext,
  value: unknown,
  policy: MockRow,
): string {
  if (value === undefined || value === null) return randomLicenseKey()
  if (typeof value !== "string") {
    fail(typeMismatch("/data/attributes/key", value, "string"))
  }
  if (RESERVED_KEYS.includes(value.toLowerCase())) {
    fail(unprocessable(attributeError("key", "NOT_ALLOWED", "is reserved")))
  }
  if (value.length > MAX_KEY_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          "key",
          "TOO_LONG",
          `is too long (maximum is ${MAX_KEY_LENGTH} characters)`,
        ),
      ),
    )
  }
  if (policy.attributes.scheme == null && value.length < MIN_KEY_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          "key",
          "TOO_SHORT",
          `is too short (minimum is ${MIN_KEY_LENGTH} characters)`,
        ),
      ),
    )
  }
  if (isUuid(value) && licenses().has(value)) {
    fail(
      unprocessable(
        attributeError(
          "key",
          "CONFLICT",
          "must not conflict with another license's identifier (UUID)",
        ),
      ),
    )
  }

  const taken = licenses().find(
    (row) => inAccount(ctx, row) && row.attributes.key === value,
  )
  if (taken) {
    fail(
      unprocessable(attributeError("key", "TAKEN", "has already been taken")),
    )
  }

  return value
}

function validateExpiry(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "string") {
    fail(typeMismatch("/data/attributes/expiry", value, "time"))
  }

  const normalized = MINUTE_PRECISION_PATTERN.test(value)
    ? `${value}:00.000Z`
    : value
  const parsed = millis(normalized)
  if (parsed == null) {
    fail(typeMismatch("/data/attributes/expiry", value, "time"))
  }

  return iso(parsed)
}

function validateBoolean(attribute: string, value: unknown): boolean {
  if (typeof value !== "boolean") {
    fail(typeMismatch(`/data/attributes/${attribute}`, value, "boolean"))
  }
  return value
}

function validateLimit(
  attribute: LimitAttribute,
  value: unknown,
  policy: MockRow,
): number | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "number" || !Number.isInteger(value)) {
    fail(typeMismatch(`/data/attributes/${attribute}`, value, "integer"))
  }

  const maximum = BYTE_LIMIT_ATTRIBUTES.includes(attribute)
    ? MAX_BIGINT
    : MAX_INTEGER
  if (value > maximum) {
    fail(
      unprocessable(
        attributeError(
          attribute,
          "INVALID",
          `must be less than or equal to ${maximum}`,
        ),
      ),
    )
  }

  if (attribute === "maxMachines") {
    const floating = policy.attributes.floating === true
    if (!floating && value !== 1) {
      fail(
        unprocessable(
          attributeError(
            attribute,
            "INVALID",
            "must be equal to 1 for non-floating policy",
          ),
        ),
      )
    }
    if (floating && value < 1) {
      fail(
        unprocessable(
          attributeError(
            attribute,
            "INVALID",
            "must be greater than or equal to 1 for floating policy",
          ),
        ),
      )
    }
  }

  const minimum = LimitMinimums[attribute]
  if (value < minimum) {
    fail(
      unprocessable(
        attributeError(
          attribute,
          "INVALID",
          `must be greater than or equal to ${minimum}`,
        ),
      ),
    )
  }

  return value
}

function validatePermissions(value: unknown): string[] {
  const list = stringList(value)
  if (!list) {
    fail(typeMismatch("/data/attributes/permissions", value, "array"))
  }

  const unsupported = list.some(
    (action) => action !== WILDCARD && !LICENSE_PERMISSIONS.has(action),
  )
  if (unsupported) {
    fail(
      unprocessable(
        attributeError("permissions", "NOT_ALLOWED", "unsupported permissions"),
      ),
    )
  }

  return [...new Set(list)].sort()
}

function validateMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata === undefined || metadata === null) return {}
  if (!isRecord(metadata)) {
    fail(typeMismatch("/data/attributes/metadata", metadata, "hash"))
  }
  if (Object.keys(metadata).length > MAX_METADATA_KEYS) {
    fail(
      unprocessable(
        attributeError(
          "metadata",
          "TOO_LONG",
          `too many keys (exceeded limit of ${MAX_METADATA_KEYS} keys)`,
        ),
      ),
    )
  }
  return normalizeMetadata(metadata)
}

function environmentIdOf(row: MockRow): string | null {
  return row.refs.environment?.id ?? null
}

function assertCompatibleEnvironment(
  license: MockRow,
  association: MockRow,
  label: string,
): void {
  const associationEnvironment = environmentIdOf(association)
  if (
    associationEnvironment != null &&
    associationEnvironment !== environmentIdOf(license)
  ) {
    fail(
      unprocessable(
        relationshipError(
          "environment",
          "NOT_ALLOWED",
          `must be compatible with ${label} environment`,
        ),
      ),
    )
  }
}

function requirePolicy(ctx: MockContext): MockRow {
  const { linkage } = bodyRelationship(ctx, "policy")
  const policy = linkage ? visible(ctx, policies(), linkage.id) : undefined
  if (!policy) {
    fail(unprocessable(relationshipError("policy", "NOT_FOUND", "must exist")))
  }
  return policy
}

function requireOwner(ctx: MockContext, id: string): MockRow {
  const owner = users().get(id)
  if (!owner || !inAccount(ctx, owner)) {
    fail(unprocessable(relationshipError("owner", "NOT_FOUND", "must exist")))
  }
  return owner
}

function requireGroup(ctx: MockContext, id: string): MockRow {
  const group = visible(ctx, groups(), id)
  if (!group) {
    fail(unprocessable(relationshipError("group", "NOT_FOUND", "must exist")))
  }
  return group
}

function assertGroupCapacity(group: MockRow): void {
  const limit = numberOrNull(group.attributes.maxLicenses)
  if (limit == null) return

  const members = licenses().where(
    (license) => license.refs.group?.id === group.id,
  ).length
  if (members >= limit) {
    fail(
      unprocessable(
        relationshipError(
          "group",
          "LICENSE_LIMIT_EXCEEDED",
          `license count has exceeded maximum allowed by current group (${limit})`,
        ),
      ),
    )
  }
}

function allowsOverage(policy: MockRow | null, count: number, limit: number) {
  const strategy = stringOrNull(policy?.attributes.overageStrategy) ?? ""
  if (strategy === ALWAYS_ALLOW_OVERAGE) return true
  const multiplier = OverageMultipliers[strategy]
  return multiplier != null && count <= limit * multiplier
}

function userLimitError(limit: number): MockApiError {
  return {
    title: "Unprocessable resource",
    detail: `user count has exceeded maximum allowed for license (${limit})`,
    code: "USER_LIMIT_EXCEEDED",
    source: { pointer: "/data/relationships/users" },
  }
}

function assertUserCapacity(
  row: MockRow,
  policy: MockRow | null,
  next: number,
) {
  const limit = effectiveLimit(row, policy, "maxUsers")
  if (limit == null || next <= limit) return
  if (allowsOverage(policy, next, limit)) return
  fail(unprocessable(userLimitError(limit)))
}

function requestedLinkage(ctx: MockContext): Linkage | null {
  const data = isRecord(ctx.body) ? ctx.body.data : undefined
  if (data === undefined) fail(badRequest("is missing", { pointer: "/data" }))
  if (data === null) return null

  const linkage = linkageOf(ctx.body)
  if (!linkage || !isUuid(linkage.id)) {
    fail(badRequest("must be a valid UUID", { pointer: "/data/id" }))
  }
  return linkage
}

function requestedIds(ctx: MockContext): string[] {
  const list = bodyDataList(ctx)
  if (list.length < 1 || list.length > MAX_JOIN_ITEMS) {
    fail(
      badRequest(`length must be between 1 and ${MAX_JOIN_ITEMS} (inclusive)`, {
        pointer: "/data",
      }),
    )
  }
  return list.map((entry, index) => {
    if (!isUuid(entry.id)) {
      fail(badRequest("must be a valid UUID", { pointer: `/data/${index}/id` }))
    }
    return entry.id
  })
}

function durationMillis(policy: MockRow | null): number | null {
  const seconds = numberOrNull(policy?.attributes.duration)
  return seconds == null ? null : seconds * 1000
}

function parseWindow(raw: string): number | null {
  const duration = parseDuration(raw)
  if (duration != null) return duration
  return INTEGER_PATTERN.test(raw) ? Number(raw) * 1000 : null
}

function parseTime(raw: string): number | null {
  if (INTEGER_PATTERN.test(raw)) return Number(raw) * 1000
  return millis(raw)
}

function withExpiry(check: (expiry: number) => boolean): Predicate {
  return (row) => {
    const expiry = expiryOf(row)
    return expiry != null && check(expiry)
  }
}

function expiryPredicate(
  operator: string,
  raw: string,
  now: number,
  expired: boolean,
): Predicate | null {
  switch (operator) {
    case "within":
    case "in": {
      const window = parseWindow(raw)
      if (window == null) return null
      return withExpiry(
        expired
          ? (expiry) => expiry < now && expiry >= now - window
          : (expiry) => expiry >= now && expiry <= now + window,
      )
    }
    case "before": {
      const time = parseTime(raw)
      if (time == null) return null
      return withExpiry(
        expired
          ? (expiry) => expiry < now && expiry <= time
          : (expiry) => expiry >= now && expiry <= time,
      )
    }
    case "after": {
      const time = parseTime(raw)
      if (time == null) return null
      return withExpiry(
        expired
          ? (expiry) => expiry < now && expiry >= time
          : (expiry) => expiry >= now && expiry >= time,
      )
    }
    case "on": {
      const time = parseTime(raw)
      if (time == null) return null
      const day = dateOnly(time)
      const start = startOfDay(day)
      const end = endOfDay(day)
      return withExpiry(
        expired
          ? (expiry) => expiry < now && expiry >= start && expiry <= end
          : (expiry) => expiry >= start && expiry <= end,
      )
    }
    default:
      return () => true
  }
}

function activityPredicate(
  operator: string,
  raw: string,
  now: number,
): Predicate | null {
  switch (operator) {
    case "inside":
    case "within": {
      const window = parseWindow(raw)
      if (window == null) return null
      return (row) => isActiveSince(row, now - window)
    }
    case "outside": {
      const window = parseWindow(raw)
      if (window == null) return null
      return (row) => isInactiveSince(row, now - window)
    }
    case "before": {
      const time = parseTime(raw)
      if (time == null) return null
      return (row) => isInactiveSince(row, time)
    }
    case "after": {
      const time = parseTime(raw)
      if (time == null) return null
      return (row) => isActiveSince(row, time)
    }
    default:
      return () => true
  }
}

function booleanParameter(ctx: MockContext, parameter: string): boolean | null {
  const raw = ctx.query.get(parameter)
  if (raw == null || raw === "") return null
  if (raw !== "true" && raw !== "false") {
    fail(
      badRequest("type mismatch (received string expected boolean)", {
        parameter,
      }),
    )
  }
  return raw === "true"
}

function activationsPredicate(operator: string, raw: string): Predicate {
  if (!INTEGER_PATTERN.test(raw)) {
    fail(
      badRequest("type mismatch (received string expected integer)", {
        parameter: `activations[${operator}]`,
      }),
    )
  }
  const wanted = Number(raw)
  const compare = (count: number): boolean => {
    switch (operator) {
      case "eq":
        return count === wanted
      case "gt":
        return count > wanted
      case "gte":
        return count >= wanted
      case "lt":
        return count < wanted
      case "lte":
        return count <= wanted
      default:
        return true
    }
  }
  return (row) => compare(machinesOf(row.id).length)
}

function findUserByIdentifier(
  ctx: MockContext,
  identifier: string,
): MockRow | null {
  const email = identifier.trim().toLowerCase()
  return (
    accountRows(ctx, users().all()).find(
      (user) => user.id === identifier || user.attributes.email === email,
    ) ?? null
  )
}

function matchesMetadataValue(actual: unknown, raw: string): boolean {
  if (actual === undefined) return false
  if (typeof actual === "string") return actual === raw
  if (typeof actual === "number" || typeof actual === "boolean") {
    return actual.toString() === raw
  }
  if (actual === null) return raw === "null"
  return JSON.stringify(actual) === raw
}

function matchesMetadata(
  row: MockRow,
  filters: Record<string, string>,
): boolean {
  const metadata = isRecord(row.attributes.metadata)
    ? row.attributes.metadata
    : {}
  return Object.entries(filters).every(([key, value]) =>
    matchesMetadataValue(metadata[camelize(key)], value),
  )
}

function collectFilters(ctx: MockContext): Predicate[] | null {
  const now = Date.now()
  const query = ctx.query
  const predicates: Predicate[] = []

  const status = query.get("status")
  if (status) {
    const wanted = status.toUpperCase()
    predicates.push((row) => hasStatus(row, wanted, now))
  }

  for (const [operator, raw] of Object.entries(queryNested(query, "expires"))) {
    const predicate = expiryPredicate(operator, raw, now, false)
    if (!predicate) return null
    predicates.push(predicate)
  }
  for (const [operator, raw] of Object.entries(queryNested(query, "expired"))) {
    const predicate = expiryPredicate(operator, raw, now, true)
    if (!predicate) return null
    predicates.push(predicate)
  }
  for (const [operator, raw] of Object.entries(
    queryNested(query, "activity"),
  )) {
    const predicate = activityPredicate(operator, raw, now)
    if (!predicate) return null
    predicates.push(predicate)
  }

  const assigned = booleanParameter(ctx, "assigned")
  if (assigned != null) {
    predicates.push((row) => usersCount(row) > 0 === assigned)
  }
  const unassigned = booleanParameter(ctx, "unassigned")
  if (unassigned != null) {
    predicates.push((row) => (usersCount(row) === 0) === unassigned)
  }
  const activated = booleanParameter(ctx, "activated")
  if (activated != null) {
    predicates.push((row) => machinesOf(row.id).length > 0 === activated)
  }
  for (const [operator, raw] of Object.entries(
    queryNested(query, "activations"),
  )) {
    predicates.push(activationsPredicate(operator, raw))
  }

  const product = query.get("product")
  if (product) {
    predicates.push((row) => policyOf(row)?.refs.product?.id === product)
  }
  const policy = query.get("policy")
  if (policy) {
    predicates.push((row) => row.refs.policy?.id === policy)
  }
  const owner = query.get("owner")
  if (owner) {
    const user = findUserByIdentifier(ctx, owner)
    if (!user) return null
    predicates.push((row) => row.refs.owner?.id === user.id)
  }
  const user = query.get("user")
  if (user) {
    const match = findUserByIdentifier(ctx, user)
    if (!match) return null
    predicates.push(
      (row) =>
        row.refs.owner?.id === match.id ||
        licenseeIds(row.id).includes(match.id),
    )
  }
  const group = query.get("group")
  if (group) {
    predicates.push((row) => row.refs.group?.id === group)
  }
  const machine = query.get("machine")
  if (machine) {
    const licenseId = machines().get(machine)?.refs.license?.id
    if (!licenseId) return null
    predicates.push((row) => row.id === licenseId)
  }

  const metadata = queryNested(query, "metadata")
  if (Object.keys(metadata).length > 0) {
    predicates.push((row) => matchesMetadata(row, metadata))
  }

  return predicates
}

mockRoute("GET", `${MOCK_ACCOUNT}/licenses`, (ctx) => {
  const predicates = collectFilters(ctx)
  const rows = predicates
    ? scoped(ctx, licenses().all()).filter((row) =>
        predicates.every((predicate) => predicate(row)),
      )
    : []

  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockLicense(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/licenses/:id`, (ctx) => {
  const row = findLicense(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return licenseResponse(ctx, row)
})

mockRoute("POST", `${MOCK_ACCOUNT}/licenses`, (ctx) => {
  const attributes = bodyAttributes(ctx)
  rejectUnpermitted(attributes, PERMITTED_ATTRIBUTES)

  const policy = requirePolicy(ctx)
  const now = nowIso()
  const name = validateName(attributes.name)
  const key = validateKey(ctx, attributes.key, policy)
  const duration = durationMillis(policy)
  const expiry =
    validateExpiry(attributes.expiry) ??
    (policy.attributes.expirationBasis === FROM_CREATION && duration != null
      ? shift(now, duration)
      : null)
  const suspended =
    "suspended" in attributes
      ? validateBoolean("suspended", attributes.suspended)
      : false
  const protectedFlag =
    "protected" in attributes
      ? validateBoolean("protected", attributes.protected)
      : policy.attributes.protected === true
  const permissions =
    attributes.permissions == null
      ? [WILDCARD]
      : validatePermissions(attributes.permissions)
  const metadata = validateMetadata(attributes.metadata)
  const limits: Record<string, number | null> = {}
  for (const attribute of LIMIT_ATTRIBUTES) {
    limits[attribute] = validateLimit(attribute, attributes[attribute], policy)
  }

  const ownerLinkage = bodyRelationship(ctx, "owner").linkage
  const owner = ownerLinkage ? requireOwner(ctx, ownerLinkage.id) : null
  const groupLinkage = bodyRelationship(ctx, "group").linkage
  const requestedGroup = groupLinkage
    ? requireGroup(ctx, groupLinkage.id)
    : null
  const inheritedGroupId = owner?.refs.group?.id
  const group =
    requestedGroup ??
    (inheritedGroupId ? (groups().get(inheritedGroupId) ?? null) : null)

  const row = makeMockRow(
    TYPE,
    uuid(),
    {
      name,
      key,
      expiry,
      uses: 0,
      suspended,
      protected: protectedFlag,
      version: null,
      ...limits,
      permissions,
      lastValidated: null,
      lastCheckOut: null,
      lastCheckIn: requiresCheckIn(policy) ? now : null,
      metadata,
    },
    {
      ...baseRefs(ctx),
      policy: { type: "policies", id: policy.id },
      owner: owner ? { type: "users", id: owner.id } : null,
      group: null,
    },
    now,
  )

  assertCompatibleEnvironment(row, policy, "policy")
  if (owner) assertCompatibleEnvironment(row, owner, "owner")
  if (group) {
    assertCompatibleEnvironment(row, group, "group")
    assertGroupCapacity(group)
    row.refs.group = { type: "groups", id: group.id }
  }

  licenses().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "license.created", { resource: row })

  return licenseResponse(ctx, row, 201)
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/licenses/:id`, (ctx) => {
  const row = findLicense(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = bodyAttributes(ctx)
  rejectUnpermitted(
    attributes,
    PERMITTED_ATTRIBUTES.filter(
      (attribute) => !CREATE_ONLY_ATTRIBUTES.includes(attribute),
    ),
  )

  const policy = policyOf(row)
  const changes: Record<string, unknown> = {}

  if ("name" in attributes) changes.name = validateName(attributes.name)
  if ("expiry" in attributes) changes.expiry = validateExpiry(attributes.expiry)
  if ("suspended" in attributes) {
    changes.suspended = validateBoolean("suspended", attributes.suspended)
  }
  if ("protected" in attributes) {
    changes.protected = validateBoolean("protected", attributes.protected)
  }
  if ("permissions" in attributes) {
    changes.permissions =
      attributes.permissions == null
        ? [WILDCARD]
        : validatePermissions(attributes.permissions)
  }
  if ("metadata" in attributes) {
    changes.metadata = validateMetadata(attributes.metadata)
  }
  for (const attribute of LIMIT_ATTRIBUTES) {
    if (attribute in attributes && policy) {
      changes[attribute] = validateLimit(
        attribute,
        attributes[attribute],
        policy,
      )
    }
  }

  const before = { ...row.attributes }
  licenses().patch(
    row.id,
    { attributes: changes },
    { touch: Object.keys(changes).length > 0 },
  )

  emitMockEvent(ctx, "license.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return licenseResponse(ctx, row)
})

function writableLicense(ctx: MockContext): MockRow {
  const row = findLicense(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }
  return row
}

mockRoute("DELETE", `${MOCK_ACCOUNT}/licenses/:id`, (ctx) => {
  const row = writableLicense(ctx)

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/licenses/:id/actions/revoke`, (ctx) => {
  const row = writableLicense(ctx)

  emitMockEvent(ctx, "license.revoked", { resource: row })
  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

mockRoute("POST", `${MOCK_ACCOUNT}/licenses/:id/actions/renew`, (ctx) => {
  const row = writableLicense(ctx)
  const policy = policyOf(row)
  const duration = durationMillis(policy)

  if (duration == null) {
    fail(
      unprocessableEntity(
        "cannot be renewed because the policy does not have a duration",
      ),
    )
  }
  const expiry = expiryOf(row)
  if (expiry == null) {
    fail(
      unprocessableEntity(
        "cannot be renewed because the license does not have an expiry",
      ),
    )
  }

  const now = Date.now()
  const basis = stringOrNull(policy?.attributes.renewalBasis) ?? "FROM_EXPIRY"
  const start =
    basis === "FROM_NOW"
      ? now
      : basis === "FROM_NOW_IF_EXPIRED" && expiry < now
        ? now
        : expiry

  licenses().patch(row.id, { attributes: { expiry: iso(start + duration) } })
  emitMockEvent(ctx, "license.renewed", { resource: row })

  return licenseResponse(ctx, row)
})

mockRoute("POST", `${MOCK_ACCOUNT}/licenses/:id/actions/suspend`, (ctx) => {
  const row = writableLicense(ctx)
  if (row.attributes.suspended === true) {
    fail(
      unprocessableEntity("is already suspended", "/data/attributes/suspended"),
    )
  }

  licenses().patch(row.id, { attributes: { suspended: true } })
  emitMockEvent(ctx, "license.suspended", { resource: row })

  return licenseResponse(ctx, row)
})

mockRoute("POST", `${MOCK_ACCOUNT}/licenses/:id/actions/reinstate`, (ctx) => {
  const row = writableLicense(ctx)
  if (row.attributes.suspended !== true) {
    fail(unprocessableEntity("is not suspended", "/data/attributes/suspended"))
  }

  licenses().patch(row.id, { attributes: { suspended: false } })
  emitMockEvent(ctx, "license.reinstated", { resource: row })

  return licenseResponse(ctx, row)
})

mockRoute("POST", `${MOCK_ACCOUNT}/licenses/:id/actions/check-in`, (ctx) => {
  const row = writableLicense(ctx)
  if (!requiresCheckIn(policyOf(row))) {
    fail(
      unprocessableEntity(
        "cannot be checked in because the policy does not require it",
      ),
    )
  }

  licenses().patch(row.id, { attributes: { lastCheckIn: nowIso() } })
  emitMockEvent(ctx, "license.checked-in", { resource: row })

  return licenseResponse(ctx, row)
})

mockRoute("POST", `${MOCK_ACCOUNT}/licenses/:id/actions/reset-usage`, (ctx) => {
  const row = writableLicense(ctx)

  licenses().patch(row.id, { attributes: { uses: 0 } })
  emitMockEvent(ctx, "license.usage.reset", { resource: row })

  return licenseResponse(ctx, row)
})

function usageStep(ctx: MockContext, key: string): number {
  const value = bodyMeta(ctx)[key]
  if (value === undefined) return 1
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    fail(typeMismatch(`/meta/${key}`, value, "integer"))
  }
  return value
}

mockRoute(
  "POST",
  `${MOCK_ACCOUNT}/licenses/:id/actions/increment-usage`,
  (ctx) => {
    const row = writableLicense(ctx)
    const uses =
      (numberOrNull(row.attributes.uses) ?? 0) + usageStep(ctx, "increment")
    const limit = effectiveLimit(row, policyOf(row), "maxUses")

    if (limit != null && uses > limit) {
      fail(
        unprocessable(
          attributeError(
            "uses",
            "LIMIT_EXCEEDED",
            `usage exceeds maximum allowed for license (${limit})`,
          ),
        ),
      )
    }

    licenses().patch(row.id, { attributes: { uses } })
    emitMockEvent(ctx, "license.usage.incremented", { resource: row })

    return licenseResponse(ctx, row)
  },
)

mockRoute(
  "POST",
  `${MOCK_ACCOUNT}/licenses/:id/actions/decrement-usage`,
  (ctx) => {
    const row = writableLicense(ctx)
    const uses =
      (numberOrNull(row.attributes.uses) ?? 0) - usageStep(ctx, "decrement")

    if (uses < 0) {
      fail(
        unprocessable(
          attributeError(
            "uses",
            "INVALID",
            "must be greater than or equal to 0",
          ),
        ),
      )
    }

    licenses().patch(row.id, { attributes: { uses } })
    emitMockEvent(ctx, "license.usage.decremented", { resource: row })

    return licenseResponse(ctx, row)
  },
)

function base64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function wrapLines(value: string, width: number): string {
  const lines: string[] = []
  for (let index = 0; index < value.length; index += width) {
    lines.push(value.slice(index, index + width))
  }
  return lines.join("\n")
}

function checkoutAlgorithm(ctx: MockContext): string {
  const raw = ctx.query.get("algorithm")
  const algorithm = raw == null || raw === "" ? DEFAULT_ALGORITHM : raw
  const [encoding, signing, ...rest] = algorithm.split("+")

  if (rest.length > 0 || !ENCODING_ALGORITHMS.includes(encoding)) {
    fail(
      errors(400, {
        title: "Bad request",
        detail: "invalid encoding algorithm",
        code: "CHECKOUT_ALGORITHM_INVALID",
        source: { parameter: "algorithm" },
      }),
    )
  }
  if (signing == null || !SIGNING_ALGORITHMS.includes(signing)) {
    fail(
      errors(400, {
        title: "Bad request",
        detail: "invalid signing algorithm",
        code: "CHECKOUT_ALGORITHM_INVALID",
        source: { parameter: "algorithm" },
      }),
    )
  }

  return algorithm
}

function checkoutIncludes(ctx: MockContext): string[] {
  const requested = queryList(ctx.query, "include")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value !== "")
    .map((value) => (value === "user" ? "owner" : value))

  if (requested.some((value) => !CHECKOUT_INCLUDES.includes(value))) {
    fail(
      errors(400, {
        title: "Bad request",
        detail: "invalid includes",
        code: "CHECKOUT_INCLUDE_INVALID",
        source: { parameter: "include" },
      }),
    )
  }

  return [...new Set(requested)]
}

function checkoutTtl(ctx: MockContext): number | null {
  const raw = ctx.query.get("ttl")
  if (raw == null) return DEFAULT_CHECKOUT_TTL
  if (raw === "") return null
  if (!INTEGER_PATTERN.test(raw)) {
    fail(
      badRequest("type mismatch (received string expected integer)", {
        parameter: "ttl",
      }),
    )
  }

  const ttl = Number(raw)
  if (ttl < MIN_CHECKOUT_TTL) {
    fail(
      errors(400, {
        title: "Bad request",
        detail: `must be greater than or equal to ${MIN_CHECKOUT_TTL} (1 hour)`,
        code: "CHECKOUT_TTL_INVALID",
        source: { parameter: "ttl" },
      }),
    )
  }

  return ttl
}

function includedResources(
  ctx: MockContext,
  row: MockRow,
  includes: string[],
): MockResource[] {
  const included: MockResource[] = []
  const policy = policyOf(row)

  const push = (candidate: MockRow | null | undefined): void => {
    if (candidate) included.push(serializeMock(ctx, candidate))
  }

  for (const include of includes) {
    switch (include) {
      case "entitlements":
        entitlementsForLicense(row).forEach(push)
        break
      case "environment":
        push(
          row.refs.environment
            ? mockStore.table("environments").get(row.refs.environment.id)
            : null,
        )
        break
      case "product":
        push(
          policy?.refs.product
            ? mockStore.table("products").get(policy.refs.product.id)
            : null,
        )
        break
      case "policy":
        push(policy)
        break
      case "group":
        push(row.refs.group ? groups().get(row.refs.group.id) : null)
        break
      case "owner":
        push(ownerOf(row))
        break
      case "users":
        usersOf(row).forEach(push)
        break
      default:
        break
    }
  }

  return included
}

function certificateFor(
  ctx: MockContext,
  row: MockRow,
  algorithm: string,
  includes: string[],
  meta: Record<string, unknown>,
): string {
  const payload = JSON.stringify({
    data: serializeMockLicense(ctx, row),
    included: includedResources(ctx, row, includes),
    meta,
  })
  const encrypted = algorithm.startsWith(ENCRYPTION_ALGORITHM)
  const enc = encrypted
    ? [randomHex(payload.length), randomHex(24), randomHex(32)]
        .map(base64)
        .join(".")
    : base64(payload)
  const sig = base64(randomHex(128))
  const document = base64(JSON.stringify({ enc, sig, alg: algorithm }))

  return `-----BEGIN LICENSE FILE-----\n${wrapLines(document, CERTIFICATE_LINE_LENGTH)}\n-----END LICENSE FILE-----\n`
}

mockRoute("POST", `${MOCK_ACCOUNT}/licenses/:id/actions/check-out`, (ctx) => {
  const row = writableLicense(ctx)
  const algorithm = checkoutAlgorithm(ctx)
  const includes = checkoutIncludes(ctx)
  const ttl = checkoutTtl(ctx)

  const issued = nowIso()
  const expiry = ttl == null ? null : shift(issued, ttl * 1000)
  const certificate = certificateFor(ctx, row, algorithm, includes, {
    issued,
    expiry,
    ttl,
  })

  licenses().patch(row.id, { attributes: { lastCheckOut: issued } })
  emitMockEvent(ctx, "license.checked-out", { resource: row })

  const file: MockResource = {
    id: uuid(),
    type: FILE_TYPE,
    attributes: {
      certificate,
      algorithm,
      includes,
      ttl,
      expiry,
      issued,
      created: issued,
      updated: issued,
    },
    relationships: {
      account: accountRelationship(ctx),
      environment: environmentRelationship(ctx, row.refs.environment),
      license: toOne(ctx, { type: TYPE, id: row.id }),
    },
    links: {},
  }

  return { status: 200, body: { data: file } }
})

function validateLicense(row: MockRow, at: number): Verdict {
  const policy = policyOf(row)

  if (isBanned(row)) return [false, "is banned", "BANNED"]
  if (row.attributes.suspended === true) {
    return [false, "is suspended", "SUSPENDED"]
  }

  const expired = isExpired(row, at)
  const expirationStrategy =
    stringOrNull(policy?.attributes.expirationStrategy) ?? "RESTRICT_ACCESS"
  if (expired && expirationStrategy === REVOKE_ACCESS) {
    return [false, "is expired", "EXPIRED"]
  }
  if (isCheckInOverdue(row, policy, at)) {
    return [false, "is overdue for check in", "OVERDUE"]
  }

  for (const [attribute, scope, code] of RequiredScopes) {
    if (policy?.attributes[attribute] === true) {
      return [false, `${scope} scope is required`, code]
    }
  }

  const expiredVerdict: Verdict = [
    EXPIRED_ACCESS_STRATEGIES.includes(expirationStrategy),
    "is expired",
    "EXPIRED",
  ]
  const validVerdict: Verdict = [true, "is valid", "VALID"]

  const maxUsers = effectiveLimit(row, policy, "maxUsers")
  const userCount = usersCount(row)
  if (maxUsers != null && userCount > maxUsers) {
    return [
      allowsOverage(policy, userCount, maxUsers),
      "has too many associated users",
      "TOO_MANY_USERS",
    ]
  }

  if (!policy || policy.attributes.strict !== true) {
    return expired ? expiredVerdict : validVerdict
  }

  const activations = machinesOf(row.id)
  const machineCount = activations.length
  const floating = policy.attributes.floating === true
  const maxMachines = effectiveLimit(row, policy, "maxMachines")

  if (!floating && machineCount === 0) {
    return [false, "must have exactly 1 associated machine", "NO_MACHINE"]
  }
  if (!floating && machineCount > 1) {
    const limit = maxMachines ?? 1
    if (machineCount > limit) {
      return [
        allowsOverage(policy, machineCount, limit),
        "has too many associated machines",
        "TOO_MANY_MACHINES",
      ]
    }
  }
  if (floating && machineCount === 0) {
    return [false, "must have at least 1 associated machine", "NO_MACHINES"]
  }
  if (
    floating &&
    maxMachines != null &&
    machineCount > 1 &&
    machineCount > maxMachines
  ) {
    return [
      allowsOverage(policy, machineCount, maxMachines),
      "has too many associated machines",
      "TOO_MANY_MACHINES",
    ]
  }

  const maxCores = effectiveLimit(row, policy, "maxCores")
  const coreCount = sumAttribute(activations, "cores")
  if (maxCores != null && coreCount > maxCores) {
    return [
      allowsOverage(policy, coreCount, maxCores),
      "has too many associated machine cores",
      "TOO_MANY_CORES",
    ]
  }
  const maxMemory = effectiveLimit(row, policy, "maxMemory")
  const memoryTotal = sumAttribute(activations, "memory")
  if (maxMemory != null && memoryTotal > maxMemory) {
    return [
      allowsOverage(policy, memoryTotal, maxMemory),
      "has too much associated machine memory",
      "TOO_MUCH_MEMORY",
    ]
  }
  const maxDisk = effectiveLimit(row, policy, "maxDisk")
  const diskTotal = sumAttribute(activations, "disk")
  if (maxDisk != null && diskTotal > maxDisk) {
    return [
      allowsOverage(policy, diskTotal, maxDisk),
      "has too much associated machine disk",
      "TOO_MUCH_DISK",
    ]
  }

  const maxProcesses = effectiveLimit(row, policy, "maxProcesses")
  if (maxProcesses != null) {
    const perMachine = policy.attributes.processLeasingStrategy === PER_MACHINE
    const machineIds = new Set(activations.map((machine) => machine.id))
    const leased = processesOf(machineIds)
    const processCount = perMachine
      ? Math.max(0, ...countPerMachine(leased).values())
      : leased.length
    if (processCount > maxProcesses) {
      return [
        allowsOverage(policy, processCount, maxProcesses),
        "has too many associated processes",
        "TOO_MANY_PROCESSES",
      ]
    }
  }

  return expired ? expiredVerdict : validVerdict
}

function validationResult(
  ctx: MockContext,
  row: MockRow | null,
  meta: Record<string, unknown>,
): MockResult {
  const ts = nowIso()
  const echo: Record<string, unknown> = {}
  if (typeof meta.nonce === "number") echo.nonce = meta.nonce
  if (isRecord(meta.scope)) echo.scope = meta.scope

  if (!row) {
    return {
      status: 200,
      body: {
        data: null,
        meta: {
          ts,
          valid: false,
          detail: "does not exist",
          code: "NOT_FOUND",
          ...echo,
        },
      },
    }
  }

  ctx.resource = { type: TYPE, id: row.id }
  const [valid, detail, code] = validateLicense(row, Date.parse(ts))
  const policy = policyOf(row)
  const duration = durationMillis(policy)
  const touches: Record<string, unknown> = { lastValidated: ts }
  if (
    expiryOf(row) == null &&
    policy?.attributes.expirationBasis === FROM_FIRST_VALIDATION &&
    duration != null
  ) {
    touches.expiry = shift(ts, duration)
  }

  licenses().patch(row.id, { attributes: touches })
  emitMockEvent(
    ctx,
    valid ? "license.validation.succeeded" : "license.validation.failed",
    { resource: row, metadata: { code } },
  )

  return {
    status: 200,
    body: {
      data: serializeMockLicense(ctx, row),
      meta: { ts, valid, detail, code, ...echo },
    },
  }
}

mockRoute(
  "POST",
  `${MOCK_ACCOUNT}/licenses/actions/validate-key`,
  (ctx) => {
    const meta = bodyMeta(ctx)
    const key = meta.key
    if (key === undefined) {
      fail(badRequest("is missing", { pointer: "/meta/key" }))
    }
    if (typeof key !== "string") {
      fail(typeMismatch("/meta/key", key, "string"))
    }
    if (key.trim() === "") {
      fail(badRequest("cannot be blank", { pointer: "/meta/key" }))
    }

    const row =
      accountRows(ctx, licenses().all()).find(
        (candidate) => candidate.attributes.key === key,
      ) ?? null

    return validationResult(ctx, row, meta)
  },
  { public: true },
)

function validateById(ctx: MockContext): MockResult {
  const row = findLicense(ctx, ctx.params.id)
  return validationResult(ctx, row, bodyMeta(ctx))
}

mockRoute("GET", `${MOCK_ACCOUNT}/licenses/:id/actions/validate`, validateById)
mockRoute("POST", `${MOCK_ACCOUNT}/licenses/:id/actions/validate`, validateById)

function isStricter(
  ranks: Readonly<Record<string, number>>,
  next: unknown,
  previous: unknown,
): boolean {
  const nextRank = ranks[stringOrNull(next) ?? ""]
  const previousRank = ranks[stringOrNull(previous) ?? ""]
  return nextRank != null && previousRank != null && nextRank > previousRank
}

function assertPolicyCompatible(previous: MockRow, next: MockRow): void {
  let detail: string | null = null

  if (next.attributes.encrypted !== previous.attributes.encrypted) {
    detail =
      "cannot change from an encrypted policy to an unencrypted policy (or vice-versa)"
  } else if (next.attributes.usePool !== previous.attributes.usePool) {
    detail =
      "cannot change from a pooled policy to an unpooled policy (or vice-versa)"
  } else if (next.attributes.scheme !== previous.attributes.scheme) {
    detail = "cannot change to a policy with a different scheme"
  } else if (
    isStricter(
      MachineUniquenessRanks,
      next.attributes.machineUniquenessStrategy,
      previous.attributes.machineUniquenessStrategy,
    )
  ) {
    detail =
      "cannot change to a policy with a more strict machine uniqueness strategy"
  } else if (
    isStricter(
      ComponentUniquenessRanks,
      next.attributes.componentUniquenessStrategy,
      previous.attributes.componentUniquenessStrategy,
    )
  ) {
    detail =
      "cannot change to a policy with a more strict component uniqueness strategy"
  }

  if (detail) {
    fail(unprocessable(relationshipError("policy", "NOT_COMPATIBLE", detail)))
  }
}

mockRoute("PUT", `${MOCK_ACCOUNT}/licenses/:id/policy`, (ctx) => {
  const row = writableLicense(ctx)
  const linkage = requestedLinkage(ctx)
  if (!linkage) fail(badRequest("cannot be null", { pointer: "/data" }))

  const policy = visible(ctx, policies(), linkage.id)
  if (!policy) fail(notFound("policy", linkage.id))
  assertCompatibleEnvironment(row, policy, "policy")

  const previous = policyOf(row)
  if (previous && previous.id !== policy.id) {
    assertPolicyCompatible(previous, policy)
  }

  const changes: Record<string, unknown> = {}
  if (policy.attributes.transferStrategy === RESET_EXPIRY) {
    const duration = durationMillis(policy)
    changes.expiry = duration == null ? null : shift(nowIso(), duration)
  }

  licenses().patch(row.id, {
    attributes: changes,
    refs: { policy: { type: "policies", id: policy.id } },
  })
  emitMockEvent(ctx, "license.policy.updated", { resource: row })

  return licenseResponse(ctx, row)
})

mockRoute("PUT", `${MOCK_ACCOUNT}/licenses/:id/owner`, (ctx) => {
  const row = writableLicense(ctx)
  const linkage = requestedLinkage(ctx)
  const owner = linkage ? requireOwner(ctx, linkage.id) : null

  if (owner) {
    assertCompatibleEnvironment(row, owner, "owner")
    if (licenseeIds(row.id).includes(owner.id)) {
      fail(
        unprocessable(
          relationshipError(
            "owner",
            "INVALID",
            "already exists (user is attached through users)",
          ),
        ),
      )
    }
    if (owner.id !== row.refs.owner?.id) {
      assertUserCapacity(row, policyOf(row), licenseeIds(row.id).length + 1)
    }
  }

  const inheritedGroupId = owner?.refs.group?.id
  const inheritedGroup =
    !row.refs.group && inheritedGroupId
      ? (groups().get(inheritedGroupId) ?? null)
      : null
  if (inheritedGroup) {
    assertCompatibleEnvironment(row, inheritedGroup, "group")
    assertGroupCapacity(inheritedGroup)
  }

  licenses().patch(row.id, {
    refs: {
      owner: owner ? { type: "users", id: owner.id } : null,
      ...(inheritedGroup
        ? { group: { type: "groups", id: inheritedGroup.id } }
        : {}),
    },
  })
  emitMockEvent(ctx, "license.owner.updated", { resource: row })

  return licenseResponse(ctx, row)
})

mockRoute("PUT", `${MOCK_ACCOUNT}/licenses/:id/group`, (ctx) => {
  const row = writableLicense(ctx)
  const linkage = requestedLinkage(ctx)
  const group = linkage ? requireGroup(ctx, linkage.id) : null

  if (group && group.id !== row.refs.group?.id) {
    assertCompatibleEnvironment(row, group, "group")
    assertGroupCapacity(group)
  }

  licenses().patch(row.id, {
    refs: { group: group ? { type: "groups", id: group.id } : null },
  })
  emitMockEvent(ctx, "license.group.updated", { resource: row })

  return licenseResponse(ctx, row)
})

function relatedResource(
  ctx: MockContext,
  linkage: Linkage | null | undefined,
  label: string,
): MockResult {
  const related = linkage
    ? visible(ctx, mockStore.table(linkage.type), linkage.id)
    : undefined
  if (!related) fail(notFound(label, linkage?.id ?? ""))
  return { status: 200, body: { data: serializeMock(ctx, related) } }
}

mockRoute("GET", `${MOCK_ACCOUNT}/licenses/:id/product`, (ctx) => {
  const row = findLicense(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return relatedResource(ctx, policyOf(row)?.refs.product, "product")
})

mockRoute("GET", `${MOCK_ACCOUNT}/licenses/:id/policy`, (ctx) => {
  const row = findLicense(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return relatedResource(ctx, row.refs.policy, "policy")
})

mockRoute("GET", `${MOCK_ACCOUNT}/licenses/:id/group`, (ctx) => {
  const row = findLicense(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return relatedResource(ctx, row.refs.group, "group")
})

mockRoute("GET", `${MOCK_ACCOUNT}/licenses/:id/owner`, (ctx) => {
  const row = findLicense(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return relatedResource(ctx, row.refs.owner, "user")
})

mockRoute("GET", `${MOCK_ACCOUNT}/licenses/:id/users`, (ctx) => {
  const row = findLicense(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return {
    status: 200,
    body: paginateMock(ctx, usersOf(row), (user) => serializeMock(ctx, user)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/licenses/:id/users/:userId`, (ctx) => {
  const row = findLicense(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  const user = usersOf(row).find(
    (candidate) => candidate.id === ctx.params.userId,
  )
  if (!user) fail(notFound("user", ctx.params.userId))
  return { status: 200, body: { data: serializeMock(ctx, user) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/licenses/:id/users`, (ctx) => {
  const row = writableLicense(ctx)
  const ids = requestedIds(ctx)
  const policy = policyOf(row)
  const attached = new Set(licenseeIds(row.id))
  const ownerId = row.refs.owner?.id
  let count = usersCount(row)

  const attaching: MockRow[] = []
  for (const id of ids) {
    const user = users().get(id)
    if (!user || !inAccount(ctx, user)) {
      fail(unprocessable(relationshipError("user", "NOT_FOUND", "must exist")))
    }
    if (id === ownerId) {
      fail(
        unprocessable(
          relationshipError(
            "user",
            "CONFLICT",
            "already exists (user is attached through owner)",
          ),
        ),
      )
    }
    if (attached.has(id)) {
      fail(unprocessable(relationshipError("user", "TAKEN", "already exists")))
    }
    assertCompatibleEnvironment(row, user, "license")
    count += 1
    assertUserCapacity(row, policy, count)
    attached.add(id)
    attaching.push(user)
  }

  const joins = attaching.map((user) =>
    licenseUsers().insert(
      makeMockRow(
        USER_JOIN_TYPE,
        uuid(),
        {},
        {
          ...baseRefs(ctx),
          environment: row.refs.environment ?? null,
          license: { type: TYPE, id: row.id },
          user: { type: "users", id: user.id },
        },
      ),
    ),
  )

  licenses().patch(row.id, {})
  emitMockEvent(ctx, "license.users.attached", {
    resource: row,
    metadata: { emails: attaching.map((user) => user.attributes.email) },
  })

  return {
    status: 200,
    body: { data: joins.map((join) => serializeLicenseUser(ctx, join)) },
  }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/licenses/:id/users`, (ctx) => {
  const row = writableLicense(ctx)
  const ids = requestedIds(ctx)
  const attached = new Set(licenseeIds(row.id))
  const ownerId = row.refs.owner?.id

  ids.forEach((id, index) => {
    if (ownerId && id === ownerId) {
      fail(
        errors(403, {
          title: "Access denied",
          detail: `cannot detach user '${id}' (user is attached through owner)`,
          source: { pointer: `/data/${index}` },
        }),
      )
    }
    if (!attached.has(id)) {
      fail(
        unprocessableEntity(
          `cannot detach user '${id}' (user is not attached)`,
          `/data/${index}`,
        ),
      )
    }
  })

  const detaching = licenseeJoins(row.id).filter((join) =>
    ids.includes(join.refs.user?.id ?? ""),
  )
  for (const join of detaching) {
    licenseUsers().delete(join.id)
  }
  for (const machine of machinesOf(row.id)) {
    const machineOwner = machine.refs.owner?.id
    if (machineOwner && ids.includes(machineOwner)) {
      machines().patch(machine.id, { refs: { owner: null } }, { touch: false })
    }
  }

  licenses().patch(row.id, {})
  emitMockEvent(ctx, "license.users.detached", {
    resource: row,
    metadata: {
      emails: ids.map((id) => users().get(id)?.attributes.email ?? id),
    },
  })

  return { status: 204 }
})
