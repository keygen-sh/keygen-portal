import {
  APIResponse,
  Resource,
  Relationship,
  Linkage,
  Writable,
  OptionalExcept,
} from "@/types/api"

export enum PolicyView {
  LIST = "list",
  DETAILS = "details",
}

export interface PolicyAttributes {
  name: string
  duration: number | null
  strict: boolean
  floating: boolean
  scheme: string | null
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
  usePool: boolean
  maxMachines: number | null
  maxProcesses: number | null
  maxUsers: number | null
  maxCores: number | null
  maxUses: number | null
  encrypted: boolean
  protected: boolean
  requireHeartbeat: boolean
  heartbeatDuration: number | null
  heartbeatCullStrategy: string
  heartbeatResurrectionStrategy: string
  heartbeatBasis: string
  machineUniquenessStrategy: string
  machineMatchingStrategy: string
  componentUniquenessStrategy: string
  componentMatchingStrategy: string
  expirationStrategy: string
  expirationBasis: string
  renewalStrategy: string
  renewalBasis: string
  transferStrategy: string
  authenticationStrategy: string
  machineLeasingStrategy: string
  processLeasingStrategy: string
  overageStrategy: string
  metadata: Record<string, any>
  created: string
  updated: string
}

export type CheckInInterval = "day" | "week" | "month" | "year"
export type AuthenticationStrategy = "TOKEN" | "LICENSE" | "MIXED" | "NONE"
export type ExpirationStrategy =
  | "RESTRICT_ACCESS"
  | "REVOKE_ACCESS"
  | "MAINTAIN_ACCESS"
  | "ALLOW_ACCESS"
export type OverageStrategy =
  | "NO_OVERAGE"
  | "ALWAYS_ALLOW_OVERAGE"
  | "ALLOW_1_25X_OVERAGE"
  | "ALLOW_1_5X_OVERAGE"
  | "ALLOW_2X_OVERAGE"

export interface PolicyInput {
  name: string
  duration?: number | null
  strict?: boolean
  floating?: boolean
  checkInInterval?: CheckInInterval | null
  checkInIntervalCount?: number | null
  usePool?: boolean
  maxMachines?: number | null
  maxProcesses?: number | null
  maxUsers?: number | null
  maxCores?: number | null
  maxUses?: number | null
  requireHeartbeat?: boolean
  heartbeatDuration?: number | null
  authenticationStrategy?: AuthenticationStrategy
  expirationStrategy?: ExpirationStrategy
  overageStrategy?: OverageStrategy
  metadata?: Record<string, any>
}

export type CreatePolicyPayload = OptionalExcept<Writable<PolicyInput>, "name">
export type UpdatePolicyPayload = Partial<Writable<PolicyInput>>

export type PolicyRelationships = {
  account: Relationship<Linkage<"accounts">>
  product: Relationship<Linkage<"products">>
  pool: Relationship<Linkage<"pools"> | null>
  licenses: Relationship<Linkage<"licenses">[]>
  entitlements: Relationship<Linkage<"entitlements">[]>
}

export type Policy = Resource<"policies", PolicyAttributes, PolicyRelationships>
export type PolicyResponse = APIResponse<Policy>
export type PoliciesListResponse = APIResponse<Policy[]>

const SecondsPerDay = 86400
const SecondsPerWeek = 604800
const SecondsPerMonth = 2592000
const SecondsPerYear = 31536000

export const PolicyDurations = [
  { seconds: null, label: "Unlimited" },
  { seconds: SecondsPerDay * 1, label: "1 Day" },
  { seconds: SecondsPerDay * 2, label: "2 Days" },
  { seconds: SecondsPerDay * 3, label: "3 Days" },
  { seconds: SecondsPerDay * 4, label: "4 Days" },
  { seconds: SecondsPerDay * 5, label: "5 Days" },

  { seconds: SecondsPerWeek * 1, label: "1 Week" },
  { seconds: SecondsPerWeek * 2, label: "2 Weeks" },
  { seconds: SecondsPerWeek * 3, label: "3 Weeks" },
  { seconds: SecondsPerWeek * 4, label: "4 Weeks" },
  { seconds: SecondsPerWeek * 5, label: "5 Weeks" },

  { seconds: SecondsPerMonth * 1, label: "1 Month" },
  { seconds: SecondsPerMonth + SecondsPerDay * 1, label: "31 Days" },
  { seconds: SecondsPerMonth + SecondsPerDay * 2, label: "32 Days" },

  { seconds: SecondsPerMonth * 2, label: "2 Months" },
  { seconds: SecondsPerMonth * 3, label: "3 Months" },
  { seconds: SecondsPerMonth * 4, label: "4 Months" },
  { seconds: SecondsPerMonth * 5, label: "5 Months" },
  { seconds: SecondsPerMonth * 6, label: "6 Months" },
  { seconds: SecondsPerMonth * 9, label: "9 Months" },
  { seconds: SecondsPerMonth * 13, label: "13 Months" },

  { seconds: SecondsPerYear * 1, label: "1 Year" },
  { seconds: SecondsPerYear * 2, label: "2 Years" },
  { seconds: SecondsPerYear * 3, label: "3 Years" },
]

