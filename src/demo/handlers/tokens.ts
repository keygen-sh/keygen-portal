import {
  MOCK_ACCOUNT,
  assertWritable,
  attributeError,
  badRequest,
  baseRefs,
  basicCredentials,
  bodyAttributes,
  bodyMeta,
  bodyRelationship,
  type MockContext,
  destroyMock,
  emitMockEvent,
  environmentRef,
  environmentRelationship,
  errors,
  fail,
  findMockEnvironment,
  forbidden,
  inAccount,
  iso,
  type Linkage,
  makeMockRow,
  metaError,
  millis,
  notFound,
  nowIso,
  paginateMock,
  pluralType,
  queryList,
  randomHex,
  randomToken,
  receivedType,
  registerMockDestroyer,
  registerMockSerializer,
  relationshipError,
  requireMockBearer,
  requireVisible,
  type MockResource,
  resource,
  type MockResult,
  mockRoute,
  type MockRow,
  scoped,
  shift,
  singularType,
  mockStore,
  stringOrNull,
  mockSubjectOf,
  toOne,
  unauthorized,
  unpermittedAttribute,
  unprocessable,
  uuid,
  visible,
  WEEK,
} from "@/demo/server"
import { LicensePermissions } from "@/types/licenses"
import { ProductPermissions } from "@/types/products"
import {
  AdminDefaultPermissions,
  DeveloperDefaultPermissions,
  Permissions,
  ReadOnlyDefaultPermissions,
  SalesAgentDefaultPermissions,
  SupportAgentDefaultPermissions,
  UserDefaultPermissions,
  UserPermissions,
} from "@/types/users"

const TYPE = "tokens"
const LABEL = "token"
const TOKEN_DURATION = 2 * WEEK
const MAX_NAME_LENGTH = 255
const WILDCARD = "*"
const ACTIVATION_KIND = "activation-token"
const ACTIVATION_LIMITS = ["maxActivations", "maxDeactivations"] as const
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_PATTERN = /^\d{6}$/
const AUTHORIZATION_HEADER = { header: "Authorization" }

const UserRoleTokenKinds: Readonly<Record<string, string>> = {
  admin: "admin-token",
  developer: "developer-token",
  "sales-agent": "sales-token",
  "support-agent": "support-token",
  "read-only": "read-only-token",
  user: "user-token",
}

const BearerTypeTokenKinds: Readonly<Record<string, string>> = {
  products: "product-token",
  licenses: ACTIVATION_KIND,
  environments: "environment-token",
}

const TokenKindPrefixes: Readonly<Record<string, string>> = {
  "admin-token": "admin",
  "developer-token": "dev",
  "sales-token": "sales",
  "support-token": "spprt",
  "read-only-token": "read",
  "user-token": "user",
  "product-token": "prod",
  [ACTIVATION_KIND]: "activ",
  "environment-token": "env",
}

const UserRoleAllowedPermissions: Readonly<Record<string, readonly string[]>> =
  {
    admin: Permissions,
    developer: Permissions,
    "sales-agent": Permissions,
    "support-agent": Permissions,
    "read-only": ReadOnlyDefaultPermissions,
    user: UserPermissions,
  }

const UserRoleDefaultPermissions: Readonly<Record<string, readonly string[]>> =
  {
    admin: AdminDefaultPermissions,
    developer: DeveloperDefaultPermissions,
    "sales-agent": SalesAgentDefaultPermissions,
    "support-agent": SupportAgentDefaultPermissions,
    "read-only": ReadOnlyDefaultPermissions,
    user: UserDefaultPermissions,
  }

const BEARER_ROUTES = [
  { segment: "users", label: "user", alias: "email", status: 200 },
  { segment: "licenses", label: "license", alias: "key", status: 200 },
  { segment: "products", label: "product", alias: "code", status: 200 },
  { segment: "environments", label: "environment", alias: "code", status: 201 },
] as const

type BearerRoute = (typeof BEARER_ROUTES)[number]

const tokens = () => mockStore.table(TYPE)
const users = () => mockStore.table("users")
const secondFactors = () => mockStore.table("second-factors")

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  const entries: unknown[] = value
  if (!entries.every((entry): entry is string => typeof entry === "string")) {
    return null
  }
  return entries
}

