import {
  MOCK_ACCOUNT,
  assertWritable,
  attributeError,
  badRequest,
  baseRefs,
  bodyAttributes,
  bodyRelationship,
  bodyRelationships,
  type MockContext,
  countKeys,
  destroyMock,
  diffMetadata,
  emitMockEvent,
  environmentRelationship,
  fail,
  failTooLong,
  failTypeMismatch,
  inAccount,
  isRecord,
  isUuid,
  type Linkage,
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
  subjectLinkage,
  toOne,
  unprocessable,
  uuid,
  visible,
} from "@/demo/server"
import { onMockUpload, MOCK_UPLOAD_ORIGIN } from "@/demo/xhr"

import { lookupKey, upsertLookup } from "./platforms"

const TYPE = "artifacts"
const LABEL = "release artifact"
const MAX_LENGTH = 255
const MAX_TEXT_LENGTH = 4096
const MAX_FILESIZE = 5_368_709_120
const MAX_METADATA_BYTES = 16384
const MAX_METADATA_KEYS = 64
const WAITING = "WAITING"
const UPLOADED = "UPLOADED"
const FAILED = "FAILED"
const STATUSES: ReadonlySet<string> = new Set([WAITING, UPLOADED, FAILED])
const YANKED = "YANKED"
const CREATE_ATTRIBUTES: ReadonlySet<string> = new Set([
  "filename",
  "filetype",
  "filesize",
  "platform",
  "arch",
  "signature",
  "checksum",
  "metadata",
])
const UPDATE_ATTRIBUTES: ReadonlySet<string> = new Set([
  "filesize",
  "signature",
  "checksum",
  "metadata",
])
const CREATE_RELATIONSHIPS: ReadonlySet<string> = new Set([
  "release",
  "environment",
])
const NO_RELATIONSHIPS: ReadonlySet<string> = new Set<string>()
const CHANNEL_LADDER: Readonly<Record<string, readonly string[]>> = {
  stable: ["stable"],
  rc: ["stable", "rc"],
  beta: ["stable", "rc", "beta"],
  alpha: ["stable", "rc", "beta", "alpha"],
  dev: ["dev"],
}

const artifacts = () => mockStore.table(TYPE)
const releases = () => mockStore.table("releases")
const products = () => mockStore.table("products")
const channels = () => mockStore.table("channels")

const downloadUrls = new Map<string, string>()
const uploaders = new Map<string, Linkage | null>()

function keyOf(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null
}

function releaseOf(artifact: MockRow): MockRow | undefined {
  const release = artifact.refs.release
  return release ? releases().get(release.id) : undefined
}

function artifactStatus(row: MockRow): string {
  const status = row.attributes.status
  return typeof status === "string" && STATUSES.has(status) ? status : WAITING
}

function isDownloadable(row: MockRow): boolean {
  if (artifactStatus(row) !== UPLOADED) return false
  const release = releaseOf(row)
  return release != null && release.attributes.status !== YANKED
}

function downloadUrlFor(row: MockRow): string {
  const cached = downloadUrls.get(row.id)
  if (cached) return cached

  const filename = keyOf(row.attributes.filename) ?? row.id
  const blob = new Blob(
    [`${filename}\n\nPlaceholder bytes served by the Keygen Portal demo.\n`],
    { type: "application/octet-stream" },
  )
  const url = URL.createObjectURL(blob)
  downloadUrls.set(row.id, url)
  return url
}

function forgetDownloadUrl(id: string): void {
  const url = downloadUrls.get(id)
  if (!url) return
  URL.revokeObjectURL(url)
  downloadUrls.delete(id)
}

function uploadUrlFor(ctx: MockContext, row: MockRow): string {
  return `${MOCK_UPLOAD_ORIGIN}/${ctx.accountId}/${row.id}`
}

