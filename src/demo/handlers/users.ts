import {
  MOCK_ACCOUNT,
  accountPath,
  accountRef,
  accountRows,
  assertWritable,
  attributeError,
  badRequest,
  baseRefs,
  bodyAttributes,
  bodyMeta,
  bodyRelationship,
  camelize,
  type MockContext,
  DAY,
  destroyMock,
  destroyMockWhere,
  diffMetadata,
  emitMockEvent,
  environmentRelationship,
  fail,
  HOUR,
  inAccount,
  isRecord,
  isUuid,
  linkageOf,
  makeMockRow,
  metaError,
  millis,
  normalizeMetadata,
  notFound,
  nowIso,
  paginateMock,
  queryList,
  queryNested,
  randomHex,
  registerMockDestroyer,
  registerMockSerializer,
  relationshipError,
  requireVisible,
  type MockResource,
  resource,
  mockRoute,
  type MockRow,
  scoped,
  serializeMock,
  mockStore,
  stringOrNull,
  stripUuidDashes,
  toMany,
  toOne,
  typeMismatch,
  unprocessable,
  uuid,
  visible,
} from "@/demo/server"
import {
  AllRoles,
  AllowedPermissionsByRole,
  DefaultPermissionsByRole,
  Permissions,
  UserRole,
  UserStatus,
  WildcardPermission,
} from "@/types/users"

const TYPE = "users"
const LABEL = "user"
const FACTOR_TYPE = "second-factors"
const FACTOR_LABEL = "second factor"
const MAX_LENGTH = 255
const MIN_PASSWORD_LENGTH = 6
const ACTIVITY_WINDOW = 90 * DAY
const RESET_TOKEN_TTL = 24 * HOUR
const OTP_PATTERN = /^\d{6}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const SECRET_ATTRIBUTES = [
  "password",
  "passwordResetToken",
  "passwordResetSentAt",
]
const LICENSE_ACTIVITY_ATTRIBUTES = [
  "lastValidated",
  "lastCheckOut",
  "lastCheckIn",
]
const ROLE_ASSIGNING_BEARER_TYPES = ["environments"]
const ROLE_NAMES: readonly string[] = AllRoles
const ALL_PERMISSIONS = new Set<string>(Permissions)

const users = () => mockStore.table(TYPE)
const secondFactors = () => mockStore.table(FACTOR_TYPE)
const licenses = () => mockStore.table("licenses")
const licenseUsers = () => mockStore.table("license-users")
const policies = () => mockStore.table("policies")
const products = () => mockStore.table("products")
const groups = () => mockStore.table("groups")
const groupOwners = () => mockStore.table("group-owners")
const settings = () => mockStore.table("settings")
const demoMail = () => mockStore.table("demo-mail")

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  )
}

function isRole(value: unknown): value is UserRole {
  return typeof value === "string" && ROLE_NAMES.includes(value)
}

function roleOf(row: MockRow): UserRole {
  const role = row.attributes.role
  return isRole(role) ? role : UserRole.User
}

function permissionsOf(row: MockRow): string[] | null {
  return isStringList(row.attributes.permissions)
    ? row.attributes.permissions
    : null
}

function sortPermissions(actions: Iterable<string>): string[] {
  return [...new Set(actions)].sort()
}

function isFullPermissionSet(value: unknown): boolean {
  if (!isStringList(value)) return false
  if (value.includes(WildcardPermission)) return true
  return Permissions.every((permission) => value.includes(permission))
}

function hasFullPermissions(row: MockRow): boolean {
  return isFullPermissionSet(row.attributes.permissions)
}

function randomBase32(length: number): string {
  let output = ""
  while (output.length < length) {
    output += BASE32_ALPHABET.charAt(
      Math.floor(Math.random() * BASE32_ALPHABET.length),
    )
  }
  return output
}

function totpUri(email: string, secret: string): string {
  return `otpauth://totp/Keygen:${encodeURIComponent(email)}?secret=${secret}&issuer=Keygen`
}

function attachedLicenseIds(userId: string): Set<string> {
  return new Set(
    licenseUsers()
      .where((join) => join.refs.user?.id === userId)
      .map((join) => join.refs.license?.id ?? "")
      .filter((id) => id !== ""),
  )
}

function licensesForUser(userId: string): MockRow[] {
  const attached = attachedLicenseIds(userId)
  return licenses().where(
    (license) => license.refs.owner?.id === userId || attached.has(license.id),
  )
}