function underscore(value: string): string {
  return value.trim().toLowerCase().replace(/-/g, "_")
}

function userRole(bearer: MockRow): string {
  return stringOrNull(bearer.attributes.role) ?? "user"
}

function bearerRole(bearer: MockRow): string {
  if (bearer.type === "users") return underscore(userRole(bearer))
  return singularType(bearer.type)
}

export function tokenKind(bearer: MockRow | null): string {
  if (!bearer) return "orphaned-token"
  if (bearer.type === "users") {
    return UserRoleTokenKinds[userRole(bearer)] ?? "token"
  }
  return BearerTypeTokenKinds[bearer.type] ?? "token"
}

function generateSecret(kind: string): string {
  const prefix = TokenKindPrefixes[kind] ?? "token"
  if (kind === ACTIVATION_KIND) return `${prefix}-${randomHex(32)}v3`
  return randomToken(prefix)
}

function allowedPermissions(bearer: MockRow): readonly string[] {
  switch (bearer.type) {
    case "users":
      return UserRoleAllowedPermissions[userRole(bearer)] ?? UserPermissions
    case "products":
      return ProductPermissions
    case "licenses":
      return LicensePermissions
    default:
      return Permissions
  }
}

function defaultPermissions(bearer: MockRow): readonly string[] {
  switch (bearer.type) {
    case "users":
      return (
        UserRoleDefaultPermissions[userRole(bearer)] ?? UserDefaultPermissions
      )
    case "products":
      return ProductPermissions
    case "licenses":
      return LicensePermissions
    default:
      return [WILDCARD]
  }
}

function bearerPermissions(bearer: MockRow): readonly string[] {
  return stringList(bearer.attributes.permissions) ?? defaultPermissions(bearer)
}

export function effectivePermissions(
  row: MockRow,
  bearer: MockRow | null,
): string[] {
  const own = stringList(row.attributes.permissions) ?? [WILDCARD]
  if (!bearer) return own

  const granted = bearerPermissions(bearer)
  if (own.includes(WILDCARD)) return [...granted]
  if (granted.includes(WILDCARD)) return own

  return own.filter((permission) => granted.includes(permission))
}

function bearerEnvironment(bearer: MockRow): Linkage | null {
  if (bearer.type === "environments") {
    return { type: "environments", id: bearer.id }
  }
  return bearer.refs.environment ?? null
}

function tokenEnvironment(ctx: MockContext, bearer: MockRow): Linkage | null {
  return environmentRef(ctx) ?? bearerEnvironment(bearer)
}

function defaultExpiry(bearer: MockRow): string | null {
  if (bearer.type === "users" && userRole(bearer) === "user") {
    return shift(nowIso(), TOKEN_DURATION)
  }
  return null
}

function isExpired(row: MockRow, at: number): boolean {
  const expiry = millis(stringOrNull(row.attributes.expiry))
  return expiry != null && expiry < at
}

function buildToken(
  ctx: MockContext,
  row: MockRow,
  includeSecret: boolean,
): MockResource {
  const bearer = mockSubjectOf(row) ?? null
  const kind = tokenKind(bearer)

  return resource(
    ctx,
    row,
    {
      kind,
      ...(includeSecret ? { token: row.attributes.token } : {}),
      expiry: row.attributes.expiry ?? null,
      name: row.attributes.name ?? null,
      ...(kind === ACTIVATION_KIND
        ? {
            maxActivations: row.attributes.maxActivations ?? null,
            activations: row.attributes.activations ?? 0,
            maxDeactivations: row.attributes.maxDeactivations ?? null,
            deactivations: row.attributes.deactivations ?? 0,
          }
        : {}),
      permissions: effectivePermissions(row, bearer),
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      bearer: toOne(ctx, row.refs.bearer),
    },
  )
}

export function serializeMockToken(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return buildToken(ctx, row, false)
}

export function serializeMockTokenWithSecret(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return buildToken(ctx, row, true)
}

registerMockSerializer(TYPE, serializeMockToken)

registerMockDestroyer(TYPE, (ctx, row) => {
  tokens().delete(row.id)
  emitMockEvent(ctx, "token.revoked", { resource: row })
})

