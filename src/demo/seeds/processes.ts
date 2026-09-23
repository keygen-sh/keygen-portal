import type { MockRow } from "@/demo/server/types"
import { DAY, HOUR, SECOND } from "@/demo/server/time"
import type { SeedContext } from "./context"

const BUSY_MACHINE_PROCESSES = 20
const PROCESS_PLAN: readonly number[] = [
  BUSY_MACHINE_PROCESSES,
  3,
  2,
  2,
  2,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
]
const TARGET_MACHINES = PROCESS_PLAN.length
const DEAD_PROCESS_INDEXES = new Set([5, 21, 33])
const RICH_METADATA_INDEXES = new Set([2, 26])
const LONG_COMMAND_INDEXES = new Set([3, 30])
const DEFAULT_HEARTBEAT_DURATION = 600
const ALIVE_RATE = 0.7
const EDITED_RATE = 0.15
const EMPTY_METADATA_RATE = 0.4
const NAMED_PID_RATE = 0.25
const SHARED_PID = "1"
const LONG_PID =
  "com.ecorp.ecoin.telemetry.collector.background-service.instance-0001"
const ALWAYS_ALLOW_OVERAGE = "ALWAYS_ALLOW_OVERAGE"
const PER_MACHINE = "PER_MACHINE"

const NAMED_PIDS = [
  "nginx-worker-2",
  "settlement.exe",
  "com.ecorp.agent",
  "ecoin-telemetryd",
  "gateway-relay",
  "node-worker-3",
  "9f3c2a1e",
  "archive-indexer",
  "postgres",
  "redis-server",
  "batch-runner",
  "ledger-sync",
  "updater.exe",
  "watchdog",
] as const

const USERS = [
  "deploy",
  "root",
  "teller",
  "svc-ecoin",
  "SYSTEM",
  "svc-gateway",
  "ops",
  "nobody",
  "Administrator",
  "batch",
] as const

const COMMANDS = [
  "/opt/ecorp/bin/agent --serve",
  "ecoin-telemetryd --interval 60",
  "archive-worker --shard 0",
  "/usr/local/bin/gateway-relay --mesh",
  "fraud-analytics --batch",
  "/opt/ecorp/bin/archive-node --replica 2",
  "ledger-sync --since 24h",
  "C:\\Program Files\\ECorp\\settlement.exe /service",
  "/usr/bin/python3 -m reporting.export --daily",
  "watchdog --restart-on-failure",
] as const

const LONG_COMMAND =
  "/opt/ecorp/bin/settlement-worker --ledger /srv/ledgers/retail/branch-0142/settlement-v12.json --records 1200-2400 --chunk 4096 --compress zstd --output /mnt/archive/retail/branch-0142/batches --checkpoint-interval 300 --log-level debug"

interface Lineage {
  license: MockRow | undefined
  policy: MockRow | undefined
}

interface Sequence {
  index: number
}

type LineageResolver = (machine: MockRow) => Lineage

function lineageResolver(seed: SeedContext): LineageResolver {
  const licensesById = new Map(
    seed.rows("licenses").map((license) => [license.id, license]),
  )
  const policiesById = new Map(
    seed.rows("policies").map((policy) => [policy.id, policy]),
  )

  return (machine) => {
    const license = licensesById.get(machine.refs.license?.id ?? "")
    const policy = policiesById.get(license?.refs.policy?.id ?? "")
    return { license, policy }
  }
}

function heartbeatInterval(policy: MockRow | undefined): number {
  const duration = policy?.attributes.heartbeatDuration
  return typeof duration === "number" ? duration : DEFAULT_HEARTBEAT_DURATION
}

function usesHeartbeat(policy: MockRow | undefined): boolean {
  return (
    policy?.attributes.requireHeartbeat === true ||
    typeof policy?.attributes.heartbeatDuration === "number"
  )
}

function effectiveMaxProcesses(lineage: Lineage): number | null {
  const override = lineage.license?.attributes.maxProcesses
  if (typeof override === "number") return override

  const inherited = lineage.policy?.attributes.maxProcesses
  return typeof inherited === "number" ? inherited : null
}

function capacity(
  lineage: Lineage,
  licenseCounts: ReadonlyMap<string, number>,
): number {
  if (lineage.policy?.attributes.overageStrategy === ALWAYS_ALLOW_OVERAGE) {
    return Infinity
  }

  const max = effectiveMaxProcesses(lineage)
  if (max == null) return Infinity
  if (lineage.policy?.attributes.processLeasingStrategy === PER_MACHINE) {
    return max
  }

  return max - (licenseCounts.get(lineage.license?.id ?? "") ?? 0)
}

