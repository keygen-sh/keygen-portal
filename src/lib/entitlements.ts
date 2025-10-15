import { Entitlement } from "@/types/entitlements"

export function buildMockEntitlement(input: {
  name: string
  code: string
  metadata?: Record<string, string>
}): Entitlement {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  return {
    id,
    type: "entitlements",
    links: { self: `/v1/accounts/{ACCOUNT}/entitlements/${id}` },
    attributes: {
      name: input.name,
      code: input.code,
      metadata: input.metadata ?? {},
      created: now,
      updated: now,
    },
    relationships: {
      account: {
        links: { related: "/v1/accounts/{ACCOUNT}" },
        data: { type: "accounts", id: "{ACCOUNT}" },
      },
    },
  }
}
