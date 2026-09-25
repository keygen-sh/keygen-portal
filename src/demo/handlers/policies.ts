import {
  MOCK_ACCOUNT,
  assertWritable,
  badRequest,
  baseRefs,
  bodyAttributes,
  bodyRelationship,
  type MockContext,
  destroyMock,
  destroyMockWhere,
  diffMetadata,
  emitMockEvent,
  environmentRelationship,
  fail,
  isRecord,
  makeMockRow,
  normalizeMetadata,
  paginateMock,
  receivedType,
  registerMockDestroyer,
  registerMockSerializer,
  rejectAttribute,
  relationshipError,
  requireVisible,
  type MockResource,
  resource,
  resourcePath,
  mockRoute,
  type MockRow,
  scoped,
  mockStore,
  toMany,
  toOne,
  unpermittedAttribute,
  unprocessable,
  uuid,
  visible,
} from "@/demo/server"

const TYPE = "policies"
const LABEL = "policy"
const MAX_NAME_LENGTH = 255
const MAX_INTEGER = 2_147_483_647
const MIN_DURATION = 86_400
const MIN_HEARTBEAT_DURATION = 60
const MAX_CHECK_IN_INTERVAL_COUNT = 365
const MAX_METADATA_KEYS = 64
const LEGACY_SCHEME = "LEGACY_ENCRYPT"

type AttributeType = "string" | "integer" | "boolean" | "hash"

const ATTRIBUTE_TYPES: Readonly<Record<string, AttributeType>> = {
  name: "string",
  duration: "integer",
  strict: "boolean",
  floating: "boolean",
  usePool: "boolean",
  maxMachines: "integer",
  maxProcesses: "integer",
  maxUsers: "integer",
  maxCores: "integer",
  maxMemory: "integer",
  maxDisk: "integer",
  maxUses: "integer",
  machineUniquenessStrategy: "string",
  machineMatchingStrategy: "string",
  componentUniquenessStrategy: "string",
  componentMatchingStrategy: "string",
  expirationStrategy: "string",
  expirationBasis: "string",
  renewalBasis: "string",
  transferStrategy: "string",
  authenticationStrategy: "string",
  machineLeasingStrategy: "string",
  processLeasingStrategy: "string",
  overageStrategy: "string",
  scheme: "string",
  encrypted: "boolean",
  protected: "boolean",
  requireProductScope: "boolean",
  requirePolicyScope: "boolean",
  requireMachineScope: "boolean",
  requireFingerprintScope: "boolean",
  requireComponentsScope: "boolean",
  requireUserScope: "boolean",
  requireChecksumScope: "boolean",
  requireVersionScope: "boolean",
  requireCheckIn: "boolean",
  checkInInterval: "string",
  checkInIntervalCount: "integer",
  heartbeatDuration: "integer",
  heartbeatCullStrategy: "string",
  heartbeatResurrectionStrategy: "string",
  heartbeatBasis: "string",
  requireHeartbeat: "boolean",
  metadata: "hash",
}

const TYPE_CHECKS: Readonly<
  Record<AttributeType, (value: unknown) => boolean>
> = {
  string: (value) => typeof value === "string",
  integer: (value) => typeof value === "number" && Number.isInteger(value),
  boolean: (value) => typeof value === "boolean",
  hash: isRecord,
}

const NULLABLE_ATTRIBUTES = [
  "duration",
  "scheme",
  "checkInInterval",
  "checkInIntervalCount",
  "maxMachines",
  "maxProcesses",
  "maxUsers",
  "maxCores",
  "maxMemory",
  "maxDisk",
  "maxUses",
  "heartbeatDuration",
]
const CREATE_ONLY_ATTRIBUTES = ["scheme", "encrypted", "usePool"]
const CREATE_ATTRIBUTES = Object.keys(ATTRIBUTE_TYPES)
const UPDATE_ATTRIBUTES = CREATE_ATTRIBUTES.filter(
  (key) => !CREATE_ONLY_ATTRIBUTES.includes(key),
)
const SERIALIZED_ATTRIBUTES = CREATE_ATTRIBUTES.filter(
  (key) => key !== "metadata",
)

