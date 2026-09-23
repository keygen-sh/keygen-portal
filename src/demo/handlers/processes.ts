import {
  MOCK_ACCOUNT,
  assertWritable,
  badRequest,
  baseError,
  baseRefs,
  type MockContext,
  destroyMock,
  diffMetadata,
  emitMockEvent,
  environmentRelationship,
  errors,
  fail,
  makeMockRow,
  millis,
  notFound,
  nowIso,
  paginateMock,
  receivedType,
  registerMockDestroyer,
  registerMockSerializer,
  rejectAttribute,
  requireVisible,
  resource,
  type MockResource,
  resourcePath,
  mockRoute,
  type MockRow,
  scoped,
  SECOND,
  shift,
  mockStore,
  stringOrNull,
  toOne,
  unprocessable,
  uuid,
} from "@/demo/server"

import {
  findMachine,
  licenseOf,
  licenseUserIds,
  lineageOf,
  policyOf,
  readAttributes,
  rejectRelationships,
  relatedResponse,
  requireMachine,
  validateMetadata,
} from "./components"

const TYPE = "processes"
const LABEL = "process"
const RESERVED_PIDS = ["actions", "action"]
const MAX_PID_LENGTH = 4096
const CREATE_ATTRIBUTES = ["pid", "metadata"]
const UPDATE_ATTRIBUTES = ["metadata"]
const DEFAULT_HEARTBEAT_DURATION = 600
const DEFAULT_LEASING_STRATEGY = "PER_MACHINE"
const ALWAYS_ALLOW_OVERAGE = "ALWAYS_ALLOW_OVERAGE"
const NO_REVIVE = "NO_REVIVE"
const ALWAYS_REVIVE = "ALWAYS_REVIVE"

const ProcessStatus = {
  Alive: "ALIVE",
  Dead: "DEAD",
  Resurrected: "RESURRECTED",
} as const

const OVERAGE_MULTIPLIERS: Readonly<Record<string, number>> = {
  ALLOW_1_25X_OVERAGE: 1.25,
  ALLOW_1_5X_OVERAGE: 1.5,
  ALLOW_2X_OVERAGE: 2,
}

const LEASING_SCOPES: Readonly<Record<string, string>> = {
  PER_MACHINE: "machine",
  PER_LICENSE: "license",
  PER_USER: "user",
}

const LAZARUS_TTL_SECONDS: Readonly<Record<string, number>> = {
  "1_MINUTE_REVIVE": 60,
  "2_MINUTE_REVIVE": 120,
  "5_MINUTE_REVIVE": 300,
  "10_MINUTE_REVIVE": 600,
  "15_MINUTE_REVIVE": 900,
}

interface Heartbeat {
  lastHeartbeat: string | null
  nextHeartbeat: string | null
  interval: number
  status: string
}

interface ListFilters {
  machine: string | null
  license: string | null
  product: string | null
  owner: string | null
  user: string | null
  status: string | null
}

const processes = () => mockStore.table(TYPE)

function heartbeatInterval(policy: MockRow | undefined): number {
  const duration = policy?.attributes.heartbeatDuration
  return typeof duration === "number" ? duration : DEFAULT_HEARTBEAT_DURATION
}

function heartbeatOf(row: MockRow, policy: MockRow | undefined): Heartbeat {
  const interval = heartbeatInterval(policy)
  const lastHeartbeat = stringOrNull(row.attributes.lastHeartbeat)
  const nextHeartbeat =
    lastHeartbeat == null ? null : shift(lastHeartbeat, interval * SECOND)
  const deadline = millis(nextHeartbeat)
  const alive = deadline != null && deadline >= Date.now()

  return {
    lastHeartbeat,
    nextHeartbeat,
    interval,
    status: alive ? ProcessStatus.Alive : ProcessStatus.Dead,
  }
}

export function serializeMockProcess(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  const self = resourcePath(ctx, TYPE, row.id)
  const { machine, policy } = lineageOf(row)
  const heartbeat = heartbeatOf(row, policy)

  return resource(
    ctx,
    row,
    {
      lastHeartbeat: heartbeat.lastHeartbeat,
      nextHeartbeat: heartbeat.nextHeartbeat,
      interval: heartbeat.interval,
      status: heartbeat.status,
      pid: row.attributes.pid,
      created: row.created,
      updated: row.updated,
      metadata: row.attributes.metadata ?? {},
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
      product: toOne(ctx, policy?.refs.product, `${self}/product`),
      license: toOne(ctx, machine?.refs.license, `${self}/license`),
      machine: toOne(ctx, row.refs.machine, `${self}/machine`),
    },
  )
}

registerMockSerializer(TYPE, serializeMockProcess)

registerMockDestroyer(TYPE, (ctx, row) => {
  processes().delete(row.id)
  emitMockEvent(ctx, "process.deleted", { resource: row })
})