function ownsLicense(userId: string): boolean {
  return licenses().find((license) => license.refs.owner?.id === userId) != null
}

function productIdOf(license: MockRow): string | null {
  const policy = policies().get(license.refs.policy?.id ?? "")
  return policy?.refs.product?.id ?? null
}

function hasRecentActivity(license: MockRow, threshold: number): boolean {
  if (Date.parse(license.created) >= threshold) return true
  return LICENSE_ACTIVITY_ATTRIBUTES.some((attribute) => {
    const at = millis(stringOrNull(license.attributes[attribute]))
    return at != null && at >= threshold
  })
}

export function userStatus(row: MockRow): UserStatus {
  if (row.attributes.bannedAt != null) return UserStatus.Banned

  const threshold = Date.now() - ACTIVITY_WINDOW
  if (Date.parse(row.created) >= threshold) return UserStatus.Active
  if (
    licensesForUser(row.id).some((license) =>
      hasRecentActivity(license, threshold),
    )
  ) {
    return UserStatus.Active
  }

  return UserStatus.Inactive
}

function hasStatus(row: MockRow, status: string): boolean {
  const derived: string = userStatus(row)
  return derived === status
}

function productsForUser(ctx: MockContext, userId: string): MockRow[] {
  const productIds = new Set<string>()
  for (const license of licensesForUser(userId)) {
    const productId = productIdOf(license)
    if (productId) productIds.add(productId)
  }
  return scoped(
    ctx,
    [...productIds]
      .map((id) => products().get(id))
      .filter((row): row is MockRow => row != null),
  )
}

function factorsForUser(userId: string): MockRow[] {
  return secondFactors().where((factor) => factor.refs.user?.id === userId)
}

export function hasEnabledSecondFactor(user: MockRow): boolean {
  return factorsForUser(user.id).some(
    (factor) => factor.attributes.enabled === true,
  )
}

export function serializeMockUser(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const firstName = stringOrNull(row.attributes.firstName)
  const lastName = stringOrNull(row.attributes.lastName)
  const base = `${accountPath(ctx)}/users/${row.id}`

  return resource(
    ctx,
    row,
    {
      fullName:
        firstName != null && lastName != null
          ? `${firstName} ${lastName}`
          : null,
      firstName,
      lastName,
      email: row.attributes.email,
      status: userStatus(row),
      role: roleOf(row),
      permissions: permissionsOf(row),
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      group: toOne(ctx, row.refs.group, `${base}/group`),
      products: toMany(`${base}/products`),
      licenses: toMany(`${base}/licenses`),
      machines: toMany(`${base}/machines`),
      tokens: toMany(`${base}/tokens`),
      secondFactors: toMany(`${base}/second-factors`),
    },
  )
}

export function serializeMockSecondFactor(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const enabled = row.attributes.enabled === true
  const userId = row.refs.user?.id ?? ""

  return resource(
    ctx,
    row,
    {
      uri: enabled ? null : stringOrNull(row.attributes.uri),
      secret: enabled ? null : stringOrNull(row.attributes.secret),
      enabled,
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      user: toOne(ctx, row.refs.user),
    },
    {
      links: {
        self: `${accountPath(ctx)}/users/${userId}/second-factors/${row.id}`,
      },
    },
  )
}

registerMockSerializer(TYPE, serializeMockUser)
registerMockSerializer(FACTOR_TYPE, serializeMockSecondFactor)

function revokeTokens(
  ctx: MockContext | null,
  userId: string,
  exceptTokenId: string | null,
): void {
  destroyMockWhere(ctx, "tokens", (token) => {
    const bearer = token.refs.bearer
    return (
      bearer?.type === TYPE &&
      bearer.id === userId &&
      token.id !== exceptTokenId
    )
  })
}