const STRATEGY_VALUES: Readonly<Record<string, readonly string[]>> = {
  machineUniquenessStrategy: [
    "UNIQUE_PER_ACCOUNT",
    "UNIQUE_PER_PRODUCT",
    "UNIQUE_PER_POLICY",
    "UNIQUE_PER_LICENSE",
  ],
  machineMatchingStrategy: [
    "MATCH_ANY",
    "MATCH_TWO",
    "MATCH_MOST",
    "MATCH_ALL",
  ],
  componentUniquenessStrategy: [
    "UNIQUE_PER_ACCOUNT",
    "UNIQUE_PER_PRODUCT",
    "UNIQUE_PER_POLICY",
    "UNIQUE_PER_LICENSE",
    "UNIQUE_PER_MACHINE",
  ],
  componentMatchingStrategy: [
    "MATCH_ANY",
    "MATCH_TWO",
    "MATCH_MOST",
    "MATCH_ALL",
  ],
  expirationStrategy: [
    "RESTRICT_ACCESS",
    "REVOKE_ACCESS",
    "MAINTAIN_ACCESS",
    "ALLOW_ACCESS",
  ],
  expirationBasis: [
    "FROM_CREATION",
    "FROM_FIRST_VALIDATION",
    "FROM_FIRST_ACTIVATION",
    "FROM_FIRST_DOWNLOAD",
    "FROM_FIRST_USE",
  ],
  renewalBasis: ["FROM_EXPIRY", "FROM_NOW", "FROM_NOW_IF_EXPIRED"],
  transferStrategy: ["KEEP_EXPIRY", "RESET_EXPIRY"],
  authenticationStrategy: ["TOKEN", "LICENSE", "SESSION", "MIXED", "NONE"],
  heartbeatCullStrategy: ["DEACTIVATE_DEAD", "KEEP_DEAD"],
  heartbeatResurrectionStrategy: [
    "NO_REVIVE",
    "1_MINUTE_REVIVE",
    "2_MINUTE_REVIVE",
    "5_MINUTE_REVIVE",
    "10_MINUTE_REVIVE",
    "15_MINUTE_REVIVE",
    "ALWAYS_REVIVE",
  ],
  heartbeatBasis: ["FROM_CREATION", "FROM_FIRST_PING"],
  machineLeasingStrategy: ["PER_LICENSE", "PER_USER"],
  processLeasingStrategy: ["PER_MACHINE", "PER_LICENSE", "PER_USER"],
  overageStrategy: [
    "NO_OVERAGE",
    "ALWAYS_ALLOW_OVERAGE",
    "ALLOW_1_25X_OVERAGE",
    "ALLOW_1_5X_OVERAGE",
    "ALLOW_2X_OVERAGE",
  ],
}

const STRATEGY_DEFAULTS: Readonly<Record<string, string>> = {
  machineUniquenessStrategy: "UNIQUE_PER_LICENSE",
  machineMatchingStrategy: "MATCH_ANY",
  componentUniquenessStrategy: "UNIQUE_PER_MACHINE",
  componentMatchingStrategy: "MATCH_ANY",
  expirationStrategy: "RESTRICT_ACCESS",
  expirationBasis: "FROM_CREATION",
  renewalBasis: "FROM_EXPIRY",
  transferStrategy: "KEEP_EXPIRY",
  authenticationStrategy: "TOKEN",
  heartbeatCullStrategy: "DEACTIVATE_DEAD",
  heartbeatResurrectionStrategy: "NO_REVIVE",
  machineLeasingStrategy: "PER_LICENSE",
  processLeasingStrategy: "PER_MACHINE",
  overageStrategy: "NO_OVERAGE",
}

const CRYPTO_SCHEMES = [
  LEGACY_SCHEME,
  "RSA_2048_PKCS1_ENCRYPT",
  "RSA_2048_PKCS1_SIGN",
  "RSA_2048_PKCS1_PSS_SIGN",
  "RSA_2048_JWT_RS256",
  "RSA_2048_PKCS1_SIGN_V2",
  "RSA_2048_PKCS1_PSS_SIGN_V2",
  "ED25519_SIGN",
  "ECDSA_P256_SIGN",
]
const CHECK_IN_INTERVALS = ["day", "week", "month", "year"]
const OVERAGE_DIVISORS: Readonly<Record<string, number>> = {
  ALLOW_1_25X_OVERAGE: 4,
  ALLOW_1_5X_OVERAGE: 2,
}
const OVERAGE_LIMITS = [
  "maxMachines",
  "maxCores",
  "maxMemory",
  "maxDisk",
  "maxProcesses",
  "maxUsers",
]

