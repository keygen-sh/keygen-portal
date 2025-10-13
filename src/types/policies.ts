import {
  APIResponse,
  Resource,
  Relationship,
  Linkage,
  Writable,
  OptionalExcept,
} from "@/types/api"

export enum PolicyMode {
  CREATE = "create",
  EDIT = "edit",
  VIEW = "view",
}

export enum PolicyView {
  LIST = "list",
  DETAILS = "details",
}

export enum CheckInInterval {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}
export enum AuthenticationStrategy {
  TOKEN = "TOKEN",
  LICENSE = "LICENSE",
  MIXED = "MIXED",
  NONE = "NONE",
}
export enum ExpirationStrategy {
  RESTRICT_ACCESS = "RESTRICT_ACCESS",
  REVOKE_ACCESS = "REVOKE_ACCESS",
  MAINTAIN_ACCESS = "MAINTAIN_ACCESS",
  ALLOW_ACCESS = "ALLOW_ACCESS",
}
export enum OverageStrategy {
  NO_OVERAGE = "NO_OVERAGE",
  ALWAYS_ALLOW_OVERAGE = "ALWAYS_ALLOW_OVERAGE",
  ALLOW_1_25X_OVERAGE = "ALLOW_1_25X_OVERAGE",
  ALLOW_1_5X_OVERAGE = "ALLOW_1_5X_OVERAGE",
  ALLOW_2X_OVERAGE = "ALLOW_2X_OVERAGE",
}
export enum MachineUniquenessStrategy {
  UNIQUE_PER_ACCOUNT = "UNIQUE_PER_ACCOUNT",
  UNIQUE_PER_PRODUCT = "UNIQUE_PER_PRODUCT",
  UNIQUE_PER_POLICY = "UNIQUE_PER_POLICY",
  UNIQUE_PER_LICENSE = "UNIQUE_PER_LICENSE",
}
export enum MachineMatchingStrategy {
  MATCH_ANY = "MATCH_ANY",
  MATCH_TWO = "MATCH_TWO",
  MATCH_MOST = "MATCH_MOST",
  MATCH_ALL = "MATCH_ALL",
}
export enum ComponentUniquenessStrategy {
  UNIQUE_PER_ACCOUNT = "UNIQUE_PER_ACCOUNT",
  UNIQUE_PER_PRODUCT = "UNIQUE_PER_PRODUCT",
  UNIQUE_PER_POLICY = "UNIQUE_PER_POLICY",
  UNIQUE_PER_LICENSE = "UNIQUE_PER_LICENSE",
  UNIQUE_PER_MACHINE = "UNIQUE_PER_MACHINE",
}
export enum ComponentMatchingStrategy {
  MATCH_ANY = "MATCH_ANY",
  MATCH_TWO = "MATCH_TWO",
  MATCH_MOST = "MATCH_MOST",
  MATCH_ALL = "MATCH_ALL",
}
export enum HeartbeatBasis {
  FROM_CREATION = "FROM_CREATION",
  FROM_FIRST_PING = "FROM_FIRST_PING",
}
export enum HeartbeatCullStrategy {
  DEACTIVATE_DEAD = "DEACTIVATE_DEAD",
  KEEP_DEAD = "KEEP_DEAD",
}
export enum HeartbeatResurrectionStrategy {
  NO_REVIVE = "NO_REVIVE",
  ONE_MINUTE_REVIVE = "1_MINUTE_REVIVE",
  TWO_MINUTE_REVIVE = "2_MINUTE_REVIVE",
  FIVE_MINUTE_REVIVE = "5_MINUTE_REVIVE",
  TEN_MINUTE_REVIVE = "10_MINUTE_REVIVE",
  FIFTEEN_MINUTE_REVIVE = "15_MINUTE_REVIVE",
  ALWAYS_REVIVE = "ALWAYS_REVIVE",
}
export enum MachineLeasingStrategy {
  PER_LICENSE = "PER_LICENSE",
  PER_USER = "PER_USER",
}
export enum ProcessLeasingStrategy {
  PER_MACHINE = "PER_MACHINE",
  PER_LICENSE = "PER_LICENSE",
  PER_USER = "PER_USER",
}
export enum ExpirationBasis {
  FROM_CREATION = "FROM_CREATION",
  FROM_FIRST_VALIDATION = "FROM_FIRST_VALIDATION",
  FROM_FIRST_ACTIVATION = "FROM_FIRST_ACTIVATION",
  FROM_FIRST_DOWNLOAD = "FROM_FIRST_DOWNLOAD",
  FROM_FIRST_USE = "FROM_FIRST_USE",
}
export enum RenewalBasis {
  FROM_EXPIRY = "FROM_EXPIRY",
  FROM_NOW = "FROM_NOW",
  FROM_NOW_IF_EXPIRED = "FROM_NOW_IF_EXPIRED",
}
export enum TransferStrategy {
  KEEP_EXPIRY = "KEEP_EXPIRY",
  RESET_EXPIRY = "RESET_EXPIRY",
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
  checkInInterval: CheckInInterval | null
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
  heartbeatCullStrategy: HeartbeatCullStrategy
  heartbeatResurrectionStrategy: HeartbeatResurrectionStrategy
  heartbeatBasis: HeartbeatBasis

