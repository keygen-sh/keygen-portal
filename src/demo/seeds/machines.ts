import type { Linkage, MockRow } from "@/demo/server/types"
import { DAY, HOUR, SECOND, iso, millis } from "@/demo/server/time"
import type { SeedContext } from "./context"
import { MOCK_ENVIRONMENTS, MOCK_HERO_LICENSE } from "./universe"

const MACHINE_TARGET = 150
const HERO_MACHINE_COUNT = 5
const PRODUCTION_MACHINE_COUNT = 12
const DEFAULT_HEARTBEAT_DURATION = 600
const HEARTBEAT_DRIFT = 30 * SECOND
const GIB = 1024 ** 3
const GB = 1000 ** 3
const TB = 1000 ** 4
const DOTTED_FINGERPRINT = "ip-10-0-12-34.ec2.internal"
const DOTTED_FINGERPRINT_INDEX = 18
const FINGERPRINT_AGE_DAYS = 540
const RECENT_HOURS_INDEXES = new Set([20, 61, 104])
const RECENT_MINUTES_INDEXES = new Set([28, 83, 136])
const CHECK_OUT_INDEXES = new Set([17, 57, 112])
const CHECK_OUT_RATE = 0.2
const UNIQUE_PER_LICENSE = "UNIQUE_PER_LICENSE"
const KEEP_DEAD = "KEEP_DEAD"
const HEARTBEAT_FROM_CREATION = "FROM_CREATION"

const HERO_METADATA = {
  nodeId: "68666bf8b",
  rack: 4,
  gpu: true,
  tags: ["ci", "linux"],
  cost: 12.5,
  note: null,
}

type FingerprintKind = "hex" | "sha256" | "uuid" | "serial" | "mac"
type HeartbeatKind = "none" | "alive" | "dead"
type MetadataKind = "empty" | "node" | "rich"
type Weighted<T> = readonly (readonly [T, number])[]

interface HeartbeatSeed {
  lastHeartbeat: string | null
  lastDeathEventSentAt: string | null
}

interface Hardware {
  cores: number | null
  memory: number | null
  disk: number | null
}

interface ReusableFingerprint {
  fingerprint: string
  policyId: string
  reused: boolean
}

const MACHINE_COUNT_WEIGHTS: Weighted<number> = [
  [1, 20],
  [2, 34],
  [3, 26],
  [4, 14],
  [5, 6],
]

const FINGERPRINT_KIND_WEIGHTS: Weighted<FingerprintKind> = [
  ["hex", 34],
  ["sha256", 24],
  ["uuid", 18],
  ["serial", 14],
  ["mac", 10],
]

const METADATA_KIND_WEIGHTS: Weighted<MetadataKind> = [
  ["empty", 5],
  ["node", 3],
  ["rich", 2],
]

const HEARTBEAT_OVERRIDES: Readonly<Record<number, HeartbeatKind>> = {
  0: "alive",
  3: "dead",
  17: "alive",
  19: "dead",
  20: "none",
  45: "dead",
  71: "alive",
  98: "none",
  121: "dead",
}

const NAME_PREFIXES = [
  "Build Agent",
  "Teller Terminal",
  "Branch Workstation",
  "Gateway Relay",
  "Archive Node",
  "Field Terminal",
  "Settlement Worker",
  "Edge Collector",
  "Kiosk Terminal",
  "Ops Laptop",
  "Lab Bench",
  "Trading Desk",
  "Back Office Server",
  "Payment Terminal",
  "Warehouse Scanner",
  "Archive Node",
]

const NAME_LETTERS = ["A", "B", "C", "D", "E", "F"]

const HOST_STEMS = [
  "ci-runner",
  "archive",
  "edge",
  "relay",
  "archive",
  "teller",
  "kiosk",
  "settle",
  "node",
  "bench",
  "ops",
  "pos",
  "gw",
  "wks",
]

const HOST_DOMAINS = [
  "internal",
  "ec2.internal",
  "corp.internal",
  "prod.internal",
  "eu.internal",
  "dmz.internal",
  "lan",
  "local",
]

const SERIAL_PREFIXES = ["VM", "SRV", "WS", "NODE", "TRM"]

const PLATFORMS = [
  "linux-x86_64",
  "linux-aarch64",
  "linux-6.8.0-45-generic",
  "linux-5.15.0-118-generic",
  "linux-4.19.0-27-amd64",
  "darwin-arm64",
  "darwin-x86_64",
  "darwin-24.1.0",
  "darwin-23.6.0",
  "win32-x64",
  "win32-arm64",
  "windows-10.0.22631",
  "windows-10.0.19045",
  "freebsd-14.1-amd64",
]