function validateName(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "string") {
    fail(
      badRequest(
        `type mismatch (received ${receivedType(value)} expected string)`,
        { pointer: "/data/attributes/name" },
      ),
    )
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

function validateExpiry(value: unknown): string | null {
  if (value === null) return null
  const parsed = typeof value === "string" ? millis(value) : null
  if (parsed == null) {
    fail(
      badRequest(
        `type mismatch (received ${receivedType(value)} expected time)`,
        { pointer: "/data/attributes/expiry" },
      ),
    )
  }
  return iso(parsed)
}

function validatePermissions(value: unknown, bearer: MockRow): string[] {
  if (value === undefined || value === null) return [WILDCARD]

  const requested = stringList(value)
  if (!requested) {
    fail(
      badRequest(
        `type mismatch (received ${receivedType(value)} expected array)`,
        { pointer: "/data/attributes/permissions" },
      ),
    )
  }

  const granted = bearerPermissions(bearer)
  const ceiling = granted.includes(WILDCARD)
    ? allowedPermissions(bearer)
    : granted
  const unsupported = requested.some(
    (permission) => permission !== WILDCARD && !ceiling.includes(permission),
  )
  if (unsupported) {
    fail(
      unprocessable(
        attributeError("permissions", "NOT_ALLOWED", "unsupported permissions"),
      ),
    )
  }

  return requested
}

function validateLimit(value: unknown, attribute: string): number | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "number" || !Number.isInteger(value)) {
    fail(
      badRequest(
        `type mismatch (received ${receivedType(value)} expected integer)`,
        { pointer: `/data/attributes/${attribute}` },
      ),
    )
  }
  if (value < 0) {
    fail(
      unprocessable(
        attributeError(
          attribute,
          "INVALID",
          "must be greater than or equal to 0",
        ),
      ),
    )
  }
  return value
}

function insertToken(
  ctx: MockContext,
  bearer: MockRow,
  attributes: Record<string, unknown>,
  environment: Linkage | null,
): MockRow {
  const kind = tokenKind(bearer)
  const activation = kind === ACTIVATION_KIND

  for (const limit of ACTIVATION_LIMITS) {
    if (!activation && limit in attributes) fail(unpermittedAttribute(limit))
  }

  const row = makeMockRow(
    TYPE,
    uuid(),
    {
      name: validateName(attributes.name),
      token: generateSecret(kind),
      expiry:
        "expiry" in attributes
          ? validateExpiry(attributes.expiry)
          : defaultExpiry(bearer),
      permissions: validatePermissions(attributes.permissions, bearer),
      ...(activation
        ? {
            maxActivations: validateLimit(
              attributes.maxActivations,
              "maxActivations",
            ),
            activations: 0,
            maxDeactivations: validateLimit(
              attributes.maxDeactivations,
              "maxDeactivations",
            ),
            deactivations: 0,
          }
        : {}),
    },
    {
      ...baseRefs(ctx),
      environment,
      bearer: { type: bearer.type, id: bearer.id },
    },
  )

  tokens().insert(row)
  return row
}

function findUserByEmail(ctx: MockContext, email: string): MockRow | undefined {
  const candidates = users().where(
    (row) =>
      inAccount(ctx, row) &&
      stringOrNull(row.attributes.email)?.toLowerCase() === email.toLowerCase(),
  )
  return (
    candidates.find((row) => row.refs.environment == null) ?? candidates.at(0)
  )
}

function hasEnabledSecondFactor(user: MockRow): boolean {
  return (
    secondFactors().find(
      (row) => row.refs.user?.id === user.id && row.attributes.enabled === true,
    ) != null
  )
}