export function serializeMockArtifact(
  ctx: MockContext,
  row: MockRow,
  links: Record<string, string | null> = {},
): MockResource {
  const release = releaseOf(row)
  const self = resourcePath(ctx, TYPE, row.id)
  const filename = keyOf(row.attributes.filename) ?? row.id

  return resource(
    ctx,
    row,
    {
      filename: row.attributes.filename,
      filetype: row.attributes.filetype ?? null,
      filesize: row.attributes.filesize ?? null,
      platform: row.attributes.platform ?? null,
      arch: row.attributes.arch ?? null,
      signature: row.attributes.signature ?? null,
      checksum: row.attributes.checksum ?? null,
      status: artifactStatus(row),
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      product: toOne(ctx, release?.refs.product ?? null),
      release: toOne(ctx, row.refs.release),
    },
    {
      links: {
        related: `${self}/${encodeURIComponent(filename)}`,
        ...links,
      },
    },
  )
}

registerMockSerializer(TYPE, serializeMockArtifact)

registerMockDestroyer(TYPE, (ctx, row) => {
  forgetDownloadUrl(row.id)
  uploaders.delete(row.id)
  artifacts().delete(row.id)
  emitMockEvent(ctx, "artifact.deleted", { resource: row })
})

onMockUpload((url, body) => {
  const artifactId = url.split("?")[0].split("/").pop()
  const row = artifactId ? artifacts().get(artifactId) : undefined
  if (!row) return

  artifacts().patch(row.id, {
    attributes: {
      status: UPLOADED,
      ...(body instanceof Blob ? { filesize: body.size } : {}),
    },
  })

  const whodunnit = uploaders.get(row.id) ?? null
  uploaders.delete(row.id)

  emitMockEvent(null, "artifact.upload.succeeded", { resource: row, whodunnit })
  emitMockEvent(null, "artifact.uploaded", { resource: row, whodunnit })
})

function findRelease(ctx: MockContext, identifier: string): MockRow {
  const byId = visible(ctx, releases(), identifier)
  if (byId) return byId

  const byAlias = scoped(ctx, releases().all()).find(
    (row) =>
      row.attributes.version === identifier ||
      row.attributes.tag === identifier,
  )
  if (!byAlias) fail(notFound("release", identifier))
  return byAlias
}

function rejectUnpermittedAttributes(
  attributes: Record<string, unknown>,
  permitted: ReadonlySet<string>,
): void {
  for (const key of Object.keys(attributes)) {
    if (!permitted.has(key)) {
      fail(
        badRequest("unpermitted parameter", {
          pointer: `/data/attributes/${key}`,
        }),
      )
    }
  }
}

function rejectUnpermittedRelationships(
  ctx: MockContext,
  permitted: ReadonlySet<string>,
): void {
  for (const key of Object.keys(bodyRelationships(ctx))) {
    if (!permitted.has(key)) {
      fail(
        badRequest("unpermitted parameter", {
          pointer: `/data/relationships/${key}`,
        }),
      )
    }
  }
}

function normalizeKeyValue(value: string): string | null {
  const key = value.trim().toLowerCase().replace(/^\.+/, "")
  return key === "" ? null : key
}

function normalizeKeyAttribute(
  attribute: string,
  value: unknown,
): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "string") failTypeMismatch(attribute, value, "string")
  return normalizeKeyValue(value)
}

function readFilename(value: unknown): string {
  const pointer = "/data/attributes/filename"
  if (value === undefined) fail(badRequest("is missing", { pointer }))
  if (value === null) fail(badRequest("cannot be null", { pointer }))
  if (typeof value !== "string") failTypeMismatch("filename", value, "string")
  return value
}

function validateFilename(
  ctx: MockContext,
  filename: string,
  releaseId: string,
  filetype: string | null,
): string {
  if (filename.trim() === "") {
    fail(unprocessable(attributeError("filename", "MISSING", "can't be blank")))
  }
  if (filename.length > MAX_LENGTH) failTooLong("filename", MAX_LENGTH)
  if (
    filetype !== null &&
    filename.includes(".") &&
    !filename.toLowerCase().endsWith(`.${filetype}`)
  ) {
    fail(
      unprocessable(
        attributeError(
          "filename",
          "EXTENSION_INVALID",
          `filename extension does not match filetype (expected ${filetype})`,
        ),
      ),
    )
  }

  const taken = artifacts().find(
    (row) =>
      inAccount(ctx, row) &&
      row.refs.release?.id === releaseId &&
      row.attributes.filename === filename,
  )
  if (taken) {
    fail(unprocessable(attributeError("filename", "TAKEN", "already exists")))
  }

  return filename
}

