import {
  MOCK_ACCOUNT,
  accountPath,
  assertWritable,
  badRequest,
  baseRefs,
  bodyAttributes,
  bodyDataList,
  bodyRelationship,
  bodyRelationships,
  type MockContext,
  countKeys,
  destroyMock,
  destroyMockWhere,
  diffMetadata,
  emitMockEvent,
  environmentRelationship,
  errors,
  fail,
  failTooLong,
  failTypeMismatch,
  inAccount,
  isRecord,
  isUuid,
  linkageOf,
  makeMockRow,
  millis,
  newestFirst,
  normalizeMetadata,
  notFound,
  nowIso,
  paginateMock,
  queryList,
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
  serializeMock,
  mockStore,
  toMany,
  toOne,
  unpermittedAttribute,
  unprocessable,
  uuid,
} from "@/demo/server"
import { requireProduct, resolveLookupKey } from "./packages"
import { upsertLookup } from "./platforms"

const TYPE = "releases"
const LABEL = "release"
const CONSTRAINT_TYPE = "constraints"
const RESERVED_TAGS = ["actions", "action"]
const MAX_LENGTH = 255
const MAX_DESCRIPTION_LENGTH = 16384
const MAX_METADATA_BYTES = 16384
const MAX_METADATA_KEYS = 64
const MAX_BATCH = 100
const CHANNELS = ["stable", "rc", "beta", "alpha", "dev"]
const PRERELEASE_CHANNELS = ["rc", "beta", "alpha", "dev"]
const STATUSES = ["DRAFT", "PUBLISHED"]
const DEFAULT_STATUS = "DRAFT"
const CHANNEL_LADDER: Readonly<Record<string, readonly string[]>> = {
  stable: ["stable"],
  rc: ["stable", "rc"],
  beta: ["stable", "rc", "beta"],
  alpha: ["stable", "rc", "beta", "alpha"],
  dev: ["dev"],
}
const CREATE_ATTRIBUTES = [
  "name",
  "description",
  "channel",
  "status",
  "version",
  "tag",
  "backdated",
  "metadata",
]
const UPDATE_ATTRIBUTES = [
  "name",
  "description",
  "tag",
  "backdated",
  "metadata",
]
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

import type { Semver } from "@/types/releases"

export type { Semver }

const EMPTY_SEMVER: Semver = {
  major: 0,
  minor: 0,
  patch: 0,
  prerelease: null,
  build: null,
}

type RowFilter = (row: MockRow) => boolean

const releases = () => mockStore.table(TYPE)
const constraints = () => mockStore.table(CONSTRAINT_TYPE)
const packages = () => mockStore.table("packages")
const entitlements = () => mockStore.table("entitlements")
const artifacts = () => mockStore.table("artifacts")

export function parseSemver(version: string): Semver | null {
  const match = SEMVER_PATTERN.exec(version)
  if (!match) return null

  const [, major, minor, patch, prerelease, build] = match
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: prerelease ?? null,
    build: build ?? null,
  }
}

export function serializeMockRelease(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const self = resourcePath(ctx, TYPE, row.id)
  const version = String(row.attributes.version)

  return resource(
    ctx,
    row,
    {
      name: row.attributes.name ?? null,
      description: row.attributes.description ?? null,
      channel: row.attributes.channel,
      status: row.attributes.status ?? DEFAULT_STATUS,
      tag: row.attributes.tag ?? null,
      version,
      semver: parseSemver(version) ?? EMPTY_SEMVER,
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
      backdated: row.attributes.backdated ?? null,
      yanked: row.attributes.yanked ?? null,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      product: toOne(ctx, row.refs.product, `${self}/product`),
      package: toOne(ctx, row.refs.package, `${self}/package`),
      entitlements: toMany(`${self}/entitlements`),
      constraints: toMany(`${self}/constraints`),
      artifacts: toMany(`${self}/artifacts`),
      upgrade: toMany(`${self}/upgrade`),
    },
  )
}

