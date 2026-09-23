import {
  MOCK_ACCOUNT,
  accountRows,
  badRequest,
  bodyMeta,
  camelize,
  type MockContext,
  fail,
  forbidden,
  isRecord,
  isUuid,
  type Linkage,
  newestFirst,
  mockRoute,
  type MockRow,
  scoped,
  serializeMock,
  mockStore,
  stringOrNull,
  stripUuidDashes,
  typeMismatch,
} from "@/demo/server"

const SEARCHABLE_TYPES = [
  "licenses",
  "groups",
  "users",
  "machines",
  "entitlements",
  "products",
  "policies",
  "packages",
  "releases",
  "platforms",
  "arches",
  "request-logs",
] as const

type SearchableType = (typeof SEARCHABLE_TYPES)[number]
type Matcher = (row: MockRow, value: unknown) => boolean
type Matchers = Readonly<Record<string, Matcher>>

const ACCOUNT_LEVEL_TYPES: readonly SearchableType[] = ["platforms", "arches"]
const SEARCHING_ROLES: readonly string[] = [
  "admin",
  "developer",
  "read-only",
  "sales-agent",
  "support-agent",
]
const RESULT_LIMIT = 10
const MIN_TERM_LENGTH = 3

const licenseUsers = () => mockStore.table("license-users")

