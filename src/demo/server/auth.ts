import type { MockBearer, MockContext } from "./context"
import { bearerSecret } from "./context"
import { fail, unauthorized } from "./errors"
import { mockStore } from "./store"
import { millis } from "./time"
import type { MockRow } from "./types"

export function findMockTokenBySecret(secret: string): MockRow | undefined {
  return mockStore
    .table("tokens")
    .find((row) => row.attributes.token === secret)
}

export function mockSubjectOf(token: MockRow): MockRow | undefined {
  const bearer = token.refs.bearer
  if (!bearer) return undefined
  return mockStore.table(bearer.type).get(bearer.id)
}

export function resolveMockBearer(ctx: MockContext): MockBearer | null {
  const secret = bearerSecret(ctx)
  if (secret == null) return null

  const token = findMockTokenBySecret(secret)
  if (!token) {
    fail(unauthorized("TOKEN_INVALID", "Token is invalid"))
  }

  const expiry = millis(token.attributes.expiry as string | null)
  if (expiry != null && expiry < Date.now()) {
    fail(unauthorized("TOKEN_EXPIRED", "Token is expired"))
  }

  const subject = mockSubjectOf(token)
  if (!subject) {
    fail(unauthorized("TOKEN_INVALID", "Token is invalid"))
  }

  return { token, subject }
}

export function requireMockBearer(ctx: MockContext): MockBearer {
  if (!ctx.bearer) {
    fail(
      unauthorized(
        "TOKEN_MISSING",
        "You must be authenticated to complete the request",
      ),
    )
  }
  return ctx.bearer
}

export function findMockAccount(identifier: string): MockRow | undefined {
  const table = mockStore.table("accounts")
  return (
    table.get(identifier) ??
    table.find(
      (row) =>
        String(row.attributes.slug).toLowerCase() === identifier.toLowerCase(),
    )
  )
}

export function findMockEnvironment(
  accountId: string,
  identifier: string,
): MockRow | undefined {
  const table = mockStore.table("environments")
  return table.find(
    (row) =>
      row.refs.account?.id === accountId &&
      (row.id === identifier ||
        String(row.attributes.code).toLowerCase() === identifier.toLowerCase()),
  )
}
