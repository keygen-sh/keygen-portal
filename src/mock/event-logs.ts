import { type Linkage } from "@/types/api"
import { type EventLog } from "@/types/event-logs"

// mock
const ACCOUNT_ID = "e4b9c1a2-7d3f-4a6b-9c2e-1f8a5d4b3c7e"
const ADMIN_USER = "a1f3c9d2-5b7e-4c81-9a2f-6d4e8b1c3a7f"
const DEV_USER = "b2e4da13-6c8f-4d92-8b3a-7e5f9c2d4b8a"
const LICENSE_A = "c3f5eb24-7d9a-4ea3-9c4b-8f6a0d3e5c9b"
const LICENSE_B = "d4a6fc35-8eab-4fb4-ad5c-9a7b1e4f6dac"
const MACHINE_A = "e5b7ad46-9fbc-4ac5-be6d-ab8c2f5a7ebd"
const MACHINE_B = "f6c8be57-a0cd-4bd6-cf7e-bc9d3a6b8fce"
const MACHINE_C = "0d1e2f3a-4b5c-4d6e-8f9a-0b1c2d3e4f5a"
const POLICY_A = "a7d9cf68-b1de-4ce7-da8f-cd0e4b7c9adf"
const PRODUCT_A = "b8eada79-c2ef-4df8-eb9a-de1f5c8d0e1a"
const RELEASE_A = "c9fbeb8a-d3fa-4ea9-fcab-ef2a6d9e1f2b"
const ARTIFACT_A = "1e2f3a4b-5c6d-4e7f-9a0b-1c2d3e4f5a6b"
const GROUP_A = "dafcfc9b-e40b-4fba-0dbc-fa3b7eaf2a3c"
const ENTITLEMENT_A = "ebadad0c-f51c-40cb-1ecd-0b4c8fb03b4d"
const TOKEN_A = "fcb0be1d-062d-41dc-2fde-1c5d90c14c5e"

const account: EventLog["relationships"]["account"] = {
  data: { type: "accounts", id: ACCOUNT_ID },
}

const lk = <T extends string>(type: T, id: string): Linkage<T> => ({ type, id })

function log(input: {
  id: string
  event: string
  created: string
  metadata?: Record<string, unknown>
  whodunnit?: Linkage | null
  resource?: Linkage | null
  request?: Linkage<"request-logs"> | null
}): EventLog {
  return {
    id: input.id,
    type: "event-logs",
    attributes: {
      event: input.event,
      metadata: input.metadata ?? {},
      created: input.created,
      updated: input.created,
    },
    relationships: {
      account,
      environment: { data: null },
      request: { data: input.request ?? null },
      whodunnit: { data: input.whodunnit ?? null },
      resource: { data: input.resource ?? null },
    },
    links: { self: `/v1/accounts/${ACCOUNT_ID}/event-logs/${input.id}` },
  }
}