export function serializeMockConstraint(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const releaseId = row.refs.release?.id ?? ""

  return resource(
    ctx,
    row,
    { created: row.created, updated: row.updated },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      entitlement: toOne(ctx, row.refs.entitlement),
      release: toOne(ctx, row.refs.release),
    },
    {
      links: {
        related: `${accountPath(ctx)}/releases/${releaseId}/constraints/${row.id}`,
      },
    },
  )
}

registerMockSerializer(TYPE, serializeMockRelease)
registerMockSerializer(CONSTRAINT_TYPE, serializeMockConstraint)

registerMockDestroyer(TYPE, (ctx, row) => {
  destroyMockWhere(
    ctx,
    "artifacts",
    (artifact) => artifact.refs.release?.id === row.id,
  )
  for (const constraint of constraintsFor(row.id)) {
    constraints().delete(constraint.id)
  }

  releases().delete(row.id)
  emitMockEvent(ctx, "release.deleted", { resource: row })
})

function constraintsFor(releaseId: string): MockRow[] {
  return constraints().where((row) => row.refs.release?.id === releaseId)
}

function findRelease(ctx: MockContext, identifier: string): MockRow {
  const byId = releases().get(identifier)
  if (byId) return requireVisible(ctx, releases(), byId.id, LABEL)

  const byAlias = newestFirst(scoped(ctx, releases().all())).find(
    (row) =>
      row.attributes.version === identifier ||
      row.attributes.tag === identifier,
  )
  if (!byAlias) fail(notFound(LABEL, identifier))
  return byAlias
}

function tagOf(row: MockRow): string | null {
  return typeof row.attributes.tag === "string" ? row.attributes.tag : null
}

function permittedAttributes(
  ctx: MockContext,
  permitted: readonly string[],
): Record<string, unknown> {
  const attributes = bodyAttributes(ctx)
  for (const key of Object.keys(attributes)) {
    if (!permitted.includes(key)) fail(unpermittedAttribute(key))
  }
  return attributes
}

function validateChannel(channel: unknown): string {
  if (channel === undefined) {
    fail(badRequest("is missing", { pointer: "/data/attributes/channel" }))
  }
  if (typeof channel !== "string") {
    failTypeMismatch("channel", channel, "string")
  }
  if (!CHANNELS.includes(channel)) {
    fail(badRequest("is invalid", { pointer: "/data/attributes/channel" }))
  }
  return channel
}

function validateStatus(status: unknown): string {
  if (status === undefined || status === null) return DEFAULT_STATUS
  if (typeof status !== "string") failTypeMismatch("status", status, "string")
  if (!STATUSES.includes(status)) {
    fail(badRequest("is invalid", { pointer: "/data/attributes/status" }))
  }
  return status
}

function validateVersion(version: unknown, channel: string): string {
  if (version === undefined) {
    fail(badRequest("is missing", { pointer: "/data/attributes/version" }))
  }
  if (typeof version !== "string") {
    failTypeMismatch("version", version, "string")
  }
  if (version.trim() === "") {
    fail(badRequest("cannot be blank", { pointer: "/data/attributes/version" }))
  }

  const semver = parseSemver(version)
  if (!semver) rejectAttribute("version", "INVALID", "must be a valid version")

  const head = semver.prerelease?.split(".")[0] ?? null
  if (head != null && !PRERELEASE_CHANNELS.includes(head)) {
    rejectAttribute("version", "CHANNEL_INVALID", "must be a valid channel")
  }
  if (channel === "stable") {
    if (head != null) {
      rejectAttribute(
        "version",
        "CHANNEL_INVALID",
        `version does not match stable channel (expected x.y.z got ${version})`,
      )
    }
  } else if (head !== channel) {
    rejectAttribute(
      "version",
      "CHANNEL_INVALID",
      `version does not match prerelease channel (expected x.y.z-${channel}.n got ${version})`,
    )
  }

  return version
}

function validateName(name: unknown): string | null {
  if (name === undefined || name === null) return null
  if (typeof name !== "string") failTypeMismatch("name", name, "string")
  if (name.trim() === "") return null
  if (name.length > MAX_LENGTH) failTooLong("name", MAX_LENGTH)
  return name
}

