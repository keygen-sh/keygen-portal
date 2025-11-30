import {
  APIResponse,
  Resource,
  Relationship,
  Linkage,
  Writable,
  OptionalExcept,
} from "@/types/api"

export enum PolicyMode {
  Create = "create",
  Edit = "edit",
  View = "view",
}

export enum PolicyView {
  List = "list",
  Details = "details",
}

export enum CheckInInterval {
  Day = "day",
  Week = "week",
  Month = "month",
  Year = "year",
}
export enum AuthenticationStrategy {
  Token = "TOKEN",
  License = "LICENSE",
  Mixed = "MIXED",
  None = "NONE",
}
export enum ExpirationStrategy {
  RestrictAccess = "RESTRICT_ACCESS",
  RevokeAccess = "REVOKE_ACCESS",
  MaintainAccess = "MAINTAIN_ACCESS",
  AllowAccess = "ALLOW_ACCESS",
}
export enum OverageStrategy {
  NoOverage = "NO_OVERAGE",
  AlwaysAllowOverage = "ALWAYS_ALLOW_OVERAGE",
  Allow125xOverage = "ALLOW_1_25X_OVERAGE",
  Allow15xOverage = "ALLOW_1_5X_OVERAGE",
  Allow2xOverage = "ALLOW_2X_OVERAGE",
}
export enum MachineUniquenessStrategy {
  UniquePerAccount = "UNIQUE_PER_ACCOUNT",
  UniquePerProduct = "UNIQUE_PER_PRODUCT",
  UniquePerPolicy = "UNIQUE_PER_POLICY",
  UniquePerLicense = "UNIQUE_PER_LICENSE",
}
export enum MachineMatchingStrategy {
  MatchAny = "MATCH_ANY",
  MatchTwo = "MATCH_TWO",
  MatchMost = "MATCH_MOST",
  MatchAll = "MATCH_ALL",
}
export enum ComponentUniquenessStrategy {
  UniquePerAccount = "UNIQUE_PER_ACCOUNT",
  UniquePerProduct = "UNIQUE_PER_PRODUCT",
  UniquePerPolicy = "UNIQUE_PER_POLICY",
  UniquePerLicense = "UNIQUE_PER_LICENSE",
  UniquePerMachine = "UNIQUE_PER_MACHINE",
}
export enum ComponentMatchingStrategy {
  MatchAny = "MATCH_ANY",
  MatchTwo = "MATCH_TWO",
  MatchMost = "MATCH_MOST",
  MatchAll = "MATCH_ALL",
}
export enum HeartbeatBasis {
  FromCreation = "FROM_CREATION",
  FromFirstPing = "FROM_FIRST_PING",
}
export enum HeartbeatCullStrategy {
  DeactivateDead = "DEACTIVATE_DEAD",
  KeepDead = "KEEP_DEAD",
}
export enum HeartbeatResurrectionStrategy {
  NoRevive = "NO_REVIVE",
  OneMinuteRevive = "1_MINUTE_REVIVE",
  TwoMinuteRevive = "2_MINUTE_REVIVE",
  FiveMinuteRevive = "5_MINUTE_REVIVE",
  TenMinuteRevive = "10_MINUTE_REVIVE",
  FifteenMinuteRevive = "15_MINUTE_REVIVE",
  AlwaysRevive = "ALWAYS_REVIVE",
}
export enum MachineLeasingStrategy {
  PerLicense = "PER_LICENSE",
  PerUser = "PER_USER",
}
export enum ProcessLeasingStrategy {
  PerMachine = "PER_MACHINE",
  PerLicense = "PER_LICENSE",
  PerUser = "PER_USER",
}
export enum ExpirationBasis {
  FromCreation = "FROM_CREATION",
  FromFirstValidation = "FROM_FIRST_VALIDATION",
  FromFirstActivation = "FROM_FIRST_ACTIVATION",
  FromFirstDownload = "FROM_FIRST_DOWNLOAD",
  FromFirstUse = "FROM_FIRST_USE",
}
export enum RenewalBasis {
  FromExpiry = "FROM_EXPIRY",
  FromNow = "FROM_NOW",
  FromNowIfExpired = "FROM_NOW_IF_EXPIRED",
}
export enum TransferStrategy {
  KeepExpiry = "KEEP_EXPIRY",
  ResetExpiry = "RESET_EXPIRY",
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

  metadata: Record<string, unknown>
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

  metadata?: Record<string, unknown>
}

