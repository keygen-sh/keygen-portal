import {
  MOCK_ACCOUNT,
  assertWritable,
  badRequest,
  baseRefs,
  bodyAttributes,
  bodyRelationship,
  bodyRelationships,
  type MockContext,
  destroyMock,
  diffMetadata,
  emitMockEvent,
  environmentRelationship,
  fail,
  inAccount,
  isRecord,
  type Linkage,
  makeMockRow,
  normalizeMetadata,
  notFound,
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
  type MockResult,
  mockRoute,
  type MockRow,
  scoped,
  serializeMock,
  mockStore,
  toOne,
  unpermittedAttribute,
  unprocessable,
  uuid,
  visible,
} from "@/demo/server"

const TYPE = "components"
const LABEL = "machine component"
const RESERVED_FINGERPRINTS = ["actions", "action"]
const MAX_FINGERPRINT_LENGTH = 4096
const MAX_NAME_LENGTH = 255
const MAX_METADATA_KEYS = 64
const MAX_METADATA_BYTES = 16_384
const MAX_METADATA_DEPTH = 2
const CREATE_ATTRIBUTES = ["name", "fingerprint", "metadata"]
const UPDATE_ATTRIBUTES = ["name", "metadata"]
const DEFAULT_UNIQUENESS_STRATEGY = "UNIQUE_PER_MACHINE"

const UNIQUENESS_DETAILS: Readonly<Record<string, string>> = {
  UNIQUE_PER_MACHINE: "has already been taken",
  UNIQUE_PER_LICENSE: "has already been taken for this license",
  UNIQUE_PER_POLICY: "has already been taken for this policy",
  UNIQUE_PER_PRODUCT: "has already been taken for this product",
  UNIQUE_PER_ACCOUNT: "has already been taken for this account",
}

interface ListFilters {
  machine: string | null
  license: string | null
  product: string | null
  owner: string | null
  user: string | null
}

interface Lineage {
  machine: MockRow | undefined
  license: MockRow | undefined
  policy: MockRow | undefined
}

const components = () => mockStore.table(TYPE)
const machines = () => mockStore.table("machines")
const licenses = () => mockStore.table("licenses")
const policies = () => mockStore.table("policies")
const licenseUsers = () => mockStore.table("license-users")

function machineOf(row: MockRow): MockRow | undefined {
  const id = row.refs.machine?.id
  return id == null ? undefined : machines().get(id)
}

export function licenseOf(machine: MockRow | undefined): MockRow | undefined {
  const id = machine?.refs.license?.id
  return id == null ? undefined : licenses().get(id)
}

export function policyOf(license: MockRow | undefined): MockRow | undefined {
  const id = license?.refs.policy?.id
  return id == null ? undefined : policies().get(id)
}

export function lineageOf(row: MockRow): Lineage {
  const machine = machineOf(row)
  const license = licenseOf(machine)
  const policy = policyOf(license)
  return { machine, license, policy }
}

export function serializeMockComponent(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const self = resourcePath(ctx, TYPE, row.id)
  const { machine, policy } = lineageOf(row)

  return resource(
    ctx,
    row,
    {
      fingerprint: row.attributes.fingerprint,
      name: row.attributes.name,
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      product: toOne(ctx, policy?.refs.product, `${self}/product`),
      license: toOne(ctx, machine?.refs.license, `${self}/license`),
      machine: toOne(ctx, row.refs.machine, `${self}/machine`),
    },
  )
}

registerMockSerializer(TYPE, serializeMockComponent)

registerMockDestroyer(TYPE, (ctx, row) => {
  components().delete(row.id)
  emitMockEvent(ctx, "component.deleted", { resource: row })
})

export function readAttributes(
  ctx: MockContext,
  permitted: readonly string[],
): Record<string, unknown> {
  const attributes: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(bodyAttributes(ctx))) {
    if (!permitted.includes(key)) fail(unpermittedAttribute(key))
    attributes[key] = value
  }

  return attributes
}

export function rejectRelationships(ctx: MockContext): void {
  const names = Object.keys(bodyRelationships(ctx))
  if (names.length === 0) return

  fail(
    badRequest("unpermitted parameter", {
      pointer: `/data/relationships/${names[0]}`,
    }),
  )
}

function validateText(
  attribute: string,
  value: unknown,
  maxLength: number,
): string {
  const pointer = `/data/attributes/${attribute}`

  if (value === undefined) fail(badRequest("is missing", { pointer }))
  if (typeof value !== "string") {
    fail(
      badRequest(
        `type mismatch (received ${receivedType(value)} expected string)`,
        { pointer },
      ),
    )
  }
  if (value.trim() === "") {
    rejectAttribute(attribute, "MISSING", "can't be blank")
  }
  if (value.length > maxLength) {
    rejectAttribute(
      attribute,
      "TOO_LONG",
      `is too long (maximum is ${maxLength} characters)`,
    )
  }

  return value
}

