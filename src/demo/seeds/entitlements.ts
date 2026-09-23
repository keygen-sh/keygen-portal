import type { EnvironmentKey, SeedContext } from "./context"
import { MOCK_ENTITLEMENTS } from "./universe"

interface ExtraEntitlement {
  name: string
  code: string
  environment: EnvironmentKey | null
  createdDaysAgo: number
  metadata: "empty" | "small" | "rich"
}

const EXTRA_ENTITLEMENTS: readonly ExtraEntitlement[] = [
  {
    name: "Priority Support",
    code: "PRIORITY_SUPPORT",
    environment: null,
    createdDaysAgo: 268,
    metadata: "rich",
  },
  {
    name: "Audit Log Export",
    code: "AUDIT_LOG_EXPORT",
    environment: null,
    createdDaysAgo: 232,
    metadata: "small",
  },
  {
    name: "Single Sign-On",
    code: "SSO_SAML",
    environment: null,
    createdDaysAgo: 187,
    metadata: "rich",
  },
  {
    name: "Offline Activation",
    code: "OFFLINE_ACTIVATION",
    environment: null,
    createdDaysAgo: 141,
    metadata: "small",
  },
  {
    name: "Experimental API",
    code: "EXPERIMENTAL_API",
    environment: "sandbox",
    createdDaysAgo: 52,
    metadata: "small",
  },
  {
    name: "Legacy v1 Compatibility",
    code: "legacy-v1",
    environment: "sandbox",
    createdDaysAgo: 37,
    metadata: "empty",
  },
]

export function seedMockEntitlements(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const account = seed.accountRef()

  Object.values(MOCK_ENTITLEMENTS).forEach((entitlement, index) => {
    const created = seed.daysAgo(400 - index * 12, 5)
    seed.insert(
      "entitlements",
      {
        name: entitlement.name,
        code: entitlement.code,
        metadata: {
          category: index < 3 ? "Wallet" : index < 4 ? "Gateway" : "Archive",
          description: `${entitlement.name} feature flag for E Corp builds.`,
        },
      },
      { account, environment: null },
      { id: entitlement.id, created, updated: seed.later(created, 60) },
    )
  })

  for (const extra of EXTRA_ENTITLEMENTS) {
    const created = seed.daysAgo(extra.createdDaysAgo, 6)

    seed.insert(
      "entitlements",
      {
        name: extra.name,
        code: extra.code,
        metadata: seed.metadataFor(extra.metadata),
      },
      { account, environment: seed.environmentRef(extra.environment) },
      {
        created,
        updated: seed.rng.chance(0.5) ? seed.later(created, 90) : created,
      },
    )
  }
}
