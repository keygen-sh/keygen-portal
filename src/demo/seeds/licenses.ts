import type { Linkage, MockRow } from "@/demo/server/types"
import { randomLicenseKey } from "@/demo/server/ids"
import { rowLinkage, text } from "@/demo/server"
import { CheckInIntervalMillis, DAY, HOUR, MINUTE } from "@/demo/server/time"
import type { EnvironmentKey, SeedContext } from "./context"
import {
  MOCK_CUSTOMER_DOMAINS,
  MOCK_ENVIRONMENTS,
  MOCK_GROUPS,
  MOCK_HERO_LICENSE,
  MOCK_ORGANIZATIONS,
  MOCK_POLICIES,
} from "./universe"

type StatusProfile =
  | "active"
  | "expiring"
  | "expired"
  | "suspended"
  | "banned"
  | "inactive"

const PROFILE_COUNTS: readonly (readonly [StatusProfile, number])[] = [
  ["active", 52],
  ["expiring", 9],
  ["expired", 12],
  ["suspended", 6],
  ["banned", 4],
  ["inactive", 6],
]

const LIMIT_ATTRIBUTES = [
  "maxMachines",
  "maxProcesses",
  "maxUsers",
  "maxCores",
  "maxMemory",
  "maxDisk",
  "maxUses",
] as const

type LimitAttribute = (typeof LIMIT_ATTRIBUTES)[number]
type Overrides = Record<LimitAttribute, number | null>

const GIB = 1024 ** 3
const TIB = 1024 ** 4
const OVERRIDE_VALUES: Readonly<Record<LimitAttribute, number>> = {
  maxMachines: 10,
  maxProcesses: 16,
  maxUsers: 25,
  maxCores: 64,
  maxMemory: 64 * GIB,
  maxDisk: 2 * TIB,
  maxUses: 500,
}

const HERO_POLICY_IDS = new Set<string>(
  Object.values(MOCK_POLICIES).map((policy) => policy.id),
)
const HERO_POLICY_WEIGHT = 3
const ACTIVITY_WINDOW = 90 * DAY
const DEFAULT_CHECK_IN_INTERVAL = 30 * DAY
const NEAR_EXPIRY_DAYS = 30
const MID_EXPIRY_DAYS = 120
const MAX_EXPIRY_DAYS = 365
const OWNER_RATE = 0.72
const GROUP_RATE = 0.3
const OVERRIDE_RATE = 0.25
const NULL_NAME_RATE = 0.12
const VERSION_RATE = 0.3
const PERPETUAL_RATE = 0.18
const POLICY_PROTECTED_RATE = 0.8
const RECENT_ACTIVE_COUNT = 6
const SAME_DAY_COUNT = 18
const SAME_DAY_OFFSETS = [6, 13, 21, 45, 74, 132]
const OVERDUE_CHECK_IN_COUNT = 7
const MAX_LICENSEES = 3
const ENVIRONMENT_LICENSE_COUNTS: Readonly<Record<EnvironmentKey, number>> = {
  production: 8,
  sandbox: 6,
}
const HERO_DIRECT_ENTITLEMENTS = 2
const PAGED_DIRECT_ENTITLEMENTS = 10
const LICENSEE_INDEXES = new Set([1, 8, 15, 22, 29, 36, 44, 51, 58, 65, 73, 82])
const DIRECT_ENTITLEMENT_INDEXES = new Set([3, 18, 27, 39, 52, 71])
const PAGED_ENTITLEMENT_INDEX = 12
const NARROW_PERMISSIONS_INDEXES = new Set([5, 28, 57])
const SIGNED_KEY_INDEXES = new Set([9, 37, 64])
const EMPTY_PERMISSIONS_INDEXES = new Set([11, 46])
const HUMAN_KEYS: Readonly<Record<number, string>> = {
  2: "ACME-SITE-2026",
  6: "CONTOSO-OPS-0117",
  10: "NORTHWIND-FLEET-04",
  19: "FABRIKAM-LAB-0042",
  33: "WOODGROVE-EDGE-7781",
}

const NARROW_PERMISSIONS = [
  "license.read",
  "license.validate",
  "machine.create",
  "machine.delete",
  "machine.heartbeat.ping",
  "machine.read",
]

const TIERS = [
  "Enterprise License",
  "Pro Subscription",
  "Team Plan",
  "Site License",
  "Platform License",
  "Standard Subscription",
]
const VERSIONS = ["6.2.0", "6.1.4", "6.0.2"]

