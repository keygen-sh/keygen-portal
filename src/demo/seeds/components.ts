import type { MockRow } from "@/demo/server/types"
import type { SeedContext } from "./context"
import { MOCK_HERO_LICENSE, MOCK_POLICIES } from "./universe"

const TARGET_MACHINES = 18
const SHARED_MACHINES = 3
const PRIORITY_MACHINES = 6
const RECENT_COMPONENTS = 5
const LONG_FINGERPRINT_LENGTH = 200
const SHARED_TPM_FINGERPRINT = "tpm-2.0"
const UNIQUE_PER_MACHINE = "UNIQUE_PER_MACHINE"

type Kind =
  | "Primary Disk"
  | "Motherboard"
  | "CPU"
  | "GPU"
  | "TPM"
  | "NIC"
  | "BIOS"

const PRIORITY_POLICY_IDS: readonly string[] = [
  MOCK_POLICIES.gatewayRelay.id,
  MOCK_POLICIES.tradingDesk.id,
]

const COMPONENT_PLAN: readonly (readonly Kind[])[] = [
  ["Primary Disk", "CPU", "BIOS", "TPM"],
  ["TPM", "Motherboard"],
  ["GPU", "NIC"],
  ["Primary Disk", "CPU", "Motherboard"],
  ["CPU", "NIC"],
  ["Primary Disk", "TPM"],
  ["Motherboard", "BIOS", "NIC"],
  ["GPU"],
  ["Primary Disk", "CPU"],
  ["NIC", "TPM"],
  ["CPU", "GPU", "Primary Disk"],
  ["BIOS"],
  ["Motherboard", "CPU"],
  ["Primary Disk", "NIC"],
  ["TPM"],
  ["CPU", "BIOS", "Primary Disk", "NIC"],
  ["GPU", "Motherboard"],
  ["CPU", "Primary Disk"],
]

const FINGERPRINTS: Readonly<Record<Kind, (seed: SeedContext) => string>> = {
  "Primary Disk": (seed) => `S4EVNX0R${seed.rng.hex(6).toUpperCase()}`,
  Motherboard: (seed) =>
    `MB-${seed.rng.int(1000, 9999)}-${seed.rng.pick(["A", "B", "C", "D"])}`,
  CPU: (seed) => seed.rng.hex(32),
  GPU: (seed) =>
    [
      seed.rng.hex(8),
      seed.rng.hex(4),
      seed.rng.hex(4),
      seed.rng.hex(4),
      seed.rng.hex(12),
    ]
      .join("-")
      .toUpperCase(),
  TPM: (seed) => `tpm-${seed.rng.hex(16)}`,
  NIC: (seed) =>
    `3c:22:fb:${seed.rng.hex(2)}:${seed.rng.hex(2)}:${seed.rng.hex(2)}`,
  BIOS: (seed) => seed.rng.hex(LONG_FINGERPRINT_LENGTH),
}

const METADATA: Readonly<
  Record<
    Kind,
    (seed: SeedContext, fingerprint: string) => Record<string, unknown>
  >
> = {
  "Primary Disk": (seed, fingerprint) => ({
    serial: fingerprint,
    capacityGb: seed.rng.pick([512, 1024, 2048]),
    smart: { powerOnHours: seed.rng.int(100, 20_000), health: "ok" },
  }),
  Motherboard: (seed, fingerprint) => ({
    serial: fingerprint,
    slot: seed.rng.int(0, 4),
    oem: true,
  }),
  CPU: (seed) => ({
    model: seed.rng.pick(["Xeon w7-3465X", "Ryzen 9 7950X", "Apple M3 Max"]),
    cores: seed.rng.pick([8, 16, 32]),
  }),
  GPU: (seed) => ({
    vendor: seed.rng.pick(["NVIDIA", "AMD"]),
    vramGb: seed.rng.pick([8, 16, 24, 48]),
  }),
  TPM: (seed) => ({
    version: "2.0",
    vendor: seed.rng.pick(["Infineon", "STMicro", "Nuvoton"]),
  }),
  NIC: (seed) => ({
    speedGbps: seed.rng.pick([1, 10, 25]),
    driver: null,
  }),
  BIOS: (seed) => ({
    version: `F${seed.rng.int(10, 40)}`,
    tags: ["uefi", seed.rng.pick(["secure-boot", "legacy"])],
  }),
}

function latest(a: string, b: string): string {
  return a > b ? a : b
}

type PolicyResolver = (machine: MockRow) => MockRow | undefined

function policyResolver(seed: SeedContext): PolicyResolver {
  const licensesById = new Map(
    seed.rows("licenses").map((license) => [license.id, license]),
  )
  const policiesById = new Map(
    seed.rows("policies").map((policy) => [policy.id, policy]),
  )

  return (machine) => {
    const license = licensesById.get(machine.refs.license?.id ?? "")
    return policiesById.get(license?.refs.policy?.id ?? "")
  }
}

function uniquePerMachine(policyOf: PolicyResolver, machine: MockRow): boolean {
  const strategy = policyOf(machine)?.attributes.componentUniquenessStrategy
  return strategy == null || strategy === UNIQUE_PER_MACHINE
}

function chooseMachines(
  seed: SeedContext,
  policyOf: PolicyResolver,
): MockRow[] {
  const machines = seed.rows("machines")
  const hero = machines.filter(
    (machine) => machine.refs.license?.id === MOCK_HERO_LICENSE.id,
  )
  const ordered = [
    ...hero,
    ...seed.rng.shuffle(machines.filter((machine) => !hero.includes(machine))),
  ]
  const shareable = ordered.filter((machine) =>
    uniquePerMachine(policyOf, machine),
  )
  const priority = ordered.filter((machine) =>
    PRIORITY_POLICY_IDS.includes(policyOf(machine)?.id ?? ""),
  )
  const chosen = new Set([
    ...shareable.slice(0, SHARED_MACHINES),
    ...priority.slice(0, PRIORITY_MACHINES),
    ...ordered,
  ])

  return [...chosen].slice(0, TARGET_MACHINES)
}

export function seedMockComponents(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const account = seed.accountRef()
  const present = new Date(seed.now).toISOString()
  const policyOf = policyResolver(seed)
  const machines = chooseMachines(seed, policyOf)
  let recentRemaining = RECENT_COMPONENTS

  machines.forEach((machine, position) => {
    for (const kind of COMPONENT_PLAN[position] ?? []) {
      const fingerprint =
        kind === "TPM" && uniquePerMachine(policyOf, machine)
          ? SHARED_TPM_FINGERPRINT
          : FINGERPRINTS[kind](seed)

      const created =
        recentRemaining > 0
          ? latest(seed.hoursAgo(1, 6), machine.created)
          : seed.between(machine.created, present)
      if (recentRemaining > 0) recentRemaining -= 1

      seed.insert(
        "components",
        {
          fingerprint,
          name: kind,
          metadata: seed.rng.chance(0.4)
            ? METADATA[kind](seed, fingerprint)
            : {},
        },
        {
          account,
          environment: machine.refs.environment ?? null,
          machine: { type: "machines", id: machine.id },
        },
        {
          created,
          updated: seed.rng.chance(0.2) ? seed.later(created, 90) : created,
        },
      )
    }
  })
}
