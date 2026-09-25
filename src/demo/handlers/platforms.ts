import {
  MOCK_ACCOUNT,
  accountRef,
  fail,
  inAccount,
  isUuid,
  makeMockRow,
  notFound,
  paginateMock,
  registerMockSerializer,
  requireVisible,
  resource,
  resourcePath,
  mockRoute,
  scoped,
  mockStore,
  uuid,
  type MockContext,
  type MockResource,
  type MockRow,
} from "@/demo/server"

export type LookupType = "platforms" | "arches" | "channels" | "engines"

const LOOKUP_TYPES: readonly LookupType[] = [
  "platforms",
  "arches",
  "channels",
  "engines",
]

const LOOKUP_LABELS: Readonly<Record<LookupType, string>> = {
  platforms: "release platform",
  arches: "release arch",
  channels: "release channel",
  engines: "release engine",
}

const PARENT_ATTRIBUTES: Readonly<Record<LookupType, string>> = {
  platforms: "platform",
  arches: "arch",
  channels: "channel",
  engines: "engine",
}

const artifacts = () => mockStore.table("artifacts")
const releases = () => mockStore.table("releases")
const packages = () => mockStore.table("packages")
const products = () => mockStore.table("products")

export function lookupKey(value: string): string {
  return value.trim().toLowerCase()
}

function keyOf(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null
}

function releaseOf(artifact: MockRow): MockRow | undefined {
  const release = artifact.refs.release
  return release ? releases().get(release.id) : undefined
}

function belongsToProduct(
  row: MockRow,
  productId: string | undefined,
): boolean {
  return productId === undefined || row.refs.product?.id === productId
}

function parentRows(
  ctx: MockContext,
  type: LookupType,
  productId?: string,
): MockRow[] {
  if (type === "channels") {
    return scoped(ctx, releases().all()).filter((release) =>
      belongsToProduct(release, productId),
    )
  }
  if (type === "engines") {
    return scoped(ctx, packages().all()).filter((pkg) =>
      belongsToProduct(pkg, productId),
    )
  }
  return scoped(ctx, artifacts().all()).filter((artifact) => {
    const release = releaseOf(artifact)
    return release != null && belongsToProduct(release, productId)
  })
}

function parentKeys(
  ctx: MockContext,
  type: LookupType,
  productId?: string,
): Set<string> {
  const attribute = PARENT_ATTRIBUTES[type]
  const keys = new Set<string>()
  for (const row of parentRows(ctx, type, productId)) {
    const key = keyOf(row.attributes[attribute])
    if (key !== null) keys.add(key)
  }
  return keys
}

export function visibleLookups(
  ctx: MockContext,
  type: LookupType,
  productId?: string,
): MockRow[] {
  const keys = parentKeys(ctx, type, productId)
  return mockStore.table(type).where((row) => {
    const key = keyOf(row.attributes.key)
    return key !== null && inAccount(ctx, row) && keys.has(key)
  })
}

function findLookup(
  ctx: MockContext,
  type: LookupType,
  identifier: string,
  productId?: string,
): MockRow {
  const table = mockStore.table(type)
  const candidate = isUuid(identifier)
    ? table.get(identifier)
    : type === "engines"
      ? table.find(
          (row) =>
            inAccount(ctx, row) && row.attributes.key === lookupKey(identifier),
        )
      : undefined
  const key = candidate ? keyOf(candidate.attributes.key) : null

  if (
    !candidate ||
    key === null ||
    !inAccount(ctx, candidate) ||
    !parentKeys(ctx, type, productId).has(key)
  ) {
    fail(notFound(LOOKUP_LABELS[type], identifier))
  }

  return candidate
}

export function upsertLookup(
  ctx: MockContext,
  type: LookupType,
  key: string,
): MockRow {
  const normalized = lookupKey(key)
  const table = mockStore.table(type)
  const existing = table.find(
    (row) => inAccount(ctx, row) && row.attributes.key === normalized,
  )
  if (existing) return existing

  return table.insert(
    makeMockRow(
      type,
      uuid(),
      { key: normalized, name: null },
      { account: accountRef(ctx) },
    ),
  )
}

export function serializeMockLookup(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return {
    ...resource(
      ctx,
      row,
      {
        name: row.attributes.name ?? null,
        key: row.attributes.key,
        created: row.created,
        updated: row.updated,
      },
      {},
    ),
    links: { related: resourcePath(ctx, row.type, row.id) },
  }
}

export const serializePlatform = serializeMockLookup
export const serializeArch = serializeMockLookup
export const serializeChannel = serializeMockLookup
export const serializeEngine = serializeMockLookup

for (const type of LOOKUP_TYPES) {
  registerMockSerializer(type, serializeMockLookup)

  mockRoute("GET", `${MOCK_ACCOUNT}/${type}`, (ctx) => ({
    status: 200,
    body: paginateMock(ctx, visibleLookups(ctx, type), (row) =>
      serializeMockLookup(ctx, row),
    ),
  }))

  mockRoute("GET", `${MOCK_ACCOUNT}/${type}/:id`, (ctx) => {
    const row = findLookup(ctx, type, ctx.params.id)
    ctx.resource = { type, id: row.id }
    return { status: 200, body: { data: serializeMockLookup(ctx, row) } }
  })

  mockRoute("GET", `${MOCK_ACCOUNT}/products/:productId/${type}`, (ctx) => {
    const product = requireVisible(
      ctx,
      products(),
      ctx.params.productId,
      "product",
    )
    ctx.resource = { type: "products", id: product.id }
    return {
      status: 200,
      body: paginateMock(ctx, visibleLookups(ctx, type, product.id), (row) =>
        serializeMockLookup(ctx, row),
      ),
    }
  })

  mockRoute("GET", `${MOCK_ACCOUNT}/products/:productId/${type}/:id`, (ctx) => {
    const product = requireVisible(
      ctx,
      products(),
      ctx.params.productId,
      "product",
    )
    const row = findLookup(ctx, type, ctx.params.id, product.id)
    ctx.resource = { type, id: row.id }
    return { status: 200, body: { data: serializeMockLookup(ctx, row) } }
  })
}