function login(
  ctx: MockContext,
  credentials: { email: string; password: string },
): MockResult {
  const email = credentials.email.trim()
  if (!EMAIL_PATTERN.test(email)) {
    fail(
      unauthorized("EMAIL_REQUIRED", "email is required", AUTHORIZATION_HEADER),
    )
  }

  const user = findUserByEmail(ctx, email)
  if (!user) {
    fail(
      unauthorized(
        "EMAIL_INVALID",
        "email must be valid",
        AUTHORIZATION_HEADER,
      ),
    )
  }

  const password = stringOrNull(user.attributes.password)
  if (!password) {
    fail(
      unauthorized(
        "PASSWORD_NOT_SUPPORTED",
        "password is unsupported",
        AUTHORIZATION_HEADER,
      ),
    )
  }
  if (credentials.password === "") {
    fail(
      unauthorized(
        "PASSWORD_REQUIRED",
        "password is required",
        AUTHORIZATION_HEADER,
      ),
    )
  }

  if (hasEnabledSecondFactor(user)) {
    const otp = bodyMeta(ctx).otp
    if (otp === undefined || otp === null) {
      fail(metaError("otp", "second factor is required", "OTP_REQUIRED", 401))
    }
    if (typeof otp !== "string" || !OTP_PATTERN.test(otp)) {
      fail(metaError("otp", "second factor must be valid", "OTP_INVALID", 401))
    }
  }

  if (credentials.password !== password) {
    fail(
      unauthorized(
        "PASSWORD_INVALID",
        "password must be valid",
        AUTHORIZATION_HEADER,
      ),
    )
  }

  if (user.attributes.bannedAt != null) {
    fail(
      errors(403, {
        title: "Access denied",
        detail: "User is banned",
        code: "USER_BANNED",
      }),
    )
  }

  const row = insertToken(
    ctx,
    user,
    bodyAttributes(ctx),
    tokenEnvironment(ctx, user),
  )
  ctx.bearer = { token: row, subject: user }
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "token.generated", { resource: row })

  return { status: 201, body: { data: serializeMockTokenWithSecret(ctx, row) } }
}

function requestedBearer(ctx: MockContext, linkage: Linkage | null): MockRow {
  const type = linkage ? pluralType(linkage.type.toLowerCase()) : ""
  const supported = BEARER_ROUTES.some(
    (candidate) => candidate.segment === type,
  )
  const row =
    linkage && supported ? mockStore.table(type).get(linkage.id) : undefined
  if (!row || !inAccount(ctx, row)) {
    fail(unprocessable(relationshipError("bearer", "NOT_FOUND", "must exist")))
  }
  return row
}

function reusableEnvironmentToken(
  ctx: MockContext,
  bearer: MockRow,
  environment: MockRow,
): MockRow | undefined {
  const now = Date.now()
  return tokens().find((row) => {
    const linkage = row.refs.bearer
    return (
      linkage != null &&
      linkage.type === bearer.type &&
      linkage.id === bearer.id &&
      inAccount(ctx, row) &&
      row.refs.environment?.id === environment.id &&
      row.attributes.name == null &&
      typeof row.attributes.token === "string" &&
      !isExpired(row, now)
    )
  })
}

function generateForCurrentBearer(ctx: MockContext): MockResult {
  const { subject } = requireMockBearer(ctx)
  const bearerLinkage = bodyRelationship(ctx, "bearer")
  const bearer = bearerLinkage.present
    ? requestedBearer(ctx, bearerLinkage.linkage)
    : subject
  const ownToken = bearer.type === subject.type && bearer.id === subject.id

  if (!ownToken && bearer.type !== "users") fail(forbidden())
  if (ownToken && (bearer.type === "products" || bearer.type === "licenses")) {
    fail(forbidden())
  }

  const attributes = bodyAttributes(ctx)
  const environmentLinkage = bodyRelationship(ctx, "environment")

  if (environmentLinkage.present && environmentLinkage.linkage) {
    const environment = findMockEnvironment(
      ctx.accountId,
      environmentLinkage.linkage.id,
    )
    if (!environment) {
      fail(
        unprocessable(
          relationshipError("environment", "NOT_FOUND", "must exist"),
        ),
      )
    }

    const existing =
      Object.keys(attributes).length === 0
        ? reusableEnvironmentToken(ctx, bearer, environment)
        : undefined
    if (existing) {
      ctx.resource = { type: TYPE, id: existing.id }
      return {
        status: 201,
        body: { data: serializeMockTokenWithSecret(ctx, existing) },
      }
    }

    const minted = insertToken(ctx, bearer, attributes, {
      type: "environments",
      id: environment.id,
    })
    ctx.resource = { type: TYPE, id: minted.id }

    emitMockEvent(ctx, "token.generated", { resource: minted })

    return {
      status: 201,
      body: { data: serializeMockTokenWithSecret(ctx, minted) },
    }
  }

  const row = insertToken(
    ctx,
    bearer,
    attributes,
    tokenEnvironment(ctx, bearer),
  )
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "token.generated", { resource: row })

  return { status: 201, body: { data: serializeMockTokenWithSecret(ctx, row) } }
}

