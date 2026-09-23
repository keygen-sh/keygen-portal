import type { Rng } from "./prng"
import type { MockAttributes, Linkage, MockRow } from "@/demo/server/types"
import { makeMockRow, type MockStore } from "@/demo/server/store"
import { DAY, HOUR, MINUTE } from "@/demo/server/time"
import { MOCK_ACCOUNT, MOCK_ENVIRONMENTS } from "./universe"

export type SeedProfile = "established" | "fresh"

export type EnvironmentKey = keyof typeof MOCK_ENVIRONMENTS

export interface SeedContext {
  store: MockStore
  rng: Rng
  profile: SeedProfile
  now: number
  insert<A extends MockAttributes>(
    type: string,
    attributes: A,
    refs: Record<string, Linkage | null>,
    options?: { id?: string; created?: string; updated?: string },
  ): MockRow<A>
  accountRef(): Linkage
  environmentRef(key: EnvironmentKey | null): Linkage | null
  pickEnvironment(weights?: {
    global: number
    sandbox: number
    production: number
  }): Linkage | null
  daysAgo(days: number, jitterDays?: number): string
  hoursAgo(hours: number, jitterHours?: number): string
  minutesAgo(minutes: number, jitterMinutes?: number): string
  daysFromNow(days: number, jitterDays?: number): string
  between(startIso: string, endIso: string): string
  later(iso: string, maxDays: number): string
  rows(type: string): MockRow[]
  metadataFor(kind: "empty" | "small" | "rich"): Record<string, unknown>
}

export function createMockSeedContext(
  store: MockStore,
  rng: Rng,
  profile: SeedProfile,
  now: number = Date.now(),
): SeedContext {
  const iso = (millis: number): string => new Date(millis).toISOString()

  const context: SeedContext = {
    store,
    rng,
    profile,
    now,
    insert(type, attributes, refs, options = {}) {
      const created = options.created ?? iso(now)
      const row = makeMockRow(
        type,
        options.id ?? rng.uuid(Date.parse(created)),
        attributes,
        refs,
        created,
        options.updated ?? created,
      )
      store.table(type).insert(row)
      return row
    },
    accountRef: () => ({ type: "accounts", id: MOCK_ACCOUNT.id }),
    environmentRef: (key) =>
      key ? { type: "environments", id: MOCK_ENVIRONMENTS[key].id } : null,
    pickEnvironment(weights = { global: 76, sandbox: 14, production: 10 }) {
      const key = rng.weighted<EnvironmentKey | null>([
        [null, weights.global],
        ["sandbox", weights.sandbox],
        ["production", weights.production],
      ])
      return context.environmentRef(key)
    },
    daysAgo: (days, jitterDays = 0) =>
      iso(now - days * DAY - rng.float(0, jitterDays) * DAY),
    hoursAgo: (hours, jitterHours = 0) =>
      iso(now - hours * HOUR - rng.float(0, jitterHours) * HOUR),
    minutesAgo: (minutes, jitterMinutes = 0) =>
      iso(now - minutes * MINUTE - rng.float(0, jitterMinutes) * MINUTE),
    daysFromNow: (days, jitterDays = 0) =>
      iso(now + days * DAY + rng.float(0, jitterDays) * DAY),
    between: (startIso, endIso) => {
      const start = Date.parse(startIso)
      const end = Date.parse(endIso)
      return iso(start + rng.float(0, Math.max(0, end - start)))
    },
    later: (value, maxDays) =>
      iso(Math.min(now, Date.parse(value) + rng.float(0, maxDays) * DAY)),
    rows: (type) => store.table(type).all(),
    metadataFor(kind) {
      if (kind === "empty") return {}
      if (kind === "small") {
        return rng.pick([
          { tier: rng.pick(["starter", "pro", "enterprise"]) },
          { region: rng.pick(["us-east-1", "eu-west-1", "ap-southeast-2"]) },
          { seats: rng.int(1, 250) },
          { beta: rng.chance(0.5) },
          { crmId: `crm_${rng.hex(10)}` },
        ])
      }
      return {
        tier: rng.pick(["starter", "pro", "enterprise"]),
        seats: rng.int(1, 500),
        priceMultiplier: rng.pick([0.5, 1, 1.5, 2.25]),
        beta: rng.chance(0.3),
        deprecatedAt: null,
        regions: rng.sample(["us-east-1", "eu-west-1", "ap-southeast-2"], 2),
        limits: { rpm: rng.pick([60, 300, 600]), burst: rng.pick([10, 50]) },
        crmId: `crm_${rng.hex(10)}`,
        owner: rng.pick(["platform", "field-ops", "research"]),
        notes: rng.pick([
          "Migrated from legacy licensing",
          "Pilot program participant",
          "Renewal pending procurement",
        ]),
      }
    },
  }

  return context
}