registerMockDestroyer(TYPE, (ctx, row) => {
  destroyMockWhere(
    ctx,
    "licenses",
    (license) => license.refs.owner?.id === row.id,
  )
  destroyMockWhere(
    ctx,
    "machines",
    (machine) => machine.refs.owner?.id === row.id,
  )
  revokeTokens(ctx, row.id, null)

  for (const join of licenseUsers().where(
    (candidate) => candidate.refs.user?.id === row.id,
  )) {
    licenseUsers().delete(join.id)
  }
  for (const owner of groupOwners().where(
    (candidate) => candidate.refs.user?.id === row.id,
  )) {
    groupOwners().delete(owner.id)
  }
  for (const factor of factorsForUser(row.id)) {
    secondFactors().delete(factor.id)
  }
  for (const mail of demoMail().where(
    (candidate) => candidate.refs.user?.id === row.id,
  )) {
    demoMail().delete(mail.id)
  }

  users().delete(row.id)
  emitMockEvent(ctx, "user.deleted", { resource: row })
})

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function findUser(ctx: MockContext, identifier: string): MockRow {
  const byId = users().get(identifier)
  if (byId) return requireVisible(ctx, users(), byId.id, LABEL)

  const email = normalizeEmail(identifier)
  const byEmail = scoped(ctx, users().all()).find(
    (row) => row.attributes.email === email,
  )
  if (!byEmail) fail(notFound(LABEL, identifier))
  return byEmail
}

function findAccountUser(ctx: MockContext, identifier: string): MockRow {
  const email = normalizeEmail(identifier)
  const row = accountRows(ctx, users().all()).find(
    (candidate) =>
      candidate.id === identifier || candidate.attributes.email === email,
  )
  if (!row) fail(notFound(LABEL, identifier))
  return row
}

function findFactor(ctx: MockContext, user: MockRow, id: string): MockRow {
  const factor = secondFactors().get(id)
  if (!factor || factor.refs.user?.id !== user.id || !inAccount(ctx, factor)) {
    fail(notFound(FACTOR_LABEL, id))
  }
  return factor
}

function bearerMayAssignRole(ctx: MockContext): boolean {
  const subject = ctx.bearer?.subject
  if (!subject) return false
  if (ROLE_ASSIGNING_BEARER_TYPES.includes(subject.type)) return true
  return subject.type === TYPE && roleOf(subject) === UserRole.Admin
}

function otherAdmins(ctx: MockContext, row: MockRow): MockRow[] {
  return users().where(
    (candidate) =>
      candidate.id !== row.id &&
      inAccount(ctx, candidate) &&
      roleOf(candidate) === UserRole.Admin,
  )
}

function adminsRequired(detail: string): never {
  fail(unprocessable(relationshipError("account", "ADMINS_REQUIRED", detail)))
}

function validateEmail(ctx: MockContext, value: unknown, excludeId?: string) {
  if (value === undefined) {
    fail(badRequest("is missing", { pointer: "/data/attributes/email" }))
  }
  if (typeof value !== "string" || value.trim() === "") {
    fail(badRequest("cannot be blank", { pointer: "/data/attributes/email" }))
  }

  const email = normalizeEmail(value)
  if (email.length > MAX_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          "email",
          "TOO_LONG",
          `is too long (maximum is ${MAX_LENGTH} characters)`,
        ),
      ),
    )
  }
  if (!EMAIL_PATTERN.test(email)) {
    fail(unprocessable(attributeError("email", "INVALID", "is invalid")))
  }

  const taken = users().find(
    (row) =>
      row.id !== excludeId &&
      inAccount(ctx, row) &&
      row.attributes.email === email,
  )
  if (taken) {
    fail(
      unprocessable(attributeError("email", "TAKEN", "has already been taken")),
    )
  }

  return email
}

function validateName(attribute: string, value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== "string") {
    fail(typeMismatch(`/data/attributes/${attribute}`, value, "string"))
  }
  if (value.length > MAX_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          attribute,
          "TOO_LONG",
          `is too long (maximum is ${MAX_LENGTH} characters)`,
        ),
      ),
    )
  }
  return value
}

function validatePassword(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== "string") {
    fail(typeMismatch("/data/attributes/password", value, "string"))
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          "password",
          "TOO_SHORT",
          `is too short (minimum is ${MIN_PASSWORD_LENGTH} characters)`,
        ),
      ),
    )
  }
  return value
}

function validateRole(value: unknown): UserRole {
  if (!isRole(value)) {
    fail(
      badRequest(`must be one of: ${AllRoles.join(", ")}`, {
        pointer: "/data/attributes/role",
      }),
    )
  }
  return value
}