mockRoute(
  "POST",
  `${MOCK_ACCOUNT}/tokens`,
  (ctx) => {
    const credentials = basicCredentials(ctx)
    if (credentials) return login(ctx, credentials)
    return generateForCurrentBearer(ctx)
  },
  { public: true },
)

function withQueryEnvironment(ctx: MockContext): MockContext {
  if (ctx.environment) return ctx
  const identifier = ctx.query.get("environment")
  if (!identifier) return ctx
  const environment = findMockEnvironment(ctx.accountId, identifier)
  return environment ? { ...ctx, environment } : ctx
}

function bearerFilter(ctx: MockContext): (row: MockRow) => boolean {
  const type = ctx.query.get("bearer[type]") ?? ""
  const id = ctx.query.get("bearer[id]") ?? ""
  const roles = queryList(ctx.query, "bearer[role]").map(underscore)
  const bearerType = type === "" ? null : pluralType(type.trim().toLowerCase())

  if (!bearerType && id === "" && roles.length === 0) return () => true

  return (row) => {
    const linkage = row.refs.bearer
    if (!linkage) return false
    if (bearerType && linkage.type !== bearerType) return false
    if (id !== "" && linkage.id !== id) return false
    if (roles.length === 0) return true

    const bearer = mockSubjectOf(row)
    return bearer != null && roles.includes(bearerRole(bearer))
  }
}

mockRoute("GET", `${MOCK_ACCOUNT}/tokens`, (ctx) => {
  const rows = scoped(withQueryEnvironment(ctx), tokens().all()).filter(
    bearerFilter(ctx),
  )
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockToken(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/tokens/:id`, (ctx) => {
  const row = requireVisible(ctx, tokens(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockToken(ctx, row) } }
})

mockRoute("PUT", `${MOCK_ACCOUNT}/tokens/:id`, (ctx) => {
  const row = requireVisible(ctx, tokens(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const kind = tokenKind(mockSubjectOf(row) ?? null)
  const expiry = stringOrNull(row.attributes.expiry)

  tokens().patch(row.id, {
    attributes: {
      token: generateSecret(kind),
      ...(expiry != null ? { expiry: shift(nowIso(), TOKEN_DURATION) } : {}),
    },
  })

  emitMockEvent(ctx, "token.regenerated", { resource: row })

  return { status: 200, body: { data: serializeMockTokenWithSecret(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/tokens/:id`, (ctx) => {
  const row = tokens().get(ctx.params.id)
  if (!row || !inAccount(ctx, row)) fail(notFound(LABEL, ctx.params.id))
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

function findBearer(
  ctx: MockContext,
  bearerRoute: BearerRoute,
  identifier: string,
): MockRow {
  if (bearerRoute.segment === "environments") {
    const environment = findMockEnvironment(ctx.accountId, identifier)
    if (!environment) fail(notFound(bearerRoute.label, identifier))
    return environment
  }

  const table = mockStore.table(bearerRoute.segment)
  const byId = visible(ctx, table, identifier)
  if (byId) return byId

  const byAlias = scoped(ctx, table.all()).find(
    (row) =>
      stringOrNull(row.attributes[bearerRoute.alias])?.toLowerCase() ===
      identifier.toLowerCase(),
  )
  if (!byAlias) fail(notFound(bearerRoute.label, identifier))
  return byAlias
}

for (const bearerRoute of BEARER_ROUTES) {
  mockRoute(
    "POST",
    `${MOCK_ACCOUNT}/${bearerRoute.segment}/:bearerId/tokens`,
    (ctx) => {
      const bearer = findBearer(ctx, bearerRoute, ctx.params.bearerId)
      ctx.resource = { type: bearer.type, id: bearer.id }

      const row = insertToken(
        ctx,
        bearer,
        bodyAttributes(ctx),
        tokenEnvironment(ctx, bearer),
      )

      emitMockEvent(ctx, "token.generated", { resource: row })

      return {
        status: bearerRoute.status,
        body: { data: serializeMockTokenWithSecret(ctx, row) },
      }
    },
  )
}
