import type { Permission } from "@/types/users"
import type { SeedContext } from "./context"
import { MOCK_ACCOUNT, MOCK_BILLING, MOCK_PLAN } from "./universe"

export const DEV_PLAN = {
  id: "27e3e48a-68e9-473d-922f-b04d762f2495",
  name: "Dev",
} as const

export const ENT_PLAN = {
  id: "e3dcc925-f626-44e7-8f1c-e16cc4e2ec59",
  name: "Ent",
} as const

const ECDSA_PUBLIC_KEY = [
  "-----BEGIN PUBLIC KEY-----",
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE6OwfgHQs1M+KFNXlWkwuS/UvTZqj",
  "UuQYMMiVlqhEIofVHc3cAwnJsEPnO8pL9JpMPDw2NrG1ooVWTSGKYG5Jmw==",
  "-----END PUBLIC KEY-----",
  "",
].join("\n")

const RSA_PUBLIC_KEY = [
  "-----BEGIN PUBLIC KEY-----",
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAunNKDPA/n4HEPBZESePl",
  "xfvZaFgVGB0mFNxSloAUNkx9TmLC+4ZvKQl5Yz9ZWKAH47837shkYatCqw8z5ROf",
  "0rm6LyGrYHbOooxNqnKlraGPk6BUjzS5ERrY0n0e3ODm7IhZ0BpP2QVvFXonEsLz",
  "kUHDOQsHZUHnvsAFE5c3fy7Yvpt8dEYGn952QVSBiuw5ZaJPvQadZl6BE3ypHJ+b",
  "T4LRT4PV+czoHscfLkNsfimkUJWF/ZS1eCTRfyydhHTyHb9FztRwgHE2rHZkDdEZ",
  "T5fa3f8uc9yCidZJAmaHh07OSu41aMtkcaNGtAt8UmuJxfs5vpf0+X6lxGWFG7Ak",
  "VwIDAQAB",
  "-----END PUBLIC KEY-----",
  "",
].join("\n")

export const DEMO_PUBLIC_KEYS = {
  ed25519: "5cea28a41fb243219b4cd1381b763376ab5220e1e6f646ab149e900ebf78c8e7",
  ecdsa: ECDSA_PUBLIC_KEY,
  rsa2048: RSA_PUBLIC_KEY,
} as const

const DEFAULT_LICENSE_PERMISSIONS: readonly Permission[] = [
  "license.validate",
  "license.read",
  "license.check-out",
  "machine.create",
  "machine.read",
  "machine.update",
  "machine.delete",
  "machine.heartbeat.ping",
  "machine.check-out",
  "process.create",
  "process.read",
  "process.delete",
  "process.heartbeat.ping",
  "release.read",
  "release.download",
  "artifact.read",
  "policy.read",
  "product.read",
  "entitlement.read",
]

const DEFAULT_USER_PERMISSIONS: readonly Permission[] = [
  "user.read",
  "user.update",
  "user.password.update",
  "user.second-factors.create",
  "user.second-factors.read",
  "user.second-factors.update",
  "user.second-factors.delete",
  "license.read",
  "license.validate",
  "license.check-out",
  "machine.create",
  "machine.read",
  "machine.update",
  "machine.delete",
  "machine.heartbeat.ping",
  "release.read",
  "release.download",
  "token.generate",
  "token.read",
  "token.revoke",
]

export const DEFAULT_SETTINGS: ReadonlyArray<
  readonly [string, readonly Permission[]]
> = [
  ["default_license_permissions", DEFAULT_LICENSE_PERMISSIONS],
  ["default_user_permissions", DEFAULT_USER_PERMISSIONS],
]

interface PlanSeed {
  id: string
  attributes: Record<string, unknown>
}

const PLANS: readonly PlanSeed[] = [
  {
    id: DEV_PLAN.id,
    attributes: {
      name: DEV_PLAN.name,
      price: 0,
      interval: "month",
      trialDuration: null,
      requestLogRetentionDuration: 259200,
      eventLogRetentionDuration: 259200,
      maxReqs: 2500,
      maxAdmins: 1,
      maxUsers: 10,
      maxLicenses: 25,
      maxProducts: 1,
      maxPolicies: 1,
      maxEnvironments: 0,
      maxStorage: 1073741824,
      maxTransfer: 5368709120,
      maxUpload: 104857600,
      private: false,
    },
  },
  {
    id: MOCK_PLAN.id,
    attributes: {
      name: MOCK_PLAN.name,
      price: 24900,
      interval: "month",
      trialDuration: 1209600,
      requestLogRetentionDuration: 2592000,
      eventLogRetentionDuration: 7776000,
      maxReqs: 1000000,
      maxAdmins: 10,
      maxUsers: null,
      maxLicenses: null,
      maxProducts: 25,
      maxPolicies: null,
      maxEnvironments: 10,
      maxStorage: 1099511627776,
      maxTransfer: 5497558138880,
      maxUpload: 5368709120,
      private: false,
    },
  },
  {
    id: ENT_PLAN.id,
    attributes: {
      name: ENT_PLAN.name,
      price: null,
      interval: "year",
      trialDuration: null,
      requestLogRetentionDuration: null,
      eventLogRetentionDuration: null,
      maxReqs: null,
      maxAdmins: null,
      maxUsers: null,
      maxLicenses: null,
      maxProducts: null,
      maxPolicies: null,
      maxEnvironments: null,
      maxStorage: null,
      maxTransfer: null,
      maxUpload: null,
      private: false,
    },
  },
]

export function seedMockAccount(seed: SeedContext): void {
  const account = seed.accountRef()
  const now = new Date(seed.now)
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const periodStart = new Date(Date.UTC(year, month, 1)).toISOString()
  const periodEnd = new Date(Date.UTC(year, month + 1, 1)).toISOString()
  const cardExpiry = new Date(Date.UTC(year + 2, month + 1, 0)).toISOString()
  const accountCreated = seed.daysAgo(730)

  PLANS.forEach((plan, index) => {
    seed.insert(
      "plans",
      plan.attributes,
      {},
      { id: plan.id, created: seed.daysAgo(1100 - index * 30) },
    )
  })

  seed.insert(
    "billings",
    {
      state: "subscribed",
      subscriptionStatus: "active",
      subscriptionPeriodStart: periodStart,
      subscriptionPeriodEnd: periodEnd,
      cardBrand: "Visa",
      cardLast4: "4242",
      cardExpiry,
      customerId: `cus_${seed.rng.hex(14)}`,
    },
    { account },
    { id: MOCK_BILLING.id, created: accountCreated, updated: periodStart },
  )

  seed.insert(
    "accounts",
    {
      name: MOCK_ACCOUNT.name,
      slug: MOCK_ACCOUNT.slug,
      protected: false,
      apiVersion: "1.8",
      publicKey: DEMO_PUBLIC_KEYS.rsa2048,
      ecdsaKey: DEMO_PUBLIC_KEYS.ecdsa,
      ed25519Key: DEMO_PUBLIC_KEYS.ed25519,
    },
    {
      plan: { type: "plans", id: MOCK_PLAN.id },
      billing: { type: "billings", id: MOCK_BILLING.id },
    },
    {
      id: MOCK_ACCOUNT.id,
      created: accountCreated,
      updated: seed.daysAgo(3, 1),
    },
  )

  DEFAULT_SETTINGS.forEach(([key, value], index) => {
    const created = seed.daysAgo(300 - index * 180, 3)
    seed.insert(
      "settings",
      { key, value: [...value] },
      { account },
      { created, updated: seed.later(created, 45) },
    )
  })
}