export const EventLogMockData: EventLog[] = [
  log({
    id: "2a1f4d6b-3c5e-4a7d-9b8f-0e1d2c3b4a59",
    event: "license.validation.succeeded",
    created: "2026-06-01T15:42:18.000Z",
    resource: lk("licenses", LICENSE_A),
    request: lk("request-logs", "7f3a1b2c-9d4e-4f5a-8b6c-1e2d3f4a5b6c"),
    metadata: { code: "VALID" },
  }),
  log({
    id: "3b2a5e7c-4d6f-4b8e-0c9a-1f2e3d4c5b6a",
    event: "machine.created",
    created: "2026-06-01T15:30:04.000Z",
    resource: lk("machines", MACHINE_B),
    whodunnit: lk("licenses", LICENSE_A),
    request: lk("request-logs", "8a4b2c3d-0e5f-4a6b-9c7d-2f3e4a5b6c7d"),
  }),
  log({
    id: "4c3b6f8d-5e7a-4c9f-1d0b-2a3f4e5d6c7b",
    event: "license.updated",
    created: "2026-06-01T14:11:53.000Z",
    resource: lk("licenses", LICENSE_A),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "9b5c3d4e-1f6a-4b7c-0d8e-3a4b5c6d7e8f"),
    metadata: {
      diff: {
        maxMachines: [5, 10],
        expiry: ["2026-12-01T00:00:00.000Z", "2027-12-01T00:00:00.000Z"],
      },
    },
  }),
  log({
    id: "5d4c7a9e-6f8b-4d0a-2e1c-3b4a5f6e7d8c",
    event: "user.password-reset",
    created: "2026-06-01T13:58:27.000Z",
    resource: lk("users", DEV_USER),
    whodunnit: lk("users", DEV_USER),
    request: lk("request-logs", "ac6d4e5f-2a7b-4c8d-1e9f-4b5c6d7e8f90"),
  }),
  log({
    id: "6e5d8b0f-7a9c-4e1b-3f2d-4c5b6a7f8e9d",
    event: "policy.updated",
    created: "2026-06-01T11:20:46.000Z",
    resource: lk("policies", POLICY_A),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "bd7e5f6a-3b8c-4d9e-2f0a-5c6d7e8f9012"),
    metadata: {
      diff: {
        duration: [2592000, 31536000],
        maxMachines: [3, 5],
        floating: [false, true],
      },
    },
  }),
  log({
    id: "7f6e9c1a-8b0d-4f2c-4a3e-5d6c7b8a9f0e",
    event: "license.created",
    created: "2026-06-01T09:47:09.000Z",
    resource: lk("licenses", LICENSE_B),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "ce8f6a7b-4c9d-4e0f-3a1b-6d7e8f901234"),
  }),
  log({
    id: "8a7f0d2b-9c1e-4a3d-5b4f-6e7d8c9b0a1f",
    event: "machine.heartbeat.ping",
    created: "2026-06-01T08:15:33.000Z",
    resource: lk("machines", MACHINE_A),
  }),
  log({
    id: "9b801e3c-0d2f-4b4e-6c5a-7f8e9d0c1b2a",
    event: "token.generated",
    created: "2026-05-31T22:03:51.000Z",
    resource: lk("tokens", TOKEN_A),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "df9a7b8c-5d0e-4f1a-4b2c-7e8f90123456"),
  }),
  log({
    id: "ac912f4d-1e3a-4c5f-7d6b-8a9f0e1d2c3b",
    event: "release.published",
    created: "2026-05-31T19:38:12.000Z",
    resource: lk("releases", RELEASE_A),
    whodunnit: lk("products", PRODUCT_A),
    request: lk("request-logs", "ea0b8c9d-6e1f-4a2b-5c3d-8f9012345678"),
    metadata: { diff: { status: ["DRAFT", "PUBLISHED"] } },
  }),
  log({
    id: "bd0a3a5e-2f4b-4d6a-8e7c-9b0a1f2e3d4c",
    event: "license.suspended",
    created: "2026-05-31T16:50:40.000Z",
    resource: lk("licenses", LICENSE_B),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "fb1c9d0e-7f2a-4b3c-6d4e-901234567890"),
    metadata: { diff: { suspended: [false, true] } },
  }),
  log({
    id: "ce1b4b6f-3a5c-4e7b-9f8d-0c1b2a3f4e5d",
    event: "machine.deleted",
    created: "2026-05-31T12:27:05.000Z",
    resource: lk("machines", MACHINE_C),
    whodunnit: lk("users", DEV_USER),
    request: lk("request-logs", "0c2d0e1f-8a3b-4c4d-7e5f-012345678901"),
  }),
  log({
    id: "df2c5c7a-4b6d-4f8c-0a9e-1d2c3b4a5f6e",
    event: "user.created",
    created: "2026-05-30T20:14:58.000Z",
    resource: lk("users", DEV_USER),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "1d3e1f2a-9b4c-4d5e-8f60-123456789012"),
  }),
  log({
    id: "ea3d6d8b-5c7e-4a9d-1b0f-2e3d4c5b6a7f",
    event: "license.renewed",
    created: "2026-05-30T15:09:22.000Z",
    resource: lk("licenses", LICENSE_A),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "2e4f2a3b-0c5d-4e6f-9071-234567890123"),
    metadata: {
      diff: {
        expiry: ["2026-06-01T00:00:00.000Z", "2026-12-01T00:00:00.000Z"],
      },
    },
  }),
  log({
    id: "fb4e7e9c-6d8f-4b0e-2c1a-3f4e5d6c7b8a",
    event: "policy.created",
    created: "2026-05-30T10:41:17.000Z",
    resource: lk("policies", POLICY_A),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "3f5a3b4c-1d6e-4f70-8182-345678901234"),
  }),
  log({
    id: "0c5f8f0d-7e9a-4c1f-3d2b-4a5f6e7d8c9b",
    event: "product.updated",
    created: "2026-05-29T18:33:49.000Z",
    resource: lk("products", PRODUCT_A),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "405b4c5d-2e7f-4081-9293-456789012345"),
    metadata: {
      diff: {
        name: ["Acme App", "Acme App Pro"],
        url: ["https://acme.example", "https://pro.acme.example"],
      },
    },
  }),
  log({
    id: "1d6a901e-8f0b-4d2a-4e3c-5b6a7f8e9d0c",
    event: "license.validation.failed",
    created: "2026-05-29T14:02:36.000Z",
    resource: lk("licenses", LICENSE_B),
    request: lk("request-logs", "516c5d6e-3f80-4192-83a4-567890123456"),
    metadata: { code: "FINGERPRINT_SCOPE_REQUIRED" },
  }),
  log({
    id: "2e7b0a2f-9a1c-4e3b-5f4d-6c7b8a9f0e1d",
    event: "artifact.downloaded",
    created: "2026-05-28T21:19:08.000Z",
    resource: lk("artifacts", ARTIFACT_A),
    whodunnit: lk("licenses", LICENSE_A),
    request: lk("request-logs", "627d6e7f-4091-42a3-94b5-678901234567"),
  }),
  log({
    id: "3f8c1b3a-0b2d-4f4c-6a5e-7d8c9b0a1f2e",
    event: "group.created",
    created: "2026-05-28T13:45:51.000Z",
    resource: lk("groups", GROUP_A),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "738e7f80-41a2-43b4-85c6-789012345678"),
  }),
  log({
    id: "4a9d2c4b-1c3e-4a5d-7b6f-8e9d0c1b2a3f",
    event: "entitlement.created",
    created: "2026-05-27T17:28:14.000Z",
    resource: lk("entitlements", ENTITLEMENT_A),
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "849f8091-52b3-44c5-96d7-890123456789"),
  }),
  log({
    id: "5b0e3d5c-2d4f-4b6e-8c7a-9f0e1d2c3b4a",
    event: "account.updated",
    created: "2026-05-27T09:12:40.000Z",
    whodunnit: lk("users", ADMIN_USER),
    request: lk("request-logs", "950a91a2-63c4-45d6-87e8-901234567890"),
    metadata: { diff: { name: ["Acme", "Acme Inc"] } },
  }),
]
