import * as keygen from "@/keygen"

// whether the given token is the one authenticating the current Portal session
export function isCurrentToken(tokenId: string): boolean {
  return tokenId === keygen.client.currentTokenId
}

interface ResetToken {
  userId: string
  token: string
}

// parse a reset token from the URL query string
export function parseResetToken(
  value: string | undefined | null,
): ResetToken | null {
  if (!value) return null

  const parts = value.split(".")
  if (parts.length !== 3) return null

  const [, userId, token] = parts
  if (!userId || !token) return null

  const normalizedUserId = normalizeUuid(userId)
  if (!normalizedUserId) return null

  return { userId: normalizedUserId, token }
}

// normalize UUID to canonical 8-4-4-4-12 format
function normalizeUuid(value: string): string | null {
  const hex = value.replace(/-/g, "")
  if (!/^[0-9a-f]{32}$/i.test(hex)) return null

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-")
}
