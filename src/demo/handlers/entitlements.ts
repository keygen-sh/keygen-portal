import {
  MOCK_ACCOUNT,
  attributeError,
  badRequest,
  baseRefs,
  bodyAttributes,
  bodyDataList,
  destroyMock,
  diffMetadata,
  emitMockEvent,
  environmentRelationship,
  errors,
  fail,
  inAccount,
  isRecord,
  isUuid,
  makeMockRow,
  newestFirst,
  normalizeMetadata,
  notFound,
  paginateMock,
  registerMockDestroyer,
  registerMockSerializer,
  relationshipError,
  requireVisible,
  resource,
  mockRoute,
  scoped,
  mockStore,
  unprocessable,
  uuid,
  assertWritable,
  type MockContext,
  type MockResource,
  type MockRow,
} from "@/demo/server"

const TYPE = "entitlements"
const LABEL = "entitlement"
const RESERVED_CODES = ["actions", "action"]
const MAX_LENGTH = 255

const entitlements = () => mockStore.table(TYPE)
const licenseEntitlements = () => mockStore.table("license-entitlements")
const policyEntitlements = () => mockStore.table("policy-entitlements")
const constraints = () => mockStore.table("constraints")

export function serializeMockEntitlement(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return resource(
    ctx,
    row,
    {
      name: row.attributes.name,
      code: row.attributes.code,
      metadata: row.attributes.metadata ?? {},
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
    },
  )
}

registerMockSerializer(TYPE, serializeMockEntitlement)

registerMockDestroyer(TYPE, (ctx, row) => {
  for (const join of licenseEntitlements().where(
    (candidate) => candidate.refs.entitlement?.id === row.id,
  )) {
    licenseEntitlements().delete(join.id)
  }
  for (const join of policyEntitlements().where(
    (candidate) => candidate.refs.entitlement?.id === row.id,
  )) {
    policyEntitlements().delete(join.id)
  }
  for (const constraint of constraints().where(
    (candidate) => candidate.refs.entitlement?.id === row.id,
  )) {
    constraints().delete(constraint.id)
  }

  entitlements().delete(row.id)
  emitMockEvent(ctx, "entitlement.deleted", { resource: row })
})

function findEntitlement(ctx: MockContext, identifier: string): MockRow {
  const byId = entitlements().get(identifier)
  if (byId) return requireVisible(ctx, entitlements(), byId.id, LABEL)

  const byCode = scoped(ctx, entitlements().all()).find(
    (row) =>
      String(row.attributes.code).toLowerCase() === identifier.toLowerCase(),
  )
  if (!byCode) fail(notFound(LABEL, identifier))
  return byCode
}

function validateCode(
  ctx: MockContext,
  code: unknown,
  excludeId?: string,
): string {
  if (code === undefined)
    fail(badRequest("is missing", { pointer: "/data/attributes/code" }))
  if (typeof code !== "string" || code.trim() === "") {
    fail(badRequest("cannot be blank", { pointer: "/data/attributes/code" }))
  }
  if (code.length > MAX_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          "code",
          "TOO_LONG",
          `is too long (maximum is ${MAX_LENGTH} characters)`,
        ),
      ),
    )
  }
  if (isUuid(code)) {
    fail(unprocessable(attributeError("code", "INVALID", "is invalid")))
  }
  if (RESERVED_CODES.includes(code.toLowerCase())) {
    fail(unprocessable(attributeError("code", "NOT_ALLOWED", "is reserved")))
  }

  const taken = entitlements().find(
    (row) =>
      row.id !== excludeId &&
      inAccount(ctx, row) &&
      String(row.attributes.code).toLowerCase() === code.toLowerCase(),
  )
  if (taken) {
    fail(
      unprocessable(attributeError("code", "TAKEN", "has already been taken")),
    )
  }

  return code
}

function validateName(name: unknown): string {
  if (name === undefined)
    fail(badRequest("is missing", { pointer: "/data/attributes/name" }))
  if (typeof name !== "string" || name.trim() === "") {
    fail(badRequest("cannot be blank", { pointer: "/data/attributes/name" }))
  }
  if (name.length > MAX_LENGTH) {
    fail(
      unprocessable(
        attributeError(
          "name",
          "TOO_LONG",
          `is too long (maximum is ${MAX_LENGTH} characters)`,
        ),
      ),
    )
  }
  return name
}

function validateMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata === undefined || metadata === null) return {}
  if (!isRecord(metadata)) {
    fail(
      badRequest("type mismatch (received string expected object)", {
        pointer: "/data/attributes/metadata",
      }),
    )
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

mockRoute("GET", `${MOCK_ACCOUNT}/entitlements`, (ctx) => {
  const rows = scoped(ctx, entitlements().all())
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockEntitlement(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/entitlements/:id`, (ctx) => {
  const row = findEntitlement(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockEntitlement(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/entitlements`, (ctx) => {
  const attributes = bodyAttributes(ctx)
  const name = validateName(attributes.name)
  const code = validateCode(ctx, attributes.code)
  const metadata = validateMetadata(attributes.metadata)

  const row = makeMockRow(TYPE, uuid(), { name, code, metadata }, baseRefs(ctx))
  entitlements().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "entitlement.created", { resource: row })

  return { status: 201, body: { data: serializeMockEntitlement(ctx, row) } }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/entitlements/:id`, (ctx) => {
  const row = findEntitlement(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = bodyAttributes(ctx)
  const changes: Record<string, unknown> = {}

  if ("name" in attributes) changes.name = validateName(attributes.name)
  if ("code" in attributes)
    changes.code = validateCode(ctx, attributes.code, row.id)
  if ("metadata" in attributes)
    changes.metadata = validateMetadata(attributes.metadata)

  const before = { ...row.attributes }
  entitlements().patch(row.id, { attributes: changes })

  emitMockEvent(ctx, "entitlement.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockEntitlement(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/entitlements/:id`, (ctx) => {
  const row = findEntitlement(ctx, ctx.params.id)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

function policyEntitlementIds(
  policyId: string | null | undefined,
): Set<string> {
  if (!policyId) return new Set()
  return new Set(
    policyEntitlements()
      .where((row) => row.refs.policy?.id === policyId)
      .map((row) => row.refs.entitlement?.id ?? "")
      .filter((id) => id !== ""),
  )
}

function licenseDirectIds(licenseId: string): Set<string> {
  return new Set(
    licenseEntitlements()
      .where((row) => row.refs.license?.id === licenseId)
      .map((row) => row.refs.entitlement?.id ?? "")
      .filter((id) => id !== ""),
  )
}

export function entitlementsForLicense(license: MockRow): MockRow[] {
  const ids = new Set([
    ...policyEntitlementIds(license.refs.policy?.id),
    ...licenseDirectIds(license.id),
  ])
  return newestFirst(
    [...ids]
      .map((id) => entitlements().get(id))
      .filter((row): row is MockRow => row != null),
  )
}

export function entitlementsForPolicy(policy: MockRow): MockRow[] {
  return newestFirst(
    [...policyEntitlementIds(policy.id)]
      .map((id) => entitlements().get(id))
      .filter((row): row is MockRow => row != null),
  )
}

function requestedEntitlementIds(ctx: MockContext): string[] {
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

function joinResource(
  ctx: MockContext,
  row: MockRow,
  parentName: string,
): MockResource {
  return resource(
    ctx,
    row,
    { created: row.created, updated: row.updated },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      entitlement: { data: row.refs.entitlement },
      [parentName]: { data: row.refs[parentName] },
    },
  )
}

mockRoute("GET", `${MOCK_ACCOUNT}/licenses/:licenseId/entitlements`, (ctx) => {
  const license = requireVisible(
    ctx,
    mockStore.table("licenses"),
    ctx.params.licenseId,
    "license",
  )
  ctx.resource = { type: "licenses", id: license.id }
  return {
    status: 200,
    body: paginateMock(ctx, entitlementsForLicense(license), (row) =>
      serializeMockEntitlement(ctx, row),
    ),
  }
})

mockRoute("POST", `${MOCK_ACCOUNT}/licenses/:licenseId/entitlements`, (ctx) => {
  const license = requireVisible(
    ctx,
    mockStore.table("licenses"),
    ctx.params.licenseId,
    "license",
  )
  assertWritable(ctx, license)
  ctx.resource = { type: "licenses", id: license.id }

  const ids = requestedEntitlementIds(ctx)
  const inherited = policyEntitlementIds(license.refs.policy?.id)
  const direct = licenseDirectIds(license.id)

  for (const id of ids) {
    const entitlement = entitlements().get(id)
    if (!entitlement || !inAccount(ctx, entitlement)) {
      fail(
        unprocessable(
          relationshipError("entitlement", "NOT_FOUND", "must exist"),
        ),
      )
    }
    if (inherited.has(id)) {
      fail(
        unprocessable(
          relationshipError(
            "entitlement",
            "CONFLICT",
            "already exists (entitlement is attached through policy)",
          ),
        ),
      )
    }
    if (direct.has(id)) {
      fail(
        unprocessable(
          relationshipError("entitlement", "TAKEN", "already exists"),
        ),
      )
    }
  }

  const joins = ids.map((id) =>
    licenseEntitlements().insert(
      makeMockRow(
        "license-entitlements",
        uuid(),
        {},
        {
          ...baseRefs(ctx),
          environment: license.refs.environment ?? null,
          entitlement: { type: TYPE, id },
          license: { type: "licenses", id: license.id },
        },
      ),
    ),
  )

  emitMockEvent(ctx, "license.entitlements.attached", {
    resource: license,
    metadata: {
      codes: ids.map((id) => entitlements().get(id)?.attributes.code),
    },
  })

  return {
    status: 200,
    body: { data: joins.map((join) => joinResource(ctx, join, "license")) },
  }
})

mockRoute(
  "DELETE",
  `${MOCK_ACCOUNT}/licenses/:licenseId/entitlements`,
  (ctx) => {
    const license = requireVisible(
      ctx,
      mockStore.table("licenses"),
      ctx.params.licenseId,
      "license",
    )
    assertWritable(ctx, license)
    ctx.resource = { type: "licenses", id: license.id }

    const ids = requestedEntitlementIds(ctx)
    const inherited = policyEntitlementIds(license.refs.policy?.id)
    const direct = licenseDirectIds(license.id)

    ids.forEach((id, index) => {
      if (inherited.has(id) && !direct.has(id)) {
        fail(
          errors(403, {
            title: "Access denied",
            detail: `cannot detach entitlement '${id}' (entitlement is attached through policy)`,
            source: { pointer: `/data/${index}` },
          }),
        )
      }
      if (!direct.has(id)) {
        fail(
          errors(422, {
            title: "Unprocessable entity",
            detail: `cannot detach entitlement '${id}' (entitlement is not attached)`,
            source: { pointer: `/data/${index}` },
          }),
        )
      }
    })

    for (const join of licenseEntitlements().where(
      (row) =>
        row.refs.license?.id === license.id &&
        ids.includes(row.refs.entitlement?.id ?? ""),
    )) {
      licenseEntitlements().delete(join.id)
    }

    emitMockEvent(ctx, "license.entitlements.detached", {
      resource: license,
      metadata: {
        codes: ids.map((id) => entitlements().get(id)?.attributes.code),
      },
    })

    return { status: 204 }
  },
)

mockRoute("GET", `${MOCK_ACCOUNT}/policies/:policyId/entitlements`, (ctx) => {
  const policy = requireVisible(
    ctx,
    mockStore.table("policies"),
    ctx.params.policyId,
    "policy",
  )
  ctx.resource = { type: "policies", id: policy.id }
  return {
    status: 200,
    body: paginateMock(ctx, entitlementsForPolicy(policy), (row) =>
      serializeMockEntitlement(ctx, row),
    ),
  }
})

mockRoute("POST", `${MOCK_ACCOUNT}/policies/:policyId/entitlements`, (ctx) => {
  const policy = requireVisible(
    ctx,
    mockStore.table("policies"),
    ctx.params.policyId,
    "policy",
  )
  assertWritable(ctx, policy)
  ctx.resource = { type: "policies", id: policy.id }

  const ids = requestedEntitlementIds(ctx)
  const attached = policyEntitlementIds(policy.id)

  for (const id of ids) {
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
  }

  const joins = ids.map((id) =>
    policyEntitlements().insert(
      makeMockRow(
        "policy-entitlements",
        uuid(),
        {},
        {
          ...baseRefs(ctx),
          environment: policy.refs.environment ?? null,
          entitlement: { type: TYPE, id },
          policy: { type: "policies", id: policy.id },
        },
      ),
    ),
  )

  emitMockEvent(ctx, "policy.entitlements.attached", {
    resource: policy,
    metadata: {
      codes: ids.map((id) => entitlements().get(id)?.attributes.code),
    },
  })

  return {
    status: 200,
    body: { data: joins.map((join) => joinResource(ctx, join, "policy")) },
  }
})

mockRoute(
  "DELETE",
  `${MOCK_ACCOUNT}/policies/:policyId/entitlements`,
  (ctx) => {
    const policy = requireVisible(
      ctx,
      mockStore.table("policies"),
      ctx.params.policyId,
      "policy",
    )
    assertWritable(ctx, policy)
    ctx.resource = { type: "policies", id: policy.id }

    const ids = requestedEntitlementIds(ctx)
    const attached = policyEntitlementIds(policy.id)

    ids.forEach((id, index) => {
      if (!attached.has(id)) {
        fail(
          errors(422, {
            title: "Unprocessable entity",
            detail: `cannot detach entitlement '${id}' (entitlement is not attached)`,
            source: { pointer: `/data/${index}` },
          }),
        )
      }
    })

    for (const join of policyEntitlements().where(
      (row) =>
        row.refs.policy?.id === policy.id &&
        ids.includes(row.refs.entitlement?.id ?? ""),
    )) {
      policyEntitlements().delete(join.id)
    }

    emitMockEvent(ctx, "policy.entitlements.detached", {
      resource: policy,
      metadata: {
        codes: ids.map((id) => entitlements().get(id)?.attributes.code),
      },
    })

    return { status: 204 }
  },
)
