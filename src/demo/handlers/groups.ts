import {
  MOCK_ACCOUNT,
  accountPath,
  assertWritable,
  attributeError,
  badRequest,
  baseRefs,
  bodyAttributes,
  bodyDataList,
  type MockContext,
  destroyMock,
  diffMetadata,
  emitMockEvent,
  environmentRelationship,
  errors,
  fail,
  inAccount,
  inScope,
  IsolationStrategy,
  isRecord,
  isUuid,
  makeMockRow,
  normalizeMetadata,
  notFound,
  paginateMock,
  registerMockDestroyer,
  registerMockSerializer,
  rejectUnpermitted,
  relationshipError,
  requireVisible,
  type MockResource,
  resource,
  mockRoute,
  type MockRow,
  scoped,
  serializeMock,
  mockStore,
  toMany,
  toOne,
  typeMismatch,
  unprocessable,
  uuid,
} from "@/demo/server"

const TYPE = "groups"
const LABEL = "group"
const OWNER_TYPE = "group-owners"
const OWNER_LABEL = "group owner"
const NAME_MIN_LENGTH = 1
const NAME_MAX_LENGTH = 255
const METADATA_MAX_BYTES = 16384
const METADATA_MAX_DEPTH = 4
const METADATA_MAX_KEYS = 64

export type GroupMemberType = "licenses" | "users" | "machines"

const MEMBER_TYPES: readonly GroupMemberType[] = [
  "licenses",
  "users",
  "machines",
]

const GroupLimitAttribute: Readonly<Record<GroupMemberType, string>> = {
  licenses: "maxLicenses",
  users: "maxUsers",
  machines: "maxMachines",
}

const GroupLimitErrorKind: Readonly<Record<GroupMemberType, string>> = {
  licenses: "LICENSE_LIMIT_EXCEEDED",
  users: "USER_LIMIT_EXCEEDED",
  machines: "MACHINE_LIMIT_EXCEEDED",
}

const GroupMemberLabel: Readonly<Record<GroupMemberType, string>> = {
  licenses: "license",
  users: "user",
  machines: "machine",
}

const LIMIT_ATTRIBUTES = Object.values(GroupLimitAttribute)
const PERMITTED_ATTRIBUTES = ["name", ...LIMIT_ATTRIBUTES, "metadata"]

const groups = () => mockStore.table(TYPE)
const groupOwners = () => mockStore.table(OWNER_TYPE)
const users = () => mockStore.table("users")
const environments = () => mockStore.table("environments")

function groupPath(ctx: MockContext, id: string): string {
  return `${accountPath(ctx)}/groups/${id}`
}

export function serializeMockGroup(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const path = groupPath(ctx, row.id)

  return resource(
    ctx,
    row,
    {
      name: row.attributes.name,
      maxUsers: row.attributes.maxUsers ?? null,
      maxLicenses: row.attributes.maxLicenses ?? null,
      maxMachines: row.attributes.maxMachines ?? null,
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      owners: toMany(`${path}/owners`),
      users: toMany(`${path}/users`),
      licenses: toMany(`${path}/licenses`),
      machines: toMany(`${path}/machines`),
    },
  )
}

registerMockSerializer(TYPE, serializeMockGroup)

export function serializeMockGroupOwner(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const groupId = row.refs.group?.id ?? ""

  return resource(
    ctx,
    row,
    { created: row.created, updated: row.updated },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      group: toOne(ctx, row.refs.group),
      user: toOne(ctx, row.refs.user),
    },
    { links: { self: `${groupPath(ctx, groupId)}/owners/${row.id}` } },
  )
}

registerMockSerializer(OWNER_TYPE, serializeMockGroupOwner)

function membersOf(type: GroupMemberType, groupId: string): MockRow[] {
  return mockStore.table(type).where((row) => row.refs.group?.id === groupId)
}

function ownersOf(groupId: string): MockRow[] {
  return groupOwners().where((row) => row.refs.group?.id === groupId)
}

