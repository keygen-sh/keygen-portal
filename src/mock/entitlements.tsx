import { Entitlement } from "@/types/entitlements"

export const MockEntitlements: Entitlement[] = []

export const SampleEntitlements: Entitlement[] = [
  {
    id: "2c6c4b2a-2f2a-4a7a-8c9f-6b4b3a8b6f11",
    type: "entitlements",
    attributes: {
      name: "Armor Tuning Module",
      code: "FEATURE_ARMOR_TUNING",
      metadata: {
        category: "OS",
        description: "Access to armor calibration and tuning systems.",
      },
      created: "2025-10-16T15:16:00.000Z",
      updated: "2025-10-16T15:16:00.000Z",
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
        data: { type: "accounts", id: "0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
      },
    },
    links: {
      self: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/entitlements/2c6c4b2a-2f2a-4a7a-8c9f-6b4b3a8b6f11",
    },
  },
  {
    id: "4a0b9d7e-9bd8-4c6a-9d2a-0d6e4e9a3f22",
    type: "entitlements",
    attributes: {
      name: "Secure Boot",
      code: "FEATURE_SECURE_BOOT",
      metadata: {
        category: "OS",
        description: "Production integrity and secure boot chain.",
      },
      created: "2025-10-16T15:16:00.000Z",
      updated: "2025-10-16T15:16:00.000Z",
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
        data: { type: "accounts", id: "0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
      },
    },
    links: {
      self: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/entitlements/4a0b9d7e-9bd8-4c6a-9d2a-0d6e4e9a3f22",
    },
  },
  {
    id: "b06a77b8-b57a-4e0a-96df-2c260d21cbbb",
    type: "entitlements",
    attributes: {
      name: "Slipspace Networking",
      code: "FEATURE_SLIPSPACE_NET",
      metadata: {
        category: "Link",
        description: "Cross-system networking and latency compensation.",
      },
      created: "2025-10-16T15:16:00.000Z",
      updated: "2025-10-16T15:16:00.000Z",
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
        data: { type: "accounts", id: "0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
      },
    },
    links: {
      self: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/entitlements/b06a77b8-b57a-4e0a-96df-2c260d21cbbb",
    },
  },
  {
    id: "d13b21cc-a13a-459d-9cf2-f68e40c40439",
    type: "entitlements",
    attributes: {
      name: "Fireteam Synchronization",
      code: "FEATURE_FIRETEAM_SYNC",
      metadata: {
        category: "Link",
        description: "Squad synchronization and comm relay.",
      },
      created: "2025-10-16T15:16:00.000Z",
      updated: "2025-10-16T15:16:00.000Z",
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
        data: { type: "accounts", id: "0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
      },
    },
    links: {
      self: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/entitlements/d13b21cc-a13a-459d-9cf2-f68e40c40439",
    },
  },
  {
    id: "e07ce5f4-51f2-41a7-8d62-cb8e26ef1e91",
    type: "entitlements",
    attributes: {
      name: "Cortex Analytics",
      code: "FEATURE_CORTEX_ANALYTICS",
      metadata: {
        category: "AI",
        description: "Telemetry dashboards and AI behavior playback.",
      },
      created: "2025-10-16T15:16:00.000Z",
      updated: "2025-10-16T15:16:00.000Z",
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
        data: { type: "accounts", id: "0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
      },
    },
    links: {
      self: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/entitlements/e07ce5f4-51f2-41a7-8d62-cb8e26ef1e91",
    },
  },
  {
    id: "7f8a3b6b-1b9a-4f32-9c69-2a3e8d5c9d44",
    type: "entitlements",
    attributes: {
      name: "AI Companion",
      code: "FEATURE_AI_COMPANION",
      metadata: {
        category: "AI",
        description: "Attach a Core AI instance to an operator profile.",
      },
      created: "2025-10-16T15:16:00.000Z",
      updated: "2025-10-16T15:16:00.000Z",
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
        data: { type: "accounts", id: "0a000c3f-21ce-4a6c-87c2-3018ab6ce66f" },
      },
    },
    links: {
      self: "/v1/accounts/0a000c3f-21ce-4a6c-87c2-3018ab6ce66f/entitlements/7f8a3b6b-1b9a-4f32-9c69-2a3e8d5c9d44",
    },
  },
] satisfies Entitlement[]
