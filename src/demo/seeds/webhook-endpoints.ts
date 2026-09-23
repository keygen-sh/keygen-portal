import type { EnvironmentKey, SeedContext } from "./context"
import { MOCK_PRODUCTS, MOCK_WEBHOOK_ENDPOINTS } from "./universe"

export const WEBHOOK_ENDPOINT_URLS = {
  main: MOCK_WEBHOOK_ENDPOINTS.main.url,
  licenses: "https://api.ecorp.example/webhooks/licenses",
  failing: "https://legacy.ecorp.example/hooks/failing",
  timeout: "https://relay.ecorp.example/hooks/timeout",
  sandbox: "https://sandbox-hooks.ecorp.example/keygen",
} as const

export const LICENSE_SUBSCRIPTIONS = [
  "license.created",
  "license.validation.succeeded",
  "license.validation.failed",
  "license.renewed",
  "license.expiring-soon",
  "license.expired",
  "license.suspended",
  "license.reinstated",
  "license.revoked",
  "license.deleted",
  "license.check-in-overdue",
  "license.updated",
  "license.checked-out",
] as const

export const MACHINE_SUBSCRIPTIONS = [
  "machine.created",
  "machine.updated",
  "machine.deleted",
  "machine.heartbeat.ping",
  "machine.heartbeat.dead",
  "machine.heartbeat.resurrected",
] as const

export const USER_SUBSCRIPTIONS = [
  "user.created",
  "user.updated",
  "user.banned",
  "user.unbanned",
  "user.password-reset",
  "user.deleted",
  "token.generated",
  "token.revoked",
] as const

interface WebhookEndpointSeed {
  id?: string
  url: string
  subscriptions: readonly string[]
  signatureAlgorithm: string
  apiVersion: string
  product: keyof typeof MOCK_PRODUCTS | null
  environment: EnvironmentKey | null
  createdDaysAgo: number
  updatedDaysAgo?: number
}

const WEBHOOK_ENDPOINT_SEEDS: readonly WebhookEndpointSeed[] = [
  {
    id: MOCK_WEBHOOK_ENDPOINTS.main.id,
    url: WEBHOOK_ENDPOINT_URLS.main,
    subscriptions: ["*"],
    signatureAlgorithm: "ed25519",
    apiVersion: "1.8",
    product: null,
    environment: null,
    createdDaysAgo: 310,
    updatedDaysAgo: 41,
  },
  {
    url: WEBHOOK_ENDPOINT_URLS.licenses,
    subscriptions: LICENSE_SUBSCRIPTIONS,
    signatureAlgorithm: "ecdsa-p256",
    apiVersion: "1.8",
    product: "wallet",
    environment: null,
    createdDaysAgo: 214,
    updatedDaysAgo: 9,
  },
  {
    url: WEBHOOK_ENDPOINT_URLS.failing,
    subscriptions: MACHINE_SUBSCRIPTIONS,
    signatureAlgorithm: "rsa-pss-sha256",
    apiVersion: "1.7",
    product: "archive",
    environment: null,
    createdDaysAgo: 168,
  },
  {
    url: WEBHOOK_ENDPOINT_URLS.timeout,
    subscriptions: USER_SUBSCRIPTIONS,
    signatureAlgorithm: "rsa-sha256",
    apiVersion: "1.3",
    product: null,
    environment: null,
    createdDaysAgo: 122,
    updatedDaysAgo: 60,
  },
  {
    url: WEBHOOK_ENDPOINT_URLS.sandbox,
    subscriptions: ["*"],
    signatureAlgorithm: "ed25519",
    apiVersion: "1.8",
    product: null,
    environment: "sandbox",
    createdDaysAgo: 47,
  },
]

export function seedMockWebhookEndpoints(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const account = seed.accountRef()

  for (const endpoint of WEBHOOK_ENDPOINT_SEEDS) {
    const created = seed.daysAgo(endpoint.createdDaysAgo, 3)
    const updated =
      endpoint.updatedDaysAgo != null
        ? seed.daysAgo(endpoint.updatedDaysAgo, 1)
        : created
    const product = endpoint.product
      ? { type: "products", id: MOCK_PRODUCTS[endpoint.product].id }
      : null

    seed.insert(
      "webhook-endpoints",
      {
        url: endpoint.url,
        subscriptions: [...endpoint.subscriptions],
        signatureAlgorithm: endpoint.signatureAlgorithm,
        apiVersion: endpoint.apiVersion,
      },
      {
        account,
        environment: seed.environmentRef(endpoint.environment),
        product,
      },
      { id: endpoint.id, created, updated },
    )
  }
}