registerMockDestroyer(TYPE, (ctx, row) => {
  for (const type of MEMBER_TYPES) {
    for (const member of membersOf(type, row.id)) {
      mockStore
        .table(type)
        .patch(member.id, { refs: { group: null } }, { touch: false })
    }
  }
  for (const owner of ownersOf(row.id)) {
    groupOwners().delete(owner.id)
  }

  groups().delete(row.id)
  emitMockEvent(ctx, "group.deleted", { resource: row })
})

function environmentAccepts(host: MockRow, association: MockRow): boolean {
  const hostEnvironment = host.refs.environment
  const associationEnvironmentId = association.refs.environment?.id ?? null

  if (!hostEnvironment) return associationEnvironmentId == null
  if (associationEnvironmentId === hostEnvironment.id) return true

  const environment = environments().get(hostEnvironment.id)
  return (
    environment?.attributes.isolationStrategy === IsolationStrategy.Shared &&
    associationEnvironmentId == null
  )
}

export function assertGroupCompatible(member: MockRow, group: MockRow): void {
  if (!environmentAccepts(member, group)) {
    fail(
      unprocessable(
        relationshipError(
          "environment",
          "NOT_ALLOWED",
          "must be compatible with group environment",
        ),
      ),
    )
  }
}

export function assertGroupCapacity(
  group: MockRow,
  type: GroupMemberType,
): void {
  const limit = group.attributes[GroupLimitAttribute[type]]
  if (typeof limit !== "number") return

  if (membersOf(type, group.id).length >= limit) {
    fail(
      unprocessable(
        relationshipError(
          "group",
          GroupLimitErrorKind[type],
          `${GroupMemberLabel[type]} count has exceeded maximum allowed by current group (${limit})`,
        ),
      ),
    )
  }
}

export function requestedGroup(ctx: MockContext): MockRow | null {
  const data = isRecord(ctx.body) ? ctx.body.data : null
  if (data == null) return null

  const pointer = "/data/id"
  const id = isRecord(data) ? data.id : undefined
  if (id === undefined) fail(badRequest("is missing", { pointer }))
  if (!isUuid(id)) fail(typeMismatch(pointer, id, "uuid"))

  const group = groups().get(id)
  if (!group || !inScope(ctx, group)) {
    fail(unprocessable(relationshipError("group", "NOT_FOUND", "must exist")))
  }

  return group
}

function validateName(name: unknown): string {
  const pointer = "/data/attributes/name"

  if (name === undefined) fail(badRequest("is missing", { pointer }))
  if (name === null) fail(badRequest("cannot be null", { pointer }))
  if (typeof name !== "string") fail(typeMismatch(pointer, name, "string"))
  if (name.length < NAME_MIN_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          "name",
          "TOO_SHORT",
          `is too short (minimum is ${NAME_MIN_LENGTH} character)`,
        ),
      ),
    )
  }
  if (name.length > NAME_MAX_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          "name",
          "TOO_LONG",
          `is too long (maximum is ${NAME_MAX_LENGTH} characters)`,
        ),
      ),
    )
  }

  return name
}

function validateLimit(
  attribute: string,
  value: unknown,
  allowNull: boolean,
): number | null {
  const pointer = `/data/attributes/${attribute}`

  if (value === undefined) return null
  if (value === null) {
    if (allowNull) return null
    fail(badRequest("cannot be null", { pointer }))
  }
  if (typeof value !== "number" || !Number.isInteger(value)) {
    fail(typeMismatch(pointer, value, "integer"))
  }

  return value
}

function validateLimits(
  attributes: Record<string, unknown>,
  allowNull: boolean,
): Record<string, number | null> {
  const limits: Record<string, number | null> = {}

  for (const attribute of LIMIT_ATTRIBUTES) {
    if (!(attribute in attributes)) continue
    limits[attribute] = validateLimit(
      attribute,
      attributes[attribute],
      allowNull,
    )
  }

  return limits
}

function jsonChildren(value: unknown): unknown[] {
  if (Array.isArray(value)) return value as unknown[]
  if (isRecord(value)) return Object.values(value)
  return []
}

