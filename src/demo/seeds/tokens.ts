import type { SeedContext } from "./context"
import type { Linkage, MockRow } from "@/demo/server/types"
import {
  MOCK_ADMIN,
  MOCK_HERO_LICENSE,
  MOCK_ORGANIZATIONS,
  MOCK_PORTAL_TOKEN,
  MOCK_PRODUCTS,
} from "./universe"

const TOKEN_DURATION_DAYS = 14
const WILDCARD = "*"

const UserRolePrefixes: Readonly<Record<string, string>> = {
  admin: "admin",
  developer: "dev",
  "sales-agent": "sales",
  "support-agent": "spprt",
  "read-only": "read",
  user: "user",
}

const BearerTypePrefixes: Readonly<Record<string, string>> = {
  products: "prod",
  licenses: "activ",
  environments: "env",
}

interface ActivationLimits {
  maxActivations: number | null
  activations: number
  maxDeactivations: number | null
  deactivations: number
}

interface TokenSeed {
  bearer: MockRow
  name: string | null
  expiry: string | null
  created: string
  updated?: string
  permissions?: string[]
  limits?: ActivationLimits
}

function text(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function isRole(row: MockRow, role: string): boolean {
  return row.attributes.role === role
}

function secretFor(seed: SeedContext, bearer: MockRow): string {
  if (bearer.type === "licenses") return `activ-${seed.rng.hex(32)}v3`
  const prefix =
    bearer.type === "users"
      ? (UserRolePrefixes[text(bearer.attributes.role)] ?? "user")
      : (BearerTypePrefixes[bearer.type] ?? "token")
  return `${prefix}-${seed.rng.hex(64)}v3`
}

function bearerEnvironment(bearer: MockRow): Linkage | null {
  if (bearer.type === "environments") {
    return { type: "environments", id: bearer.id }
  }
  return bearer.refs.environment ?? null
}

function notBefore(
  seed: SeedContext,
  bearer: MockRow,
  desired: string,
): string {
  return Date.parse(desired) > Date.parse(bearer.created)
    ? desired
    : seed.later(bearer.created, 1)
}

function insertToken(seed: SeedContext, token: TokenSeed): void {
  const created = notBefore(seed, token.bearer, token.created)

  seed.insert(
    "tokens",
    {
      name: token.name,
      token: secretFor(seed, token.bearer),
      expiry: token.expiry,
      permissions: token.permissions ?? [WILDCARD],
      ...(token.limits ?? {}),
    },
    {
      account: seed.accountRef(),
      environment: bearerEnvironment(token.bearer),
      bearer: { type: token.bearer.type, id: token.bearer.id },
    },
    { created, updated: token.updated ?? created },
  )
}

export function seedMockTokens(seed: SeedContext): void {
  const users = seed.rows("users")
  const admin = users.find((row) => row.id === MOCK_ADMIN.id)
  const portalCreated = seed.minutesAgo(40, 20)

  seed.insert(
    "tokens",
    {
      name: MOCK_PORTAL_TOKEN.name,
      token: MOCK_PORTAL_TOKEN.secret,
      expiry: seed.daysFromNow(TOKEN_DURATION_DAYS),
      permissions: [WILDCARD],
    },
    {
      account: seed.accountRef(),
      environment: null,
      bearer: { type: "users", id: MOCK_ADMIN.id },
    },
    {
      id: MOCK_PORTAL_TOKEN.id,
      created: admin ? notBefore(seed, admin, portalCreated) : portalCreated,
    },
  )

  if (seed.profile === "fresh") return

  const products = seed.rows("products")
  const licenses = seed.rows("licenses")
  const environments = seed.rows("environments")

  if (admin) {
    const created = seed.daysAgo(210, 5)
    insertToken(seed, {
      bearer: admin,
      name: "CI server",
      expiry: null,
      created,
      updated: seed.later(created, 150),
    })
  }

  const developer = users.find((row) => isRole(row, "developer"))
  if (developer) {
    insertToken(seed, {
      bearer: developer,
      name: "Developer CLI",
      expiry: null,
      created: seed.daysAgo(96, 4),
    })
  }

  for (const environment of environments) {
    insertToken(seed, {
      bearer: environment,
      name: `${text(environment.attributes.name)} integration`,
      expiry: null,
      created: seed.between(environment.created, seed.hoursAgo(6)),
    })
  }

  const wallet =
    products.find((row) => row.id === MOCK_PRODUCTS.wallet.id) ?? products.at(0)
  if (wallet) {
    insertToken(seed, {
      bearer: wallet,
      name: "Ecoin Wallet license server",
      expiry: null,
      created: seed.between(wallet.created, seed.daysAgo(45)),
      permissions: [
        "license.validate",
        "license.read",
        "machine.create",
        "machine.delete",
        "machine.read",
      ],
    })
  }

  const gateway =
    products.find((row) => row.id === MOCK_PRODUCTS.gateway.id) ??
    products.at(1)
  if (gateway && gateway.id !== wallet?.id) {
    insertToken(seed, {
      bearer: gateway,
      name: "Payments Gateway backend",
      expiry: null,
      created: seed.between(gateway.created, seed.hoursAgo(12)),
      permissions: [
        "license.validate",
        "license.read",
        "machine.create",
        "machine.read",
      ],
    })
  }

  const hero =
    licenses.find((row) => row.id === MOCK_HERO_LICENSE.id) ??
    licenses.find((row) => row.refs.environment == null)
  if (hero) {
    insertToken(seed, {
      bearer: hero,
      name: `${MOCK_ORGANIZATIONS[0]} activation`,
      expiry: null,
      created: seed.daysAgo(24, 3),
      limits: {
        maxActivations: 5,
        activations: 2,
        maxDeactivations: null,
        deactivations: 0,
      },
    })
    insertToken(seed, {
      bearer: hero,
      name: null,
      expiry: seed.daysFromNow(TOKEN_DURATION_DAYS),
      created: seed.hoursAgo(5, 2),
      limits: {
        maxActivations: null,
        activations: 0,
        maxDeactivations: 1,
        deactivations: 1,
      },
    })
  }

  const otherLicenses = licenses.filter(
    (row) => row.id !== hero?.id && row.refs.environment == null,
  )
  const otherLicense =
    otherLicenses.length > 0 ? seed.rng.pick(otherLicenses) : undefined
  if (otherLicense) {
    insertToken(seed, {
      bearer: otherLicense,
      name: "Field kit",
      expiry: seed.daysAgo(3),
      created: seed.daysAgo(12, 3),
      permissions: ["license.validate", "machine.create", "machine.read"],
      limits: {
        maxActivations: 10,
        activations: 7,
        maxDeactivations: 3,
        deactivations: 0,
      },
    })
  }
}
