import type { Linkage, MockRow } from "@/demo/server/types"
import type { EnvironmentKey, SeedContext } from "./context"
import { TERMINAL_FIRMWARE_CODE } from "./products"
import {
  MOCK_ENTITLEMENTS,
  MOCK_ENVIRONMENTS,
  MOCK_POLICIES,
  MOCK_PRODUCTS,
} from "./universe"

const DAY = 86_400
const WEEK = 7 * DAY
const YEAR = 365 * DAY

type PolicyAttributes = {
  name: string
  duration: number | null
  strict: boolean
  floating: boolean
  usePool: boolean
  maxMachines: number | null
  maxProcesses: number | null
  maxUsers: number | null
  maxCores: number | null
  maxMemory: number | null
  maxDisk: number | null
  maxUses: number | null
  machineUniquenessStrategy: string
  machineMatchingStrategy: string
  componentUniquenessStrategy: string
  componentMatchingStrategy: string
  expirationStrategy: string
  expirationBasis: string
  renewalBasis: string
  transferStrategy: string
  authenticationStrategy: string
  machineLeasingStrategy: string
  processLeasingStrategy: string
  overageStrategy: string
  scheme: string | null
  encrypted: boolean
  protected: boolean
  requireProductScope: boolean
  requirePolicyScope: boolean
  requireMachineScope: boolean
  requireFingerprintScope: boolean
  requireComponentsScope: boolean
  requireUserScope: boolean
  requireChecksumScope: boolean
  requireVersionScope: boolean
  requireCheckIn: boolean
  checkInInterval: string | null
  checkInIntervalCount: number | null
  heartbeatDuration: number | null
  heartbeatCullStrategy: string
  heartbeatResurrectionStrategy: string
  heartbeatBasis: string
  requireHeartbeat: boolean
  metadata: Record<string, unknown>
}

interface PolicyPlan {
  id?: string
  name: string
  product: string
  environment: EnvironmentKey | null
  created: string
  entitlements: readonly string[]
  attributes: Partial<PolicyAttributes>
}

const SERVER_DEFAULTS: Omit<PolicyAttributes, "name"> = {
  duration: null,
  strict: false,
  floating: false,
  usePool: false,
  maxMachines: null,
  maxProcesses: null,
  maxUsers: null,
  maxCores: null,
  maxMemory: null,
  maxDisk: null,
  maxUses: null,
  machineUniquenessStrategy: "UNIQUE_PER_LICENSE",
  machineMatchingStrategy: "MATCH_ANY",
  componentUniquenessStrategy: "UNIQUE_PER_MACHINE",
  componentMatchingStrategy: "MATCH_ANY",
  expirationStrategy: "RESTRICT_ACCESS",
  expirationBasis: "FROM_CREATION",
  renewalBasis: "FROM_EXPIRY",
  transferStrategy: "KEEP_EXPIRY",
  authenticationStrategy: "TOKEN",
  machineLeasingStrategy: "PER_LICENSE",
  processLeasingStrategy: "PER_MACHINE",
  overageStrategy: "NO_OVERAGE",
  scheme: null,
  encrypted: false,
  protected: true,
  requireProductScope: false,
  requirePolicyScope: false,
  requireMachineScope: false,
  requireFingerprintScope: false,
  requireComponentsScope: false,
  requireUserScope: false,
  requireChecksumScope: false,
  requireVersionScope: false,
  requireCheckIn: false,
  checkInInterval: null,
  checkInIntervalCount: null,
  heartbeatDuration: null,
  heartbeatCullStrategy: "DEACTIVATE_DEAD",
  heartbeatResurrectionStrategy: "NO_REVIVE",
  heartbeatBasis: "FROM_FIRST_PING",
  requireHeartbeat: false,
  metadata: {},
}

const PRIORITY_SUPPORT = "PRIORITY_SUPPORT"
const AUDIT_LOG_EXPORT = "AUDIT_LOG_EXPORT"
const SSO_SAML = "SSO_SAML"
const OFFLINE_ACTIVATION = "OFFLINE_ACTIVATION"