  machineUniquenessStrategy: MachineUniquenessStrategy
  machineMatchingStrategy: MachineMatchingStrategy
  componentUniquenessStrategy: ComponentUniquenessStrategy
  componentMatchingStrategy: ComponentMatchingStrategy

  expirationStrategy: ExpirationStrategy
  expirationBasis: ExpirationBasis
  renewalBasis: RenewalBasis
  transferStrategy: TransferStrategy

  authenticationStrategy: AuthenticationStrategy
  machineLeasingStrategy: MachineLeasingStrategy
  processLeasingStrategy: ProcessLeasingStrategy
  overageStrategy: OverageStrategy

  metadata: Record<string, any>
  created: string
  updated: string
}

export interface PolicyInput {
  name: string
  duration?: number | null
  expirationStrategy?: ExpirationStrategy | null
  expirationBasis?: ExpirationBasis | null
  renewalBasis?: RenewalBasis | null
  transferStrategy?: TransferStrategy | null

  strict?: boolean
  floating?: boolean
  protected?: boolean
  usePool?: boolean
  scheme?: string | null
  encrypted?: boolean

  requireCheckIn?: boolean
  checkInInterval?: CheckInInterval | null
  checkInIntervalCount?: number | null

  requireProductScope?: boolean
  requirePolicyScope?: boolean
  requireMachineScope?: boolean
  requireFingerprintScope?: boolean
  requireComponentsScope?: boolean
  requireUserScope?: boolean
  requireChecksumScope?: boolean
  requireVersionScope?: boolean

  maxMachines?: number | null
  maxProcesses?: number | null
  maxUsers?: number | null
  maxCores?: number | null
  maxUses?: number | null

  requireHeartbeat?: boolean
  heartbeatDuration?: number | null
  heartbeatBasis?: HeartbeatBasis | null
  heartbeatCullStrategy?: HeartbeatCullStrategy | null
  heartbeatResurrectionStrategy?: HeartbeatResurrectionStrategy | null

  machineUniquenessStrategy?: MachineUniquenessStrategy | null
  machineMatchingStrategy?: MachineMatchingStrategy | null
  componentUniquenessStrategy?: ComponentUniquenessStrategy | null
  componentMatchingStrategy?: ComponentMatchingStrategy | null
  machineLeasingStrategy?: MachineLeasingStrategy | null
  processLeasingStrategy?: ProcessLeasingStrategy | null
  overageStrategy?: OverageStrategy | null

  authenticationStrategy?: AuthenticationStrategy | null

  metadata?: Record<string, any>
}

export enum TimingTemplates {
  PERPETUAL = "PERPETUAL",
  TIMED = "TIMED",
  PERPETUAL_FALLBACK = "PERPETUAL_FALLBACK",
}
export enum AccessTemplates {
  NODE_LOCKED = "NODE_LOCKED",
  USER_LOCKED = "USER_LOCKED",
}
export enum MeteredTemplates {
  PROCESS_BASED = "PROCESS_BASED",
  LEASE_BASED = "LEASE_BASED",
  FEATURE_BASED = "FEATURE_BASED",
  USAGE_BASED = "USAGE_BASED",
}