export enum TimingTemplates {
  Perpetual = "PERPETUAL",
  Timed = "TIMED",
  PerpetualFallback = "PERPETUAL_FALLBACK",
}
export enum AccessTemplates {
  NodeLocked = "NODE_LOCKED",
  UserLocked = "USER_LOCKED",
}
export enum MeteredTemplates {
  ProcessBased = "PROCESS_BASED",
  LeaseBased = "LEASE_BASED",
  FeatureBased = "FEATURE_BASED",
  UsageBased = "USAGE_BASED",
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
    [CheckInInterval.Day]: "Daily",
    [CheckInInterval.Week]: "Weekly",
    [CheckInInterval.Month]: "Monthly",
    [CheckInInterval.Year]: "Yearly",
  },
  authenticationStrategy: {
    [AuthenticationStrategy.Token]: "Token",
    [AuthenticationStrategy.License]: "License",
    [AuthenticationStrategy.Mixed]: "Mixed",
    [AuthenticationStrategy.None]: "None",
  },
  expirationStrategy: {
    [ExpirationStrategy.RestrictAccess]: "Restrict Access",
    [ExpirationStrategy.RevokeAccess]: "Revoke Access",
    [ExpirationStrategy.MaintainAccess]: "Maintain Access",
    [ExpirationStrategy.AllowAccess]: "Allow Access",
  },
  overageStrategy: {
    [OverageStrategy.NoOverage]: "No Overage",
    [OverageStrategy.AlwaysAllowOverage]: "Always Allow Overage",
    [OverageStrategy.Allow125xOverage]: "Allow 1.25x Overage",
    [OverageStrategy.Allow15xOverage]: "Allow 1.5x Overage",
    [OverageStrategy.Allow2xOverage]: "Allow 2x Overage",
  },
  machineUniquenessStrategy: {
    [MachineUniquenessStrategy.UniquePerAccount]: "Unique Per-Account",
    [MachineUniquenessStrategy.UniquePerProduct]: "Unique Per-Product",
    [MachineUniquenessStrategy.UniquePerPolicy]: "Unique Per-Policy",
    [MachineUniquenessStrategy.UniquePerLicense]: "Unique Per-License",
  },
  machineMatchingStrategy: {
    [MachineMatchingStrategy.MatchAny]: "Match Any",
    [MachineMatchingStrategy.MatchTwo]: "Match Two",
    [MachineMatchingStrategy.MatchMost]: "Match Most",
    [MachineMatchingStrategy.MatchAll]: "Match All",
  },
  componentUniquenessStrategy: {
    [ComponentUniquenessStrategy.UniquePerAccount]: "Unique Per-Account",
    [ComponentUniquenessStrategy.UniquePerProduct]: "Unique Per-Product",
    [ComponentUniquenessStrategy.UniquePerPolicy]: "Unique Per-Policy",
    [ComponentUniquenessStrategy.UniquePerLicense]: "Unique Per-License",
    [ComponentUniquenessStrategy.UniquePerMachine]: "Unique Per-Machine",
  },
  componentMatchingStrategy: {
    [ComponentMatchingStrategy.MatchAny]: "Match Any",
    [ComponentMatchingStrategy.MatchTwo]: "Match Two",
    [ComponentMatchingStrategy.MatchMost]: "Match Most",
    [ComponentMatchingStrategy.MatchAll]: "Match All",
  },
  heartbeatBasis: {
    [HeartbeatBasis.FromCreation]: "From Creation",
    [HeartbeatBasis.FromFirstPing]: "From First Ping",
  },
  heartbeatCullStrategy: {
    [HeartbeatCullStrategy.DeactivateDead]: "Deactivate Dead",
    [HeartbeatCullStrategy.KeepDead]: "Keep Dead",
  },
  heartbeatResurrectionStrategy: {
    [HeartbeatResurrectionStrategy.NoRevive]: "No Revive",
    [HeartbeatResurrectionStrategy.OneMinuteRevive]: "1 Minute Revive",
    [HeartbeatResurrectionStrategy.TwoMinuteRevive]: "2 Minute Revive",
    [HeartbeatResurrectionStrategy.FiveMinuteRevive]: "5 Minute Revive",
    [HeartbeatResurrectionStrategy.TenMinuteRevive]: "10 Minute Revive",
    [HeartbeatResurrectionStrategy.FifteenMinuteRevive]: "15 Minute Revive",
    [HeartbeatResurrectionStrategy.AlwaysRevive]: "Always Revive",
  },
  machineLeasingStrategy: {
    [MachineLeasingStrategy.PerLicense]: "Per License",
    [MachineLeasingStrategy.PerUser]: "Per User",
  },
  processLeasingStrategy: {
    [ProcessLeasingStrategy.PerMachine]: "Per Machine",
    [ProcessLeasingStrategy.PerLicense]: "Per License",
    [ProcessLeasingStrategy.PerUser]: "Per User",
  },
  expirationBasis: {
    [ExpirationBasis.FromCreation]: "From Creation",
    [ExpirationBasis.FromFirstValidation]: "From First Validation",
    [ExpirationBasis.FromFirstActivation]: "From First Activation",
    [ExpirationBasis.FromFirstDownload]: "From First Download",
    [ExpirationBasis.FromFirstUse]: "From First Use",
  },
  renewalBasis: {
    [RenewalBasis.FromExpiry]: "From Expiry",
    [RenewalBasis.FromNow]: "From Now",
    [RenewalBasis.FromNowIfExpired]: "From Now If Expired",
  },
  transferStrategy: {
    [TransferStrategy.KeepExpiry]: "Keep Expiry",
    [TransferStrategy.ResetExpiry]: "Reset Expiry",
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
      heartbeatCullStrategy: HeartbeatCullStrategy.DeactivateDead,
      heartbeatResurrectionStrategy: HeartbeatResurrectionStrategy.NoRevive,
      heartbeatBasis: HeartbeatBasis.FromFirstPing,
      machineUniquenessStrategy: MachineUniquenessStrategy.UniquePerLicense,
      machineMatchingStrategy: MachineMatchingStrategy.MatchAll,
      componentUniquenessStrategy:
        ComponentUniquenessStrategy.UniquePerMachine,
      componentMatchingStrategy: ComponentMatchingStrategy.MatchAll,
      expirationStrategy: ExpirationStrategy.RestrictAccess,
      expirationBasis: ExpirationBasis.FromCreation,
      renewalBasis: RenewalBasis.FromExpiry,
      transferStrategy: TransferStrategy.KeepExpiry,
      authenticationStrategy: AuthenticationStrategy.Token,
      machineLeasingStrategy: MachineLeasingStrategy.PerLicense,
      processLeasingStrategy: ProcessLeasingStrategy.PerMachine,
      overageStrategy: OverageStrategy.NoOverage,
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