function policyPlans(seed: SeedContext): PolicyPlan[] {
  return [
    {
      id: MOCK_POLICIES.branchWorkstation.id,
      name: MOCK_POLICIES.branchWorkstation.name,
      product: MOCK_POLICIES.branchWorkstation.product,
      environment: null,
      created: seed.daysAgo(372, 4),
      entitlements: [
        MOCK_ENTITLEMENTS.encryptionAtRest.code,
        MOCK_ENTITLEMENTS.hardwareKeys.code,
        OFFLINE_ACTIVATION,
      ],
      attributes: {
        duration: YEAR,
        strict: true,
        floating: false,
        maxMachines: 1,
        requireHeartbeat: true,
        heartbeatDuration: 600,
        heartbeatBasis: "FROM_CREATION",
        requireCheckIn: true,
        checkInInterval: "week",
        checkInIntervalCount: 1,
        authenticationStrategy: "TOKEN",
        requireMachineScope: true,
        requireFingerprintScope: true,
        machineMatchingStrategy: "MATCH_ALL",
        componentMatchingStrategy: "MATCH_ALL",
        metadata: {
          description:
            "Standard issue license for Ecoin Wallet branch workstations.",
          product: MOCK_PRODUCTS.wallet.code,
          tier: "branch",
        },
      },
    },
    {
      id: MOCK_POLICIES.tradingDesk.id,
      name: MOCK_POLICIES.tradingDesk.name,
      product: MOCK_POLICIES.tradingDesk.product,
      environment: null,
      created: seed.daysAgo(338, 4),
      entitlements: [
        MOCK_ENTITLEMENTS.encryptionAtRest.code,
        MOCK_ENTITLEMENTS.hardwareKeys.code,
        MOCK_ENTITLEMENTS.highAvailability.code,
        MOCK_ENTITLEMENTS.accessControl.code,
        PRIORITY_SUPPORT,
        AUDIT_LOG_EXPORT,
      ],
      attributes: {
        duration: YEAR,
        strict: true,
        floating: true,
        maxMachines: 5,
        authenticationStrategy: "LICENSE",
        transferStrategy: "RESET_EXPIRY",
        renewalBasis: "FROM_NOW_IF_EXPIRED",
        machineLeasingStrategy: "PER_USER",
        machineUniquenessStrategy: "UNIQUE_PER_POLICY",
        componentUniquenessStrategy: "UNIQUE_PER_ACCOUNT",
        overageStrategy: "ALWAYS_ALLOW_OVERAGE",
        requireFingerprintScope: true,
        protected: false,
        metadata: {
          description:
            "Shared multi-seat license for coordinated trading desk deployment.",
          product: MOCK_PRODUCTS.wallet.code,
          tier: "trading-desk",
        },
      },
    },
    {
      id: MOCK_POLICIES.archiveNode.id,
      name: MOCK_POLICIES.archiveNode.name,
      product: MOCK_POLICIES.archiveNode.product,
      environment: null,
      created: seed.daysAgo(291, 4),
      entitlements: [
        MOCK_ENTITLEMENTS.fraudAnalytics.code,
        MOCK_ENTITLEMENTS.ledgerExport.code,
        AUDIT_LOG_EXPORT,
        SSO_SAML,
      ],
      attributes: {
        duration: YEAR,
        strict: true,
        floating: false,
        maxMachines: 1,
        protected: true,
        encrypted: true,
        scheme: "LEGACY_ENCRYPT",
        expirationBasis: "FROM_FIRST_ACTIVATION",
        authenticationStrategy: "MIXED",
        requireCheckIn: true,
        checkInInterval: "month",
        checkInIntervalCount: 1,
        heartbeatCullStrategy: "KEEP_DEAD",
        heartbeatBasis: "FROM_CREATION",
        requireMachineScope: true,
        requireFingerprintScope: true,
        machineMatchingStrategy: "MATCH_ALL",
        componentMatchingStrategy: "MATCH_ALL",
        metadata: {
          description:
            "Subscription granting archival retention features and analytics.",
          product: MOCK_PRODUCTS.archive.code,
          tier: "archive-node",
        },
      },
    },
    {
      id: MOCK_POLICIES.gatewayRelay.id,
      name: MOCK_POLICIES.gatewayRelay.name,
      product: MOCK_POLICIES.gatewayRelay.product,
      environment: null,
      created: seed.daysAgo(214, 4),
      entitlements: [
        MOCK_ENTITLEMENTS.highAvailability.code,
        MOCK_ENTITLEMENTS.accessControl.code,
        PRIORITY_SUPPORT,
      ],
      attributes: {
        duration: YEAR,
        strict: true,
        floating: true,
        maxMachines: 4,
        maxProcesses: 8,
        maxUsers: 3,
        requireUserScope: true,
        requireFingerprintScope: true,
        expirationStrategy: "REVOKE_ACCESS",
        expirationBasis: "FROM_FIRST_USE",
        renewalBasis: "FROM_NOW",
        machineUniquenessStrategy: "UNIQUE_PER_PRODUCT",
        machineMatchingStrategy: "MATCH_TWO",
        componentUniquenessStrategy: "UNIQUE_PER_LICENSE",
        componentMatchingStrategy: "MATCH_MOST",
        processLeasingStrategy: "PER_LICENSE",
        metadata: {
          description:
            "Relay node license for Payments Gateway mesh deployments.",
          product: MOCK_PRODUCTS.gateway.code,
          tier: "relay",
        },
      },
    },
    {
      id: MOCK_POLICIES.evaluation.id,
      name: MOCK_POLICIES.evaluation.name,
      product: MOCK_POLICIES.evaluation.product,
      environment: null,
      created: seed.daysAgo(126, 3),
      entitlements: [],
      attributes: {
        duration: 2 * WEEK,
        strict: false,
        floating: true,
        maxMachines: 2,
        maxUses: 100,
        expirationStrategy: "MAINTAIN_ACCESS",
        expirationBasis: "FROM_FIRST_VALIDATION",
        renewalBasis: "FROM_NOW",
        transferStrategy: "RESET_EXPIRY",
        authenticationStrategy: "LICENSE",
        overageStrategy: "ALLOW_1_5X_OVERAGE",
        metadata: {
          description: "14-day evaluation capped at 100 validations.",
          tier: "trial",
        },
      },
    },
    {
      name: "Merchant Seat Subscription",
      product: MOCK_PRODUCTS.gateway.id,
      environment: null,
      created: seed.daysAgo(168, 4),
      entitlements: [
        MOCK_ENTITLEMENTS.highAvailability.code,
        MOCK_ENTITLEMENTS.fraudAnalytics.code,
        PRIORITY_SUPPORT,
        AUDIT_LOG_EXPORT,
        SSO_SAML,
      ],
      attributes: {
        duration: YEAR,
        strict: true,
        floating: true,
        maxMachines: 48,
        maxUsers: 24,
        expirationStrategy: "ALLOW_ACCESS",
        expirationBasis: "FROM_FIRST_DOWNLOAD",
        machineUniquenessStrategy: "UNIQUE_PER_ACCOUNT",
        machineMatchingStrategy: "MATCH_TWO",
        componentUniquenessStrategy: "UNIQUE_PER_PRODUCT",
        componentMatchingStrategy: "MATCH_TWO",
        machineLeasingStrategy: "PER_USER",
        processLeasingStrategy: "PER_USER",
        overageStrategy: "ALLOW_1_25X_OVERAGE",
        requireHeartbeat: true,
        heartbeatDuration: 1800,
        heartbeatResurrectionStrategy: "5_MINUTE_REVIVE",
        requireCheckIn: true,
        checkInInterval: "day",
        checkInIntervalCount: 10,
        requireProductScope: true,
        requirePolicyScope: true,
        requireUserScope: true,
        metadata: {
          description:
            "Annual per-seat subscription for merchant gateway rollouts.",
          product: MOCK_PRODUCTS.gateway.code,
          tier: "merchant-seats",
          seats: 24,
        },
      },
    },
    {
      name: "Legacy Archive Perpetual",
      product: MOCK_PRODUCTS.archive.id,
      environment: null,
      created: seed.daysAgo(352, 5),
      entitlements: [
        MOCK_ENTITLEMENTS.encryptionAtRest.code,
        MOCK_ENTITLEMENTS.ledgerExport.code,
        OFFLINE_ACTIVATION,
      ],
      attributes: {
        duration: null,
        strict: true,
        floating: false,
        maxMachines: 3,
        protected: false,
        scheme: "RSA_2048_PKCS1_PSS_SIGN",
        authenticationStrategy: "NONE",
        requireComponentsScope: true,
        requireChecksumScope: true,
        requireVersionScope: true,
        metadata: {
          description:
            "Perpetual license sold with Archive 1.x, kept for renewals and support only.",
          product: MOCK_PRODUCTS.archive.code,
          tier: "legacy",
          renewable: false,
        },
      },
    },
    {
      name: "Terminal Fleet",
      product: TERMINAL_FIRMWARE_CODE,
      environment: "production",
      created: seed.daysAgo(29, 2),
      entitlements: [],
      attributes: {
        duration: null,
        strict: true,
        floating: true,
        maxMachines: 12,
        requireHeartbeat: true,
        heartbeatDuration: 300,
        heartbeatBasis: "FROM_FIRST_PING",
        heartbeatCullStrategy: "KEEP_DEAD",
        heartbeatResurrectionStrategy: "ALWAYS_REVIVE",
        overageStrategy: "ALWAYS_ALLOW_OVERAGE",
        requireFingerprintScope: true,
        machineMatchingStrategy: "MATCH_MOST",
        metadata: {
          description:
            "Perpetual fleet lease for payment terminals in the field.",
          product: TERMINAL_FIRMWARE_CODE,
          region: "us-east-1",
        },
      },
    },
  ]
}