const CORE_OPTIONS = [2, 4, 8, 12, 16, 24, 32, 64]
const MEMORY_OPTIONS = [4, 8, 16, 24, 32, 64, 128, 256].map((gib) => gib * GIB)
const DISK_OPTIONS = [128 * GB, 256 * GB, 512 * GB, TB, 2 * TB, 4 * TB]
const METADATA_TAGS = [
  "ci",
  "linux",
  "gpu",
  "edge",
  "lab",
  "pos",
  "branch",
  "kiosk",
  "staging",
  "fleet",
]
const METADATA_COSTS = [6.75, 12.5, 40, 87.25, 128]
const METADATA_REGIONS = [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "ap-southeast-2",
]

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" ? value : null
}

function effectiveLimit(
  license: MockRow,
  policy: MockRow,
  key: string,
): number | null {
  return (
    numberOrNull(license.attributes[key]) ??
    numberOrNull(policy.attributes[key])
  )
}

function licenseeIndex(joins: MockRow[]): Map<string, string[]> {
  const index = new Map<string, string[]>()
  for (const join of joins) {
    const licenseId = join.refs.license?.id
    const userId = join.refs.user?.id
    if (!licenseId || !userId) continue
    index.set(licenseId, [...(index.get(licenseId) ?? []), userId])
  }
  return index
}

function machineCountFor(
  seed: SeedContext,
  license: MockRow,
  policy: MockRow,
  fixed: number | null,
): number {
  const limit = effectiveLimit(license, policy, "maxMachines")
  const desired = fixed ?? seed.rng.weighted(MACHINE_COUNT_WEIGHTS)
  return limit == null ? desired : Math.min(desired, limit)
}

function machineHeadroom(
  license: MockRow,
  policies: Map<string, MockRow>,
): number {
  const policy = policies.get(license.refs.policy?.id ?? "")
  if (!policy) return 0
  return effectiveLimit(license, policy, "maxMachines") ?? MACHINE_TARGET
}

function productionPlan(
  licenses: MockRow[],
  total: number,
): Map<string, number> {
  const plan = new Map<string, number>()
  if (licenses.length === 0) return plan

  for (let index = 0; index < total; index++) {
    const license = licenses[index % licenses.length]
    plan.set(license.id, (plan.get(license.id) ?? 0) + 1)
  }
  return plan
}

function interleave(primary: MockRow[], secondary: MockRow[]): MockRow[] {
  const merged: MockRow[] = []
  const span = Math.max(primary.length, secondary.length)

  for (let index = 0; index < span; index++) {
    if (index < primary.length) merged.push(primary[index])
    if (index < secondary.length) merged.push(secondary[index])
  }
  return merged
}

function createdFor(
  seed: SeedContext,
  license: MockRow,
  index: number,
  present: string,
): string {
  const recent = RECENT_MINUTES_INDEXES.has(index)
    ? seed.minutesAgo(3, 40)
    : RECENT_HOURS_INDEXES.has(index)
      ? seed.hoursAgo(1, 4)
      : null
  if (recent != null && recent > license.created) return recent
  return seed.between(license.created, present)
}

function fingerprintFor(seed: SeedContext): string {
  const kind = seed.rng.weighted(FINGERPRINT_KIND_WEIGHTS)
  if (kind === "sha256") return `sha256:${seed.rng.hex(64)}`
  if (kind === "uuid") {
    const age = seed.rng.float(0, FINGERPRINT_AGE_DAYS) * DAY
    return seed.rng.uuid(seed.now - age)
  }
  if (kind === "serial") {
    return `${seed.rng.pick(SERIAL_PREFIXES)}-${seed.rng.hex(10).toUpperCase()}`
  }
  if (kind === "mac") {
    return `2c:54:91:${seed.rng.hex(2)}:${seed.rng.hex(2)}:${seed.rng.hex(2)}`
  }
  return seed.rng.hex(40)
}

function nameFor(seed: SeedContext): string | null {
  if (seed.rng.chance(0.3)) return null
  const prefix = seed.rng.pick(NAME_PREFIXES)
  const suffix = seed.rng.chance(0.2)
    ? seed.rng.pick(NAME_LETTERS)
    : String(seed.rng.int(1, 64)).padStart(2, "0")
  return `${prefix} ${suffix}`
}