function readPid(value: unknown): string {
  const pointer = "/data/attributes/pid"

  if (value === undefined) fail(badRequest("is missing", { pointer }))
  if (typeof value !== "string") {
    fail(
      badRequest(
        `type mismatch (received ${receivedType(value)} expected string)`,
        { pointer },
      ),
    )
  }

  return value
}

function validatePid(machine: MockRow, pid: string): void {
  if (pid.trim() === "") rejectAttribute("pid", "MISSING", "can't be blank")

  const taken = processes().find(
    (row) => row.refs.machine?.id === machine.id && row.attributes.pid === pid,
  )
  if (taken) rejectAttribute("pid", "TAKEN", "has already been taken")
  if (RESERVED_PIDS.includes(pid.toLowerCase())) {
    rejectAttribute("pid", "NOT_ALLOWED", "is reserved")
  }
  if (pid.length > MAX_PID_LENGTH) {
    rejectAttribute(
      "pid",
      "TOO_LONG",
      `is too long (maximum is ${MAX_PID_LENGTH} characters)`,
    )
  }
}

function effectiveMaxProcesses(
  license: MockRow | undefined,
  policy: MockRow | undefined,
): number | null {
  const override = license?.attributes.maxProcesses
  if (typeof override === "number") return override

  const inherited = policy?.attributes.maxProcesses
  return typeof inherited === "number" ? inherited : null
}

function sharesLease(
  strategy: string,
  machine: MockRow,
  sibling: MockRow | undefined,
): boolean {
  if (!sibling) return false
  if (strategy === DEFAULT_LEASING_STRATEGY) return sibling.id === machine.id

  const licenseId = machine.refs.license?.id
  if (licenseId == null || sibling.refs.license?.id !== licenseId) return false
  if (strategy !== "PER_USER") return true

  return (sibling.refs.owner?.id ?? null) === (machine.refs.owner?.id ?? null)
}

function validateProcessLimit(machine: MockRow): void {
  const license = licenseOf(machine)
  const policy = policyOf(license)
  const overage = policy?.attributes.overageStrategy
  if (overage === ALWAYS_ALLOW_OVERAGE) return

  const max = effectiveMaxProcesses(license, policy)
  if (max == null) return

  const leasing = policy?.attributes.processLeasingStrategy
  const strategy =
    typeof leasing === "string" ? leasing : DEFAULT_LEASING_STRATEGY
  const multiplier =
    typeof overage === "string" && overage in OVERAGE_MULTIPLIERS
      ? OVERAGE_MULTIPLIERS[overage]
      : 1
  const count = processes().where((row) =>
    sharesLease(strategy, machine, lineageOf(row).machine),
  ).length

  if (count + 1 > max * multiplier) {
    fail(
      unprocessable(
        baseError(
          "MACHINE_PROCESS_LIMIT_EXCEEDED",
          `process count has exceeded maximum allowed for ${LEASING_SCOPES[strategy]} (${max})`,
        ),
      ),
    )
  }
}

function canResurrect(
  policy: MockRow | undefined,
  nextHeartbeat: string | null,
): boolean {
  const strategy = policy?.attributes.heartbeatResurrectionStrategy
  if (typeof strategy !== "string" || strategy === NO_REVIVE) return false
  if (strategy === ALWAYS_REVIVE) return true
  if (!(strategy in LAZARUS_TTL_SECONDS)) return false

  const deadline = millis(nextHeartbeat)
  return (
    deadline != null &&
    Date.now() <= deadline + LAZARUS_TTL_SECONDS[strategy] * SECOND
  )
}

function listFilters(ctx: MockContext): ListFilters {
  return {
    machine: ctx.query.get("machine"),
    license: ctx.query.get("license"),
    product: ctx.query.get("product"),
    owner: ctx.query.get("owner"),
    user: ctx.query.get("user"),
    status: ctx.query.get("status"),
  }
}

function matchesFilters(filters: ListFilters, row: MockRow): boolean {
  const { machine, license, policy } = lineageOf(row)

  if (filters.machine && row.refs.machine?.id !== filters.machine) return false
  if (filters.license && machine?.refs.license?.id !== filters.license) {
    return false
  }
  if (filters.product && policy?.refs.product?.id !== filters.product) {
    return false
  }
  if (filters.owner && machine?.refs.owner?.id !== filters.owner) return false
  if (filters.user && !licenseUserIds(license).includes(filters.user)) {
    return false
  }
  if (
    filters.status &&
    heartbeatOf(row, policy).status !== filters.status.toUpperCase()
  ) {
    return false
  }

  return true
}

