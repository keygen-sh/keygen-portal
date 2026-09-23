import {
  MOCK_ACCOUNT,
  accountPath,
  accountRef,
  accountRows,
  type MockApiError,
  attributeError,
  badRequest,
  bodyAttributes,
  bodyRelationship,
  bodyRelationships,
  constantize,
  type MockContext,
  currentSubject,
  destroyMock,
  diffMetadata,
  emitMockEvent,
  errors,
  fail,
  forbidden,
  inAccount,
  isRecord,
  isUuid,
  makeMockRow,
  normalizeMetadata,
  notFound,
  nowIso,
  paginateMock,
  randomHex,
  registerMockDestroyer,
  registerMockSerializer,
  type Relationship,
  relationshipError,
  type MockResource,
  resource,
  type MockResult,
  mockRoute,
  type MockRow,
  SECOND,
  shift,
  mockStore,
  toMany,
  toOne,
  typeMismatch,
  unpermittedAttribute,
  unprocessable,
  uuid,
} from "@/demo/server"
import { DEFAULT_SETTINGS, DEMO_PUBLIC_KEYS } from "@/demo/seeds/account"
import { LicensePermissions } from "@/types/licenses"
import { UserPermissions } from "@/types/users"

const TYPE = "accounts"
const BILLING_TYPE = "billings"
const PLAN_TYPE = "plans"
const SETTING_TYPE = "settings"
const USER_TYPE = "users"

const MAX_LENGTH = 255
const MIN_PASSWORD_LENGTH = 6
const MAX_PASSWORD_LENGTH = 72
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
const RESERVED_SLUGS = ["actions", "action"]
const SLUG_PATTERN = /^[a-z0-9][-a-z0-9]+$/
const SLUG_FORMAT_DETAIL =
  "can only contain lowercase letters, numbers and dashes (but cannot start with dash)"
const DOMAIN_TAKEN_DETAIL =
  "already exists for this domain (please use a different domain or use account recovery)"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ADMIN_ROLES = ["admin"]
const MANAGER_ROLES = ["admin", "developer"]
const LICENSE_SETTING_KEY = "default_license_permissions"
const USER_SETTING_KEY = "default_user_permissions"
const SETTING_KEYS = [LICENSE_SETTING_KEY, USER_SETTING_KEY]
const CANCELABLE_STATES = ["pending", "trialing", "subscribed"]
const PAUSABLE_STATES = ["trialing", "subscribed"]
const RESUMABLE_STATES = ["paused"]
const RENEWABLE_STATES = ["canceling"]

const ACCOUNT_COLLECTIONS = [
  "webhook-endpoints",
  "webhook-events",
  "products",
  "platforms",
  "arches",
  "channels",
  "releases",
  "artifacts",
  "policies",
  "users",
  "keys",
  "licenses",
  "machines",
  "components",
  "processes",
  "tokens",
]

const FREE_EMAIL_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "pm.me",
  "gmx.com",
  "gmx.de",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "fastmail.com",
  "hey.com",
  "tutanota.com",
  "tuta.io",
  "qq.com",
  "163.com",
  "126.com",
  "web.de",
  "t-online.de",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "temp-mail.org",
  "yopmail.com",
  "sharklasers.com",
  "dispostable.com",
])

const HAIKU_ADJECTIVES = [
  "misty",
  "quiet",
  "silent",
  "bold",
  "crimson",
  "frosty",
  "gentle",
  "hidden",
  "lively",
  "morning",
  "patient",
  "rapid",
  "shy",
  "solitary",
  "still",
  "summer",
  "twilight",
  "wandering",
  "wild",
  "young",
]

const HAIKU_NOUNS = [
  "river",
  "meadow",
  "forest",
  "harbor",
  "glacier",
  "sunset",
  "thunder",
  "valley",
  "breeze",
  "cloud",
  "dawn",
  "field",
  "lake",
  "mountain",
  "pond",
  "shadow",
  "snow",
  "star",
  "surf",
  "wave",
]

