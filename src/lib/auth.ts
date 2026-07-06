import * as keygen from "@/keygen"

// whether the given token is the one authenticating the current Portal session
export function isCurrentToken(tokenId: string): boolean {
  return tokenId === keygen.client.currentTokenId
}