function validatePermissions(value: unknown, role: UserRole): string[] {
  if (!isStringList(value)) {
    fail(typeMismatch("/data/attributes/permissions", value, "array"))
  }

  const allowed = new Set<string>(AllowedPermissionsByRole[role])
  const unsupported = value.some(
    (action) =>
      action !== WildcardPermission &&
      (!ALL_PERMISSIONS.has(action) || !allowed.has(action)),
  )
  if (unsupported) {
    fail(
      unprocessable(
        attributeError("permissions", "NOT_ALLOWED", "unsupported permissions"),
      ),
    )
  }

  return sortPermissions(value)
}

function validateMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata === undefined || metadata === null) return {}
  if (!isRecord(metadata)) {
    fail(typeMismatch("/data/attributes/metadata", metadata, "object"))
  }
  if (Object.keys(metadata).length > 64) {
    fail(
      unprocessable(
        attributeError(
          "metadata",
          "TOO_LONG",
          "too many keys (exceeded limit of 64 keys)",
        ),
      ),
    )
  }
  return normalizeMetadata(metadata)
}

function defaultPermissionsFor(ctx: MockContext, role: UserRole): string[] {
  if (role === UserRole.User) {
    const setting = accountRows(ctx, settings().all()).find(
      (row) => row.attributes.key === "default_user_permissions",
    )
    const value = setting?.attributes.value
    if (isStringList(value) && value.length > 0) return sortPermissions(value)
  }
  return sortPermissions(DefaultPermissionsByRole[role])
}

function permissionsAfterRoleChange(
  ctx: MockContext,
  row: MockRow,
  role: UserRole,
): string[] {
  const current = permissionsOf(row)
  if (!current) return defaultPermissionsFor(ctx, role)

  const retained = new Set<string>([
    ...DefaultPermissionsByRole[role],
    WildcardPermission,
  ])
  return sortPermissions(current.filter((action) => retained.has(action)))
}

function requireGroup(
  ctx: MockContext,
  groupId: string,
  excludeUserId: string | null,
): MockRow {
  const group = visible(ctx, groups(), groupId)
  if (!group) {
    fail(unprocessable(relationshipError("group", "NOT_FOUND", "must exist")))
  }

  const maxUsers = group.attributes.maxUsers
  if (typeof maxUsers === "number") {
    const members = users().where(
      (candidate) =>
        candidate.refs.group?.id === group.id && candidate.id !== excludeUserId,
    ).length
    if (members >= maxUsers) {
      fail(
        unprocessable(
          relationshipError(
            "group",
            "USER_LIMIT_EXCEEDED",
            `user count has exceeded maximum allowed by current group (${maxUsers})`,
          ),
        ),
      )
    }
  }

  return group
}

function requireMetaString(meta: Record<string, unknown>, key: string): string {
  const value = meta[key]
  if (value === undefined) {
    fail(badRequest("is missing", { pointer: `/meta/${key}` }))
  }
  if (typeof value !== "string") {
    fail(typeMismatch(`/meta/${key}`, value, "string"))
  }
  return value
}

function requireOtp(meta: Record<string, unknown>): void {
  const otp = meta.otp
  if (typeof otp !== "string" || !OTP_PATTERN.test(otp)) {
    fail(metaError("otp", "second factor must be valid", "OTP_INVALID", 401))
  }
}

function matchesMetadata(
  row: MockRow,
  filters: Record<string, string>,
): boolean {
  const metadata: Record<string, unknown> = isRecord(row.attributes.metadata)
    ? row.attributes.metadata
    : {}
  return Object.entries(filters).every(([key, value]) => {
    const normalizedKey = camelize(key)
    return (
      normalizedKey in metadata && String(metadata[normalizedKey]) === value
    )
  })
}

function userResponse(ctx: MockContext, row: MockRow, status = 200) {
  return { status, body: { data: serializeMockUser(ctx, row) } }
}