function validateFilesize(value: unknown): number | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "number" || !Number.isInteger(value)) {
    failTypeMismatch("filesize", value, "integer")
  }
  if (value < 0) {
    fail(
      unprocessable(
        attributeError(
          "filesize",
          "INVALID",
          "must be greater than or equal to 0",
        ),
      ),
    )
  }
  if (value > MAX_FILESIZE) {
    fail(
      unprocessable(
        attributeError(
          "filesize",
          "INVALID",
          `must be less than or equal to ${MAX_FILESIZE}`,
        ),
      ),
    )
  }
  return value
}

function validateText(attribute: string, value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "string") failTypeMismatch(attribute, value, "string")
  if (value.length > MAX_TEXT_LENGTH) failTooLong(attribute, MAX_TEXT_LENGTH)
  return value
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

function requireRelease(ctx: MockContext): MockRow {
  const { linkage } = bodyRelationship(ctx, "release")
  const release = linkage ? visible(ctx, releases(), linkage.id) : undefined
  if (!release) {
    fail(unprocessable(relationshipError("release", "NOT_FOUND", "must exist")))
  }
  return release
}

function matchesLookup(
  type: "platforms" | "arches",
  value: unknown,
  param: string,
): boolean {
  const key = keyOf(value)
  if (param === "") return key === null
  if (isUuid(param)) {
    const row = mockStore.table(type).get(param)
    return row != null && key !== null && key === keyOf(row.attributes.key)
  }
  return key === lookupKey(param)
}

function channelKeys(param: string): readonly string[] {
  const key = isUuid(param)
    ? keyOf(channels().get(param)?.attributes.key)
    : lookupKey(param)
  if (key === null || !Object.hasOwn(CHANNEL_LADDER, key)) return []
  return CHANNEL_LADDER[key]
}

function productMatches(release: MockRow | undefined, param: string): boolean {
  const productId = release?.refs.product?.id
  if (!productId) return false
  if (productId === param) return true

  const code = products().get(productId)?.attributes.code
  return typeof code === "string" && code.toLowerCase() === param.toLowerCase()
}

function releaseMatches(release: MockRow | undefined, param: string): boolean {
  if (!release) return false
  return (
    release.id === param ||
    release.attributes.version === param ||
    release.attributes.tag === param
  )
}

function applyArtifactFilters(ctx: MockContext, rows: MockRow[]): MockRow[] {
  const status = ctx.query.get("status")
  const filetype = ctx.query.get("filetype")
  const platform = ctx.query.get("platform")
  const arch = ctx.query.get("arch")

  return rows.filter((row) => {
    if (status !== null && artifactStatus(row) !== status.toUpperCase()) {
      return false
    }
    if (
      filetype !== null &&
      keyOf(row.attributes.filetype) !== normalizeKeyValue(filetype)
    ) {
      return false
    }
    if (
      platform !== null &&
      !matchesLookup("platforms", row.attributes.platform, platform)
    ) {
      return false
    }
    if (arch !== null && !matchesLookup("arches", row.attributes.arch, arch)) {
      return false
    }
    return true
  })
}

function applyReleaseFilters(ctx: MockContext, rows: MockRow[]): MockRow[] {
  const product = ctx.query.get("product")
  const release = ctx.query.get("release")
  const channel = ctx.query.get("channel")
  if (product === null && release === null && channel === null) return rows

  const ladder = channel === null ? null : channelKeys(channel)

  return rows.filter((row) => {
    const parent = releaseOf(row)
    if (product !== null && !productMatches(parent, product)) return false
    if (release !== null && !releaseMatches(parent, release)) return false
    if (
      ladder !== null &&
      !ladder.includes(keyOf(parent?.attributes.channel) ?? "")
    ) {
      return false
    }
    return true
  })
}

function downloadMetadata(
  release: MockRow | undefined,
): Record<string, unknown> {
  return {
    product: release?.refs.product?.id ?? null,
    package: release?.refs.package?.id ?? null,
    version: release?.attributes.version ?? null,
  }
}