function hostnameFor(seed: SeedContext, name: string | null): string | null {
  if (seed.rng.chance(0.15)) return null
  const stem = name
    ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : `${seed.rng.pick(HOST_STEMS)}-${String(seed.rng.int(1, 99)).padStart(2, "0")}`
  return `${stem}.${seed.rng.pick(HOST_DOMAINS)}`
}

function ipFor(seed: SeedContext): string | null {
  if (seed.rng.chance(0.15)) return null
  if (seed.rng.chance(0.15)) {
    return `2001:db8:${seed.rng.hex(4)}:${seed.rng.hex(4)}::${seed.rng.hex(4)}`
  }
  const host = seed.rng.int(1, 254)
  const subnet = seed.rng.int(0, 255)
  const block = seed.rng.int(0, 2)
  if (block === 0) return `10.${seed.rng.int(0, 255)}.${subnet}.${host}`
  if (block === 1) return `192.168.${subnet}.${host}`
  return `172.${seed.rng.int(16, 31)}.${subnet}.${host}`
}

function platformFor(seed: SeedContext): string | null {
  return seed.rng.chance(0.12) ? null : seed.rng.pick(PLATFORMS)
}

function pickWithin(
  seed: SeedContext,
  options: readonly number[],
  limit: number | null,
  count: number,
): number | null {
  const share = limit == null ? null : Math.floor(limit / count)
  const allowed =
    share == null ? options : options.filter((option) => option <= share)
  return allowed.length > 0 ? seed.rng.pick(allowed) : null
}

function hardwareFor(
  seed: SeedContext,
  license: MockRow,
  policy: MockRow,
  count: number,
): Hardware {
  return {
    cores: seed.rng.chance(0.25)
      ? null
      : pickWithin(
          seed,
          CORE_OPTIONS,
          effectiveLimit(license, policy, "maxCores"),
          count,
        ),
    memory: seed.rng.chance(0.25)
      ? null
      : pickWithin(
          seed,
          MEMORY_OPTIONS,
          effectiveLimit(license, policy, "maxMemory"),
          count,
        ),
    disk: seed.rng.chance(0.3)
      ? null
      : pickWithin(
          seed,
          DISK_OPTIONS,
          effectiveLimit(license, policy, "maxDisk"),
          count,
        ),
  }
}

function heartbeatFor(
  seed: SeedContext,
  policy: MockRow,
  created: string,
  forced: HeartbeatKind | null,
): HeartbeatSeed {
  const duration =
    (numberOrNull(policy.attributes.heartbeatDuration) ??
      DEFAULT_HEARTBEAT_DURATION) * SECOND
  const required = policy.attributes.requireHeartbeat === true
  const fromCreation =
    policy.attributes.heartbeatBasis === HEARTBEAT_FROM_CREATION
  const keepsDead = policy.attributes.heartbeatCullStrategy === KEEP_DEAD
  const createdMillis = millis(created) ?? seed.now
  const age = seed.now - createdMillis

  let kind =
    forced ??
    (required
      ? seed.rng.weighted<HeartbeatKind>([
          ["alive", 60],
          ["dead", keepsDead ? 30 : 12],
          ["none", fromCreation ? 0 : 10],
        ])
      : seed.rng.weighted<HeartbeatKind>([
          ["none", 70],
          ["alive", 16],
          ["dead", 14],
        ]))
  if (kind === "dead" && age < duration + 2 * HOUR) kind = "alive"

  if (kind === "none") {
    return { lastHeartbeat: null, lastDeathEventSentAt: null }
  }

  if (kind === "alive") {
    const last = seed.now - seed.rng.float(0.05, 0.8) * duration
    return {
      lastHeartbeat: iso(Math.max(last, createdMillis)),
      lastDeathEventSentAt: null,
    }
  }

  const last = seed.now - duration - seed.rng.float(1, 72) * HOUR
  return {
    lastHeartbeat: iso(last),
    lastDeathEventSentAt: iso(last + duration + HEARTBEAT_DRIFT),
  }
}

function ownerFor(
  seed: SeedContext,
  license: MockRow,
  licenseeIds: string[],
): Linkage | null {
  if (license.refs.owner && seed.rng.chance(0.65)) return license.refs.owner
  if (licenseeIds.length > 0 && seed.rng.chance(0.5)) {
    return { type: "users", id: seed.rng.pick(licenseeIds) }
  }
  return null
}

function metadataFor(seed: SeedContext): Record<string, unknown> {
  const kind = seed.rng.weighted(METADATA_KIND_WEIGHTS)
  if (kind === "empty") return {}

  const node = { nodeId: seed.rng.hex(9), rack: seed.rng.int(1, 12) }
  if (kind === "node") return node

  return {
    ...node,
    gpu: seed.rng.chance(0.4),
    tags: seed.rng.sample(METADATA_TAGS, 2),
    cost: seed.rng.pick(METADATA_COSTS),
    region: seed.rng.pick(METADATA_REGIONS),
    note: null,
  }
}