mockRoute("GET", `${MOCK_ACCOUNT}/users`, (ctx) => {
  const roles = queryList(ctx.query, "roles")
  const roleFilter: readonly string[] = roles.length > 0 ? roles : AllRoles
  const status = ctx.query.get("status")?.toUpperCase()
  const assigned = ctx.query.get("assigned")
  const product = ctx.query.get("product")
  const group = ctx.query.get("group")
  const metadata = queryNested(ctx.query, "metadata")

  const rows = scoped(ctx, users().all()).filter((row) => {
    if (!roleFilter.includes(roleOf(row))) return false
    if (status && !hasStatus(row, status)) return false
    if (assigned && ownsLicense(row.id) !== (assigned === "true")) return false
    if (
      product &&
      !licensesForUser(row.id).some(
        (license) => productIdOf(license) === product,
      )
    ) {
      return false
    }
    if (group && row.refs.group?.id !== group) return false
    return matchesMetadata(row, metadata)
  })

  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockUser(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/users/:id`, (ctx) => {
  const row = findUser(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return userResponse(ctx, row)
})

mockRoute("POST", `${MOCK_ACCOUNT}/users`, (ctx) => {
  const attributes = bodyAttributes(ctx)
  const email = validateEmail(ctx, attributes.email)
  const firstName = validateName("firstName", attributes.firstName)
  const lastName = validateName("lastName", attributes.lastName)
  const password = validatePassword(attributes.password)
  const role =
    "role" in attributes && bearerMayAssignRole(ctx)
      ? validateRole(attributes.role)
      : UserRole.User
  const permissions =
    attributes.permissions == null
      ? defaultPermissionsFor(ctx, role)
      : validatePermissions(attributes.permissions, role)
  const metadata = validateMetadata(attributes.metadata)

  const groupLinkage = bodyRelationship(ctx, "group").linkage
  const group = groupLinkage ? requireGroup(ctx, groupLinkage.id, null) : null

  const row = makeMockRow(
    TYPE,
    uuid(),
    {
      email,
      firstName,
      lastName,
      role,
      password,
      permissions,
      bannedAt: null,
      passwordResetToken: null,
      passwordResetSentAt: null,
      metadata,
    },
    {
      ...baseRefs(ctx),
      group: group ? { type: "groups", id: group.id } : null,
    },
  )
  users().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "user.created", { resource: row })

  return userResponse(ctx, row, 201)
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/users/:id`, (ctx) => {
  const row = findUser(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = bodyAttributes(ctx)
  const changes: Record<string, unknown> = {}
  const currentRole = roleOf(row)
  const nextRole =
    "role" in attributes && bearerMayAssignRole(ctx)
      ? validateRole(attributes.role)
      : currentRole
  const roleChanged = nextRole !== currentRole

  if ("email" in attributes) {
    changes.email = validateEmail(ctx, attributes.email, row.id)
  }
  if ("firstName" in attributes) {
    changes.firstName = validateName("firstName", attributes.firstName)
  }
  if ("lastName" in attributes) {
    changes.lastName = validateName("lastName", attributes.lastName)
  }
  if ("password" in attributes) {
    changes.password = validatePassword(attributes.password)
  }
  if ("metadata" in attributes) {
    changes.metadata = validateMetadata(attributes.metadata)
  }

  if (roleChanged) {
    if (currentRole === UserRole.Admin && otherAdmins(ctx, row).length === 0) {
      adminsRequired("account must have at least 1 admin user")
    }
    changes.role = nextRole
    changes.permissions = permissionsAfterRoleChange(ctx, row, nextRole)
  }

  if ("permissions" in attributes) {
    changes.permissions =
      attributes.permissions == null
        ? defaultPermissionsFor(ctx, nextRole)
        : validatePermissions(attributes.permissions, nextRole)
  }

  if (
    !roleChanged &&
    nextRole === UserRole.Admin &&
    "permissions" in changes &&
    !isFullPermissionSet(changes.permissions) &&
    !otherAdmins(ctx, row).some(hasFullPermissions)
  ) {
    adminsRequired(
      "account must have at least 1 admin user with a full permission set",
    )
  }

  const before = { ...row.attributes }
  users().patch(
    row.id,
    { attributes: changes },
    { touch: Object.keys(changes).length > 0 },
  )
  if (roleChanged) {
    revokeTokens(ctx, row.id, ctx.bearer?.token.id ?? null)
  }

  emitMockEvent(ctx, "user.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes, SECRET_ATTRIBUTES),
  })

  return userResponse(ctx, row)
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/users/:id`, (ctx) => {
  const row = findUser(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  if (roleOf(row) === UserRole.Admin && otherAdmins(ctx, row).length === 0) {
    adminsRequired("account must have at least 1 admin user")
  }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

mockRoute("POST", `${MOCK_ACCOUNT}/users/:id/actions/ban`, (ctx) => {
  const row = findUser(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  users().patch(row.id, { attributes: { bannedAt: nowIso() } })
  emitMockEvent(ctx, "user.banned", { resource: row })

  return userResponse(ctx, row)
})

mockRoute("POST", `${MOCK_ACCOUNT}/users/:id/actions/unban`, (ctx) => {
  const row = findUser(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  users().patch(row.id, { attributes: { bannedAt: null } })
  emitMockEvent(ctx, "user.unbanned", { resource: row })

  return userResponse(ctx, row)
})

mockRoute(
  "POST",
  `${MOCK_ACCOUNT}/users/:id/actions/update-password`,
  (ctx) => {
    const row = findUser(ctx, ctx.params.id)
    ctx.resource = { type: TYPE, id: row.id }

    const meta = bodyMeta(ctx)
    const oldPassword = requireMetaString(meta, "oldPassword")
    const newPassword = requireMetaString(meta, "newPassword")

    const password = stringOrNull(row.attributes.password)
    if (password == null || password !== oldPassword) {
      fail(metaError("oldPassword", "is not valid", undefined, 401))
    }
    validatePassword(newPassword)

    users().patch(row.id, {
      attributes: {
        password: newPassword,
        passwordResetToken: null,
        passwordResetSentAt: null,
      },
    })
    revokeTokens(ctx, row.id, ctx.bearer?.token.id ?? null)

    return userResponse(ctx, row)
  },
)

mockRoute(
  "POST",
  `${MOCK_ACCOUNT}/users/:id/actions/reset-password`,
  (ctx) => {
    const row = findAccountUser(ctx, ctx.params.id)
    ctx.resource = { type: TYPE, id: row.id }

    const meta = bodyMeta(ctx)
    const token = requireMetaString(meta, "passwordResetToken")
    const newPassword = requireMetaString(meta, "newPassword")

    const storedToken = stringOrNull(row.attributes.passwordResetToken)
    if (storedToken == null || storedToken !== token) {
      fail(notFound(LABEL, ctx.params.id))
    }

    const sentAt = millis(stringOrNull(row.attributes.passwordResetSentAt))
    if (sentAt == null || sentAt < Date.now() - RESET_TOKEN_TTL) {
      fail(metaError("passwordResetToken", "is expired", undefined, 401))
    }
    validatePassword(newPassword)

    users().patch(row.id, {
      attributes: {
        password: newPassword,
        passwordResetToken: null,
        passwordResetSentAt: null,
      },
    })
    revokeTokens(ctx, row.id, null)

    return userResponse(ctx, row)
  },
  { public: true },
)

mockRoute(
  "POST",
  `${MOCK_ACCOUNT}/passwords`,
  (ctx) => {
    const email = normalizeEmail(requireMetaString(bodyMeta(ctx), "email"))
    const row = accountRows(ctx, users().all()).find(
      (candidate) => candidate.attributes.email === email,
    )
    if (!row) return { status: 200 }
    ctx.resource = { type: TYPE, id: row.id }

    const token = randomHex(48)
    users().patch(row.id, {
      attributes: { passwordResetToken: token, passwordResetSentAt: nowIso() },
    })

    const slug = stringOrNull(ctx.account?.attributes.slug) ?? ctx.accountId
    const accountName = stringOrNull(ctx.account?.attributes.name) ?? "Keygen"
    const invited = row.attributes.password == null
    const resetToken = `${stripUuidDashes(ctx.accountId)}.${stripUuidDashes(row.id)}.${token}`

    demoMail().insert(
      makeMockRow(
        "demo-mail",
        uuid(),
        {
          to: email,
          subject: invited
            ? `You've been invited to ${accountName} on Keygen`
            : `Reset your ${accountName} password`,
          link: `${window.location.origin}/${slug}/auth/reset?token=${resetToken}`,
          kind: invited ? "invite" : "reset",
        },
        { account: accountRef(ctx), user: { type: TYPE, id: row.id } },
      ),
    )

    emitMockEvent(ctx, "user.password-reset", { resource: row })

    return { status: 200 }
  },
  { public: true },
)

