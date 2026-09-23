import {
  MOCK_ACCOUNT,
  assertWritable,
  attributeError,
  badRequest,
  baseRefs,
  bodyAttributes,
  type MockContext,
  countKeys,
  destroyMock,
  destroyMockWhere,
  diffMetadata,
  emitMockEvent,
  environmentRelationship,
  fail,
  failTooLong,
  failTypeMismatch,
  inAccount,
  isRecord,
  isUuid,
  makeMockRow,
  normalizeMetadata,
  notFound,
  paginateMock,
  receivedType,
  registerMockDestroyer,
  registerMockSerializer,
  type Relationship,
  requireVisible,
  type MockResource,
  resource,
  resourcePath,
  mockRoute,
  type MockRow,
  scoped,
  mockStore,
  toMany,
  unprocessable,
  uuid,
} from "@/demo/server"
import { ProductPermissions } from "@/types/products"

const TYPE = "products"
const LABEL = "product"
const RESERVED_CODES = ["actions", "action"]
const MAX_LENGTH = 255
const MAX_METADATA_BYTES = 16384
const MAX_METADATA_KEYS = 64
const DISTRIBUTION_STRATEGIES = ["LICENSED", "OPEN", "CLOSED"]
const DEFAULT_DISTRIBUTION_STRATEGY = "LICENSED"
const URL_PROTOCOLS = ["http:", "https:"]
const BLOCKED_URL_HOSTS = ["localhost", "keygen.sh"]
const TLD_PATTERN = /\.[a-zA-Z]{2,}$/
const BACKEND_ONLY_PERMISSIONS = [
  "group.users.read",
  "machine.heartbeat.ping",
  "machine.heartbeat.reset",
  "process.heartbeat.ping",
]
const ALLOWED_PERMISSIONS = new Set([
  "*",
  ...ProductPermissions,
  ...BACKEND_ONLY_PERMISSIONS,
])
const RELATED_COLLECTIONS = [
  "policies",
  "licenses",
  "machines",
  "users",
  "tokens",
  "platforms",
  "channels",
  "releases",
  "artifacts",
]

export const DEFAULT_PRODUCT_PERMISSIONS: readonly string[] = [
  ...ProductPermissions,
]

const products = () => mockStore.table(TYPE)
const releases = () => mockStore.table("releases")
const webhookEndpoints = () => mockStore.table("webhook-endpoints")

function relatedCollections(
  ctx: MockContext,
  row: MockRow,
): Record<string, Relationship> {
  const base = resourcePath(ctx, TYPE, row.id)
  const relationships: Record<string, Relationship> = {}
  for (const name of RELATED_COLLECTIONS) {
    relationships[name] = toMany(`${base}/${name}`)
  }
  return relationships
}

export function serializeMockProduct(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return resource(
    ctx,
    row,
    {
      name: row.attributes.name,
      code: row.attributes.code ?? null,
      distributionStrategy:
        row.attributes.distributionStrategy ?? DEFAULT_DISTRIBUTION_STRATEGY,
      url: row.attributes.url ?? null,
      platforms: row.attributes.platforms ?? [],
      permissions: row.attributes.permissions ?? DEFAULT_PRODUCT_PERMISSIONS,
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      ...relatedCollections(ctx, row),
    },
  )
}

registerMockSerializer(TYPE, serializeMockProduct)

registerMockDestroyer(TYPE, (ctx, row) => {
  const ownsProduct = (candidate: MockRow) =>
    candidate.refs.product?.id === row.id

  const releaseIds = new Set(
    releases()
      .where(ownsProduct)
      .map((release) => release.id),
  )

  destroyMockWhere(ctx, "artifacts", (artifact) =>
    releaseIds.has(artifact.refs.release?.id ?? ""),
  )
  destroyMockWhere(ctx, "releases", ownsProduct)
  destroyMockWhere(ctx, "packages", ownsProduct)
  destroyMockWhere(ctx, "policies", ownsProduct)
  destroyMockWhere(
    ctx,
    "tokens",
    (token) =>
      token.refs.bearer?.type === TYPE && token.refs.bearer.id === row.id,
  )

  for (const endpoint of webhookEndpoints().where(ownsProduct)) {
    webhookEndpoints().patch(
      endpoint.id,
      { refs: { product: null } },
      { touch: false },
    )
  }

  products().delete(row.id)
  emitMockEvent(ctx, "product.deleted", { resource: row })
})