const SETTING_PERMISSIONS: Readonly<Record<string, ReadonlySet<string>>> = {
  [LICENSE_SETTING_KEY]: new Set<string>([...LicensePermissions, "*"]),
  [USER_SETTING_KEY]: new Set<string>([...UserPermissions, "*"]),
}

const SETTING_VALUE_DETAILS: Readonly<Record<string, string>> = {
  [LICENSE_SETTING_KEY]: "must be an array of valid license permissions",
  [USER_SETTING_KEY]: "must be an array of valid user permissions",
}

interface AdminAttributes {
  email: string
  password: string | null
  firstName: string | null
  lastName: string | null
  metadata: Record<string, unknown>
}

const accounts = () => mockStore.table(TYPE)
const billings = () => mockStore.table(BILLING_TYPE)
const plans = () => mockStore.table(PLAN_TYPE)
const settings = () => mockStore.table(SETTING_TYPE)
const users = () => mockStore.table(USER_TYPE)

function billingFor(account: MockRow): MockRow | undefined {
  const linkage = account.refs.billing
  return linkage ? billings().get(linkage.id) : undefined
}

function accountStatus(account: MockRow): string {
  const state = billingFor(account)?.attributes.state
  return (typeof state === "string" ? state : "subscribed").toUpperCase()
}

function accountMeta(account: MockRow): Record<string, unknown> {
  const rsa2048 = btoa(String(account.attributes.publicKey))
  return {
    publicKey: rsa2048,
    keys: {
      ed25519: btoa(String(account.attributes.ed25519Key)),
      rsa2048,
      ecdsa: btoa(String(account.attributes.ecdsaKey)),
    },
  }
}

function accountRelationships(
  ctx: MockContext,
  row: MockRow,
): Record<string, Relationship> {
  const self = `/v1/accounts/${row.id}`
  const { billing, plan } = row.refs
  const relationships: Record<string, Relationship> = {}

  if (billing) relationships.billing = toOne(ctx, billing, `${self}/billing`)
  if (plan) relationships.plan = toOne(ctx, plan, `/v1/plans/${plan.id}`)
  relationships.settings = toMany(`${self}/settings`)
  for (const name of ACCOUNT_COLLECTIONS) {
    relationships[name] = toMany(`${self}/${name}`)
  }

  return relationships
}

export function serializeMockAccount(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return {
    id: row.id,
    type: TYPE,
    attributes: {
      name: row.attributes.name ?? null,
      slug: row.attributes.slug,
      apiVersion: row.attributes.apiVersion ?? DEFAULT_API_VERSION,
      status: accountStatus(row),
      protected: row.attributes.protected === true,
      created: row.created,
      updated: row.updated,
    },
    relationships: accountRelationships(ctx, row),
    links: { self: `/v1/accounts/${row.id}` },
    meta: accountMeta(row),
  }
}

export function serializeMockPlan(
  _ctx: MockContext,
  row: MockRow,
): MockResource {
  return {
    id: row.id,
    type: PLAN_TYPE,
    attributes: {
      name: row.attributes.name,
      price: row.attributes.price ?? null,
      interval: row.attributes.interval ?? null,
      trialDuration: row.attributes.trialDuration ?? null,
      requestLogRetentionDuration:
        row.attributes.requestLogRetentionDuration ?? null,
      eventLogRetentionDuration:
        row.attributes.eventLogRetentionDuration ?? null,
      maxReqs: row.attributes.maxReqs ?? null,
      maxAdmins: row.attributes.maxAdmins ?? null,
      maxUsers: row.attributes.maxUsers ?? null,
      maxPolicies: row.attributes.maxPolicies ?? null,
      maxLicenses: row.attributes.maxLicenses ?? null,
      maxProducts: row.attributes.maxProducts ?? null,
      maxStorage: row.attributes.maxStorage ?? null,
      maxTransfer: row.attributes.maxTransfer ?? null,
      maxUpload: row.attributes.maxUpload ?? null,
      private: row.attributes.private === true,
      created: row.created,
      updated: row.updated,
    },
    relationships: {},
    links: { self: `/v1/plans/${row.id}` },
  }
}