function validateDescription(description: unknown): string | null {
  if (description === undefined || description === null) return null
  if (typeof description !== "string") {
    failTypeMismatch("description", description, "string")
  }
  if (description.trim() === "") return null
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    failTooLong("description", MAX_DESCRIPTION_LENGTH)
  }
  return description
}

function validateTag(tag: unknown): string | null {
  if (tag === undefined || tag === null) return null
  if (typeof tag !== "string") failTypeMismatch("tag", tag, "string")
  if (tag.trim() === "") return null
  if (RESERVED_TAGS.includes(tag.toLowerCase())) {
    rejectAttribute("tag", "NOT_ALLOWED", "is reserved")
  }
  if (tag.length > MAX_LENGTH) failTooLong("tag", MAX_LENGTH)
  return tag
}

function validateBackdated(backdated: unknown): string | null {
  if (backdated === undefined || backdated === null) return null
  if (typeof backdated !== "string") {
    failTypeMismatch("backdated", backdated, "time")
  }

  const at = millis(backdated)
  if (at == null) failTypeMismatch("backdated", backdated, "time")
  if (at > Date.now()) {
    rejectAttribute("backdated", "INVALID", "must be in the past")
  }

  return new Date(at).toISOString()
}

function validateMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata === undefined || metadata === null) return {}
  if (!isRecord(metadata)) failTypeMismatch("metadata", metadata, "object")

  if (JSON.stringify(metadata).length > MAX_METADATA_BYTES) {
    rejectAttribute(
      "metadata",
      "TOO_LONG",
      `too large (exceeded limit of ${MAX_METADATA_BYTES} bytes)`,
    )
  }
  if (countKeys(metadata) > MAX_METADATA_KEYS) {
    rejectAttribute(
      "metadata",
      "TOO_LONG",
      `too many keys (exceeded limit of ${MAX_METADATA_KEYS} keys)`,
    )
  }

  return normalizeMetadata(metadata)
}

function sameScope(
  row: MockRow,
  productId: string,
  packageId: string | null,
): boolean {
  return (
    row.refs.product?.id === productId &&
    (row.refs.package?.id ?? null) === packageId
  )
}

function assertVersionAvailable(
  ctx: MockContext,
  version: string,
  productId: string,
  packageId: string | null,
  excludeId?: string,
): void {
  const taken = releases().find(
    (row) =>
      row.id !== excludeId &&
      inAccount(ctx, row) &&
      sameScope(row, productId, packageId) &&
      row.attributes.version === version,
  )
  if (taken) rejectAttribute("version", "TAKEN", "version already exists")
}

function assertTagAvailable(
  ctx: MockContext,
  tag: string | null,
  productId: string,
  packageId: string | null,
  excludeId?: string,
): void {
  if (tag == null) return

  const taken = releases().find(
    (row) =>
      row.id !== excludeId &&
      inAccount(ctx, row) &&
      sameScope(row, productId, packageId) &&
      row.attributes.tag === tag,
  )
  if (taken) rejectAttribute("tag", "TAKEN", "tag already exists")
}

function resolvePackage(
  ctx: MockContext,
  packageId: string,
  productId: string,
): MockRow {
  const pkg = packages().get(packageId)
  if (!pkg || !inAccount(ctx, pkg)) {
    fail(unprocessable(relationshipError("package", "NOT_FOUND", "must exist")))
  }
  if (pkg.refs.product?.id !== productId) {
    fail(
      unprocessable(
        relationshipError(
          "package",
          "NOT_ALLOWED",
          "package product must match release product",
        ),
      ),
    )
  }
  return pkg
}

function requestedPackage(ctx: MockContext, product: MockRow): MockRow | null {
  const { linkage } = bodyRelationship(ctx, "package")
  if (!linkage) return null
  if (!isUuid(linkage.id)) {
    fail(
      badRequest("must be a valid UUID", {
        pointer: "/data/relationships/package/data/id",
      }),
    )
  }
  return resolvePackage(ctx, linkage.id, product.id)
}