function validateFingerprint(value: unknown): string {
  const fingerprint = validateText("fingerprint", value, MAX_FINGERPRINT_LENGTH)
  if (RESERVED_FINGERPRINTS.includes(fingerprint.toLowerCase())) {
    rejectAttribute("fingerprint", "NOT_ALLOWED", "is reserved")
  }
  return fingerprint
}

function metadataDepth(value: unknown): number {
  if (!isRecord(value)) return 0
  return 1 + Math.max(0, ...Object.values(value).map(metadataDepth))
}

export function validateMetadata(value: unknown): Record<string, unknown> {
  if (value === undefined || value === null) return {}

  const pointer = "/data/attributes/metadata"
  if (!isRecord(value)) {
    fail(
      badRequest(
        `type mismatch (received ${receivedType(value)} expected hash)`,
        { pointer },
      ),
    )
  }
  if (metadataDepth(value) > MAX_METADATA_DEPTH) {
    fail(
      badRequest(
        `cannot have more than ${MAX_METADATA_DEPTH} levels of nesting`,
        { pointer },
      ),
    )
  }
  if (Object.keys(value).length > MAX_METADATA_KEYS) {
    rejectAttribute(
      "metadata",
      "TOO_LONG",
      `too many keys (exceeded limit of ${MAX_METADATA_KEYS} keys)`,
    )
  }
  if (JSON.stringify(value).length > MAX_METADATA_BYTES) {
    rejectAttribute(
      "metadata",
      "TOO_LONG",
      `too large (exceeded limit of ${MAX_METADATA_BYTES} bytes)`,
    )
  }

  return normalizeMetadata(value)
}

export function requireMachine(ctx: MockContext): MockRow {
  const { present, linkage } = bodyRelationship(ctx, "machine")
  if (!present) {
    fail(badRequest("is missing", { pointer: "/data/relationships/machine" }))
  }

  const machine = linkage ? visible(ctx, machines(), linkage.id) : undefined
  if (!machine) {
    fail(unprocessable(relationshipError("machine", "NOT_FOUND", "must exist")))
  }

  return machine
}

function uniquenessStrategy(machine: MockRow): string {
  const policy = policyOf(licenseOf(machine))
  const strategy = policy?.attributes.componentUniquenessStrategy
  return typeof strategy === "string" ? strategy : DEFAULT_UNIQUENESS_STRATEGY
}

function uniquenessScopeId(
  strategy: string,
  machine: MockRow | undefined,
): string | null {
  if (!machine) return null
  if (strategy === "UNIQUE_PER_MACHINE") return machine.id

  const license = licenseOf(machine)
  if (strategy === "UNIQUE_PER_LICENSE") return license?.id ?? null

  const policy = policyOf(license)
  if (strategy === "UNIQUE_PER_POLICY") return policy?.id ?? null
  if (strategy === "UNIQUE_PER_PRODUCT") return policy?.refs.product?.id ?? null

  return machine.refs.account?.id ?? null
}

function validateFingerprintUniqueness(
  ctx: MockContext,
  machine: MockRow,
  fingerprint: string,
): void {
  const duplicates = components().where(
    (row) => inAccount(ctx, row) && row.attributes.fingerprint === fingerprint,
  )
  if (duplicates.length === 0) return

  if (duplicates.some((row) => row.refs.machine?.id === machine.id)) {
    rejectAttribute(
      "fingerprint",
      "TAKEN",
      UNIQUENESS_DETAILS[DEFAULT_UNIQUENESS_STRATEGY],
    )
  }

  const strategy = uniquenessStrategy(machine)
  if (strategy === DEFAULT_UNIQUENESS_STRATEGY) return

  const scopeId = uniquenessScopeId(strategy, machine)
  if (scopeId == null) return

  const conflict = duplicates.some(
    (row) => uniquenessScopeId(strategy, machineOf(row)) === scopeId,
  )
  if (conflict) {
    rejectAttribute("fingerprint", "TAKEN", UNIQUENESS_DETAILS[strategy])
  }
}

export function licenseUserIds(license: MockRow | undefined): string[] {
  if (!license) return []

  const licensees = licenseUsers()
    .where((join) => join.refs.license?.id === license.id)
    .map((join) => join.refs.user?.id)
    .filter((id): id is string => id != null)
  const owner = license.refs.owner?.id

  return owner == null ? licensees : [owner, ...licensees]
}

function listFilters(ctx: MockContext): ListFilters {
  return {
    machine: ctx.query.get("machine"),
    license: ctx.query.get("license"),
    product: ctx.query.get("product"),
    owner: ctx.query.get("owner"),
    user: ctx.query.get("user"),
  }
}