export function serializeMockBilling(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const account = accounts().get(row.refs.account?.id ?? "")
  const plan = account?.refs.plan ?? null

  return resource(
    ctx,
    row,
    {
      subscriptionStatus: row.attributes.subscriptionStatus ?? null,
      subscriptionPeriodStart: row.attributes.subscriptionPeriodStart ?? null,
      subscriptionPeriodEnd: row.attributes.subscriptionPeriodEnd ?? null,
      cardExpiry: row.attributes.cardExpiry ?? null,
      cardBrand: row.attributes.cardBrand ?? null,
      cardLast4: row.attributes.cardLast4 ?? null,
      state: row.attributes.state,
      created: row.created,
      updated: row.updated,
    },
    {
      plan: toOne(ctx, plan, plan ? `/v1/plans/${plan.id}` : null),
    },
    { links: { self: `${accountPath(ctx)}/billing` } },
  )
}

export function serializeMockSetting(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return resource(
    ctx,
    row,
    {
      key: row.attributes.key,
      value: row.attributes.value,
      created: row.created,
      updated: row.updated,
    },
    {},
  )
}

registerMockSerializer(TYPE, serializeMockAccount)
registerMockSerializer(PLAN_TYPE, serializeMockPlan)
registerMockSerializer(BILLING_TYPE, serializeMockBilling)
registerMockSerializer(SETTING_TYPE, serializeMockSetting)

registerMockDestroyer(SETTING_TYPE, (ctx, row) => {
  settings().delete(row.id)
  emitMockEvent(ctx, "account.settings.deleted", { resource: row })
})

function currentAccount(ctx: MockContext): MockRow {
  if (!ctx.account) fail(notFound("account", ctx.params.account))
  return ctx.account
}

function requireRole(ctx: MockContext, roles: readonly string[]): void {
  const subject = currentSubject(ctx)
  if (!subject || subject.type === "environments") return
  if (
    subject.type !== USER_TYPE ||
    !roles.includes(String(subject.attributes.role))
  ) {
    fail(forbidden())
  }
}

function missingSatellite(label: string): MockResult {
  return errors(404, {
    title: "Not found",
    detail: `The requested ${label} was not found`,
    code: "NOT_FOUND",
  })
}

function requireBilling(account: MockRow): MockRow {
  const billing = billingFor(account)
  if (!billing) fail(missingSatellite("billing"))
  return billing
}

function requirePlan(account: MockRow): MockRow {
  const linkage = account.refs.plan
  const plan = linkage ? plans().get(linkage.id) : undefined
  if (!plan) fail(missingSatellite("plan"))
  return plan
}

function tooLong(attribute: string, maximum: number): MockApiError {
  return attributeError(
    attribute,
    "TOO_LONG",
    `is too long (maximum is ${maximum} characters)`,
  )
}

function slugTaken(slug: string, excludeId?: string): boolean {
  const taken = accounts().find(
    (row) =>
      row.id !== excludeId &&
      String(row.attributes.slug).toLowerCase() === slug.toLowerCase(),
  )
  return taken !== undefined
}

function validateSlug(slug: unknown, excludeId?: string): string {
  const pointer = "/data/attributes/slug"
  if (typeof slug !== "string") fail(typeMismatch(pointer, slug, "string"))
  if (slug.length > MAX_LENGTH) {
    fail(unprocessable(tooLong("slug", MAX_LENGTH)))
  }
  if (!SLUG_PATTERN.test(slug)) {
    fail(unprocessable(attributeError("slug", "INVALID", SLUG_FORMAT_DETAIL)))
  }
  if (RESERVED_SLUGS.includes(slug)) {
    fail(unprocessable(attributeError("slug", "NOT_ALLOWED", "is reserved")))
  }
  if (isUuid(slug.replace(/-/g, ""))) {
    fail(
      unprocessable(
        attributeError("slug", "NOT_ALLOWED", "cannot resemble a UUID"),
      ),
    )
  }
  if (slugTaken(slug, excludeId)) {
    fail(
      unprocessable(attributeError("slug", "TAKEN", "has already been taken")),
    )
  }
  return slug
}