function findProduct(ctx: MockContext, identifier: string): MockRow {
  const byId = products().get(identifier)
  if (byId) return requireVisible(ctx, products(), byId.id, LABEL)

  const byCode = scoped(ctx, products().all()).find(
    (row) =>
      typeof row.attributes.code === "string" &&
      row.attributes.code.toLowerCase() === identifier.toLowerCase(),
  )
  if (!byCode) fail(notFound(LABEL, identifier))
  return byCode
}

function validateName(name: unknown): string {
  if (name === undefined) {
    fail(badRequest("is missing", { pointer: "/data/attributes/name" }))
  }
  if (name !== null && typeof name !== "string") {
    failTypeMismatch("name", name, "string")
  }
  if (name === null || name.trim() === "") {
    fail(unprocessable(attributeError("name", "MISSING", "can't be blank")))
  }
  if (name.length > MAX_LENGTH) failTooLong("name", MAX_LENGTH)
  return name
}

function validateCode(
  ctx: MockContext,
  code: unknown,
  excludeId?: string,
): string | null {
  if (code === undefined || code === null) return null
  if (typeof code !== "string") failTypeMismatch("code", code, "string")
  if (code.trim() === "") {
    fail(badRequest("cannot be blank", { pointer: "/data/attributes/code" }))
  }
  if (code.length > MAX_LENGTH) failTooLong("code", MAX_LENGTH)
  if (isUuid(code)) {
    fail(unprocessable(attributeError("code", "INVALID", "is invalid")))
  }
  if (RESERVED_CODES.includes(code.toLowerCase())) {
    fail(unprocessable(attributeError("code", "NOT_ALLOWED", "is reserved")))
  }

  const taken = products().find(
    (row) =>
      row.id !== excludeId &&
      inAccount(ctx, row) &&
      typeof row.attributes.code === "string" &&
      row.attributes.code.toLowerCase() === code.toLowerCase(),
  )
  if (taken) {
    fail(
      unprocessable(attributeError("code", "TAKEN", "has already been taken")),
    )
  }

  return code
}