function entitlementIdOf(
  entry: Record<string, unknown>,
  pointer: string,
): string {
  const relationships = isRecord(entry.relationships) ? entry.relationships : {}
  const linkage = linkageOf(relationships.entitlement)
  if (!linkage || !isUuid(linkage.id)) {
    fail(badRequest("must be a valid UUID", { pointer }))
  }
  return linkage.id
}

function inlineConstraintIds(ctx: MockContext): string[] {
  const relationship = bodyRelationships(ctx).constraints
  const data = isRecord(relationship) ? relationship.data : undefined
  if (!Array.isArray(data)) return []

  return data
    .filter(isRecord)
    .map((entry, index) =>
      entitlementIdOf(
        entry,
        `/data/relationships/constraints/data/${index}/relationships/entitlement/data/id`,
      ),
    )
}

function requestedBatch(ctx: MockContext): Record<string, unknown>[] {
  const list = bodyDataList(ctx)
  if (list.length < 1 || list.length > MAX_BATCH) {
    fail(
      badRequest(`length must be between 1 and ${MAX_BATCH} (inclusive)`, {
        pointer: "/data",
      }),
    )
  }
  return list
}

function requestedEntitlementIds(ctx: MockContext): string[] {
  return requestedBatch(ctx).map((entry, index) =>
    entitlementIdOf(entry, `/data/${index}/relationships/entitlement/data/id`),
  )
}

function requestedConstraintIds(ctx: MockContext): string[] {
  return requestedBatch(ctx).map((entry, index) => {
    if (!isUuid(entry.id)) {
      fail(badRequest("must be a valid UUID", { pointer: `/data/${index}/id` }))
    }
    return entry.id
  })
}

function attachConstraints(
  ctx: MockContext,
  release: MockRow,
  entitlementIds: string[],
): MockRow[] {
  const attached = new Set(
    constraintsFor(release.id).map((row) => row.refs.entitlement?.id ?? ""),
  )

  for (const id of entitlementIds) {
    const entitlement = entitlements().get(id)
    if (!entitlement || !inAccount(ctx, entitlement)) {
      fail(
        unprocessable(
          relationshipError("entitlement", "NOT_FOUND", "must exist"),
        ),
      )
    }
    if (attached.has(id)) {
      fail(
        unprocessable(
          relationshipError("entitlement", "TAKEN", "already exists"),
        ),
      )
    }
    attached.add(id)
  }

  return entitlementIds.map((id) =>
    constraints().insert(
      makeMockRow(
        CONSTRAINT_TYPE,
        uuid(),
        {},
        {
          ...baseRefs(ctx),
          environment: release.refs.environment ?? null,
          release: { type: TYPE, id: release.id },
          entitlement: { type: "entitlements", id },
        },
      ),
    ),
  )
}

function entitlementCodes(rows: MockRow[]): unknown[] {
  return rows.map(
    (row) =>
      entitlements().get(row.refs.entitlement?.id ?? "")?.attributes.code,
  )
}

function statusFilter(ctx: MockContext): RowFilter | null {
  const status = ctx.query.get("status")
  if (status == null || status === "") return null

  const expected = status.toUpperCase()
  return (row) => row.attributes.status === expected
}

function channelFilter(ctx: MockContext): RowFilter | null {
  const channel = ctx.query.get("channel")
  if (channel == null || channel === "") return null

  const key = resolveLookupKey(ctx, "channels", channel)
  const ladder: readonly string[] =
    key != null && key in CHANNEL_LADDER ? CHANNEL_LADDER[key] : []
  return (row) => ladder.includes(String(row.attributes.channel))
}

function productFilter(ctx: MockContext): RowFilter | null {
  const product = ctx.query.get("product")
  if (product == null || product === "") return null

  return (row) => row.refs.product?.id === product
}

function packageIdForKey(ctx: MockContext, key: string): string | null {
  const pkg = packages().find(
    (row) => inAccount(ctx, row) && row.attributes.key === key,
  )
  return pkg?.id ?? null
}

function packageFilter(ctx: MockContext): RowFilter | null {
  const value = ctx.query.get("package")
  if (value == null) return null
  if (value === "") return (row) => row.refs.package == null

  const packageId = isUuid(value) ? value : packageIdForKey(ctx, value)
  return (row) => packageId != null && row.refs.package?.id === packageId
}

