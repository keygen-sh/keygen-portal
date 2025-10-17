import {
  AuthenticationStrategy,
  CheckInInterval,
  ComponentMatchingStrategy,
  ComponentUniquenessStrategy,
  ExpirationBasis,
  ExpirationStrategy,
  HeartbeatBasis,
  HeartbeatCullStrategy,
  HeartbeatResurrectionStrategy,
  MachineLeasingStrategy,
  MachineMatchingStrategy,
  MachineUniquenessStrategy,
  OverageStrategy,
  ProcessLeasingStrategy,
  RenewalBasis,
  TransferStrategy,
} from "@/types/policies"
import { Policy } from "@/types/policies"

export const MockPolicies: Policy[] = []

export const SamplePolicies: Policy[] = [
  {
    id: "f9e2d7c4-5f0f-4f2c-a7ab-1c6e1f7b9a10",
    type: "policies",
    links: {
      self: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/f9e2d7c4-5f0f-4f2c-a7ab-1c6e1f7b9a10",
    },
    attributes: {
      name: "Field Operator",
      duration: 31536000,
      strict: false,
      floating: false,
      scheme: null,

      requireProductScope: false,
      requirePolicyScope: false,
      requireMachineScope: true,
      requireFingerprintScope: true,
      requireComponentsScope: false,
      requireUserScope: false,
      requireChecksumScope: false,
      requireVersionScope: false,

      requireCheckIn: true,
      checkInInterval: CheckInInterval.WEEK,
      checkInIntervalCount: 1,

      usePool: false,
      maxMachines: 1,
      maxProcesses: null,
      maxUsers: null,
      maxCores: null,
      maxUses: null,

      encrypted: true,
      protected: false,

      requireHeartbeat: true,
      heartbeatDuration: 600,
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
        description: "Standard issue license for MJOLNIR OS field units.",
        product: "MJOLNIR_OS",
        tier: "field",
      },
      created: "2025-10-16T15:16:30.000Z",
      updated: "2025-10-16T15:16:30.000Z",
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
        data: { type: "accounts", id: "0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
      },
      product: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/f9e2d7c4-5f0f-4f2c-a7ab-1c6e1f7b9a10/product",
        },
        data: { type: "products", id: "c59cfe19-5781-4b72-8c37-b835dd5a8afe" }, // MJOLNIR OS
      },
      pool: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/f9e2d7c4-5f0f-4f2c-a7ab-1c6e1f7b9a10/pool",
        },
      },
      licenses: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/f9e2d7c4-5f0f-4f2c-a7ab-1c6e1f7b9a10/licenses",
        },
      },
      entitlements: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/f9e2d7c4-5f0f-4f2c-a7ab-1c6e1f7b9a10/entitlements",
        },
        data: [
          { type: "entitlements", id: "2c6c4b2a-2f2a-4a7a-8c9f-6b4b3a8b6f11" }, // Armor Tuning Module
          { type: "entitlements", id: "4a0b9d7e-9bd8-4c6a-9d2a-0d6e4e9a3f22" }, // Secure Boot
        ],
      },
    },
  },

  {
    id: "0bd5b3a3-6a2d-4a63-9b71-1fd4b2c5e1aa",
    type: "policies",
    links: {
      self: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/0bd5b3a3-6a2d-4a63-9b71-1fd4b2c5e1aa",
    },
    attributes: {
      name: "Fireteam License",
      duration: 31536000,
      strict: true,
      floating: true,
      scheme: null,

      requireProductScope: false,
      requirePolicyScope: false,
      requireMachineScope: true,
      requireFingerprintScope: true,
      requireComponentsScope: false,
      requireUserScope: true,
      requireChecksumScope: false,
      requireVersionScope: false,

      requireCheckIn: false,
      checkInInterval: null,
      checkInIntervalCount: null,

      usePool: false,
      maxMachines: 5,
      maxProcesses: null,
      maxUsers: null,
      maxCores: null,
      maxUses: null,

      encrypted: false,
      protected: false,

      requireHeartbeat: true,
      heartbeatDuration: 300,
      heartbeatCullStrategy: HeartbeatCullStrategy.DEACTIVATE_DEAD,
      heartbeatResurrectionStrategy: HeartbeatResurrectionStrategy.NO_REVIVE,
      heartbeatBasis: HeartbeatBasis.FROM_FIRST_PING,

      machineUniquenessStrategy: MachineUniquenessStrategy.UNIQUE_PER_POLICY,
      machineMatchingStrategy: MachineMatchingStrategy.MATCH_ANY,
      componentUniquenessStrategy:
        ComponentUniquenessStrategy.UNIQUE_PER_ACCOUNT,
      componentMatchingStrategy: ComponentMatchingStrategy.MATCH_ANY,

      expirationStrategy: ExpirationStrategy.RESTRICT_ACCESS,
      expirationBasis: ExpirationBasis.FROM_CREATION,
      renewalBasis: RenewalBasis.FROM_EXPIRY,
      transferStrategy: TransferStrategy.RESET_EXPIRY,

      authenticationStrategy: AuthenticationStrategy.LICENSE,
      machineLeasingStrategy: MachineLeasingStrategy.PER_USER,
      processLeasingStrategy: ProcessLeasingStrategy.PER_MACHINE,
      overageStrategy: OverageStrategy.NO_OVERAGE,

      metadata: {
        description:
          "Shared multi-unit license for coordinated fireteam deployment.",
        product: "MJOLNIR_LINK",
        tier: "fireteam",
      },
      created: "2025-10-16T15:16:30.000Z",
      updated: "2025-10-16T15:16:30.000Z",
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
        data: { type: "accounts", id: "0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
      },
      product: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/0bd5b3a3-6a2d-4a63-9b71-1fd4b2c5e1aa/product",
        },
        data: { type: "products", id: "af25be97-a609-4db1-b718-f2b0bdc0969e" }, // MJOLNIR Link
      },
      pool: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/0bd5b3a3-6a2d-4a63-9b71-1fd4b2c5e1aa/pool",
        },
      },
      licenses: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/0bd5b3a3-6a2d-4a63-9b71-1fd4b2c5e1aa/licenses",
        },
      },
      entitlements: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/0bd5b3a3-6a2d-4a63-9b71-1fd4b2c5e1aa/entitlements",
        },
        data: [
          { type: "entitlements", id: "b06a77b8-b57a-4e0a-96df-2c260d21cbbb" }, // Slipspace Networking
          { type: "entitlements", id: "d13b21cc-a13a-459d-9cf2-f68e40c40439" }, // Fireteam Synchronization
        ],
      },
    },
  },

  {
    id: "6f4f3a2b-8f0c-4d21-8f7e-9c1d5f2b3a77",
    type: "policies",
    links: {
      self: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/6f4f3a2b-8f0c-4d21-8f7e-9c1d5f2b3a77",
    },
    attributes: {
      name: "AI Core",
      duration: 31536000,
      strict: true,
      floating: false,
      scheme: null,

      requireProductScope: false,
      requirePolicyScope: false,
      requireMachineScope: true,
      requireFingerprintScope: true,
      requireComponentsScope: false,
      requireUserScope: false,
      requireChecksumScope: false,
      requireVersionScope: false,

      requireCheckIn: true,
      checkInInterval: CheckInInterval.MONTH,
      checkInIntervalCount: 1,

      usePool: false,
      maxMachines: 1,
      maxProcesses: null,
      maxUsers: null,
      maxCores: null,
      maxUses: null,

      encrypted: true,
      protected: true,

      requireHeartbeat: false,
      heartbeatDuration: null,
      heartbeatCullStrategy: HeartbeatCullStrategy.KEEP_DEAD,
      heartbeatResurrectionStrategy: HeartbeatResurrectionStrategy.NO_REVIVE,
      heartbeatBasis: HeartbeatBasis.FROM_CREATION,

      machineUniquenessStrategy: MachineUniquenessStrategy.UNIQUE_PER_LICENSE,
      machineMatchingStrategy: MachineMatchingStrategy.MATCH_ALL,
      componentUniquenessStrategy:
        ComponentUniquenessStrategy.UNIQUE_PER_MACHINE,
      componentMatchingStrategy: ComponentMatchingStrategy.MATCH_ALL,

      expirationStrategy: ExpirationStrategy.RESTRICT_ACCESS,
      expirationBasis: ExpirationBasis.FROM_FIRST_ACTIVATION,
      renewalBasis: RenewalBasis.FROM_EXPIRY,
      transferStrategy: TransferStrategy.KEEP_EXPIRY,

      authenticationStrategy: AuthenticationStrategy.MIXED,
      machineLeasingStrategy: MachineLeasingStrategy.PER_LICENSE,
      processLeasingStrategy: ProcessLeasingStrategy.PER_MACHINE,
      overageStrategy: OverageStrategy.NO_OVERAGE,

      metadata: {
        description: "Subscription granting Core AI features and analytics.",
        product: "MJOLNIR_AI",
        tier: "ai-core",
      },
      created: "2025-10-16T15:16:30.000Z",
      updated: "2025-10-16T15:16:30.000Z",
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
        data: { type: "accounts", id: "0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
      },
      product: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/6f4f3a2b-8f0c-4d21-8f7e-9c1d5f2b3a77/product",
        },
        data: { type: "products", id: "00225f1e-8797-414e-a31c-440e657ca4d8" }, // MJOLNIR AI
      },
      pool: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/6f4f3a2b-8f0c-4d21-8f7e-9c1d5f2b3a77/pool",
        },
      },
      licenses: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/6f4f3a2b-8f0c-4d21-8f7e-9c1d5f2b3a77/licenses",
        },
      },
      entitlements: {
        links: {
          related:
            "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/policies/6f4f3a2b-8f0c-4d21-8f7e-9c1d5f2b3a77/entitlements",
        },
        data: [
          { type: "entitlements", id: "e07ce5f4-51f2-41a7-8d62-cb8e26ef1e91" }, // Cortex Analytics
          { type: "entitlements", id: "7f8a3b6b-1b9a-4f32-9c69-2a3e8d5c9d44" }, // AI Companion
        ],
      },
    },
  },
] satisfies Policy[]