function matchesFilters(filters: ListFilters, row: MockRow): boolean {
  const { machine, license, policy } = lineageOf(row)

  if (filters.machine && row.refs.machine?.id !== filters.machine) return false
  if (filters.license && machine?.refs.license?.id !== filters.license) {
    return false
  }
  if (filters.product && policy?.refs.product?.id !== filters.product) {
    return false
  }
  if (filters.owner && machine?.refs.owner?.id !== filters.owner) return false
  if (filters.user && !licenseUserIds(license).includes(filters.user)) {
    return false
  }

  return true
}

export function findMachine(ctx: MockContext, identifier: string): MockRow {
  const byId = machines().get(identifier)
  if (byId) return requireVisible(ctx, machines(), byId.id, "machine")

  const byFingerprint = scoped(ctx, machines().all()).find(
    (row) => row.attributes.fingerprint === identifier,
  )
  if (!byFingerprint) fail(notFound("machine", identifier))
  return byFingerprint
}

export function relatedResponse(
  ctx: MockContext,
  linkage: Linkage | null | undefined,
  label: string,
): MockResult {
  const related = linkage
    ? visible(ctx, mockStore.table(linkage.type), linkage.id)
    : undefined
  if (!related) fail(notFound(label, linkage?.id ?? ctx.params.id))

  return { status: 200, body: { data: serializeMock(ctx, related) } }
}

mockRoute("GET", `${MOCK_ACCOUNT}/components`, (ctx) => {
  const filters = listFilters(ctx)
  const rows = scoped(ctx, components().all()).filter((row) =>
    matchesFilters(filters, row),
  )
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockComponent(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/components/:id`, (ctx) => {
  const row = requireVisible(ctx, components(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockComponent(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/components`, (ctx) => {
  const attributes = readAttributes(ctx, CREATE_ATTRIBUTES)
  const name = validateText("name", attributes.name, MAX_NAME_LENGTH)
  const fingerprint = validateFingerprint(attributes.fingerprint)
  const metadata = validateMetadata(attributes.metadata)
  const machine = requireMachine(ctx)
  validateFingerprintUniqueness(ctx, machine, fingerprint)

  const row = makeMockRow(
    TYPE,
    uuid(),
    { fingerprint, name, metadata },
    {
      ...baseRefs(ctx),
      environment: machine.refs.environment ?? null,
      machine: { type: "machines", id: machine.id },
    },
  )
  components().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "component.created", { resource: row })

  return {
    status: 201,
    body: { data: serializeMockComponent(ctx, row) },
    headers: { Location: resourcePath(ctx, TYPE, row.id) },
  }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/components/:id`, (ctx) => {
  const row = requireVisible(ctx, components(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  rejectRelationships(ctx)
  const attributes = readAttributes(ctx, UPDATE_ATTRIBUTES)
  const changes: Record<string, unknown> = {}

  if ("name" in attributes) {
    changes.name = validateText("name", attributes.name, MAX_NAME_LENGTH)
  }
  if ("metadata" in attributes) {
    changes.metadata = validateMetadata(attributes.metadata)
  }

  const before = { ...row.attributes }
  const changed = Object.entries(changes).some(
    ([key, value]) => JSON.stringify(before[key]) !== JSON.stringify(value),
  )
  components().patch(row.id, { attributes: changes }, { touch: changed })

  emitMockEvent(ctx, "component.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockComponent(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/components/:id`, (ctx) => {
  const row = requireVisible(ctx, components(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

mockRoute("GET", `${MOCK_ACCOUNT}/components/:id/machine`, (ctx) => {
  const row = requireVisible(ctx, components(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return relatedResponse(ctx, row.refs.machine, "machine")
})

mockRoute("GET", `${MOCK_ACCOUNT}/components/:id/license`, (ctx) => {
  const row = requireVisible(ctx, components(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return relatedResponse(ctx, machineOf(row)?.refs.license, "license")
})

mockRoute("GET", `${MOCK_ACCOUNT}/components/:id/product`, (ctx) => {
  const row = requireVisible(ctx, components(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return relatedResponse(ctx, lineageOf(row).policy?.refs.product, "product")
})

mockRoute("GET", `${MOCK_ACCOUNT}/machines/:machineId/components`, (ctx) => {
  const machine = findMachine(ctx, ctx.params.machineId)
  ctx.resource = { type: "machines", id: machine.id }

  const rows = scoped(ctx, components().all()).filter(
    (row) => row.refs.machine?.id === machine.id,
  )
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockComponent(ctx, row)),
  }
})

mockRoute(
  "GET",
  `${MOCK_ACCOUNT}/machines/:machineId/components/:id`,
  (ctx) => {
    const machine = findMachine(ctx, ctx.params.machineId)
    const row = requireVisible(ctx, components(), ctx.params.id, LABEL)
    if (row.refs.machine?.id !== machine.id) fail(notFound(LABEL, row.id))
    ctx.resource = { type: TYPE, id: row.id }

    return { status: 200, body: { data: serializeMockComponent(ctx, row) } }
  },
)
