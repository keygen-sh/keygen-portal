import {
  MOCK_ACCOUNT,
  assertWritable,
  attributeError,
  badRequest,
  baseRefs,
  bodyAttributes,
  bodyRelationship,
  type MockContext,
  destroyMock,
  environmentRelationship,
  fail,
  failTypeMismatch,
  isUuid,
  type Linkage,
  makeMockRow,
  paginateMock,
  registerMockDestroyer,
  registerMockSerializer,
  requireVisible,
  type MockResource,
  resource,
  mockRoute,
  type MockRow,
  scoped,
  mockStore,
  toOne,
  unprocessable,
  uuid,
} from "@/demo/server"
import { EventTypes } from "@/types/events"

const TYPE = "webhook-endpoints"
const LABEL = "webhook endpoint"
const PRODUCT_TYPE = "products"
const WILDCARD = "*"
const MAX_URL_LENGTH = 4096
const URL_PROTOCOL = "https:"
const BLOCKED_URL_HOSTS = ["localhost", "keygen.sh"]
const HOST_PATTERN = /^.*?\.[a-zA-Z]{2,}$/
const DEFAULT_SIGNATURE_ALGORITHM = "ed25519"
const SIGNATURE_ALGORITHMS = [
  "ed25519",
  "ecdsa-p256",
  "rsa-pss-sha256",
  "rsa-sha256",
]
const DEFAULT_API_VERSION = "1.8"
const SUPPORTED_API_VERSIONS = [
  "1.0",
  "1.1",
  "1.2",
  "1.3",
  "1.4",
  "1.5",
  "1.6",
  "1.7",
  "1.8",
]
const EVENT_TYPES = new Set<string>(EventTypes)

const webhookEndpoints = () => mockStore.table(TYPE)

export function serializeMockWebhookEndpoint(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return resource(
    ctx,
    row,
    {
      url: row.attributes.url,
      subscriptions: row.attributes.subscriptions ?? [WILDCARD],
      signatureAlgorithm:
        row.attributes.signatureAlgorithm ?? DEFAULT_SIGNATURE_ALGORITHM,
      apiVersion: row.attributes.apiVersion ?? null,
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      product: toOne(ctx, row.refs.product),
    },
  )
}

registerMockSerializer(TYPE, serializeMockWebhookEndpoint)

registerMockDestroyer(TYPE, (_ctx, row) => {
  webhookEndpoints().delete(row.id)
})

