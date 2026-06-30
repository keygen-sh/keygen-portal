import * as keygen from "@/keygen"

import { Token, TokenAttributes } from "@/types/tokens"

import { AttributeType } from "@/components/attribute/value"

export const tokenAttributeTypeSchema: Record<
  keyof Omit<TokenAttributes, "created" | "updated" | "permissions" | "token">,
  AttributeType
> = {
  kind: "raw",
  name: "raw",
  expiry: "date",
  activations: "number",
  maxActivations: "number",
  deactivations: "number",
  maxDeactivations: "number",
}

const BASE_REVOCATION_DESCRIPTION =
  "This permanently revokes the token. Any integration using it will immediately lose access. This cannot be undone."

export function revokeTokenDescription(
  token: Token | null | undefined,
): string {
  if (!token) return BASE_REVOCATION_DESCRIPTION

  if (token.id === keygen.client.currentTokenId) {
    return `${BASE_REVOCATION_DESCRIPTION} You're currently authenticated with this token, so revoking it will sign you out and require you to re-authenticate.`
  }

  if (token.attributes.kind === "admin-token") {
    return `${BASE_REVOCATION_DESCRIPTION} Admin tokens can authenticate your Portal session, so revoking this token may sign you out and require you to re-authenticate.`
  }

  return BASE_REVOCATION_DESCRIPTION
}