function validateName(name: unknown): string {
  const pointer = "/data/attributes/name"
  if (typeof name !== "string") fail(typeMismatch(pointer, name, "string"))
  if (name.length > MAX_LENGTH) {
    fail(unprocessable(tooLong("name", MAX_LENGTH)))
  }
  return name
}

function validateApiVersion(version: unknown): string {
  if (
    typeof version !== "string" ||
    !SUPPORTED_API_VERSIONS.includes(version)
  ) {
    fail(badRequest("is invalid", { pointer: "/data/attributes/apiVersion" }))
  }
  return version
}

function validateProtected(value: unknown): boolean {
  if (typeof value !== "boolean") {
    fail(typeMismatch("/data/attributes/protected", value, "boolean"))
  }
  return value
}

function requestApiVersion(ctx: MockContext): string {
  const version = ctx.headers.get("keygen-version")
  return version && SUPPORTED_API_VERSIONS.includes(version)
    ? version
    : DEFAULT_API_VERSION
}

function parameterize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function underscore(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/-/g, "_")
    .toLowerCase()
}

function isFreeEmailProvider(host: string): boolean {
  return FREE_EMAIL_PROVIDERS.has(host) || host.endsWith(".edu")
}

function haikunate(): string {
  const pick = (items: readonly string[]): string =>
    items[Math.floor(Math.random() * items.length)]
  const suffix = 1000 + Math.floor(Math.random() * 9000)
  return `${pick(HAIKU_ADJECTIVES)}-${pick(HAIKU_NOUNS)}-${suffix}`
}

function adminPointer(index: number, attribute: string): string {
  return `/data/relationships/admins/data/${index}/attributes/${attribute}`
}

function adminError(
  index: number,
  attribute: string,
  kind: string,
  detail: string,
): MockApiError {
  return {
    title: "Unprocessable resource",
    detail,
    code: `USERS_${constantize(attribute)}_${kind}`,
    source: { pointer: adminPointer(index, attribute) },
  }
}

function adminTooLong(
  index: number,
  attribute: string,
  maximum: number,
): MockApiError {
  return adminError(
    index,
    attribute,
    "TOO_LONG",
    `is too long (maximum is ${maximum} characters)`,
  )
}

function adminEntries(ctx: MockContext): Record<string, unknown>[] {
  const admins = bodyRelationships(ctx).admins
  const data = isRecord(admins) ? admins.data : undefined
  const entries = Array.isArray(data) ? data.filter(isRecord) : []
  if (entries.length === 0) {
    fail(badRequest("is missing", { pointer: "/data/relationships/admins" }))
  }
  return entries
}

function validateAdminEmail(email: unknown, index: number): string {
  const pointer = adminPointer(index, "email")
  if (email === undefined) fail(badRequest("is missing", { pointer }))
  if (typeof email !== "string" || email.trim() === "") {
    fail(badRequest("cannot be blank", { pointer }))
  }
  if (email.length > MAX_LENGTH) {
    fail(unprocessable(adminTooLong(index, "email", MAX_LENGTH)))
  }
  if (!EMAIL_PATTERN.test(email)) {
    fail(unprocessable(adminError(index, "email", "INVALID", "is invalid")))
  }
  return email
}

function validateAdminPassword(
  password: unknown,
  index: number,
): string | null {
  if (password === undefined || password === null) return null
  if (typeof password !== "string") {
    fail(typeMismatch(adminPointer(index, "password"), password, "string"))
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    fail(
      unprocessable(
        adminError(
          index,
          "password",
          "TOO_SHORT",
          `is too short (minimum is ${MIN_PASSWORD_LENGTH} characters)`,
        ),
      ),
    )
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    fail(unprocessable(adminTooLong(index, "password", MAX_PASSWORD_LENGTH)))
  }
  return password
}