function engineFilter(ctx: MockContext): RowFilter | null {
  const value = ctx.query.get("engine")
  if (value == null) return null

  const key = value === "" ? null : resolveLookupKey(ctx, "engines", value)
  return (row) => {
    const pkg = row.refs.package ? packages().get(row.refs.package.id) : null
    if (!pkg) return false
    if (value === "") return pkg.attributes.engine == null
    return key != null && pkg.attributes.engine === key
  }
}

function entitlementsFilter(ctx: MockContext): RowFilter | null {
  const ids = queryList(ctx.query, "entitlements")
  if (ids.length === 0) return null

  return (row) =>
    constraintsFor(row.id).every((constraint) =>
      ids.includes(constraint.refs.entitlement?.id ?? ""),
    )
}

mockRoute("GET", `${MOCK_ACCOUNT}/releases`, (ctx) => {
  const filters = [
    statusFilter(ctx),
    channelFilter(ctx),
    productFilter(ctx),
    packageFilter(ctx),
    engineFilter(ctx),
    entitlementsFilter(ctx),
  ].filter((filter): filter is RowFilter => filter != null)

  const rows = scoped(ctx, releases().all()).filter((row) =>
    filters.every((filter) => filter(row)),
  )

  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockRelease(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/releases/:id`, (ctx) => {
  const row = findRelease(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockRelease(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/releases`, (ctx) => {
  const attributes = permittedAttributes(ctx, CREATE_ATTRIBUTES)
  const channel = validateChannel(attributes.channel)
  const status = validateStatus(attributes.status)
  const version = validateVersion(attributes.version, channel)
  const name = validateName(attributes.name)
  const description = validateDescription(attributes.description)
  const tag = validateTag(attributes.tag)
  const backdated = validateBackdated(attributes.backdated)
  const metadata = validateMetadata(attributes.metadata)
  const product = requireProduct(ctx)
  const pkg = requestedPackage(ctx, product)
  const constraintIds = inlineConstraintIds(ctx)

  assertVersionAvailable(ctx, version, product.id, pkg?.id ?? null)
  assertTagAvailable(ctx, tag, product.id, pkg?.id ?? null)

  const row = makeMockRow(
    TYPE,
    uuid(),
    {
      name,
      description,
      channel,
      status,
      version,
      tag,
      backdated,
      yanked: null,
      metadata,
    },
    {
      ...baseRefs(ctx),
      product: { type: "products", id: product.id },
      package: pkg ? { type: "packages", id: pkg.id } : null,
    },
  )
  releases().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  upsertLookup(ctx, "channels", channel)
  if (constraintIds.length > 0) attachConstraints(ctx, row, constraintIds)

  emitMockEvent(ctx, "release.created", { resource: row })

  return { status: 201, body: { data: serializeMockRelease(ctx, row) } }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/releases/:id`, (ctx) => {
  const row = findRelease(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = permittedAttributes(ctx, UPDATE_ATTRIBUTES)
  const changes: Record<string, unknown> = {}

  if ("name" in attributes) changes.name = validateName(attributes.name)
  if ("description" in attributes) {
    changes.description = validateDescription(attributes.description)
  }
  if ("tag" in attributes) {
    const tag = validateTag(attributes.tag)
    assertTagAvailable(
      ctx,
      tag,
      row.refs.product?.id ?? "",
      row.refs.package?.id ?? null,
      row.id,
    )
    changes.tag = tag
  }
  if ("backdated" in attributes) {
    changes.backdated = validateBackdated(attributes.backdated)
  }
  if ("metadata" in attributes) {
    changes.metadata = validateMetadata(attributes.metadata)
  }

  const before = { ...row.attributes }
  releases().patch(
    row.id,
    { attributes: changes },
    { touch: Object.keys(changes).length > 0 },
  )

  emitMockEvent(ctx, "release.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockRelease(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/releases/:id`, (ctx) => {
  const row = findRelease(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

mockRoute("POST", `${MOCK_ACCOUNT}/releases/:id/actions/publish`, (ctx) => {
  const row = findRelease(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  releases().patch(row.id, { attributes: { status: "PUBLISHED" } })
  emitMockEvent(ctx, "release.published", { resource: row })

  return { status: 200, body: { data: serializeMockRelease(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/releases/:id/actions/yank`, (ctx) => {
  const row = findRelease(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  releases().patch(row.id, {
    attributes: { status: "YANKED", yanked: nowIso() },
  })
  emitMockEvent(ctx, "release.yanked", { resource: row })

  return { status: 200, body: { data: serializeMockRelease(ctx, row) } }
})

mockRoute("PUT", `${MOCK_ACCOUNT}/releases/:id/package`, (ctx) => {
  const row = findRelease(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const data = isRecord(ctx.body) ? ctx.body.data : undefined
  if (data === undefined) fail(badRequest("is missing", { pointer: "/data" }))

  const productId = row.refs.product?.id ?? ""
  let pkg: MockRow | null = null
  if (data !== null) {
    const linkage = linkageOf(ctx.body)
    if (!linkage || !isUuid(linkage.id)) {
      fail(badRequest("must be a valid UUID", { pointer: "/data/id" }))
    }
    pkg = resolvePackage(ctx, linkage.id, productId)
  }

  const packageId = pkg?.id ?? null
  assertVersionAvailable(
    ctx,
    String(row.attributes.version),
    productId,
    packageId,
    row.id,
  )
  assertTagAvailable(ctx, tagOf(row), productId, packageId, row.id)

  releases().patch(row.id, {
    refs: { package: pkg ? { type: "packages", id: pkg.id } : null },
  })
  emitMockEvent(ctx, "release.package.updated", { resource: row })

  return { status: 200, body: { data: serializeMockRelease(ctx, row) } }
})

mockRoute("GET", `${MOCK_ACCOUNT}/releases/:id/constraints`, (ctx) => {
  const release = findRelease(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: release.id }

  return {
    status: 200,
    body: paginateMock(ctx, constraintsFor(release.id), (row) =>
      serializeMockConstraint(ctx, row),
    ),
  }
})

mockRoute("POST", `${MOCK_ACCOUNT}/releases/:id/constraints`, (ctx) => {
  const release = findRelease(ctx, ctx.params.id)
  assertWritable(ctx, release)
  ctx.resource = { type: TYPE, id: release.id }

  const ids = requestedEntitlementIds(ctx)
  const attached = attachConstraints(ctx, release, ids)

  emitMockEvent(ctx, "release.constraints.attached", {
    resource: release,
    metadata: { codes: entitlementCodes(attached) },
  })

  return {
    status: 200,
    body: { data: attached.map((row) => serializeMockConstraint(ctx, row)) },
  }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/releases/:id/constraints`, (ctx) => {
  const release = findRelease(ctx, ctx.params.id)
  assertWritable(ctx, release)
  ctx.resource = { type: TYPE, id: release.id }

  const ids = requestedConstraintIds(ctx)
  const attached = new Map(
    constraintsFor(release.id).map((row) => [row.id, row]),
  )

  ids.forEach((id, index) => {
    if (!attached.has(id)) {
      fail(
        errors(422, {
          title: "Unprocessable entity",
          detail: `cannot detach constraint '${id}' (constraint is not attached)`,
          source: { pointer: `/data/${index}` },
        }),
      )
    }
  })

  const detached = ids.flatMap((id) => {
    const row = attached.get(id)
    return row ? [row] : []
  })
  for (const row of detached) constraints().delete(row.id)

  emitMockEvent(ctx, "release.constraints.detached", {
    resource: release,
    metadata: { codes: entitlementCodes(detached) },
  })

  return { status: 204 }
})

mockRoute("GET", `${MOCK_ACCOUNT}/releases/:id/artifacts`, (ctx) => {
  const release = findRelease(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: release.id }

  const rows = scoped(
    ctx,
    artifacts().where((row) => row.refs.release?.id === release.id),
  )

  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMock(ctx, row)),
  }
})