mockRoute("GET", `${MOCK_ACCOUNT}/processes`, (ctx) => {
  const filters = listFilters(ctx)
  const rows = scoped(ctx, processes().all()).filter((row) =>
    matchesFilters(filters, row),
  )
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockProcess(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/processes/:id`, (ctx) => {
  const row = requireVisible(ctx, processes(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockProcess(ctx, row) } }
})

mockRoute("POST", `${MOCK_ACCOUNT}/processes`, (ctx) => {
  const attributes = readAttributes(ctx, CREATE_ATTRIBUTES)
  const pid = readPid(attributes.pid)
  const metadata = validateMetadata(attributes.metadata)
  const machine = requireMachine(ctx)
  validatePid(machine, pid)
  validateProcessLimit(machine)

  const now = nowIso()
  const row = makeMockRow(
    TYPE,
    uuid(),
    { pid, lastHeartbeat: now, metadata },
    {
      ...baseRefs(ctx),
      environment: machine.refs.environment ?? null,
      machine: { type: "machines", id: machine.id },
    },
    now,
  )
  processes().insert(row)
  ctx.resource = { type: TYPE, id: row.id }

  emitMockEvent(ctx, "process.created", { resource: row })

  return {
    status: 201,
    body: { data: serializeMockProcess(ctx, row) },
    headers: { Location: resourcePath(ctx, TYPE, row.id) },
  }
})

mockRoute("PATCH", `${MOCK_ACCOUNT}/processes/:id`, (ctx) => {
  const row = requireVisible(ctx, processes(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  rejectRelationships(ctx)
  const attributes = readAttributes(ctx, UPDATE_ATTRIBUTES)
  const changes: Record<string, unknown> = {}

  if ("metadata" in attributes) {
    changes.metadata = validateMetadata(attributes.metadata)
  }

  const before = { ...row.attributes }
  const changed = Object.entries(changes).some(
    ([key, value]) => JSON.stringify(before[key]) !== JSON.stringify(value),
  )
  processes().patch(row.id, { attributes: changes }, { touch: changed })

  emitMockEvent(ctx, "process.updated", {
    resource: row,
    metadata: diffMetadata(before, row.attributes),
  })

  return { status: 200, body: { data: serializeMockProcess(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/processes/:id`, (ctx) => {
  const row = requireVisible(ctx, processes(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

mockRoute("POST", `${MOCK_ACCOUNT}/processes/:id/actions/ping`, (ctx) => {
  const row = requireVisible(ctx, processes(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const { policy } = lineageOf(row)
  const heartbeat = heartbeatOf(row, policy)
  const dead = heartbeat.status === ProcessStatus.Dead

  if (dead && !canResurrect(policy, heartbeat.nextHeartbeat)) {
    fail(
      errors(422, {
        title: "Unprocessable entity",
        detail: "is dead",
        code: "PROCESS_HEARTBEAT_DEAD",
      }),
    )
  }

  processes().patch(row.id, { attributes: { lastHeartbeat: nowIso() } })
  const data = serializeMockProcess(ctx, row)

  if (dead) {
    emitMockEvent(ctx, "process.heartbeat.resurrected", { resource: row })
    return {
      status: 200,
      body: {
        data: {
          ...data,
          attributes: { ...data.attributes, status: ProcessStatus.Resurrected },
        },
      },
    }
  }

  emitMockEvent(ctx, "process.heartbeat.ping", { resource: row })

  return { status: 200, body: { data } }
})

mockRoute("GET", `${MOCK_ACCOUNT}/processes/:id/machine`, (ctx) => {
  const row = requireVisible(ctx, processes(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return relatedResponse(ctx, row.refs.machine, "machine")
})

mockRoute("GET", `${MOCK_ACCOUNT}/processes/:id/license`, (ctx) => {
  const row = requireVisible(ctx, processes(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return relatedResponse(ctx, lineageOf(row).machine?.refs.license, "license")
})

mockRoute("GET", `${MOCK_ACCOUNT}/processes/:id/product`, (ctx) => {
  const row = requireVisible(ctx, processes(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return relatedResponse(ctx, lineageOf(row).policy?.refs.product, "product")
})

mockRoute("GET", `${MOCK_ACCOUNT}/machines/:machineId/processes`, (ctx) => {
  const machine = findMachine(ctx, ctx.params.machineId)
  ctx.resource = { type: "machines", id: machine.id }

  const filters = listFilters(ctx)
  const rows = scoped(ctx, processes().all()).filter(
    (row) =>
      row.refs.machine?.id === machine.id && matchesFilters(filters, row),
  )
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockProcess(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/machines/:machineId/processes/:id`, (ctx) => {
  const machine = findMachine(ctx, ctx.params.machineId)
  const row = requireVisible(ctx, processes(), ctx.params.id, LABEL)
  if (row.refs.machine?.id !== machine.id) fail(notFound(LABEL, row.id))
  ctx.resource = { type: TYPE, id: row.id }

  return { status: 200, body: { data: serializeMockProcess(ctx, row) } }
})