function allowsAssociation(
  policyEnvironment: EnvironmentKey | null,
  associated: MockRow,
): boolean {
  const associatedEnvironment = associated.refs.environment?.id ?? null
  if (policyEnvironment == null) return associatedEnvironment == null

  const environment = MOCK_ENVIRONMENTS[policyEnvironment]
  if (associatedEnvironment === environment.id) return true
  return (
    environment.isolationStrategy === "SHARED" && associatedEnvironment == null
  )
}

function productRef(
  seed: SeedContext,
  preferred: string,
  policyEnvironment: EnvironmentKey | null,
): Linkage {
  const candidates = seed
    .rows("products")
    .filter((row) => allowsAssociation(policyEnvironment, row))
  const chosen =
    candidates.find(
      (row) => row.id === preferred || row.attributes.code === preferred,
    ) ?? candidates.at(0)

  return { type: "products", id: chosen?.id ?? preferred }
}

function compatibleEntitlements(
  seed: SeedContext,
  codes: readonly string[],
  policyEnvironment: EnvironmentKey | null,
): MockRow[] {
  const rows = seed.rows("entitlements")

  return codes.flatMap((code) => {
    const row = rows.find((candidate) => candidate.attributes.code === code)
    if (!row || !allowsAssociation(policyEnvironment, row)) return []
    return [row]
  })
}

function latest(a: string, b: string): string {
  return a > b ? a : b
}

export function seedMockPolicies(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const account = seed.accountRef()

  for (const plan of policyPlans(seed)) {
    const environment = seed.environmentRef(plan.environment)
    const policy = seed.insert(
      "policies",
      { ...SERVER_DEFAULTS, name: plan.name, ...plan.attributes },
      {
        account,
        environment,
        product: productRef(seed, plan.product, plan.environment),
      },
      {
        id: plan.id,
        created: plan.created,
        updated: seed.rng.chance(0.6)
          ? seed.later(plan.created, 60)
          : plan.created,
      },
    )

    for (const entitlement of compatibleEntitlements(
      seed,
      plan.entitlements,
      plan.environment,
    )) {
      seed.insert(
        "policy-entitlements",
        {},
        {
          account,
          environment,
          policy: { type: "policies", id: policy.id },
          entitlement: { type: "entitlements", id: entitlement.id },
        },
        {
          created: seed.later(latest(policy.created, entitlement.created), 45),
        },
      )
    }
  }
}