function recordDownload(ctx: MockContext, row: MockRow): void {
  const release = releaseOf(row)
  const metadata = downloadMetadata(release)

  emitMockEvent(ctx, "artifact.downloaded", { resource: row, metadata })
  if (release)
    emitMockEvent(ctx, "release.downloaded", { resource: release, metadata })
}

mockRoute("GET", `${MOCK_ACCOUNT}/artifacts`, (ctx) => {
  const rows = applyReleaseFilters(
    ctx,
    applyArtifactFilters(ctx, scoped(ctx, artifacts().all())),
  )
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockArtifact(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/artifacts/:id`, (ctx) => {
  const row = requireVisible(ctx, artifacts(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }

  if (!isDownloadable(row)) {
    return { status: 200, body: { data: serializeMockArtifact(ctx, row) } }
  }

  const redirect = downloadUrlFor(row)
  if (!ctx.prefer.has("no-download")) recordDownload(ctx, row)

  return {
    status: 200,
    body: { data: serializeMockArtifact(ctx, row, { redirect }) },
  }
})

mockRoute("POST", `${MOCK_ACCOUNT}/artifacts`, (ctx) => {
  const attributes = bodyAttributes(ctx)
  rejectUnpermittedAttributes(attributes, CREATE_ATTRIBUTES)
  rejectUnpermittedRelationships(ctx, CREATE_RELATIONSHIPS)

  const filenameInput = readFilename(attributes.filename)
  const filetype = normalizeKeyAttribute("filetype", attributes.filetype)
  const platform = normalizeKeyAttribute("platform", attributes.platform)
  const arch = normalizeKeyAttribute("arch", attributes.arch)
  const filesize = validateFilesize(attributes.filesize)
  const signature = validateText("signature", attributes.signature)
  const checksum = validateText("checksum", attributes.checksum)
  const metadata = validateMetadata(attributes.metadata)
  const release = requireRelease(ctx)
  const filename = validateFilename(ctx, filenameInput, release.id, filetype)

  if (platform !== null) upsertLookup(ctx, "platforms", platform)
  if (arch !== null) upsertLookup(ctx, "arches", arch)

  const row = makeMockRow(
    TYPE,
    uuid(),
    {
      filename,
      filetype,
      filesize,
      platform,
      arch,
      signature,
      checksum,
      status: WAITING,
      metadata,
    },
    {
      ...baseRefs(ctx),
      environment: release.refs.environment ?? null,
      release: { type: "releases", id: release.id },
    },
  )
  artifacts().insert(row)
  uploaders.set(row.id, subjectLinkage(ctx))
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "artifact.created", { resource: row })

  return {
    status: 200,
    body: {
      data: serializeMockArtifact(ctx, row, {
        redirect: uploadUrlFor(ctx, row),
      }),
    },
  }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/artifacts/:id`, (ctx) => {
  const row = requireVisible(ctx, artifacts(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = bodyAttributes(ctx)
  rejectUnpermittedAttributes(attributes, UPDATE_ATTRIBUTES)
  rejectUnpermittedRelationships(ctx, NO_RELATIONSHIPS)

  const changes: Record<string, unknown> = {}

  if ("filesize" in attributes) {
    changes.filesize = validateFilesize(attributes.filesize)
  }
  if ("signature" in attributes) {
    changes.signature = validateText("signature", attributes.signature)
  }
  if ("checksum" in attributes) {
    changes.checksum = validateText("checksum", attributes.checksum)
  }
  if ("metadata" in attributes) {
    changes.metadata = validateMetadata(attributes.metadata)
  }

  const before = { ...row.attributes }
  artifacts().patch(
    row.id,
    { attributes: changes },
    { touch: Object.keys(changes).length > 0 },
  )

  emitMockEvent(ctx, "artifact.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockArtifact(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/artifacts/:id`, (ctx) => {
  const row = requireVisible(ctx, artifacts(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

mockRoute("GET", `${MOCK_ACCOUNT}/releases/:releaseId/artifacts`, (ctx) => {
  const release = findRelease(ctx, ctx.params.releaseId)
  ctx.resource = { type: "releases", id: release.id }

  const rows = applyArtifactFilters(
    ctx,
    scoped(
      ctx,
      artifacts().where((row) => row.refs.release?.id === release.id),
    ),
  )

  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockArtifact(ctx, row)),
  }
})