const policies = () => mockStore.table(TYPE)
const products = () => mockStore.table("products")
const policyEntitlements = () => mockStore.table("policy-entitlements")

export function serializeMockPolicy(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const self = resourcePath(ctx, TYPE, row.id)

  return resource(
    ctx,
    row,
    {
      ...Object.fromEntries(
        SERIALIZED_ATTRIBUTES.map((key): [string, unknown] => [
          key,
          row.attributes[key] ?? null,
        ]),
      ),
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      product: toOne(ctx, row.refs.product, `${self}/product`),
      pool: toMany(`${self}/pool`),
      licenses: toMany(`${self}/licenses`),
      entitlements: toMany(`${self}/entitlements`),
    },
  )
}

registerMockSerializer(TYPE, serializeMockPolicy)

registerMockDestroyer(TYPE, (ctx, row) => {
  destroyMockWhere(
    ctx,
    "licenses",
    (license) => license.refs.policy?.id === row.id,
  )
  for (const join of policyEntitlements().where(
    (candidate) => candidate.refs.policy?.id === row.id,
  )) {
    policyEntitlements().delete(join.id)
  }

  policies().delete(row.id)
  emitMockEvent(ctx, "policy.deleted", { resource: row })
})

function humanize(attribute: string): string {
  return attribute.replace(/([A-Z])/g, (letter) => ` ${letter.toLowerCase()}`)
}

function integerAttribute(
  attributes: Record<string, unknown>,
  key: string,
): number | null {
  const value = attributes[key]
  return typeof value === "number" ? value : null
}

function validateMetadata(metadata: unknown): Record<string, unknown> {
  if (isRecord(metadata) && Object.keys(metadata).length > MAX_METADATA_KEYS) {
    rejectAttribute(
      "metadata",
      "TOO_LONG",
      `too many keys (exceeded limit of ${MAX_METADATA_KEYS} keys)`,
    )
  }
  return normalizeMetadata(metadata)
}

function readAttributes(
  ctx: MockContext,
  permitted: readonly string[],
): Record<string, unknown> {
  const changes: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(bodyAttributes(ctx))) {
    if (!permitted.includes(key)) fail(unpermittedAttribute(key))
    if (value === null) {
      if (NULLABLE_ATTRIBUTES.includes(key)) changes[key] = null
      continue
    }

    const expected = ATTRIBUTE_TYPES[key]
    if (!TYPE_CHECKS[expected](value)) {
      fail(
        badRequest(
          `type mismatch (received ${receivedType(value)} expected ${expected})`,
          { pointer: `/data/attributes/${key}` },
        ),
      )
    }

    changes[key] = key === "metadata" ? validateMetadata(value) : value
  }

  return changes
}

function accountProtected(ctx: MockContext): boolean {
  const value = ctx.account?.attributes.protected
  return typeof value === "boolean" ? value : true
}

function createDefault(
  ctx: MockContext,
  key: string,
  requireHeartbeat: boolean,
): unknown {
  if (key === "protected") return accountProtected(ctx)
  if (key === "metadata") return {}
  if (key === "heartbeatBasis") {
    return requireHeartbeat ? "FROM_CREATION" : "FROM_FIRST_PING"
  }
  if (key in STRATEGY_DEFAULTS) return STRATEGY_DEFAULTS[key]
  if (ATTRIBUTE_TYPES[key] === "boolean") return false
  return null
}

function applyCreateDefaults(
  ctx: MockContext,
  changes: Record<string, unknown>,
): Record<string, unknown> {
  const requireHeartbeat = changes.requireHeartbeat === true
  const attributes: Record<string, unknown> = {}

  for (const key of CREATE_ATTRIBUTES) {
    attributes[key] =
      key in changes ? changes[key] : createDefault(ctx, key, requireHeartbeat)
  }

  if (attributes.encrypted === true && attributes.scheme == null) {
    attributes.scheme = LEGACY_SCHEME
  }
  if (attributes.floating !== true) attributes.maxMachines = 1

  return attributes
}

function requireProduct(ctx: MockContext): MockRow {
  const { linkage } = bodyRelationship(ctx, "product")
  const product = linkage ? visible(ctx, products(), linkage.id) : undefined
  if (!product) {
    fail(unprocessable(relationshipError("product", "NOT_FOUND", "must exist")))
  }
  return product
}