function jsonDepth(value: unknown): number {
  if (!Array.isArray(value) && !isRecord(value)) return 0
  return 1 + Math.max(0, ...jsonChildren(value).map(jsonDepth))
}

function jsonKeyCount(value: unknown): number {
  const own = isRecord(value) ? Object.keys(value).length : 0

  return jsonChildren(value).reduce<number>(
    (sum, child) => sum + jsonKeyCount(child),
    own,
  )
}

function validateMetadata(metadata: unknown): Record<string, unknown> {
  const pointer = "/data/attributes/metadata"

  if (metadata === undefined || metadata === null) return {}
  if (!isRecord(metadata)) fail(typeMismatch(pointer, metadata, "hash"))

  const byteSize = new TextEncoder().encode(JSON.stringify(metadata)).length
  if (byteSize > METADATA_MAX_BYTES) {
    fail(
      unprocessable(
        attributeError(
          "metadata",
          "TOO_LONG",
          `too large (exceeded limit of ${METADATA_MAX_BYTES} bytes)`,
        ),
      ),
    )
  }
  if (jsonDepth(metadata) > METADATA_MAX_DEPTH) {
    fail(
      unprocessable(
        attributeError(
          "metadata",
          "TOO_LONG",
          `too many items (exceeded limit of ${METADATA_MAX_DEPTH} items)`,
        ),
      ),
    )
  }
  if (jsonKeyCount(metadata) > METADATA_MAX_KEYS) {
    fail(
      unprocessable(
        attributeError(
          "metadata",
          "TOO_LONG",
          `too many keys (exceeded limit of ${METADATA_MAX_KEYS} keys)`,
        ),
      ),
    )
  }

  return normalizeMetadata(metadata)
}