function chooseMachines(
  seed: SeedContext,
  lineageOf: LineageResolver,
): MockRow[] {
  const machines = seed.rows("machines")
  const withHeartbeat = seed.rng.shuffle(
    machines.filter((machine) => usesHeartbeat(lineageOf(machine).policy)),
  )
  const without = seed.rng.shuffle(
    machines.filter((machine) => !withHeartbeat.includes(machine)),
  )
  const ranked = [...withHeartbeat, ...without]
  const pool = [
    ...ranked.filter((machine) => machine.refs.environment == null),
    ...ranked.filter((machine) => machine.refs.environment != null),
  ]
  const canBeBusy = (machine: MockRow): boolean =>
    capacity(lineageOf(machine), new Map()) >= BUSY_MACHINE_PROCESSES
  const busy = pool.find(canBeBusy)
  const ordered = pool.filter((machine) => machine !== busy)

  return [...(busy ? [busy] : []), ...ordered].slice(0, TARGET_MACHINES)
}

function hostnameOf(seed: SeedContext, machine: MockRow): string {
  const hostname = machine.attributes.hostname
  return typeof hostname === "string" && hostname !== ""
    ? hostname
    : `node-${seed.rng.hex(4)}`
}

function nextPid(seed: SeedContext, used: Set<string>, index: number): string {
  if (index === 0 && !used.has(SHARED_PID)) {
    used.add(SHARED_PID)
    return SHARED_PID
  }

  let pid = ""
  do {
    pid = seed.rng.chance(NAMED_PID_RATE)
      ? seed.rng.pick(NAMED_PIDS)
      : String(seed.rng.int(1000, 65_535))
  } while (used.has(pid))

  used.add(pid)
  return pid
}

function metadataFor(
  seed: SeedContext,
  machine: MockRow,
  index: number,
): Record<string, unknown> {
  const hostName = hostnameOf(seed, machine)

  if (RICH_METADATA_INDEXES.has(index)) {
    return {
      hostName,
      cores: 8,
      load: 0.42,
      headless: true,
      session: null,
      args: ["--serve", "--port", "8080"],
      env: { region: "us-east-1" },
    }
  }
  if (LONG_COMMAND_INDEXES.has(index)) {
    return { hostName, user: "batch", command: LONG_COMMAND }
  }
  if (seed.rng.chance(EMPTY_METADATA_RATE)) return {}

  return {
    hostName,
    user: seed.rng.pick(USERS),
    command: seed.rng.pick(COMMANDS),
  }
}

function heartbeatOffset(
  seed: SeedContext,
  interval: number,
  index: number,
): number {
  if (index === 0) return 20 * SECOND
  if (index === 1) return interval * SECOND - 45 * SECOND
  if (!DEAD_PROCESS_INDEXES.has(index) && seed.rng.chance(ALIVE_RATE)) {
    return seed.rng.float(0, 0.8) * interval * SECOND
  }
  return seed.rng.float(HOUR, 30 * DAY)
}

function insertProcess(
  seed: SeedContext,
  machine: MockRow,
  lineage: Lineage,
  pid: string,
  sequence: Sequence,
): void {
  const index = sequence.index
  sequence.index += 1

  const interval = heartbeatInterval(lineage.policy)
  const floor = Date.parse(machine.created)
  const lastHeartbeatMillis = Math.min(
    seed.now,
    Math.max(seed.now - heartbeatOffset(seed, interval, index), floor),
  )
  const lastHeartbeat = new Date(lastHeartbeatMillis).toISOString()
  const created = seed.between(machine.created, lastHeartbeat)

  seed.insert(
    "processes",
    {
      pid,
      lastHeartbeat,
      metadata: metadataFor(seed, machine, index),
    },
    {
      account: seed.accountRef(),
      environment: machine.refs.environment ?? null,
      machine: { type: "machines", id: machine.id },
    },
    {
      created,
      updated: seed.rng.chance(EDITED_RATE)
        ? seed.later(lastHeartbeat, 2)
        : lastHeartbeat,
    },
  )
}

export function seedMockProcesses(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const lineageOf = lineageResolver(seed)
  const machines = chooseMachines(seed, lineageOf)
  if (machines.length === 0) return

  const licenseCounts = new Map<string, number>()
  const sequence: Sequence = { index: 0 }

  machines.forEach((machine, position) => {
    const lineage = lineageOf(machine)
    const desired = PROCESS_PLAN[position] ?? 1
    const count = Math.min(desired, capacity(lineage, licenseCounts))
    const used = new Set<string>()

    for (let index = 0; index < count; index++) {
      const pid =
        position === 2 && index === 0
          ? LONG_PID
          : nextPid(seed, used, position < 2 ? index : index + 1)
      used.add(pid)

      insertProcess(seed, machine, lineage, pid, sequence)

      const licenseId = lineage.license?.id
      if (licenseId != null) {
        licenseCounts.set(licenseId, (licenseCounts.get(licenseId) ?? 0) + 1)
      }
    }
  })
}
