import {
  MOCK_ACCOUNT,
  assertWritable,
  attributeError,
  badRequest,
  baseRefs,
  bodyAttributes,
  bodyRelationship,
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
  registerMockDestroyer,
  registerMockSerializer,
  relationshipError,
  requireVisible,
  type MockResource,
  resource,
  resourcePath,
  mockRoute,
  type MockRow,
  scoped,
  mockStore,
  toOne,
  unpermittedAttribute,
  unprocessable,
  uuid,
} from "@/demo/server"
import { upsertLookup } from "./platforms"

const TYPE = "packages"
const LABEL = "release package"
const RESERVED_KEYS = ["actions", "action"]
const MAX_LENGTH = 255
const MAX_METADATA_BYTES = 16384
const MAX_METADATA_KEYS = 64
const PYPI_SEPARATORS = /[-_.]+/g
const PERMITTED_ATTRIBUTES = ["name", "key", "engine", "metadata"]

export const PACKAGE_ENGINES = [
  "pypi",
  "tauri",
  "rubygems",
  "npm",
  "oci",
  "raw",
]

const packages = () => mockStore.table(TYPE)
const products = () => mockStore.table("products")

export function serializeMockPackage(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return resource(
    ctx,
    row,
    {
      name: row.attributes.name,
      key: row.attributes.key,
      engine: row.attributes.engine ?? null,
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      product: toOne(ctx, row.refs.product),
    },
    { links: { related: resourcePath(ctx, TYPE, row.id) } },
  )
}

registerMockSerializer(TYPE, serializeMockPackage)

registerMockDestroyer(TYPE, (ctx, row) => {
  destroyMockWhere(
    ctx,
    "releases",
    (release) => release.refs.package?.id === row.id,
  )

  packages().delete(row.id)
  emitMockEvent(ctx, "package.deleted", { resource: row })
})

export function resolveLookupKey(
  ctx: MockContext,
  type: "channels" | "engines",
  identifier: string,
): string | null {
  if (!isUuid(identifier)) return identifier.trim().toLowerCase()

  const row = mockStore.table(type).get(identifier)
  if (!row || !inAccount(ctx, row)) return null
  return typeof row.attributes.key === "string" ? row.attributes.key : null
}

export function requireProduct(ctx: MockContext): MockRow {
  const { present, linkage } = bodyRelationship(ctx, "product")
  if (!present) {
    fail(badRequest("is missing", { pointer: "/data/relationships/product" }))
  }
  if (!linkage) {
    fail(
      badRequest("is missing", {
        pointer: "/data/relationships/product/data",
      }),
    )
  }
  if (!isUuid(linkage.id)) {
    fail(
      badRequest("must be a valid UUID", {
        pointer: "/data/relationships/product/data/id",
      }),
    )
  }

  const product = products().get(linkage.id)
  if (!product || !inAccount(ctx, product)) {
    fail(unprocessable(relationshipError("product", "NOT_FOUND", "must exist")))
  }

  const productEnvironment = product.refs.environment?.id ?? null
  if (
    productEnvironment != null &&
    productEnvironment !== ctx.environment?.id
  ) {
    fail(
      unprocessable(
        relationshipError(
          "environment",
          "NOT_ALLOWED",
          "must be compatible with product environment",
        ),
      ),
    )
  }

  return product
}

function findPackage(ctx: MockContext, identifier: string): MockRow {
  const byId = packages().get(identifier)
  if (byId) return requireVisible(ctx, packages(), byId.id, LABEL)

  const byKey = scoped(ctx, packages().all()).find(
    (row) => row.attributes.key === identifier,
  )
  if (!byKey) fail(notFound(LABEL, identifier))
  return byKey
}

function permittedAttributes(ctx: MockContext): Record<string, unknown> {
  const attributes = bodyAttributes(ctx)
  for (const key of Object.keys(attributes)) {
    if (!PERMITTED_ATTRIBUTES.includes(key)) fail(unpermittedAttribute(key))
  }
  return attributes
}

function validateName(name: unknown): string {
  if (name === undefined) {
    fail(badRequest("is missing", { pointer: "/data/attributes/name" }))
  }
  if (typeof name !== "string") failTypeMismatch("name", name, "string")
  if (name.trim() === "") {
    fail(unprocessable(attributeError("name", "MISSING", "can't be blank")))
  }
  if (name.length > MAX_LENGTH) failTooLong("name", MAX_LENGTH)
  return name
}

