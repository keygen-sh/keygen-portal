import { MockStore, mockStore } from "@/demo/server/store"
import { createRng } from "./prng"
import { createMockSeedContext, type SeedProfile } from "./context"
import { MOCK_SEED } from "./universe"

import { seedMockAccount } from "./account"
import { seedMockEnvironments } from "./environments"
import { seedMockUsers } from "./users"
import { seedMockGroups } from "./groups"
import { seedMockProducts } from "./products"
import { seedMockEntitlements } from "./entitlements"
import { seedMockPolicies } from "./policies"
import { seedMockLicenses } from "./licenses"
import { seedMockMachines } from "./machines"
import { seedMockComponents } from "./components"
import { seedMockProcesses } from "./processes"
import { seedMockPackages } from "./packages"
import { seedMockReleases } from "./releases"
import { seedMockArtifacts } from "./artifacts"
import { seedMockTokens } from "./tokens"
import { seedMockWebhookEndpoints } from "./webhook-endpoints"
import { seedMockWebhookEvents } from "./webhook-events"
import { seedMockEventLogs } from "./event-logs"
import { seedMockRequestLogs } from "./request-logs"

export type { SeedProfile } from "./context"

const SEEDERS = [
  seedMockAccount,
  seedMockEnvironments,
  seedMockUsers,
  seedMockGroups,
  seedMockProducts,
  seedMockEntitlements,
  seedMockPolicies,
  seedMockLicenses,
  seedMockMachines,
  seedMockComponents,
  seedMockProcesses,
  seedMockPackages,
  seedMockReleases,
  seedMockArtifacts,
  seedMockTokens,
  seedMockWebhookEndpoints,
  seedMockWebhookEvents,
  seedMockEventLogs,
  seedMockRequestLogs,
] as const

function fill(target: MockStore, profile: SeedProfile, now: number): void {
  const context = createMockSeedContext(
    target,
    createRng(MOCK_SEED),
    profile,
    now,
  )

  for (const seeder of SEEDERS) {
    seeder(context)
  }
}

export function seedMockData(
  profile: SeedProfile,
  now: number = Date.now(),
): void {
  mockStore.quietly(() => {
    mockStore.clear()
    fill(mockStore, profile, now)
  })
}

export function buildMockData(profile: SeedProfile, now: number): MockStore {
  const scratch = new MockStore()
  scratch.quietly(() => fill(scratch, profile, now))
  return scratch
}