export const PolicyAttributeDescriptions: Readonly<
  Record<
    keyof Omit<PolicyAttributes, "created" | "updated" | "metadata">,
    string
  >
> = {
  name: "Policy name.",
  duration:
    "Duration in seconds. Licenses that implement this policy do not expire when this is null.",
  strict:
    "When enabled, a license will be invalidated if its machine limit is not met.",
  floating:
    "When enabled, a license is valid across multiple machines. This is not enforced unless the policy is strict.",
  scheme:
    "The cryptographic encryption/signature scheme used on license keys. Can be used to implement offline licensing.",
  requireProductScope:
    "When enabled, validating a license that implements the policy will require a product ID scope that matches the license's product relationship by its identifier (UUID).",
  requirePolicyScope:
    "When enabled, validating a license that implements the policy will require a policy ID scope that matches the license's policy relationship by its identifier (UUID).",
  requireMachineScope:
    "When enabled, validating a license that implements the policy will require a machine ID scope that matches at least 1 of the license's machine relationship by its identifier (UUID).",
  requireFingerprintScope:
    "When enabled, validating a license that implements the policy will require a fingerprint ID scope that matches at least 1 of the license's fingerprint relationship by its identifier (UUID).",
  requireComponentsScope:
    "When enabled, validating a license that implements the policy will require a components ID scope that matches at least 1 of the license's components relationship by its identifier (UUID).",
  requireUserScope:
    "When enabled, validating a license that implements the policy will require a user scope that matches the license's user relationship.",
  requireChecksumScope:
    "When enabled, validating a license that implements the policy will require a checksum scope that matches an accessible artifact.",
  requireVersionScope:
    "When enabled, validating a license that implements the policy will require a version scope that matches an accessible release.",
  requireCheckIn:
    "When enabled, a license that implements the policy will require check-in at a predefined interval to continue to pass validation i.e. if a license misses a check-in, it will be invalidated.",
  checkInInterval:
    "One of day, week, month or year. The frequency at which a license should check-in.",
  checkInIntervalCount:
    "The number of intervals (specified in the check-in interval property) between each required check-in. For example, checkInInterval=week and checkInIntervalCount=2 requires check-in every 2 weeks. Must be a number between 1 and 365 inclusive.",
  usePool:
    'Whether or not to pull license keys from a finite pool of pre-determined keys. Keys are populated via the "Key" resource.',
  maxMachines:
    "The maximum number of machines a license implementing the policy can have activated.",
  maxProcesses:
    "The maximum number of machine processes a license implementing the policy can have spawned.",
  maxUsers:
    "The maximum number of users a license implementing the policy can have attached.",
  maxCores:
    "The maximum number of machine CPU cores a license implementing the policy can have activated.",
  maxUses:
    'The maximum number of recorded uses a license implementing the policy can have (what constitutes as "usage" is up to you).',
  encrypted: "--",
  protected:
    "A protected policy disallows users the ability to create and manage their own licenses and associated machines. All resource management must be done server-side by an admin when protected.",
  requireHeartbeat:
    "When enabled, machines will be required to start and maintain a heartbeat, otherwise they will fail validation.",
  heartbeatDuration:
    "When a machine heartbeat monitor is active, the machine must send a heartbeat ping within this timeframe to remain activated.",
  heartbeatCullStrategy:
    "How machines with a dead heartbeat are handled, i.e. kept or auto-activated.",
  heartbeatResurrectionStrategy:
    "Whether or not dead machines can be resurrected shortly after death.",
  heartbeatBasis:
    "The event that causes a machine's heartbeat to be set, e.g. on creation.",
  machineUniquenessStrategy:
    "The uniqueness validation strategy for machine fingerprints. Utilize this to prevent duplicate fingerprints across a variety of scopes.",
  machineMatchingStrategy:
    "The matching strategy for machine fingerprints supplied during a license validation.",
  componentUniquenessStrategy:
    "The uniqueness validation strategy for component fingerprints. Utilize this to prevent duplicate fingerprints across a variety of scopes.",
  componentMatchingStrategy:
    "The matching strategy for component fingerprints supplied during a license validation.",
  expirationStrategy:
    "The strategy for expired licenses during a license validation and release access.",
  expirationBasis:
    "The event that causes a license's expiry to be set, e.g. on creation.",
  renewalStrategy: "The strategy for renewing licenses when they expire.",
  renewalBasis:
    "The event that causes a license's initial expiry to be set, e.g. on creation.",
  transferStrategy:
    "The strategy used when a license is transferred to this policy.",
  authenticationStrategy:
    "How licenses are allowed to authenticate with the API.",
  machineLeasingStrategy:
    "The strategy used for leasing and counting machines.",
  processLeasingStrategy:
    "The strategy used for leasing and counting machine processes.",
  overageStrategy:
    "The strategy used for a license's overage allowance, affecting max machines, max cores and max processes.",
} as const