function isBlockedHost(host: string): boolean {
  return BLOCKED_URL_HOSTS.some(
    (blocked) => host === blocked || host.endsWith(`.${blocked}`),
  )
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function validateUrl(url: unknown): string | null {
  if (url === undefined || url === null) return null
  if (typeof url !== "string") failTypeMismatch("url", url, "string")
  if (url.length > MAX_LENGTH) failTooLong("url", MAX_LENGTH)

  const parsed = parseUrl(url)
  if (!parsed) {
    fail(unprocessable(attributeError("url", "INVALID", "must be a valid URL")))
  }

  if (!URL_PROTOCOLS.includes(parsed.protocol)) {
    fail(
      unprocessable(
        attributeError(
          "url",
          "PROTOCOL_INVALID",
          "must be a valid URL using one of the following protocols: https, http",
        ),
      ),
    )
  }

  const host = parsed.hostname.toLowerCase()
  if (host === "" || isBlockedHost(host) || !TLD_PATTERN.test(host)) {
    fail(
      unprocessable(
        attributeError(
          "url",
          "HOST_INVALID",
          "must be a URL with a valid host",
        ),
      ),
    )
  }

  return url
}

function validateDistributionStrategy(strategy: unknown): string {
  if (strategy === undefined || strategy === null) {
    return DEFAULT_DISTRIBUTION_STRATEGY
  }
  if (typeof strategy !== "string") {
    failTypeMismatch("distributionStrategy", strategy, "string")
  }
  if (!DISTRIBUTION_STRATEGIES.includes(strategy)) {
    fail(
      unprocessable(
        attributeError(
          "distributionStrategy",
          "NOT_ALLOWED",
          "unsupported distribution strategy",
        ),
      ),
    )
  }
  return strategy
}

function validateStringList(attribute: string, value: unknown): string[] {
  if (!Array.isArray(value)) failTypeMismatch(attribute, value, "array")

  const items: unknown[] = value
  return items.map((item, index) => {
    if (typeof item !== "string") {
      fail(
        badRequest(
          `type mismatch (received ${receivedType(item)} expected string)`,
          { pointer: `/data/attributes/${attribute}/${index}` },
        ),
      )
    }
    return item
  })
}

function validatePlatforms(platforms: unknown): string[] {
  if (platforms === undefined || platforms === null) return []
  return validateStringList("platforms", platforms)
}

function validatePermissions(permissions: unknown): string[] {
  if (permissions === undefined || permissions === null) {
    return [...DEFAULT_PRODUCT_PERMISSIONS]
  }

  const actions = [...new Set(validateStringList("permissions", permissions))]
  if (actions.some((action) => !ALLOWED_PERMISSIONS.has(action))) {
    fail(
      unprocessable(
        attributeError("permissions", "NOT_ALLOWED", "unsupported permissions"),
      ),
    )
  }

  return actions
}

function validateMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata === undefined || metadata === null) return {}
  if (!isRecord(metadata)) failTypeMismatch("metadata", metadata, "object")

  if (JSON.stringify(metadata).length > MAX_METADATA_BYTES) {
    fail(
      unprocessable(
        attributeError(
          "metadata",
          "TOO_LONG",
          `too large (exceeded limit of ${MAX_METADATA_BYTES} bytes)`,
        ),
      ),
    )
  }
  if (countKeys(metadata) > MAX_METADATA_KEYS) {
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

mockRoute("GET", `${MOCK_ACCOUNT}/products`, (ctx) => {
  const rows = scoped(ctx, products().all())
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockProduct(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/products/:id`, (ctx) => {
  const row = findProduct(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockProduct(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/products`, (ctx) => {
  const attributes = bodyAttributes(ctx)
  const name = validateName(attributes.name)
  const code = validateCode(ctx, attributes.code)
  const distributionStrategy = validateDistributionStrategy(
    attributes.distributionStrategy,
  )
  const url = validateUrl(attributes.url)
  const platforms = validatePlatforms(attributes.platforms)
  const permissions = validatePermissions(attributes.permissions)
  const metadata = validateMetadata(attributes.metadata)

  const row = makeMockRow(
    TYPE,
    uuid(),
    { name, code, distributionStrategy, url, platforms, permissions, metadata },
    baseRefs(ctx),
  )
  products().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "product.created", { resource: row })

  return { status: 201, body: { data: serializeMockProduct(ctx, row) } }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/products/:id`, (ctx) => {
  const row = findProduct(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = bodyAttributes(ctx)
  const changes: Record<string, unknown> = {}

  if ("name" in attributes) changes.name = validateName(attributes.name)
  if ("code" in attributes) {
    changes.code = validateCode(ctx, attributes.code, row.id)
  }
  if ("distributionStrategy" in attributes) {
    changes.distributionStrategy = validateDistributionStrategy(
      attributes.distributionStrategy,
    )
  }
  if ("url" in attributes) changes.url = validateUrl(attributes.url)
  if ("platforms" in attributes) {
    changes.platforms = validatePlatforms(attributes.platforms)
  }
  if ("permissions" in attributes && attributes.permissions !== null) {
    changes.permissions = validatePermissions(attributes.permissions)
  }
  if ("metadata" in attributes) {
    changes.metadata = validateMetadata(attributes.metadata)
  }

  const before = { ...row.attributes }
  products().patch(
    row.id,
    { attributes: changes },
    { touch: Object.keys(changes).length > 0 },
  )

  emitMockEvent(ctx, "product.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockProduct(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/products/:id`, (ctx) => {
  const row = findProduct(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})