function validateAdminName(
  value: unknown,
  index: number,
  attribute: string,
): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== "string") {
    fail(typeMismatch(adminPointer(index, attribute), value, "string"))
  }
  if (value.length > MAX_LENGTH) {
    fail(unprocessable(adminTooLong(index, attribute, MAX_LENGTH)))
  }
  return value
}

function validateAdminMetadata(
  metadata: unknown,
  index: number,
): Record<string, unknown> {
  if (metadata === undefined || metadata === null) return {}
  if (!isRecord(metadata)) {
    fail(typeMismatch(adminPointer(index, "metadata"), metadata, "object"))
  }
  return normalizeMetadata(metadata)
}

function validateAdmin(
  entry: Record<string, unknown>,
  index: number,
): AdminAttributes {
  const attributes: Record<string, unknown> = isRecord(entry.attributes)
    ? entry.attributes
    : {}
  return {
    email: validateAdminEmail(attributes.email, index),
    password: validateAdminPassword(attributes.password, index),
    firstName: validateAdminName(attributes.firstName, index, "firstName"),
    lastName: validateAdminName(attributes.lastName, index, "lastName"),
    metadata: validateAdminMetadata(attributes.metadata, index),
  }
}

function validateAdmins(ctx: MockContext): AdminAttributes[] {
  const admins = adminEntries(ctx).map((entry, index) =>
    validateAdmin(entry, index),
  )
  const seen = new Set<string>()
  admins.forEach((admin, index) => {
    const email = admin.email.toLowerCase()
    if (seen.has(email)) {
      fail(
        unprocessable(
          adminError(index, "email", "TAKEN", "has already been taken"),
        ),
      )
    }
    seen.add(email)
  })
  return admins
}

function publicPlans(): MockRow[] {
  return plans().where((row) => row.attributes.private !== true)
}

function priceOf(row: MockRow, missing: number): number {
  const price = row.attributes.price
  return typeof price === "number" ? price : missing
}

function listedPlans(): MockRow[] {
  return publicPlans().sort((a, b) => priceOf(a, -1) - priceOf(b, -1))
}

function registrationPlan(): MockRow | undefined {
  const cheapest = Number.POSITIVE_INFINITY
  return publicPlans()
    .sort((a, b) => priceOf(a, cheapest) - priceOf(b, cheapest))
    .at(0)
}

function requestedPlan(ctx: MockContext): MockRow {
  const { present, linkage } = bodyRelationship(ctx, "plan")
  if (!present || !linkage) {
    fail(badRequest("is missing", { pointer: "/data/relationships/plan" }))
  }
  const plan = plans().get(linkage.id) ?? registrationPlan()
  if (!plan) {
    fail(unprocessable(relationshipError("plan", "NOT_FOUND", "must exist")))
  }
  return plan
}

function registrationInfo(
  attributes: Record<string, unknown>,
  email: string,
): { slug: string; name: string } {
  const separator = email.lastIndexOf("@")
  const localPart = email.slice(0, separator)
  const host = email.slice(separator + 1).toLowerCase()
  const isPublicProvider = isFreeEmailProvider(host)
  const name = isPublicProvider ? localPart : host

  if (attributes.slug !== undefined && attributes.slug !== null) {
    return { slug: validateSlug(attributes.slug), name }
  }

  const slug = parameterize(isPublicProvider ? localPart : host)
  if (isUuid(slug)) {
    fail(
      unprocessable(
        attributeError("slug", "NOT_ALLOWED", "cannot resemble a UUID"),
      ),
    )
  }
  if (!slugTaken(slug)) return { slug, name }
  if (!isPublicProvider) {
    fail(
      unprocessable(attributeError("slug", "NOT_ALLOWED", DOMAIN_TAKEN_DETAIL)),
    )
  }

  let candidate = `${slug}-${haikunate()}`
  while (slugTaken(candidate)) candidate = `${slug}-${haikunate()}`
  return { slug: candidate, name }
}