mockRoute("GET", `${MOCK_ACCOUNT}/users/:id/group`, (ctx) => {
  const row = findUser(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }

  const groupId = row.refs.group?.id ?? ""
  const group = groupId === "" ? undefined : visible(ctx, groups(), groupId)
  if (!group) fail(notFound("group", groupId))

  return { status: 200, body: { data: serializeMock(ctx, group) } }
})

mockRoute("PUT", `${MOCK_ACCOUNT}/users/:id/group`, (ctx) => {
  const row = findUser(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const data = isRecord(ctx.body) ? ctx.body.data : undefined
  if (data === undefined) fail(badRequest("is missing", { pointer: "/data" }))

  let group: MockRow | null = null
  if (data !== null) {
    const linkage = linkageOf(ctx.body)
    if (!linkage || !isUuid(linkage.id)) {
      fail(badRequest("must be a valid UUID", { pointer: "/data/id" }))
    }
    group = requireGroup(ctx, linkage.id, row.id)
  }

  users().patch(row.id, {
    refs: { group: group ? { type: "groups", id: group.id } : null },
  })
  emitMockEvent(ctx, "user.group.updated", { resource: row })

  return userResponse(ctx, row)
})

mockRoute("GET", `${MOCK_ACCOUNT}/users/:id/products`, (ctx) => {
  const row = findUser(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }

  return {
    status: 200,
    body: paginateMock(ctx, productsForUser(ctx, row.id), (product) =>
      serializeMock(ctx, product),
    ),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/users/:userId/second-factors`, (ctx) => {
  const user = findUser(ctx, ctx.params.userId)
  ctx.resource = { type: TYPE, id: user.id }

  return {
    status: 200,
    body: paginateMock(ctx, factorsForUser(user.id), (factor) =>
      serializeMockSecondFactor(ctx, factor),
    ),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/users/:userId/second-factors/:id`, (ctx) => {
  const user = findUser(ctx, ctx.params.userId)
  const factor = findFactor(ctx, user, ctx.params.id)
  ctx.resource = { type: FACTOR_TYPE, id: factor.id }

  return { status: 200, body: { data: serializeMockSecondFactor(ctx, factor) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/users/:userId/second-factors`, (ctx) => {
  const user = findUser(ctx, ctx.params.userId)
  ctx.resource = { type: TYPE, id: user.id }

  const meta = bodyMeta(ctx)
  if (hasEnabledSecondFactor(user)) {
    requireOtp(meta)
  } else {
    const password = stringOrNull(user.attributes.password)
    if (password == null || meta.password !== password) {
      fail(
        metaError(
          "password",
          "password must be valid",
          "PASSWORD_INVALID",
          401,
        ),
      )
    }
  }

  const secret = randomBase32(32)
  const email = stringOrNull(user.attributes.email) ?? ""
  const factor = makeMockRow(
    FACTOR_TYPE,
    uuid(),
    { secret, uri: totpUri(email, secret), enabled: false },
    {
      account: accountRef(ctx),
      environment: user.refs.environment ?? null,
      user: { type: TYPE, id: user.id },
    },
  )
  secondFactors().insert(factor)
  ctx.resource = { type: FACTOR_TYPE, id: factor.id }

  emitMockEvent(ctx, "second-factor.created", { resource: factor })

  return { status: 201, body: { data: serializeMockSecondFactor(ctx, factor) } }
})

mockRoute(
  "PATCH",
  `${MOCK_ACCOUNT}/users/:userId/second-factors/:id`,
  (ctx) => {
    const user = findUser(ctx, ctx.params.userId)
    const factor = findFactor(ctx, user, ctx.params.id)
    ctx.resource = { type: FACTOR_TYPE, id: factor.id }

    const enabled = bodyAttributes(ctx).enabled
    if (enabled === undefined) {
      fail(badRequest("is missing", { pointer: "/data/attributes/enabled" }))
    }
    if (typeof enabled !== "boolean") {
      fail(typeMismatch("/data/attributes/enabled", enabled, "boolean"))
    }
    requireOtp(bodyMeta(ctx))

    secondFactors().patch(factor.id, { attributes: { enabled } })
    emitMockEvent(
      ctx,
      enabled ? "second-factor.enabled" : "second-factor.disabled",
      {
        resource: factor,
      },
    )

    return {
      status: 200,
      body: { data: serializeMockSecondFactor(ctx, factor) },
    }
  },
)

mockRoute(
  "DELETE",
  `${MOCK_ACCOUNT}/users/:userId/second-factors/:id`,
  (ctx) => {
    const user = findUser(ctx, ctx.params.userId)
    const factor = findFactor(ctx, user, ctx.params.id)
    ctx.resource = { type: FACTOR_TYPE, id: factor.id }

    if (hasEnabledSecondFactor(user)) requireOtp(bodyMeta(ctx))

    emitMockEvent(ctx, "second-factor.deleted", { resource: factor })
    secondFactors().delete(factor.id)

    return { status: 204 }
  },
)