export const MockPolicies = [
  {
    id: "0b4b1a9a-e25a-4f14-a95e-d9dd378d6065",
    type: "policies",
    links: {
      self: "/v1/accounts/{ACCOUNT}/policies/0b4b1a9a-e25a-4f14-a95e-d9dd378d6065",
    },
    attributes: {
      name: "Premium Add-On",
      duration: 31536000,
      strict: false,
      floating: false,
      scheme: null,
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
      usePool: false,
      maxMachines: 1,
      maxProcesses: null,
      maxUsers: null,
      maxCores: null,
      maxUses: null,
      encrypted: false,
      protected: false,
      requireHeartbeat: true,
      heartbeatDuration: null,
      heartbeatCullStrategy: "DEACTIVATE_DEAD",
      heartbeatResurrectionStrategy: "NO_REVIVE",
      heartbeatBasis: "FROM_FIRST_PING",
      machineUniquenessStrategy: "UNIQUE_PER_LICENSE",
      machineMatchingStrategy: "MATCH_ALL",
      componentUniquenessStrategy: "UNIQUE_PER_MACHINE",
      componentMatchingStrategy: "MATCH_ALL",
      expirationStrategy: "RESTRICT_ACCESS",
      expirationBasis: "FROM_CREATION",
      renewalStrategy: "",
      renewalBasis: "FROM_EXPIRY",
      transferStrategy: "KEEP_EXPIRY",
      authenticationStrategy: "TOKEN",
      machineLeasingStrategy: "PER_LICENSE",
      processLeasingStrategy: "PER_MACHINE",
      overageStrategy: "NO_OVERAGE",
      metadata: {
        description: "This is a mock policy used for demonstration purposes.",
        tier: "premium",
        department: "macrodata refinement",
        project: "alpha",
        owner: "Helly R.",
        contact: "helly.r@lumon.industries",
        widget: "<Widget />",
        notes: "This is a mock policy used for demonstration purposes.",
        creator: "Helly R.",
        quality: "High",
        environment: "Production",
        foreword: "This is a mock policy used for demonstration purposes.",
        disclaimer: "This is a mock policy used for demonstration purposes.",
        additionalInfo:
          "This is a mock policy used for demonstration purposes.",
      },
      created: "2017-01-02T20:26:53.464Z",
      updated: "2017-01-02T20:26:53.464Z",
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/{ACCOUNT}" },
        data: { type: "accounts", id: "{ACCOUNT}" },
      },
      product: {
        links: {
          related:
            "/v1/accounts/{ACCOUNT}/policies/0b4b1a9a-e25a-4f14-a95e-d9dd378d6065/product",
        },
        data: { type: "products", id: "80dca7f1-e939-4927-8e47-8a4c84c8ac71" },
      },
      pool: {
        links: {
          related:
            "/v1/accounts/{ACCOUNT}/policies/0b4b1a9a-e25a-4f14-a95e-d9dd378d6065/pool",
        },
      },
      licenses: {
        links: {
          related:
            "/v1/accounts/{ACCOUNT}/policies/0b4b1a9a-e25a-4f14-a95e-d9dd378d6065/licenses",
        },
      },
      entitlements: {
        links: {
          related:
            "/v1/accounts/{ACCOUNT}/policies/0b4b1a9a-e25a-4f14-a95e-d9dd378d6065/entitlements",
        },
      },
    },
  },
] satisfies Policy[]