function trialBilling(plan: MockRow, created: string): Record<string, unknown> {
  const trialDuration = plan.attributes.trialDuration
  return {
    state: "trialing",
    subscriptionStatus: "trialing",
    subscriptionPeriodStart: created,
    subscriptionPeriodEnd:
      typeof trialDuration === "number"
        ? shift(created, trialDuration * SECOND)
        : null,
    cardBrand: null,
    cardLast4: null,
    cardExpiry: null,
    customerId: `cus_${randomHex(14)}`,
  }
}

mockRoute("GET", MOCK_ACCOUNT, (ctx) => {
  const account = currentAccount(ctx)
  ctx.resource = { type: TYPE, id: account.id }
  return { status: 200, body: { data: serializeMockAccount(ctx, account) } }
})

mockRoute("PATCH", MOCK_ACCOUNT, (ctx) => {
  const account = currentAccount(ctx)
  requireRole(ctx, MANAGER_ROLES)
  ctx.resource = { type: TYPE, id: account.id }

  const attributes = bodyAttributes(ctx)
  const changes: Record<string, unknown> = {}

  if ("name" in attributes) changes.name = validateName(attributes.name)
  if ("slug" in attributes) {
    changes.slug = validateSlug(attributes.slug, account.id)
  }
  if ("apiVersion" in attributes) {
    changes.apiVersion = validateApiVersion(attributes.apiVersion)
  }
  if ("protected" in attributes) {
    changes.protected = validateProtected(attributes.protected)
  }

  const before = { ...account.attributes }
  accounts().patch(account.id, { attributes: changes })

  emitMockEvent(ctx, "account.updated", {
    resource: account,
    metadata: diffMetadata(before, account.attributes),
  })

  return { status: 200, body: { data: serializeMockAccount(ctx, account) } }
})

mockRoute("DELETE", MOCK_ACCOUNT, () => forbidden())

mockRoute(
  "POST",
  "/v1/accounts",
  (ctx) => {
    const attributes = bodyAttributes(ctx)
    const plan = requestedPlan(ctx)
    const admins = validateAdmins(ctx)
    const founder = admins[admins.length - 1]
    const registration = registrationInfo(attributes, founder.email)
    const name =
      attributes.name !== undefined && attributes.name !== null
        ? validateName(attributes.name)
        : registration.name
    const isProtected =
      attributes.protected === undefined
        ? false
        : validateProtected(attributes.protected)

    const created = nowIso()
    const accountId = uuid()
    const billingId = uuid()
    const accountLinkage = { type: TYPE, id: accountId }

    const account = makeMockRow(
      TYPE,
      accountId,
      {
        name,
        slug: registration.slug,
        protected: isProtected,
        apiVersion: requestApiVersion(ctx),
        publicKey: DEMO_PUBLIC_KEYS.rsa2048,
        ecdsaKey: DEMO_PUBLIC_KEYS.ecdsa,
        ed25519Key: randomHex(64),
      },
      {
        plan: { type: PLAN_TYPE, id: plan.id },
        billing: { type: BILLING_TYPE, id: billingId },
      },
      created,
    )
    accounts().insert(account)

    billings().insert(
      makeMockRow(
        BILLING_TYPE,
        billingId,
        trialBilling(plan, created),
        { account: accountLinkage },
        created,
      ),
    )

    for (const [key, value] of DEFAULT_SETTINGS) {
      settings().insert(
        makeMockRow(
          SETTING_TYPE,
          uuid(),
          { key, value: [...value] },
          { account: accountLinkage },
          created,
        ),
      )
    }

    for (const admin of admins) {
      users().insert(
        makeMockRow(
          USER_TYPE,
          uuid(),
          { ...admin, role: "admin", permissions: ["*"], bannedAt: null },
          { account: accountLinkage, environment: null, group: null },
          created,
        ),
      )
    }

    return {
      status: 201,
      body: { data: serializeMockAccount(ctx, account) },
      headers: { Location: `/v1/accounts/${accountId}` },
    }
  },
  { public: true },
)