mockRoute("GET", `${MOCK_ACCOUNT}/groups`, (ctx) => {
  const rows = scoped(ctx, groups().all())
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockGroup(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/groups/:id`, (ctx) => {
  const row = requireVisible(ctx, groups(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockGroup(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/groups`, (ctx) => {
  const attributes = bodyAttributes(ctx)
  rejectUnpermitted(attributes, PERMITTED_ATTRIBUTES)

  const name = validateName(attributes.name)
  const limits = validateLimits(attributes, false)
  const metadata = validateMetadata(attributes.metadata)

  const row = makeMockRow(
    TYPE,
    uuid(),
    {
      name,
      maxUsers: null,
      maxLicenses: null,
      maxMachines: null,
      ...limits,
      metadata,
    },
    baseRefs(ctx),
  )
  groups().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "group.created", { resource: row })

  return { status: 201, body: { data: serializeMockGroup(ctx, row) } }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/groups/:id`, (ctx) => {
  const row = requireVisible(ctx, groups(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = bodyAttributes(ctx)
  rejectUnpermitted(attributes, PERMITTED_ATTRIBUTES)

  const changes: Record<string, unknown> = validateLimits(attributes, true)
  if ("name" in attributes) changes.name = validateName(attributes.name)
  if ("metadata" in attributes) {
    changes.metadata = validateMetadata(attributes.metadata)
  }

  const before = { ...row.attributes }
  const changed = Object.keys(changes).some(
    (key) => JSON.stringify(changes[key]) !== JSON.stringify(before[key]),
  )
  groups().patch(row.id, { attributes: changes }, { touch: changed })

  emitMockEvent(ctx, "group.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockGroup(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/groups/:id`, (ctx) => {
  const row = requireVisible(ctx, groups(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

function requestedUserIds(ctx: MockContext): string[] {
  const list = bodyDataList(ctx)
  if (list.length < 1 || list.length > 100) {
    fail(
      badRequest("length must be between 1 and 100 (inclusive)", {
        pointer: "/data",
      }),
    )
  }
  return list.map((entry, index) => {
    if (!isUuid(entry.id)) {
      fail(badRequest("must be a valid UUID", { pointer: `/data/${index}/id` }))
    }
    return entry.id
  })
}

function ownerEmails(ids: string[]): unknown[] {
  return ids.map((id) => users().get(id)?.attributes.email ?? null)
}

mockRoute("GET", `${MOCK_ACCOUNT}/groups/:groupId/owners`, (ctx) => {
  const group = requireVisible(ctx, groups(), ctx.params.groupId, LABEL)
  ctx.resource = { type: TYPE, id: group.id }
  return {
    status: 200,
    body: paginateMock(ctx, ownersOf(group.id), (row) =>
      serializeMockGroupOwner(ctx, row),
    ),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/groups/:groupId/owners/:ownerId`, (ctx) => {
  const group = requireVisible(ctx, groups(), ctx.params.groupId, LABEL)
  ctx.resource = { type: TYPE, id: group.id }

  const owner = groupOwners().get(ctx.params.ownerId)
  if (!owner || owner.refs.group?.id !== group.id) {
    fail(notFound(OWNER_LABEL, ctx.params.ownerId))
  }

  return { status: 200, body: { data: serializeMockGroupOwner(ctx, owner) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/groups/:groupId/owners`, (ctx) => {
  const group = requireVisible(ctx, groups(), ctx.params.groupId, LABEL)
  assertWritable(ctx, group)
  ctx.resource = { type: TYPE, id: group.id }

  const ids = requestedUserIds(ctx)
  const taken = new Set(
    ownersOf(group.id).map((owner) => owner.refs.user?.id ?? ""),
  )

  for (const id of ids) {
    const user = users().get(id)
    if (!user || !inAccount(ctx, user)) {
      fail(unprocessable(relationshipError("user", "NOT_FOUND", "must exist")))
    }
    if (!environmentAccepts(group, user)) {
      fail(
        unprocessable(
          relationshipError(
            "environment",
            "NOT_ALLOWED",
            "must be compatible with user environment",
          ),
        ),
      )
    }
    if (taken.has(id)) {
      fail(unprocessable(relationshipError("user", "TAKEN", "already exists")))
    }
    taken.add(id)
  }

  const owners = ids.map((id) =>
    groupOwners().insert(
      makeMockRow(
        OWNER_TYPE,
        uuid(),
        {},
        {
          ...baseRefs(ctx),
          environment: group.refs.environment ?? null,
          group: { type: TYPE, id: group.id },
          user: { type: "users", id },
        },
      ),
    ),
  )

  emitMockEvent(ctx, "group.owners.attached", {
    resource: group,
    metadata: { emails: ownerEmails(ids) },
  })

  return {
    status: 200,
    body: { data: owners.map((owner) => serializeMockGroupOwner(ctx, owner)) },
  }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/groups/:groupId/owners`, (ctx) => {
  const group = requireVisible(ctx, groups(), ctx.params.groupId, LABEL)
  assertWritable(ctx, group)
  ctx.resource = { type: TYPE, id: group.id }

  const ids = requestedUserIds(ctx)
  const owners = ownersOf(group.id)

  ids.forEach((id, index) => {
    if (!owners.some((owner) => owner.refs.user?.id === id)) {
      fail(
        errors(422, {
          title: "Unprocessable entity",
          detail: `owner relationship for user '${id}' not found`,
          source: { pointer: `/data/${index}` },
        }),
      )
    }
  })

  for (const owner of owners) {
    if (ids.includes(owner.refs.user?.id ?? "")) {
      groupOwners().delete(owner.id)
    }
  }

  emitMockEvent(ctx, "group.owners.detached", {
    resource: group,
    metadata: { emails: ownerEmails(ids) },
  })

  return { status: 204 }
})

for (const type of MEMBER_TYPES) {
  mockRoute("GET", `${MOCK_ACCOUNT}/groups/:groupId/${type}`, (ctx) => {
    const group = requireVisible(ctx, groups(), ctx.params.groupId, LABEL)
    ctx.resource = { type: TYPE, id: group.id }

    const rows = scoped(ctx, membersOf(type, group.id))
    return {
      status: 200,
      body: paginateMock(ctx, rows, (row) => serializeMock(ctx, row)),
    }
  })
}