export type PolicyTemplateSelection = {
  timing: TimingTemplates | null
  access: AccessTemplates[]
  metered: MeteredTemplates[]
  advanced?: boolean
  offline?: boolean
}

export type PolicyFormValues = Writable<PolicyInput> & {
  product: {
    id: string
  }
  entitlements?: {
    attach?: string[]
    create?: { name: string; code: string; metadata?: Record<string, string> }[]
  }
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

export const PolicyOptionLabels = {
  checkInInterval: {
    [CheckInInterval.DAY]: "Daily",
    [CheckInInterval.WEEK]: "Weekly",
    [CheckInInterval.MONTH]: "Monthly",
    [CheckInInterval.YEAR]: "Yearly",
  },
  authenticationStrategy: {
    [AuthenticationStrategy.TOKEN]: "Token",
    [AuthenticationStrategy.LICENSE]: "License",
    [AuthenticationStrategy.MIXED]: "Mixed",
    [AuthenticationStrategy.NONE]: "None",
  },
  expirationStrategy: {
    [ExpirationStrategy.RESTRICT_ACCESS]: "Restrict Access",
    [ExpirationStrategy.REVOKE_ACCESS]: "Revoke Access",
    [ExpirationStrategy.MAINTAIN_ACCESS]: "Maintain Access",
    [ExpirationStrategy.ALLOW_ACCESS]: "Allow Access",
  },
  overageStrategy: {
    [OverageStrategy.NO_OVERAGE]: "No Overage",
    [OverageStrategy.ALWAYS_ALLOW_OVERAGE]: "Always Allow Overage",
    [OverageStrategy.ALLOW_1_25X_OVERAGE]: "Allow 1.25x Overage",
    [OverageStrategy.ALLOW_1_5X_OVERAGE]: "Allow 1.5x Overage",
    [OverageStrategy.ALLOW_2X_OVERAGE]: "Allow 2x Overage",
  },
  machineUniquenessStrategy: {
    [MachineUniquenessStrategy.UNIQUE_PER_ACCOUNT]: "Unique Per-Account",
    [MachineUniquenessStrategy.UNIQUE_PER_PRODUCT]: "Unique Per-Product",
    [MachineUniquenessStrategy.UNIQUE_PER_POLICY]: "Unique Per-Policy",
    [MachineUniquenessStrategy.UNIQUE_PER_LICENSE]: "Unique Per-License",
  },
  machineMatchingStrategy: {
    [MachineMatchingStrategy.MATCH_ANY]: "Match Any",
    [MachineMatchingStrategy.MATCH_TWO]: "Match Two",
    [MachineMatchingStrategy.MATCH_MOST]: "Match Most",
    [MachineMatchingStrategy.MATCH_ALL]: "Match All",
  },
  componentUniquenessStrategy: {
    [ComponentUniquenessStrategy.UNIQUE_PER_ACCOUNT]: "Unique Per-Account",
    [ComponentUniquenessStrategy.UNIQUE_PER_PRODUCT]: "Unique Per-Product",
    [ComponentUniquenessStrategy.UNIQUE_PER_POLICY]: "Unique Per-Policy",
    [ComponentUniquenessStrategy.UNIQUE_PER_LICENSE]: "Unique Per-License",
    [ComponentUniquenessStrategy.UNIQUE_PER_MACHINE]: "Unique Per-Machine",
  },
  componentMatchingStrategy: {
    [ComponentMatchingStrategy.MATCH_ANY]: "Match Any",
    [ComponentMatchingStrategy.MATCH_TWO]: "Match Two",
    [ComponentMatchingStrategy.MATCH_MOST]: "Match Most",
    [ComponentMatchingStrategy.MATCH_ALL]: "Match All",
  },
  heartbeatBasis: {
    [HeartbeatBasis.FROM_CREATION]: "From Creation",
    [HeartbeatBasis.FROM_FIRST_PING]: "From First Ping",
  },
  heartbeatCullStrategy: {
    [HeartbeatCullStrategy.DEACTIVATE_DEAD]: "Deactivate Dead",
    [HeartbeatCullStrategy.KEEP_DEAD]: "Keep Dead",
  },
  heartbeatResurrectionStrategy: {
    [HeartbeatResurrectionStrategy.NO_REVIVE]: "No Revive",
    [HeartbeatResurrectionStrategy.ONE_MINUTE_REVIVE]: "1 Minute Revive",
    [HeartbeatResurrectionStrategy.TWO_MINUTE_REVIVE]: "2 Minute Revive",
    [HeartbeatResurrectionStrategy.FIVE_MINUTE_REVIVE]: "5 Minute Revive",
    [HeartbeatResurrectionStrategy.TEN_MINUTE_REVIVE]: "10 Minute Revive",
    [HeartbeatResurrectionStrategy.FIFTEEN_MINUTE_REVIVE]: "15 Minute Revive",
    [HeartbeatResurrectionStrategy.ALWAYS_REVIVE]: "Always Revive",
  },
  machineLeasingStrategy: {
    [MachineLeasingStrategy.PER_LICENSE]: "Per License",
    [MachineLeasingStrategy.PER_USER]: "Per User",
  },
  processLeasingStrategy: {
    [ProcessLeasingStrategy.PER_MACHINE]: "Per Machine",
    [ProcessLeasingStrategy.PER_LICENSE]: "Per License",
    [ProcessLeasingStrategy.PER_USER]: "Per User",
  },
  expirationBasis: {
    [ExpirationBasis.FROM_CREATION]: "From Creation",
    [ExpirationBasis.FROM_FIRST_VALIDATION]: "From First Validation",
    [ExpirationBasis.FROM_FIRST_ACTIVATION]: "From First Activation",
    [ExpirationBasis.FROM_FIRST_DOWNLOAD]: "From First Download",
    [ExpirationBasis.FROM_FIRST_USE]: "From First Use",
  },
  renewalBasis: {
    [RenewalBasis.FROM_EXPIRY]: "From Expiry",
    [RenewalBasis.FROM_NOW]: "From Now",
    [RenewalBasis.FROM_NOW_IF_EXPIRED]: "From Now If Expired",
  },
  transferStrategy: {
    [TransferStrategy.KEEP_EXPIRY]: "Keep Expiry",
    [TransferStrategy.RESET_EXPIRY]: "Reset Expiry",
  },
} as const

export const MockPolicies: Policy[] = [
  {
    id: "0b4b1a9a-e25a-4f14-a95e-d9dd378d6065",
    type: "policies",
    links: {
      self: "/v1/accounts/{ACCOUNT}/policies/0b4b1a9a-e25a-4f14-a95e-d9dd378d6065",
    },
    attributes: {
      name: "Premium",
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
      heartbeatCullStrategy: HeartbeatCullStrategy.DEACTIVATE_DEAD,
      heartbeatResurrectionStrategy: HeartbeatResurrectionStrategy.NO_REVIVE,
      heartbeatBasis: HeartbeatBasis.FROM_FIRST_PING,
      machineUniquenessStrategy: MachineUniquenessStrategy.UNIQUE_PER_LICENSE,
      machineMatchingStrategy: MachineMatchingStrategy.MATCH_ALL,
      componentUniquenessStrategy:
        ComponentUniquenessStrategy.UNIQUE_PER_MACHINE,
      componentMatchingStrategy: ComponentMatchingStrategy.MATCH_ALL,
      expirationStrategy: ExpirationStrategy.RESTRICT_ACCESS,
      expirationBasis: ExpirationBasis.FROM_CREATION,
      renewalBasis: RenewalBasis.FROM_EXPIRY,
      transferStrategy: TransferStrategy.KEEP_EXPIRY,
      authenticationStrategy: AuthenticationStrategy.TOKEN,
      machineLeasingStrategy: MachineLeasingStrategy.PER_LICENSE,
      processLeasingStrategy: ProcessLeasingStrategy.PER_MACHINE,
      overageStrategy: OverageStrategy.NO_OVERAGE,
      metadata: {
        description: "This is a mock policy used for demonstration purposes.",
        tier: "premium",
        department: "macrodata refinement",
        project: "cold harbor",
        owner: "mark s.",
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