mockRoute(
  "GET",
  "/v1/plans",
  (ctx) => ({
    status: 200,
    body: { data: listedPlans().map((row) => serializeMockPlan(ctx, row)) },
  }),
  { public: true },
)

mockRoute(
  "GET",
  "/v1/plans/:id",
  (ctx) => {
    const plan = plans().get(ctx.params.id)
    if (!plan) fail(notFound("plan", ctx.params.id))
    return { status: 200, body: { data: serializeMockPlan(ctx, plan) } }
  },
  { public: true },
)

mockRoute("GET", `${MOCK_ACCOUNT}/plan`, (ctx) => {
  const account = currentAccount(ctx)
  ctx.resource = { type: TYPE, id: account.id }
  const plan = requirePlan(account)
  return { status: 200, body: { data: serializeMockPlan(ctx, plan) } }
})

mockRoute("GET", `${MOCK_ACCOUNT}/billing`, (ctx) => {
  const account = currentAccount(ctx)
  requireRole(ctx, ADMIN_ROLES)
  ctx.resource = { type: TYPE, id: account.id }
  const billing = requireBilling(account)
  return { status: 200, body: { data: serializeMockBilling(ctx, billing) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/actions/manage-subscription`, (ctx) => {
  const account = currentAccount(ctx)
  requireRole(ctx, ADMIN_ROLES)
  ctx.resource = { type: TYPE, id: account.id }
  requireBilling(account)

  const url = `/${String(account.attributes.slug)}/app/billing`
  return { status: 200, body: { meta: { url } }, headers: { Location: url } }
})

function transitionSubscription(
  ctx: MockContext,
  verb: string,
  allowedStates: readonly string[],
  nextState: string,
  event: string,
): MockResult {
  const account = currentAccount(ctx)
  requireRole(ctx, ADMIN_ROLES)
  ctx.resource = { type: TYPE, id: account.id }

  const billing = requireBilling(account)
  const state = String(billing.attributes.state)
  if (!allowedStates.includes(state)) {
    fail(
      errors(422, {
        title: "Unprocessable entity",
        detail: `failed to ${verb} ${state} subscription`,
      }),
    )
  }

  billings().patch(billing.id, { attributes: { state: nextState } })
  emitMockEvent(ctx, event, { resource: account })

  return { status: 204 }
}

mockRoute("POST", `${MOCK_ACCOUNT}/actions/cancel-subscription`, (ctx) =>
  transitionSubscription(
    ctx,
    "cancel",
    CANCELABLE_STATES,
    "canceling",
    "account.subscription.canceled",
  ),
)

mockRoute("POST", `${MOCK_ACCOUNT}/actions/pause-subscription`, (ctx) =>
  transitionSubscription(
    ctx,
    "pause",
    PAUSABLE_STATES,
    "paused",
    "account.subscription.paused",
  ),
)

mockRoute("POST", `${MOCK_ACCOUNT}/actions/resume-subscription`, (ctx) =>
  transitionSubscription(
    ctx,
    "resume",
    RESUMABLE_STATES,
    "pending",
    "account.subscription.resumed",
  ),
)

mockRoute("POST", `${MOCK_ACCOUNT}/actions/renew-subscription`, (ctx) =>
  transitionSubscription(
    ctx,
    "renew",
    RENEWABLE_STATES,
    "pending",
    "account.subscription.renewed",
  ),
)

function findSetting(ctx: MockContext, identifier: string): MockRow {
  const row = settings().find(
    (candidate) =>
      inAccount(ctx, candidate) &&
      (candidate.id === identifier || candidate.attributes.key === identifier),
  )
  if (!row) fail(notFound("account setting", identifier))
  return row
}

function validateSettingKey(ctx: MockContext, key: unknown): string {
  const pointer = "/data/attributes/key"
  if (key === undefined) fail(badRequest("is missing", { pointer }))
  if (typeof key !== "string" || key.trim() === "") {
    fail(badRequest("cannot be blank", { pointer }))
  }

  const normalized = underscore(key)
  if (!SETTING_KEYS.includes(normalized)) {
    fail(
      unprocessable(
        attributeError(
          "key",
          "NOT_ALLOWED",
          `must be one of: ${SETTING_KEYS.join(", ")}`,
        ),
      ),
    )
  }

  const taken = settings().find(
    (row) => inAccount(ctx, row) && row.attributes.key === normalized,
  )
  if (taken) {
    fail(
      unprocessable(attributeError("key", "TAKEN", "has already been taken")),
    )
  }

  return normalized
}

function validateSettingValue(key: string, value: unknown): string[] {
  if (value === undefined) {
    fail(badRequest("is missing", { pointer: "/data/attributes/value" }))
  }
  if (!Array.isArray(value)) {
    fail(
      unprocessable(
        attributeError("value", "NOT_ALLOWED", "must be a valid setting"),
      ),
    )
  }

  const allowed = SETTING_PERMISSIONS[key]
  const permissions = value.filter(
    (entry: unknown): entry is string => typeof entry === "string",
  )
  if (
    permissions.length !== value.length ||
    !permissions.every((permission) => allowed.has(permission))
  ) {
    fail(
      unprocessable(
        attributeError("value", "NOT_ALLOWED", SETTING_VALUE_DETAILS[key]),
      ),
    )
  }

  return permissions
}

mockRoute("GET", `${MOCK_ACCOUNT}/settings`, (ctx) => {
  const account = currentAccount(ctx)
  requireRole(ctx, MANAGER_ROLES)
  ctx.resource = { type: TYPE, id: account.id }

  const rows = accountRows(ctx, settings().all())
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockSetting(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/settings/:id`, (ctx) => {
  const account = currentAccount(ctx)
  requireRole(ctx, MANAGER_ROLES)
  ctx.resource = { type: TYPE, id: account.id }

  const row = findSetting(ctx, ctx.params.id)
  return { status: 200, body: { data: serializeMockSetting(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/settings`, (ctx) => {
  const account = currentAccount(ctx)
  requireRole(ctx, MANAGER_ROLES)
  ctx.resource = { type: TYPE, id: account.id }

  const attributes = bodyAttributes(ctx)
  const key = validateSettingKey(ctx, attributes.key)
  const value = validateSettingValue(key, attributes.value)

  const row = makeMockRow(
    SETTING_TYPE,
    uuid(),
    { key, value },
    { account: accountRef(ctx) },
  )
  settings().insert(row)

  emitMockEvent(ctx, "account.settings.created", { resource: row })

  return {
    status: 201,
    body: { data: serializeMockSetting(ctx, row) },
    headers: { Location: `${accountPath(ctx)}/settings/${row.id}` },
  }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/settings/:id`, (ctx) => {
  const account = currentAccount(ctx)
  requireRole(ctx, MANAGER_ROLES)
  ctx.resource = { type: TYPE, id: account.id }

  const row = findSetting(ctx, ctx.params.id)
  const attributes = bodyAttributes(ctx)
  if ("key" in attributes) fail(unpermittedAttribute("key"))

  const value = validateSettingValue(
    String(row.attributes.key),
    attributes.value,
  )

  const before = { ...row.attributes }
  settings().patch(row.id, { attributes: { value } })

  emitMockEvent(ctx, "account.settings.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockSetting(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/settings/:id`, (ctx) => {
  const account = currentAccount(ctx)
  requireRole(ctx, MANAGER_ROLES)
  ctx.resource = { type: TYPE, id: account.id }

  const row = findSetting(ctx, ctx.params.id)
  destroyMock(ctx, SETTING_TYPE, row.id)

  return { status: 204 }
})
