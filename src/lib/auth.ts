import { linkOptions, defaultParseSearch } from "@tanstack/react-router"

import * as keygen from "@/keygen"

import { toast } from "@/lib/toast"
import { dasherize } from "@/lib/utils"

// whether the given token is the one authenticating the current Portal session
export function isCurrentToken(tokenId: string): boolean {
  return tokenId === keygen.client.currentTokenId
}

// get account slug from an email address, e.g. "example-com" from "example.com"
export function accountSlugFromEmail(email: string | undefined | null): string {
  const domain = email?.split("@")[1] ?? ""

  return dasherize(domain)
}

interface ResetToken {
  userId: string
  token: string
}

const REDIRECT_STORAGE_KEY = "keygen.auth.redirect"

export function parseRedirect(value: unknown): string | undefined {
  return typeof value === "string" && /^\/goto(?:[/?#]|$)/.test(value)
    ? value
    : undefined
}

export function redirectTarget(redirect: string) {
  const { pathname, search, hash } = new URL(redirect, window.location.origin)

  return linkOptions({
    to: "/goto/$",
    params: { _splat: pathname.slice("/goto/".length) },
    search: defaultParseSearch(search),
    hash: hash.slice(1),
  })
}

export function setPendingRedirect(value: string): void {
  window.sessionStorage.setItem(REDIRECT_STORAGE_KEY, value)
}

export function takePendingRedirect(): string | undefined {
  const value = parseRedirect(
    window.sessionStorage.getItem(REDIRECT_STORAGE_KEY),
  )
  window.sessionStorage.removeItem(REDIRECT_STORAGE_KEY)

  return value
}

export function parseEnvironment(value: unknown): string | undefined {
  return !keygen.config.isCE && typeof value === "string" && value !== ""
    ? value
    : undefined
}

// get redirect and env from the URL query string
export function loginSearch({
  redirect,
  env,
}: { redirect?: string; env?: string } = {}): {
  redirect?: string
  env?: string
} {
  return { redirect, env: env ?? keygen.sessionEnvironment.recall() }
}

const ENVIRONMENT_STORAGE_KEY = "keygen.auth.environment"

export function setPendingEnvironment(value: string): void {
  window.sessionStorage.setItem(ENVIRONMENT_STORAGE_KEY, value)
}

export function takePendingEnvironment(): string | undefined {
  const value = parseEnvironment(
    window.sessionStorage.getItem(ENVIRONMENT_STORAGE_KEY),
  )
  window.sessionStorage.removeItem(ENVIRONMENT_STORAGE_KEY)

  return value
}

export async function activateEnvironment(alias: string): Promise<void> {
  const environment = await keygen.environments.get({ id: alias })
  if (environment.data == null) {
    toast({
      message: "Environment not found.",
      description: `"${alias}" doesn't exist on this account. You've been signed in globally.`,
      variant: "error",
    })

    return
  }

  const token = await keygen.tokens.create({
    relationships: {
      environment: { data: { type: "environments", id: environment.data.id } },
    },
  })

  keygen.environment.set({
    id: environment.data.id,
    code: environment.data.attributes.code,
    name: environment.data.attributes.name,
    token: token.data?.attributes.token ?? null,
  })
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