function updatedFor(
  seed: SeedContext,
  created: string,
  stamps: (string | null)[],
): string {
  const latest = stamps.reduce<string>(
    (max, stamp) => (stamp != null && stamp > max ? stamp : max),
    created,
  )
  return latest === created && seed.rng.chance(0.4)
    ? seed.later(created, 60)
    : latest
}

export function seedMockMachines(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const account = seed.accountRef()
  const present = iso(seed.now)
  const policies = new Map(
    seed.rows("policies").map((row): [string, MockRow] => [row.id, row]),
  )
  const users = new Map(
    seed.rows("users").map((row): [string, MockRow] => [row.id, row]),
  )
  const licensees = licenseeIndex(seed.rows("license-users"))
  const licenses = seed.rows("licenses")
  const hero = licenses.find((row) => row.id === MOCK_HERO_LICENSE.id)
  const production = licenses
    .filter(
      (row) =>
        row !== hero &&
        row.refs.environment?.id === MOCK_ENVIRONMENTS.production.id,
    )
    .slice(0, PRODUCTION_MACHINE_COUNT)
  const planned = productionPlan(production, PRODUCTION_MACHINE_COUNT)
  const others = seed.rng.shuffle(
    licenses.filter((row) => row !== hero && !production.includes(row)),
  )
  const roomy = others.filter((row) => machineHeadroom(row, policies) > 1)
  const tight = others.filter((row) => machineHeadroom(row, policies) <= 1)
  const selected = [
    ...(hero ? [hero] : []),
    ...production,
    ...interleave(roomy, tight),
  ]

  let machineIndex = 0
  let reusable: ReusableFingerprint | null = null

  for (const license of selected) {
    if (machineIndex >= MACHINE_TARGET) break

    const policy = policies.get(license.refs.policy?.id ?? "")
    if (!policy) continue

    const fixed =
      license === hero ? HERO_MACHINE_COUNT : (planned.get(license.id) ?? null)
    const count = Math.min(
      machineCountFor(seed, license, policy, fixed),
      MACHINE_TARGET - machineIndex,
    )
    const strategy = policy.attributes.machineUniquenessStrategy
    const perLicense = strategy == null || strategy === UNIQUE_PER_LICENSE

    for (let position = 0; position < count; position++) {
      let fingerprint =
        machineIndex === DOTTED_FINGERPRINT_INDEX
          ? DOTTED_FINGERPRINT
          : fingerprintFor(seed)
      if (position === 0 && perLicense) {
        if (reusable && !reusable.reused && reusable.policyId !== policy.id) {
          fingerprint = reusable.fingerprint
          reusable.reused = true
        } else if (!reusable) {
          reusable = { fingerprint, policyId: policy.id, reused: false }
        }
      }

      const created = createdFor(seed, license, machineIndex, present)
      const heartbeat = heartbeatFor(
        seed,
        policy,
        created,
        HEARTBEAT_OVERRIDES[machineIndex] ?? null,
      )
      const lastCheckOut =
        CHECK_OUT_INDEXES.has(machineIndex) || seed.rng.chance(CHECK_OUT_RATE)
          ? seed.between(created, present)
          : null
      const owner = ownerFor(seed, license, licensees.get(license.id) ?? [])
      const ownerRow = owner ? users.get(owner.id) : undefined
      const group = license.refs.group ?? ownerRow?.refs.group ?? null
      const name = nameFor(seed)

      seed.insert(
        "machines",
        {
          fingerprint,
          name,
          ip: ipFor(seed),
          hostname: hostnameFor(seed, name),
          platform: platformFor(seed),
          ...hardwareFor(seed, license, policy, count),
          lastHeartbeat: heartbeat.lastHeartbeat,
          lastCheckOut,
          lastDeathEventSentAt: heartbeat.lastDeathEventSentAt,
          metadata:
            license === hero && position === 0
              ? HERO_METADATA
              : metadataFor(seed),
        },
        {
          account,
          environment: license.refs.environment ?? null,
          license: { type: "licenses", id: license.id },
          owner,
          group,
        },
        {
          created,
          updated: updatedFor(seed, created, [
            heartbeat.lastHeartbeat,
            lastCheckOut,
          ]),
        },
      )

      machineIndex += 1
    }
  }
}