function isList(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

function underscore(key: string): string {
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function canonicalKey(key: string): string {
  return camelize(underscore(key))
}

function typeStem(type: string): string {
  return type
    .toLowerCase()
    .replace(/ies$/, "y")
    .replace(/(ch|sh|ss)es$/, "$1")
    .replace(/([^s])s$/, "$1")
}

function termOf(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return ""
}

function includesTerm(haystack: unknown, term: string): boolean {
  return (
    typeof haystack === "string" &&
    haystack.toLowerCase().includes(term.toLowerCase())
  )
}

function matchesId(id: string, term: string): boolean {
  if (isUuid(term)) {
    return (
      stripUuidDashes(id).toLowerCase() === stripUuidDashes(term).toLowerCase()
    )
  }
  return includesTerm(id, term)
}

function refRow(linkage: Linkage | null | undefined): MockRow | undefined {
  return linkage ? mockStore.table(linkage.type).get(linkage.id) : undefined
}

function rowsOf(row: MockRow | undefined): MockRow[] {
  return row ? [row] : []
}

function policyOf(license: MockRow | undefined): MockRow | undefined {
  return refRow(license?.refs.policy)
}

function productOf(row: MockRow | undefined): MockRow | undefined {
  return refRow(row?.refs.product)
}

function licenseOf(machine: MockRow): MockRow | undefined {
  return refRow(machine.refs.license)
}

function ownerOf(row: MockRow): MockRow | undefined {
  return refRow(row.refs.owner)
}

function usersOf(license: MockRow | undefined): MockRow[] {
  if (!license) return []
  const licensees = licenseUsers()
    .where((join) => join.refs.license?.id === license.id)
    .map((join) => refRow(join.refs.user))
  return [ownerOf(license), ...licensees].filter(
    (user): user is MockRow => user != null,
  )
}

function fullNameOf(user: MockRow): string {
  return [user.attributes.firstName, user.attributes.lastName]
    .filter((part): part is string => typeof part === "string")
    .join(" ")
}

function castTerm(value: unknown): unknown[] {
  if (typeof value !== "string") return [value]
  if (value === "true") return [value, true]
  if (value === "false") return [value, false]
  if (value === "null") return [value, null]
  if (/^\d+$/.test(value)) return [value, Number.parseInt(value, 10)]
  if (/^\d+\.\d+$/.test(value)) return [value, Number.parseFloat(value)]
  return [value]
}

function contains(stored: unknown, wanted: unknown): boolean {
  if (isRecord(wanted)) {
    return (
      isRecord(stored) &&
      Object.entries(wanted).every(([key, value]) =>
        contains(stored[key], value),
      )
    )
  }
  if (isList(wanted)) {
    return (
      isList(stored) &&
      wanted.every((entry) =>
        stored.some((candidate) => contains(candidate, entry)),
      )
    )
  }
  return stored === wanted
}

function withTerm(match: (row: MockRow, term: string) => boolean): Matcher {
  return (row, value) => {
    const term = termOf(value)
    return term !== "" && match(row, term)
  }
}

function substring(name: string): Matcher {
  return withTerm((row, term) => includesTerm(row.attributes[name], term))
}

function exact(name: string): Matcher {
  return withTerm((row, term) => row.attributes[name] === term)
}

function related(resolve: (row: MockRow) => MockRow | undefined): Matcher {
  return withTerm((row, term) => {
    const target = resolve(row)
    if (!target) return false
    return (
      matchesId(target.id, term) || includesTerm(target.attributes.name, term)
    )
  })
}

function anyUser(resolve: (row: MockRow) => MockRow[]): Matcher {
  return withTerm((row, term) =>
    resolve(row).some(
      (user) =>
        matchesId(user.id, term) || includesTerm(user.attributes.email, term),
    ),
  )
}

function refType(name: string): Matcher {
  return withTerm((row, term) => {
    const ref = row.refs[name]
    return ref != null && typeStem(ref.type) === typeStem(term)
  })
}

function refId(name: string): Matcher {
  return withTerm((row, term) => {
    const ref = row.refs[name]
    return ref != null && matchesId(ref.id, term)
  })
}

function polymorphic(name: string): Matcher {
  const byRefType = refType(name)
  const byRefId = refId(name)
  return (row, value) =>
    isRecord(value)
      ? byRefType(row, value.type) && byRefId(row, value.id)
      : byRefId(row, value)
}

const byId: Matcher = withTerm((row, term) => matchesId(row.id, term))

const byMetadata: Matcher = (row, value) => {
  const metadata = row.attributes.metadata
  if (!isRecord(value) || !isRecord(metadata)) return false
  return Object.entries(value).every(([key, term]) =>
    castTerm(term).some((candidate) =>
      contains(metadata[canonicalKey(key)], candidate),
    ),
  )
}

const byUserName: Matcher = withTerm(
  (row, term) =>
    includesTerm(fullNameOf(row), term) ||
    includesTerm(row.attributes.email, term),
)

const byRole: Matcher = withTerm((row, term) => {
  const role = stringOrNull(row.attributes.role)
  return (
    role != null &&
    includesTerm(role.replace(/-/g, "_"), term.replace(/-/g, "_"))
  )
})

const byMethod: Matcher = withTerm(
  (row, term) => row.attributes.method === term.toUpperCase(),
)

const byOwner: Matcher = anyUser((row) => rowsOf(ownerOf(row)))

const NAMED_MATCHERS: Matchers = {
  id: byId,
  name: substring("name"),
  metadata: byMetadata,
}

const LOOKUP_MATCHERS: Matchers = {
  id: byId,
  name: substring("name"),
  key: substring("key"),
}

const MATCHERS: Readonly<Record<SearchableType, Matchers>> = {
  licenses: {
    id: byId,
    name: substring("name"),
    key: exact("key"),
    owner: byOwner,
    user: anyUser(usersOf),
    policy: related(policyOf),
    product: related((row) => productOf(policyOf(row))),
    metadata: byMetadata,
  },
  groups: NAMED_MATCHERS,
  users: {
    id: byId,
    email: substring("email"),
    firstName: substring("firstName"),
    lastName: substring("lastName"),
    fullName: byUserName,
    name: byUserName,
    role: byRole,
    metadata: byMetadata,
  },
  machines: {
    id: byId,
    name: substring("name"),
    fingerprint: substring("fingerprint"),
    owner: byOwner,
    user: anyUser((row) => usersOf(licenseOf(row))),
    license: related(licenseOf),
    policy: related((row) => policyOf(licenseOf(row))),
    product: related((row) => productOf(policyOf(licenseOf(row)))),
    metadata: byMetadata,
  },
  entitlements: { ...NAMED_MATCHERS, code: substring("code") },
  products: { ...NAMED_MATCHERS, code: substring("code") },
  policies: { ...NAMED_MATCHERS, product: related(productOf) },
  packages: {
    ...NAMED_MATCHERS,
    key: substring("key"),
    product: related(productOf),
  },
  releases: {
    ...NAMED_MATCHERS,
    version: substring("version"),
    tag: substring("tag"),
    product: related(productOf),
    package: related((row) => refRow(row.refs.package)),
  },
  platforms: LOOKUP_MATCHERS,
  arches: LOOKUP_MATCHERS,
  "request-logs": {
    id: byId,
    ip: substring("ip"),
    method: byMethod,
    status: exact("status"),
    url: substring("url"),
    requestor: polymorphic("requestor"),
    requestorType: refType("requestor"),
    requestorId: refId("requestor"),
    resource: polymorphic("resource"),
    resourceType: refType("resource"),
    resourceId: refId("resource"),
  },
}

function isSearchableType(value: string): value is SearchableType {
  return SEARCHABLE_TYPES.some((type) => type === value)
}

function searchType(value: unknown): SearchableType {
  if (value === undefined) {
    fail(badRequest("is missing", { pointer: "/meta/type" }))
  }
  if (typeof value !== "string") {
    fail(typeMismatch("/meta/type", value, "string"))
  }
  if (!isSearchableType(value)) {
    fail(
      badRequest(`search type '${value}' is not supported`, {
        pointer: "/meta/type",
      }),
    )
  }
  return value
}

function searchQuery(value: unknown): Record<string, unknown> {
  if (value === undefined) {
    fail(badRequest("is missing", { pointer: "/meta/query" }))
  }
  if (!isRecord(value)) fail(typeMismatch("/meta/query", value, "hash"))
  if (Object.keys(value).length === 0) {
    fail(badRequest("search query is required", { pointer: "/meta/query" }))
  }
  return value
}

function requiresEveryMatch(value: unknown): boolean {
  if (value === undefined) return true
  if (typeof value !== "string") {
    fail(typeMismatch("/meta/op", value, "string"))
  }
  return value.toUpperCase() !== "OR"
}

function matcherFor(
  type: SearchableType,
  attribute: string,
): Matcher | undefined {
  const matchers = MATCHERS[type]
  return Object.hasOwn(matchers, attribute) ? matchers[attribute] : undefined
}

function assertMinimumLength(
  label: string,
  pointer: string,
  value: unknown,
): void {
  if (typeof value === "string" && value.length < MIN_TERM_LENGTH) {
    fail(
      badRequest(
        `search query for '${label}' is too small (minimum ${MIN_TERM_LENGTH} characters)`,
        { pointer },
      ),
    )
  }
}

function predicateFor(
  type: SearchableType,
  key: string,
  value: unknown,
): (row: MockRow) => boolean {
  const attribute = canonicalKey(key)
  const matcher = matcherFor(type, attribute)
  if (!matcher) {
    fail(
      badRequest(
        `search query '${attribute}' is not supported for resource type '${type}'`,
        { pointer: `/meta/query/${attribute}` },
      ),
    )
  }

  if (attribute === "metadata") {
    if (!isRecord(value)) {
      fail(
        badRequest(
          "search query for 'metadata' must be a hash of key-value search terms",
          { pointer: "/meta/query/metadata" },
        ),
      )
    }
    for (const [metadataKey, term] of Object.entries(value)) {
      const label = canonicalKey(metadataKey)
      assertMinimumLength(label, `/meta/query/metadata/${label}`, term)
    }
  } else {
    assertMinimumLength(attribute, `/meta/query/${attribute}`, value)
  }

  return (row) => matcher(row, value)
}

function canSearch(subject: MockRow | undefined): boolean {
  if (!subject) return false
  if (subject.type === "environments") return true
  if (subject.type !== "users") return false
  const role = stringOrNull(subject.attributes.role)
  return role != null && SEARCHING_ROLES.includes(role)
}

function assertSearchable(ctx: MockContext): void {
  if (!canSearch(ctx.bearer?.subject)) {
    fail(
      forbidden(
        "You do not have permission to complete the request (ensure the token or license is allowed to access all resources)",
      ),
    )
  }
}

function candidateRows(ctx: MockContext, type: SearchableType): MockRow[] {
  const rows = mockStore.table(type).all()
  return ACCOUNT_LEVEL_TYPES.includes(type)
    ? accountRows(ctx, rows)
    : scoped(ctx, rows)
}

mockRoute("POST", `${MOCK_ACCOUNT}/search`, (ctx) => {
  assertSearchable(ctx)

  const meta = bodyMeta(ctx)
  const type = searchType(meta.type)
  const query = searchQuery(meta.query)
  const everyTerm = requiresEveryMatch(meta.op)
  const predicates = Object.entries(query).map(([key, value]) =>
    predicateFor(type, key, value),
  )

  const matches = candidateRows(ctx, type).filter((row) =>
    everyTerm
      ? predicates.every((predicate) => predicate(row))
      : predicates.some((predicate) => predicate(row)),
  )
  const data = newestFirst(matches)
    .slice(0, RESULT_LIMIT)
    .map((row) => serializeMock(ctx, row))

  return { status: 200, body: { data, links: {} } }
})
