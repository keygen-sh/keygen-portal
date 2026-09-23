import {
  MOCK_ACCOUNT,
  accountRef,
  accountRows,
  attributeError,
  bodyAttributes,
  destroyMock,
  destroyMockWhere,
  diffMetadata,
  emitMockEvent,
  fail,
  findMockEnvironment,
  inAccount,
  isUuid,
  IsolationStrategy,
  makeMockRow,
  missingAttribute,
  notFound,
  paginateMock,
  registerMockDestroyer,
  registerMockSerializer,
  resource,
  mockRoute,
  mockStore,
  unpermittedAttribute,
  unprocessable,
  uuid,
  type MockContext,
  type MockResource,
  type MockRow,
} from "@/demo/server"

const TYPE = "environments"
const LABEL = "environment"
const RESERVED_CODES = ["actions", "action"]
const MAX_LENGTH = 255
const TOO_LONG_DETAIL = `is too long (maximum is ${MAX_LENGTH} characters)`
const ISOLATION_STRATEGIES: readonly string[] = Object.values(IsolationStrategy)
const CREATE_ATTRIBUTES = ["name", "code", "isolationStrategy"]
const UPDATE_ATTRIBUTES = ["name", "code"]

const environments = () => mockStore.table(TYPE)
const tokens = () => mockStore.table("tokens")

export function serializeMockEnvironment(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return resource(
    ctx,
    row,
    {
      name: row.attributes.name,
      code: row.attributes.code,
      isolationStrategy: row.attributes.isolationStrategy,
      created: row.created,
      updated: row.updated,
    },
    {},
  )
}

registerMockSerializer(TYPE, serializeMockEnvironment)

registerMockDestroyer(TYPE, (ctx, row) => {
  const belongsToEnvironment = (candidate: MockRow): boolean =>
    candidate.refs.environment?.id === row.id

  for (const type of mockStore.types()) {
    destroyMockWhere(ctx, type, belongsToEnvironment)
  }
  for (const type of mockStore.types()) {
    const table = mockStore.table(type)
    for (const emittedDuringCascade of table.where(belongsToEnvironment)) {
      table.delete(emittedDuringCascade.id)
    }
  }
  for (const token of tokens().where(
    (candidate) =>
      candidate.refs.bearer?.type === TYPE &&
      candidate.refs.bearer?.id === row.id,
  )) {
    tokens().delete(token.id)
  }

  environments().delete(row.id)
  emitMockEvent(ctx, "environment.deleted", { resource: row })
})

function requireEnvironment(ctx: MockContext, identifier: string): MockRow {
  const row = findMockEnvironment(ctx.accountId, identifier)
  if (!row) fail(notFound(LABEL, identifier))
  return row
}

function rejectUnpermittedAttributes(
  attributes: Record<string, unknown>,
  permitted: readonly string[],
): void {
  for (const key of Object.keys(attributes)) {
    if (!permitted.includes(key)) fail(unpermittedAttribute(key))
  }
}

function validateName(name: unknown): string {
  if (name === undefined) fail(missingAttribute("name"))
  if (typeof name !== "string" || name.trim() === "") {
    fail(unprocessable(attributeError("name", "MISSING", "can't be blank")))
  }
  if (name.length > MAX_LENGTH) {
    fail(unprocessable(attributeError("name", "TOO_LONG", TOO_LONG_DETAIL)))
  }
  return name
}

function validateCode(
  ctx: MockContext,
  code: unknown,
  excludeId?: string,
): string {
  if (code === undefined) fail(missingAttribute("code"))
  if (typeof code !== "string" || code.trim() === "") {
    fail(unprocessable(attributeError("code", "MISSING", "can't be blank")))
  }
  if (code.length > MAX_LENGTH) {
    fail(unprocessable(attributeError("code", "TOO_LONG", TOO_LONG_DETAIL)))
  }
  if (isUuid(code)) {
    fail(unprocessable(attributeError("code", "INVALID", "is invalid")))
  }
  if (RESERVED_CODES.includes(code.toLowerCase())) {
    fail(unprocessable(attributeError("code", "NOT_ALLOWED", "is reserved")))
  }

  const taken = environments().find(
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

function validateIsolationStrategy(value: unknown): string {
  if (value === undefined || value === null) return IsolationStrategy.Isolated
  if (typeof value !== "string" || !ISOLATION_STRATEGIES.includes(value)) {
    fail(
      unprocessable(
        attributeError(
          "isolationStrategy",
          "NOT_ALLOWED",
          "unsupported isolation strategy",
        ),
      ),
    )
  }
  return value
}

mockRoute("GET", `${MOCK_ACCOUNT}/environments`, (ctx) => {
  const rows = accountRows(ctx, environments().all())
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockEnvironment(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/environments/:id`, (ctx) => {
  const row = requireEnvironment(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockEnvironment(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/environments`, (ctx) => {
  const attributes = bodyAttributes(ctx)
  rejectUnpermittedAttributes(attributes, CREATE_ATTRIBUTES)

  const name = validateName(attributes.name)
  const code = validateCode(ctx, attributes.code)
  const isolationStrategy = validateIsolationStrategy(
    attributes.isolationStrategy,
  )

  const row = makeMockRow(
    TYPE,
    uuid(),
    { name, code, isolationStrategy },
    { account: accountRef(ctx) },
  )
  environments().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "environment.created", { resource: row })

  return { status: 201, body: { data: serializeMockEnvironment(ctx, row) } }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/environments/:id`, (ctx) => {
  const row = requireEnvironment(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }

  const attributes = bodyAttributes(ctx)
  rejectUnpermittedAttributes(attributes, UPDATE_ATTRIBUTES)

  const changes: Record<string, unknown> = {}
  if ("name" in attributes) changes.name = validateName(attributes.name)
  if ("code" in attributes) {
    changes.code = validateCode(ctx, attributes.code, row.id)
  }

  const before = { ...row.attributes }
  const changed = Object.entries(changes).some(
    ([key, value]) => before[key] !== value,
  )
  environments().patch(row.id, { attributes: changes }, { touch: changed })

  emitMockEvent(ctx, "environment.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockEnvironment(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/environments/:id`, (ctx) => {
  const row = requireEnvironment(ctx, ctx.params.id)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})