export function isSubscribed(endpoint: MockRow, event: string): boolean {
  const subscriptions = endpoint.attributes.subscriptions
  if (!Array.isArray(subscriptions)) return false
  const entries: unknown[] = subscriptions
  return entries.includes(WILDCARD) || entries.includes(event)
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

function validateUrl(url: unknown): string {
  if (url === undefined) {
    fail(badRequest("is missing", { pointer: "/data/attributes/url" }))
  }
  if (typeof url !== "string") {
    failTypeMismatch("/data/attributes/url", url, "string")
  }
  if (url.trim() === "") {
    fail(unprocessable(attributeError("url", "MISSING", "can't be blank")))
  }
  if (url.length > MAX_URL_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          "url",
          "TOO_LONG",
          `is too long (maximum is ${MAX_URL_LENGTH} characters)`,
        ),
      ),
    )
  }

  const parsed = parseUrl(url)
  if (!parsed) {
    fail(unprocessable(attributeError("url", "INVALID", "must be a valid URL")))
  }
  if (parsed.protocol !== URL_PROTOCOL) {
    fail(
      unprocessable(
        attributeError(
          "url",
          "PROTOCOL_INVALID",
          "must be a valid URL using one of the following protocols: https",
        ),
      ),
    )
  }

  const host = parsed.hostname.toLowerCase()
  if (host === "" || isBlockedHost(host) || !HOST_PATTERN.test(host)) {
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

function validateSubscriptions(subscriptions: unknown): string[] {
  if (subscriptions === undefined) return [WILDCARD]
  if (!Array.isArray(subscriptions)) {
    failTypeMismatch("/data/attributes/subscriptions", subscriptions, "array")
  }

  const items: unknown[] = subscriptions
  const entries = items.map((item, index) => {
    if (typeof item !== "string") {
      failTypeMismatch(
        `/data/attributes/subscriptions/${index}`,
        item,
        "string",
      )
    }
    return item
  })
  const unique = [...new Set(entries)]

  if (unique.length === 0) {
    fail(
      unprocessable(
        attributeError(
          "subscriptions",
          "TOO_SHORT",
          "must have at least 1 webhook event subscription",
        ),
      ),
    )
  }
  if (
    !(unique.length === 1 && unique[0] === WILDCARD) &&
    unique.some((entry) => !EVENT_TYPES.has(entry))
  ) {
    fail(
      unprocessable(
        attributeError(
          "subscriptions",
          "NOT_ALLOWED",
          "unsupported webhook event type for subscription",
        ),
      ),
    )
  }

  return unique
}

function validateSignatureAlgorithm(algorithm: unknown): string {
  if (algorithm === undefined) return DEFAULT_SIGNATURE_ALGORITHM
  if (typeof algorithm !== "string") {
    failTypeMismatch("/data/attributes/signatureAlgorithm", algorithm, "string")
  }
  if (!SIGNATURE_ALGORITHMS.includes(algorithm)) {
    fail(
      unprocessable(
        attributeError(
          "signatureAlgorithm",
          "NOT_ALLOWED",
          "unsupported signature algorithm",
        ),
      ),
    )
  }
  return algorithm
}

function requestApiVersion(ctx: MockContext): string {
  const header = ctx.headers.get("keygen-version")?.replace(/^v/i, "")
  if (header && SUPPORTED_API_VERSIONS.includes(header)) return header

  const accountVersion = ctx.account?.attributes.apiVersion
  if (
    typeof accountVersion === "string" &&
    SUPPORTED_API_VERSIONS.includes(accountVersion)
  ) {
    return accountVersion
  }

  return DEFAULT_API_VERSION
}

function validateApiVersion(ctx: MockContext, version: unknown): string {
  if (version === undefined) return requestApiVersion(ctx)
  if (typeof version !== "string") {
    failTypeMismatch("/data/attributes/apiVersion", version, "string")
  }
  if (!SUPPORTED_API_VERSIONS.includes(version)) {
    fail(
      unprocessable(
        attributeError("apiVersion", "NOT_ALLOWED", "unsupported version"),
      ),
    )
  }
  return version
}

function validateProduct(ctx: MockContext): {
  present: boolean
  linkage: Linkage | null
} {
  const { present, linkage } = bodyRelationship(ctx, "product")
  if (!present || !linkage) return { present, linkage: null }
  if (!isUuid(linkage.id)) {
    fail(
      badRequest("type mismatch (received string expected UUID)", {
        pointer: "/data/relationships/product/data/id",
      }),
    )
  }
  return { present, linkage: { type: PRODUCT_TYPE, id: linkage.id } }
}

mockRoute("GET", `${MOCK_ACCOUNT}/webhook-endpoints`, (ctx) => {
  const rows = scoped(ctx, webhookEndpoints().all())
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) =>
      serializeMockWebhookEndpoint(ctx, row),
    ),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/webhook-endpoints/:id`, (ctx) => {
  const row = requireVisible(ctx, webhookEndpoints(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockWebhookEndpoint(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/webhook-endpoints`, (ctx) => {
  const attributes = bodyAttributes(ctx)
  const url = validateUrl(attributes.url)
  const subscriptions = validateSubscriptions(attributes.subscriptions)
  const signatureAlgorithm = validateSignatureAlgorithm(
    attributes.signatureAlgorithm,
  )
  const apiVersion = validateApiVersion(ctx, attributes.apiVersion)
  const product = validateProduct(ctx)

  const row = makeMockRow(
    TYPE,
    uuid(),
    { url, subscriptions, signatureAlgorithm, apiVersion },
    { ...baseRefs(ctx), product: product.linkage },
  )
  webhookEndpoints().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  return { status: 201, body: { data: serializeMockWebhookEndpoint(ctx, row) } }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/webhook-endpoints/:id`, (ctx) => {
  const row = requireVisible(ctx, webhookEndpoints(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = bodyAttributes(ctx)
  const changes: Record<string, unknown> = {}

  if ("url" in attributes) changes.url = validateUrl(attributes.url)
  if ("subscriptions" in attributes) {
    changes.subscriptions = validateSubscriptions(attributes.subscriptions)
  }
  if ("signatureAlgorithm" in attributes) {
    changes.signatureAlgorithm = validateSignatureAlgorithm(
      attributes.signatureAlgorithm,
    )
  }
  if ("apiVersion" in attributes) {
    changes.apiVersion = validateApiVersion(ctx, attributes.apiVersion)
  }

  const product = validateProduct(ctx)
  const changed = Object.keys(changes).length > 0 || product.present

  webhookEndpoints().patch(
    row.id,
    {
      attributes: changes,
      ...(product.present ? { refs: { product: product.linkage } } : {}),
    },
    { touch: changed },
  )

  return { status: 200, body: { data: serializeMockWebhookEndpoint(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/webhook-endpoints/:id`, (ctx) => {
  const row = requireVisible(ctx, webhookEndpoints(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})