interface State {
  seed: SeedContext
  account: Linkage
  policies: MockRow[]
  customers: MockRow[]
  groups: MockRow[]
  entitlements: MockRow[]
  policyEntitlements: Map<string, Set<string>>
  usedKeys: Set<string>
  recentRemaining: number
  sameDayRemaining: number
  overdueRemaining: number
  environmentRemaining: Record<EnvironmentKey, number>
}

interface Activity {
  lastValidated: string | null
  lastCheckOut: string | null
  lastCheckIn: string | null
}

function count(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function isoAt(millis: number): string {
  return new Date(millis).toISOString()
}

function environmentIdOf(row: MockRow): string | null {
  return row.refs.environment?.id ?? null
}

function compatible(row: MockRow, environment: string | null): boolean {
  const rowEnvironment = environmentIdOf(row)
  return rowEnvironment == null || rowEnvironment === environment
}

function policyEntitlementMap(joins: MockRow[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const join of joins) {
    const policyId = join.refs.policy?.id
    const entitlementId = join.refs.entitlement?.id
    if (!policyId || !entitlementId) continue
    const ids = map.get(policyId) ?? new Set<string>()
    ids.add(entitlementId)
    map.set(policyId, ids)
  }
  return map
}

function inheritedEntitlementIds(state: State, policy: MockRow): Set<string> {
  return state.policyEntitlements.get(policy.id) ?? new Set<string>()
}

function claimKey(state: State, key: string): string {
  state.usedKeys.add(key)
  return key
}

function uniqueKey(state: State): string {
  const random = (): number => state.seed.rng.next()
  let key = randomLicenseKey(random)
  while (state.usedKeys.has(key)) key = randomLicenseKey(random)
  return claimKey(state, key)
}

function signedKey(state: State): string {
  const { rng } = state.seed
  return claimKey(state, `key/${rng.hex(200)}.${rng.hex(86)}`)
}

function keyFor(state: State, index: number): string {
  if (index in HUMAN_KEYS) return claimKey(state, HUMAN_KEYS[index])
  if (SIGNED_KEY_INDEXES.has(index)) return signedKey(state)
  return uniqueKey(state)
}

function policyWeight(policy: MockRow): number {
  return HERO_POLICY_IDS.has(policy.id) ? HERO_POLICY_WEIGHT : 1
}

function weightedPolicy(state: State, candidates: MockRow[]): MockRow {
  return state.seed.rng.weighted(
    candidates.map((policy) => [policy, policyWeight(policy)] as const),
  )
}

function policiesFor(state: State, profile: StatusProfile): MockRow[] {
  if (profile !== "expiring" && profile !== "expired") return state.policies
  const timed = state.policies.filter(
    (policy) => count(policy.attributes.duration) != null,
  )
  return timed.length > 0 ? timed : state.policies
}

function pickCustomer(
  state: State,
  environment: string | null,
  banned: boolean,
): MockRow | null {
  const pool = state.customers.filter(
    (user) =>
      compatible(user, environment) &&
      (user.attributes.bannedAt != null) === banned,
  )
  return pool.length > 0 ? state.seed.rng.pick(pool) : null
}

function pendingEnvironment(state: State): EnvironmentKey | null {
  const keys = (
    Object.keys(state.environmentRemaining) as EnvironmentKey[]
  ).filter((key) => state.environmentRemaining[key] > 0)
  return keys.length > 0 ? state.seed.rng.pick(keys) : null
}

function chooseOwnerAndPolicy(
  state: State,
  profile: StatusProfile,
  index: number,
): { policy: MockRow; owner: MockRow | null; profile: StatusProfile } {
  const { rng } = state.seed

  if (profile === "banned") {
    const bannedUsers = state.customers.filter(
      (user) => user.attributes.bannedAt != null,
    )
    if (bannedUsers.length > 0) {
      const owner = rng.pick(bannedUsers)
      const candidates = state.policies.filter((policy) =>
        compatible(owner, environmentIdOf(policy)),
      )
      if (candidates.length > 0) {
        return { policy: weightedPolicy(state, candidates), owner, profile }
      }
    }
    return chooseOwnerAndPolicy(state, "suspended", index)
  }

  let candidates = policiesFor(state, profile)
  if (index === 0) {
    const globalPolicies = candidates.filter(
      (policy) => environmentIdOf(policy) == null,
    )
    if (globalPolicies.length > 0) candidates = globalPolicies
  } else if (SIGNED_KEY_INDEXES.has(index)) {
    const schemePolicies = candidates.filter(
      (policy) => text(policy.attributes.scheme) != null,
    )
    if (schemePolicies.length > 0) candidates = schemePolicies
  } else {
    const key = pendingEnvironment(state)
    const scopedPolicies = key
      ? candidates.filter(
          (policy) => environmentIdOf(policy) === MOCK_ENVIRONMENTS[key].id,
        )
      : []
    if (key && scopedPolicies.length > 0) {
      state.environmentRemaining[key] -= 1
      candidates = scopedPolicies
    }
  }

  const policy = weightedPolicy(state, candidates)
  const owner = rng.chance(OWNER_RATE)
    ? pickCustomer(state, environmentIdOf(policy), false)
    : null

  return { policy, owner, profile }
}

function groupFor(
  state: State,
  environment: string | null,
  owner: MockRow | null,
): MockRow | null {
  const { rng } = state.seed
  const inheritedId = owner?.refs.group?.id
  const inherited = inheritedId
    ? (state.groups.find((group) => group.id === inheritedId) ?? null)
    : null

  if (rng.chance(GROUP_RATE)) {
    const pool = state.groups.filter((group) => compatible(group, environment))
    if (pool.length > 0) return rng.pick(pool)
  }

  return inherited && compatible(inherited, environment) ? inherited : null
}

function createdFor(state: State, profile: StatusProfile): string {
  const { seed } = state
  if (profile === "inactive") return seed.daysAgo(seed.rng.int(120, 540), 1)
  if (profile === "active" && state.recentRemaining > 0) {
    state.recentRemaining -= 1
    return seed.hoursAgo(seed.rng.int(1, 22), 1)
  }
  if (profile === "active") return seed.daysAgo(seed.rng.int(1, 540), 1)
  return seed.daysAgo(seed.rng.int(30, 500), 1)
}

function sameDayExpiry(state: State): string {
  const { seed } = state
  const offset =
    SAME_DAY_OFFSETS[state.sameDayRemaining % SAME_DAY_OFFSETS.length]
  const dayStart = Math.floor((seed.now + offset * DAY) / DAY) * DAY
  return isoAt(
    dayStart + seed.rng.int(0, 23) * HOUR + seed.rng.int(0, 59) * MINUTE,
  )
}

function futureExpiry(state: State): string {
  const { seed } = state
  if (state.sameDayRemaining > 0) {
    state.sameDayRemaining -= 1
    return sameDayExpiry(state)
  }

  const bucket = seed.rng.weighted([
    ["near", 3],
    ["quarter", 4],
    ["year", 4],
  ] as const)

  switch (bucket) {
    case "near":
      return seed.daysFromNow(seed.rng.int(4, NEAR_EXPIRY_DAYS), 1)
    case "quarter":
      return seed.daysFromNow(
        seed.rng.int(NEAR_EXPIRY_DAYS + 1, MID_EXPIRY_DAYS),
        1,
      )
    default:
      return seed.daysFromNow(
        seed.rng.int(MID_EXPIRY_DAYS + 1, MAX_EXPIRY_DAYS),
        1,
      )
  }
}

function expiredExpiry(state: State): string {
  const { seed } = state
  const bucket = seed.rng.weighted([
    ["hours", 2],
    ["week", 3],
    ["month", 3],
    ["year", 2],
  ] as const)

  switch (bucket) {
    case "hours":
      return seed.hoursAgo(seed.rng.int(1, 6), 1)
    case "week":
      return seed.daysAgo(seed.rng.int(1, 6), 1)
    case "month":
      return seed.daysAgo(seed.rng.int(8, 29), 1)
    default:
      return seed.daysAgo(seed.rng.int(31, 360), 1)
  }
}

function expiryFor(
  state: State,
  profile: StatusProfile,
  policy: MockRow,
): string | null {
  const { seed } = state
  const perpetual = count(policy.attributes.duration) == null

  switch (profile) {
    case "expiring":
      return isoAt(seed.now + seed.rng.float(1, 71) * HOUR)
    case "expired":
      return expiredExpiry(state)
    case "inactive":
      return null
    case "suspended":
    case "banned": {
      const roll = seed.rng.next()
      if (roll < 0.3) return null
      if (roll < 0.5) return expiredExpiry(state)
      return seed.daysFromNow(seed.rng.int(4, MAX_EXPIRY_DAYS), 1)
    }
    default:
      if (perpetual) {
        return seed.rng.chance(0.7) ? null : futureExpiry(state)
      }
      return seed.rng.chance(PERPETUAL_RATE) ? null : futureExpiry(state)
  }
}

function checkInIntervalMillis(policy: MockRow): number {
  const interval = text(policy.attributes.checkInInterval)
  const intervalCount = count(policy.attributes.checkInIntervalCount)
  if (!interval || !intervalCount || !(interval in CheckInIntervalMillis)) {
    return DEFAULT_CHECK_IN_INTERVAL
  }
  return intervalCount * CheckInIntervalMillis[interval]
}

function checkInFor(
  state: State,
  profile: StatusProfile,
  policy: MockRow,
  created: string,
): string | null {
  if (policy.attributes.requireCheckIn !== true) return null

  const { seed } = state
  const interval = checkInIntervalMillis(policy)
  const createdAt = Date.parse(created)

  if (profile === "inactive") {
    return seed.between(created, seed.daysAgo(100))
  }
  if (
    profile === "active" &&
    state.overdueRemaining > 0 &&
    createdAt < seed.now - interval - 6 * DAY
  ) {
    state.overdueRemaining -= 1
    return isoAt(seed.now - interval - seed.rng.float(1, 5) * DAY)
  }

  return isoAt(
    Math.max(createdAt, seed.now - seed.rng.float(0.05, 0.8) * interval),
  )
}

function activityFor(
  state: State,
  profile: StatusProfile,
  policy: MockRow,
  created: string,
): Activity {
  const { seed } = state
  const createdRecently = Date.parse(created) >= seed.now - ACTIVITY_WINDOW

  let lastValidated: string | null = null
  if (profile === "inactive") {
    lastValidated = seed.rng.chance(0.5)
      ? seed.between(created, seed.daysAgo(100))
      : null
  } else if (profile === "active" || seed.rng.chance(0.7)) {
    const skip = profile === "active" && createdRecently && seed.rng.chance(0.3)
    if (!skip) {
      lastValidated = seed.rng.chance(0.3)
        ? seed.minutesAgo(seed.rng.int(2, 300), 5)
        : seed.daysAgo(seed.rng.int(0, 60), 1)
    }
  }

  const lastCheckOut =
    profile !== "inactive" && seed.rng.chance(0.3)
      ? seed.daysAgo(seed.rng.int(0, 45), 1)
      : null

  return {
    lastValidated,
    lastCheckOut,
    lastCheckIn: checkInFor(state, profile, policy, created),
  }
}

function emptyOverrides(): Overrides {
  return {
    maxMachines: null,
    maxProcesses: null,
    maxUsers: null,
    maxCores: null,
    maxMemory: null,
    maxDisk: null,
    maxUses: null,
  }
}

function overridesFor(state: State, policy: MockRow): Overrides {
  const { rng } = state.seed
  const overrides = emptyOverrides()
  if (!rng.chance(OVERRIDE_RATE)) return overrides

  const candidates = LIMIT_ATTRIBUTES.filter(
    (attribute) =>
      attribute !== "maxMachines" || policy.attributes.floating === true,
  )
  for (const attribute of rng.sample(candidates, rng.int(1, 2))) {
    const policyValue = count(policy.attributes[attribute])
    overrides[attribute] =
      policyValue != null && rng.chance(0.3)
        ? policyValue
        : OVERRIDE_VALUES[attribute]
  }

  return overrides
}

function usesFor(
  state: State,
  policy: MockRow,
  maxUsesOverride: number | null,
) {
  const { rng } = state.seed
  const maxUses = maxUsesOverride ?? count(policy.attributes.maxUses)
  if (maxUses != null) return rng.int(0, maxUses)
  return rng.chance(0.2) ? rng.int(1, 40) : 0
}

function permissionsFor(index: number): string[] {
  if (EMPTY_PERMISSIONS_INDEXES.has(index)) return []
  if (NARROW_PERMISSIONS_INDEXES.has(index)) return [...NARROW_PERMISSIONS]
  return ["*"]
}

function ownerLabel(owner: MockRow): string {
  const firstName = text(owner.attributes.firstName)
  const lastName = text(owner.attributes.lastName)
  if (firstName && lastName) return `${firstName} ${lastName}`
  return text(owner.attributes.email) ?? "Customer"
}

function nameFor(
  state: State,
  owner: MockRow | null,
  policy: MockRow,
): string | null {
  const { rng } = state.seed
  if (rng.chance(NULL_NAME_RATE)) return null

  const kinds: (readonly [string, number])[] = [
    ["org", 5],
    ["trial", 2],
  ]
  if (owner) kinds.push(["owner", 3])

  switch (rng.weighted(kinds)) {
    case "owner":
      return owner
        ? `${ownerLabel(owner)}: ${text(policy.attributes.name) ?? "License"}`
        : null
    case "trial":
      return `Trial: ${rng.pick(MOCK_CUSTOMER_DOMAINS)}`
    default:
      return `${rng.pick(MOCK_ORGANIZATIONS)}: ${rng.pick(TIERS)}`
  }
}

function metadataFor(state: State): Record<string, unknown> {
  const { seed } = state
  const { rng } = seed
  const kind = rng.weighted([
    ["empty", 4],
    ["customer", 2],
    ["trial", 1],
    ["billing", 1],
    ["small", 1],
    ["rich", 1],
  ] as const)

  switch (kind) {
    case "empty":
      return {}
    case "customer":
      return {
        customerId: `cus_${rng.hex(10)}`,
        seats: rng.pick([5, 10, 25, 50, 100]),
        tier: rng.pick(["starter", "pro", "enterprise"]),
      }
    case "trial":
      return { trial: true, source: rng.pick(["website", "sales", "partner"]) }
    case "billing":
      return {
        billing: {
          plan: rng.pick(["pro", "enterprise"]),
          interval: rng.pick(["month", "year"]),
        },
        deployment: rng.pick(["cloud", "on-prem", "field"]),
      }
    case "small":
      return seed.metadataFor("small")
    default:
      return seed.metadataFor("rich")
  }
}

function protectedFor(state: State, policy: MockRow): boolean {
  const policyProtected = policy.attributes.protected === true
  return state.seed.rng.chance(POLICY_PROTECTED_RATE)
    ? policyProtected
    : !policyProtected
}

function attachLicensees(
  state: State,
  license: MockRow,
  owner: MockRow | null,
) {
  const { seed } = state
  const environment = environmentIdOf(license)
  const pool = state.customers.filter(
    (user) =>
      user.id !== owner?.id &&
      user.attributes.bannedAt == null &&
      compatible(user, environment),
  )
  for (const user of seed.rng.sample(pool, seed.rng.int(1, MAX_LICENSEES))) {
    const created = seed.between(license.created, isoAt(seed.now))
    seed.insert(
      "license-users",
      {},
      {
        account: state.account,
        environment: license.refs.environment ?? null,
        license: rowLinkage(license),
        user: rowLinkage(user),
      },
      { created },
    )
  }
}

function attachEntitlements(
  state: State,
  license: MockRow,
  policy: MockRow,
  total: number,
): void {
  if (total <= 0) return

  const { seed } = state
  const inherited = inheritedEntitlementIds(state, policy)
  const environment = environmentIdOf(license)
  const pool = state.entitlements.filter(
    (entitlement) =>
      !inherited.has(entitlement.id) && compatible(entitlement, environment),
  )
  for (const entitlement of seed.rng.sample(pool, total)) {
    const created = seed.between(license.created, isoAt(seed.now))
    seed.insert(
      "license-entitlements",
      {},
      {
        account: state.account,
        environment: license.refs.environment ?? null,
        license: rowLinkage(license),
        entitlement: rowLinkage(entitlement),
      },
      { created },
    )
  }
}

function seedHero(state: State): void {
  const { seed } = state
  const policy =
    state.policies.find(
      (row) => row.id === MOCK_POLICIES.branchWorkstation.id,
    ) ?? state.policies[0]
  const environment = environmentIdOf(policy)
  const namedCustomers = state.customers.filter(
    (user) =>
      user.attributes.bannedAt == null &&
      text(user.attributes.firstName) != null &&
      text(user.attributes.lastName) != null &&
      compatible(user, environment),
  )
  const owner =
    namedCustomers.length > 0
      ? seed.rng.pick(namedCustomers)
      : pickCustomer(state, environment, false)
  const enterprise = state.groups.find(
    (group) => group.id === MOCK_GROUPS.enterprise.id,
  )
  const group =
    enterprise && compatible(enterprise, environment) ? enterprise : null
  const created = seed.daysAgo(280, 2)
  const maxUses = count(policy.attributes.maxUses)

  const license = seed.insert(
    "licenses",
    {
      name: MOCK_HERO_LICENSE.name,
      key: claimKey(state, MOCK_HERO_LICENSE.key),
      expiry: seed.daysFromNow(210, 1),
      uses: maxUses == null ? 12 : Math.min(12, maxUses),
      suspended: false,
      protected: policy.attributes.protected !== false,
      version: VERSIONS[0],
      ...emptyOverrides(),
      maxCores: 48,
      permissions: ["*"],
      lastValidated: seed.minutesAgo(35, 20),
      lastCheckOut: seed.daysAgo(9, 1),
      lastCheckIn:
        policy.attributes.requireCheckIn === true ? seed.daysAgo(2, 1) : null,
      metadata: {
        customerId: "cus_117acme",
        tier: "enterprise",
        seats: 25,
        deployment: "field",
        site: "Headquarters",
      },
    },
    {
      account: state.account,
      environment: policy.refs.environment ?? null,
      policy: rowLinkage(policy),
      owner: owner ? rowLinkage(owner) : null,
      group: group ? rowLinkage(group) : null,
    },
    { id: MOCK_HERO_LICENSE.id, created, updated: seed.daysAgo(3, 1) },
  )

  attachEntitlements(state, license, policy, HERO_DIRECT_ENTITLEMENTS)
  attachLicensees(state, license, owner)
}

function seedLicense(state: State, profile: StatusProfile, index: number) {
  const { seed } = state
  const chosen = chooseOwnerAndPolicy(state, profile, index)
  const { policy, owner } = chosen
  const effectiveProfile = chosen.profile
  const environment = environmentIdOf(policy)
  const created = createdFor(state, effectiveProfile)
  const overrides = overridesFor(state, policy)
  const activity = activityFor(state, effectiveProfile, policy, created)
  const group = groupFor(state, environment, owner)

  const suspended = effectiveProfile === "suspended"

  const license = seed.insert(
    "licenses",
    {
      name: nameFor(state, owner, policy),
      key: keyFor(state, index),
      expiry: expiryFor(state, effectiveProfile, policy),
      uses: usesFor(state, policy, overrides.maxUses),
      suspended,
      protected: protectedFor(state, policy),
      version: seed.rng.chance(VERSION_RATE) ? seed.rng.pick(VERSIONS) : null,
      ...overrides,
      permissions: permissionsFor(index),
      ...activity,
      metadata: metadataFor(state),
    },
    {
      account: state.account,
      environment: policy.refs.environment ?? null,
      policy: rowLinkage(policy),
      owner: owner ? rowLinkage(owner) : null,
      group: group ? rowLinkage(group) : null,
    },
    {
      created,
      updated: seed.rng.chance(0.6) ? seed.later(created, 90) : created,
    },
  )

  if (LICENSEE_INDEXES.has(index)) attachLicensees(state, license, owner)
  if (index === PAGED_ENTITLEMENT_INDEX) {
    attachEntitlements(state, license, policy, PAGED_DIRECT_ENTITLEMENTS)
  } else if (DIRECT_ENTITLEMENT_INDEXES.has(index)) {
    attachEntitlements(state, license, policy, 1)
  }
}

export function seedMockLicenses(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const policies = seed.rows("policies")
  if (policies.length === 0) return

  const state: State = {
    seed,
    account: seed.accountRef(),
    policies,
    customers: seed
      .rows("users")
      .filter((user) => user.attributes.role === "user"),
    groups: seed.rows("groups"),
    entitlements: seed.rows("entitlements"),
    policyEntitlements: policyEntitlementMap(seed.rows("policy-entitlements")),
    usedKeys: new Set<string>(),
    recentRemaining: RECENT_ACTIVE_COUNT,
    sameDayRemaining: SAME_DAY_COUNT,
    overdueRemaining: OVERDUE_CHECK_IN_COUNT,
    environmentRemaining: { ...ENVIRONMENT_LICENSE_COUNTS },
  }

  seedHero(state)

  const profiles = seed.rng.shuffle(
    PROFILE_COUNTS.flatMap(([profile, total]) =>
      Array.from({ length: total }, () => profile),
    ),
  )
  profiles.forEach((profile, index) => seedLicense(state, profile, index))
}