function validateName(name: unknown): void {
  if (typeof name !== "string" || name.trim() === "") {
    rejectAttribute("name", "MISSING", "can't be blank")
  }
  if (name.length > MAX_NAME_LENGTH) {
    rejectAttribute(
      "name",
      "TOO_LONG",
      `is too long (maximum is ${MAX_NAME_LENGTH} characters)`,
    )
  }
}

function validateLimits(attributes: Record<string, unknown>): void {
  const floating = attributes.floating === true

  const duration = integerAttribute(attributes, "duration")
  if (duration != null) {
    if (duration <= 0) {
      rejectAttribute("duration", "INVALID", "must be greater than 0")
    }
    if (duration > MAX_INTEGER) {
      rejectAttribute(
        "duration",
        "INVALID",
        `must be less than or equal to ${MAX_INTEGER}`,
      )
    }
    if (duration < MIN_DURATION) {
      rejectAttribute(
        "duration",
        "INVALID",
        `must be greater than or equal to ${MIN_DURATION} (1 day)`,
      )
    }
  }

  const heartbeatDuration = integerAttribute(attributes, "heartbeatDuration")
  if (heartbeatDuration != null) {
    if (heartbeatDuration <= 0) {
      rejectAttribute("heartbeatDuration", "INVALID", "must be greater than 0")
    }
    if (heartbeatDuration > MAX_INTEGER) {
      rejectAttribute(
        "heartbeatDuration",
        "INVALID",
        `must be less than or equal to ${MAX_INTEGER}`,
      )
    }
    if (heartbeatDuration < MIN_HEARTBEAT_DURATION) {
      rejectAttribute(
        "heartbeatDuration",
        "INVALID",
        `must be greater than or equal to ${MIN_HEARTBEAT_DURATION} (1 minute)`,
      )
    }
  }

  const maxMachines = integerAttribute(attributes, "maxMachines")
  if (maxMachines != null) {
    if (maxMachines < 0) {
      rejectAttribute(
        "maxMachines",
        "INVALID",
        "must be greater than or equal to 0",
      )
    }
    if (floating && maxMachines < 1) {
      rejectAttribute(
        "maxMachines",
        "INVALID",
        "must be greater than or equal to 1 for floating policy",
      )
    }
    if (!floating && maxMachines !== 1) {
      rejectAttribute(
        "maxMachines",
        "INVALID",
        "must be equal to 1 for non-floating policy",
      )
    }
  }

  for (const key of ["maxCores", "maxMemory", "maxDisk"]) {
    const value = integerAttribute(attributes, key)
    if (value != null && value < 1) {
      rejectAttribute(key, "INVALID", "must be greater than or equal to 1")
    }
  }

  for (const key of ["maxProcesses", "maxUsers"]) {
    const value = integerAttribute(attributes, key)
    if (value != null && value <= 0) {
      rejectAttribute(key, "INVALID", "must be greater than 0")
    }
  }

  const maxUses = integerAttribute(attributes, "maxUses")
  if (maxUses != null && maxUses < 0) {
    rejectAttribute("maxUses", "INVALID", "must be greater than or equal to 0")
  }
}

function validateCheckIn(attributes: Record<string, unknown>): void {
  if (attributes.requireCheckIn !== true) return

  const interval = attributes.checkInInterval
  if (typeof interval !== "string" || !CHECK_IN_INTERVALS.includes(interval)) {
    rejectAttribute(
      "checkInInterval",
      "NOT_ALLOWED",
      `must be one of: ${CHECK_IN_INTERVALS.join(", ")}`,
    )
  }

  const count = integerAttribute(attributes, "checkInIntervalCount")
  if (count == null || count < 1 || count > MAX_CHECK_IN_INTERVAL_COUNT) {
    rejectAttribute(
      "checkInIntervalCount",
      "NOT_ALLOWED",
      `must be a number between 1 and ${MAX_CHECK_IN_INTERVAL_COUNT} inclusive`,
    )
  }
}

function validateScheme(attributes: Record<string, unknown>): void {
  const scheme = attributes.scheme
  const encrypted = attributes.encrypted === true

  if (encrypted && scheme !== LEGACY_SCHEME) {
    rejectAttribute(
      "scheme",
      "NOT_ALLOWED",
      "unsupported encryption scheme (scheme must be LEGACY_ENCRYPT for legacy encrypted policies)",
    )
  }
  if (typeof scheme === "string" && !CRYPTO_SCHEMES.includes(scheme)) {
    rejectAttribute("scheme", "NOT_ALLOWED", "unsupported signing scheme")
  }
  if (!encrypted && scheme === LEGACY_SCHEME) {
    rejectAttribute(
      "scheme",
      "INVALID",
      "must be encrypted when using LEGACY_ENCRYPT scheme",
    )
  }
}