function validateEngine(engine: unknown): string | null {
  if (engine === undefined || engine === null) return null
  if (typeof engine !== "string" || !PACKAGE_ENGINES.includes(engine)) {
    fail(badRequest("is invalid", { pointer: "/data/attributes/engine" }))
  }
  return engine
}

function normalizeKey(key: string, engine: string | null): string {
  return engine === "pypi" ? key.replace(PYPI_SEPARATORS, "-") : key
}

function validateKey(
  ctx: MockContext,
  key: unknown,
  engine: string | null,
  excludeId?: string,
): string {
  if (key === undefined) {
    fail(badRequest("is missing", { pointer: "/data/attributes/key" }))
  }
  if (typeof key !== "string") failTypeMismatch("key", key, "string")
  if (key.trim() === "") {
    fail(unprocessable(attributeError("key", "MISSING", "can't be blank")))
  }
  if (key.length > MAX_LENGTH) failTooLong("key", MAX_LENGTH)
  if (isUuid(key)) {
    fail(unprocessable(attributeError("key", "INVALID", "is invalid")))
  }
  if (RESERVED_KEYS.includes(key.toLowerCase())) {
    fail(unprocessable(attributeError("key", "NOT_ALLOWED", "is reserved")))
  }

  const normalized = normalizeKey(key, engine)
  const taken = packages().find(
    (row) =>
      row.id !== excludeId &&
      inAccount(ctx, row) &&
      row.attributes.key === normalized,
  )
  if (taken) {
    fail(unprocessable(attributeError("key", "TAKEN", "already exists")))
  }

  return normalized
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

function currentEngine(row: MockRow): string | null {
  return typeof row.attributes.engine === "string"
    ? row.attributes.engine
    : null
}

mockRoute("GET", `${MOCK_ACCOUNT}/packages`, (ctx) => {
  const product = ctx.query.get("product")
  const engine = ctx.query.get("engine")
  const engineKey =
    engine == null || engine === ""
      ? null
      : resolveLookupKey(ctx, "engines", engine)

  const rows = scoped(ctx, packages().all()).filter((row) => {
    if (product && row.refs.product?.id !== product) return false
    if (engine === "") return row.attributes.engine == null
    if (engine != null) {
      return engineKey != null && row.attributes.engine === engineKey
    }
    return true
  })

  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockPackage(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/packages/:id`, (ctx) => {
  const row = findPackage(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockPackage(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/packages`, (ctx) => {
  const attributes = permittedAttributes(ctx)
  const name = validateName(attributes.name)
  const engine = validateEngine(attributes.engine)
  const key = validateKey(ctx, attributes.key, engine)
  const metadata = validateMetadata(attributes.metadata)
  const product = requireProduct(ctx)

  const row = makeMockRow(
    TYPE,
    uuid(),
    { name, key, engine, metadata },
    { ...baseRefs(ctx), product: { type: "products", id: product.id } },
  )
  packages().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  if (engine != null) upsertLookup(ctx, "engines", engine)

  emitMockEvent(ctx, "package.created", { resource: row })

  return { status: 201, body: { data: serializeMockPackage(ctx, row) } }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/packages/:id`, (ctx) => {
  const row = findPackage(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = permittedAttributes(ctx)
  const changes: Record<string, unknown> = {}
  const engine =
    "engine" in attributes
      ? validateEngine(attributes.engine)
      : currentEngine(row)

  if ("name" in attributes) changes.name = validateName(attributes.name)
  if ("engine" in attributes) changes.engine = engine
  if ("key" in attributes) {
    changes.key = validateKey(ctx, attributes.key, engine, row.id)
  }
  if ("metadata" in attributes) {
    changes.metadata = validateMetadata(attributes.metadata)
  }

  const before = { ...row.attributes }
  packages().patch(
    row.id,
    { attributes: changes },
    { touch: Object.keys(changes).length > 0 },
  )

  if ("engine" in attributes && engine != null) {
    upsertLookup(ctx, "engines", engine)
  }

  emitMockEvent(ctx, "package.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockPackage(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/packages/:id`, (ctx) => {
  const row = findPackage(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})