function validateStrategies(attributes: Record<string, unknown>): void {
  for (const [key, values] of Object.entries(STRATEGY_VALUES)) {
    const value = attributes[key]
    if (typeof value === "string" && !values.includes(value)) {
      rejectAttribute(key, "NOT_ALLOWED", `unsupported ${humanize(key)}`)
    }
  }

  if (
    attributes.heartbeatResurrectionStrategy === "ALWAYS_REVIVE" &&
    attributes.heartbeatCullStrategy !== "KEEP_DEAD"
  ) {
    rejectAttribute(
      "heartbeatCullStrategy",
      "NOT_ALLOWED",
      "incompatible heartbeat cull strategy (must be KEEP_DEAD when resurrection strategy is ALWAYS_REVIVE)",
    )
  }
}

function validateOverage(attributes: Record<string, unknown>): void {
  const strategy = attributes.overageStrategy
  if (typeof strategy !== "string" || !(strategy in OVERAGE_DIVISORS)) return

  const divisor = OVERAGE_DIVISORS[strategy]
  if (attributes.floating !== true) {
    rejectAttribute(
      "overageStrategy",
      "NOT_ALLOWED",
      `incompatible overage strategy (cannot use ${strategy} for node-locked policy)`,
    )
  }

  for (const key of OVERAGE_LIMITS) {
    const value = integerAttribute(attributes, key) ?? 0
    if (value % divisor !== 0) {
      rejectAttribute(
        "overageStrategy",
        "NOT_ALLOWED",
        `incompatible overage strategy (cannot use ${strategy} with a ${humanize(key)} value not divisible by ${divisor})`,
      )
    }
  }
}

function validatePool(attributes: Record<string, unknown>): void {
  if (attributes.usePool !== true) return

  if (attributes.encrypted === true) {
    rejectAttribute(
      "encrypted",
      "NOT_SUPPORTED",
      "cannot be encrypted and use a pool",
    )
  }
  if (typeof attributes.scheme === "string") {
    rejectAttribute(
      "scheme",
      "NOT_SUPPORTED",
      "cannot use a scheme and use a pool",
    )
  }
}

function validatePolicy(attributes: Record<string, unknown>): void {
  validateName(attributes.name)
  validateLimits(attributes)
  validateCheckIn(attributes)
  validateScheme(attributes)
  validateStrategies(attributes)
  validateOverage(attributes)
  validatePool(attributes)
}

mockRoute("GET", `${MOCK_ACCOUNT}/policies`, (ctx) => {
  const product = ctx.query.get("product")
  const rows = scoped(ctx, policies().all()).filter(
    (row) => !product || row.refs.product?.id === product,
  )
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockPolicy(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/policies/:id`, (ctx) => {
  const row = requireVisible(ctx, policies(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockPolicy(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/policies`, (ctx) => {
  const changes = readAttributes(ctx, CREATE_ATTRIBUTES)
  const product = requireProduct(ctx)
  const attributes = applyCreateDefaults(ctx, changes)
  validatePolicy(attributes)

  const row = makeMockRow(TYPE, uuid(), attributes, {
    ...baseRefs(ctx),
    product: { type: "products", id: product.id },
  })
  policies().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "policy.created", { resource: row })

  return {
    status: 201,
    body: { data: serializeMockPolicy(ctx, row) },
    headers: { Location: resourcePath(ctx, TYPE, row.id) },
  }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/policies/:id`, (ctx) => {
  const row = requireVisible(ctx, policies(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const changes = readAttributes(ctx, UPDATE_ATTRIBUTES)
  validatePolicy({ ...row.attributes, ...changes })

  const before = { ...row.attributes }
  const changed = Object.entries(changes).some(
    ([key, value]) => JSON.stringify(before[key]) !== JSON.stringify(value),
  )
  policies().patch(row.id, { attributes: changes }, { touch: changed })

  emitMockEvent(ctx, "policy.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockPolicy(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/policies/:id`, (ctx) => {
  const row = requireVisible(ctx, policies(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})
