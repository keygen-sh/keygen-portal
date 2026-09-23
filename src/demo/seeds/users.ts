import type { EnvironmentKey, SeedContext } from "./context"
import {
  MOCK_ADMIN,
  MOCK_CUSTOMER_DOMAINS,
  MOCK_FIRST_NAMES,
  MOCK_LAST_NAMES,
  MOCK_TEAM,
} from "./universe"
import {
  AllRoles,
  DefaultPermissionsByRole,
  UserDefaultPermissions,
  UserRole,
} from "@/types/users"

const CUSTOMER_COUNT = 42
const TEAM_DOMAIN = "ecorp.example"
const TEAM_AGES_IN_DAYS = [540, 455, 380, 300, 245, 190, 120, 45]
const CUSTOMER_AGES_IN_DAYS = [
  600, 575, 548, 520, 495, 470, 441, 415, 390, 366, 340, 318, 295, 272, 250,
  231, 212, 194, 176, 160, 145, 131, 118, 106, 95, 85, 76, 68, 60, 53, 46, 40,
  34, 29, 24, 20, 16, 12, 9, 6, 2, 0.1,
]
const CUSTOMER_ENVIRONMENTS: Partial<Record<number, EnvironmentKey>> = {
  6: "sandbox",
  8: "production",
  13: "sandbox",
  16: "production",
  21: "sandbox",
  23: "production",
  29: "sandbox",
  32: "production",
  34: "sandbox",
  39: "production",
  41: "sandbox",
}
const BANNED_CUSTOMER_INDEXES = [4, 19, 31]
const WILDCARD_CUSTOMER_INDEX = 3
const NARROWED_CUSTOMER_INDEXES = [5, 20, 37]
const ANONYMOUS_CUSTOMER_INDEXES = [2, 24]
const UNDEFINED_PERMISSION_CUSTOMER_INDEXES = [1, 12, 27, 36]
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const ROLE_NAMES: readonly string[] = AllRoles

const NARROWED_DEVELOPER_PERMISSIONS = [
  "account.read",
  "admin.read",
  "artifact.create",
  "artifact.read",
  "artifact.update",
  "entitlement.read",
  "environment.read",
  "event-log.read",
  "license.create",
  "license.read",
  "license.update",
  "license.validate",
  "machine.read",
  "package.create",
  "package.read",
  "package.update",
  "policy.read",
  "product.read",
  "release.create",
  "release.publish",
  "release.read",
  "release.update",
  "release.upload",
  "release.yank",
  "request-log.read",
  "token.generate",
  "token.read",
  "token.revoke",
  "user.password.reset",
  "user.password.update",
  "user.read",
  "user.second-factors.create",
  "user.second-factors.delete",
  "user.second-factors.read",
  "user.second-factors.update",
  "webhook-endpoint.read",
  "webhook-event.read",
]

const NARROWED_USER_PERMISSIONS = [
  "license.read",
  "license.validate",
  "machine.create",
  "machine.delete",
  "machine.heartbeat.ping",
  "machine.read",
]

interface UserSeed {
  email: string
  firstName: string | null
  lastName: string | null
  role: UserRole
  password: string | null
  permissions: string[] | null
  bannedAt?: string | null
  metadata?: Record<string, unknown>
}

function userAttributes(input: UserSeed) {
  return {
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
    password: input.password,
    permissions: input.permissions,
    bannedAt: input.bannedAt ?? null,
    passwordResetToken: null,
    passwordResetSentAt: null,
    metadata: input.metadata ?? {},
  }
}

function roleNamed(name: string): UserRole {
  const index = ROLE_NAMES.indexOf(name)
  return index === -1 ? UserRole.User : AllRoles[index]
}

function base32Secret(random: () => number): string {
  let output = ""
  while (output.length < 32) {
    output += BASE32_ALPHABET.charAt(
      Math.floor(random() * BASE32_ALPHABET.length),
    )
  }
  return output
}

function totpUri(email: string, secret: string): string {
  return `otpauth://totp/Keygen:${encodeURIComponent(email)}?secret=${secret}&issuer=Keygen`
}

function customerPermissions(index: number): string[] | null {
  if (index === WILDCARD_CUSTOMER_INDEX) return ["*"]
  if (UNDEFINED_PERMISSION_CUSTOMER_INDEXES.includes(index)) return null
  if (NARROWED_CUSTOMER_INDEXES.includes(index))
    return [...NARROWED_USER_PERMISSIONS]
  return [...UserDefaultPermissions]
}

function seedAdmin(seed: SeedContext): void {
  const fresh = seed.profile === "fresh"
  const created = fresh ? seed.hoursAgo(2) : seed.daysAgo(400)

  seed.insert(
    "users",
    userAttributes({
      email: MOCK_ADMIN.email,
      firstName: MOCK_ADMIN.firstName,
      lastName: MOCK_ADMIN.lastName,
      role: UserRole.Admin,
      password: MOCK_ADMIN.password,
      permissions: ["*"],
    }),
    { account: seed.accountRef(), environment: null, group: null },
    {
      id: MOCK_ADMIN.id,
      created,
      updated: fresh ? created : seed.daysAgo(12, 3),
    },
  )
}

function seedTeam(seed: SeedContext): void {
  const account = seed.accountRef()

  MOCK_TEAM.forEach((member, index) => {
    const role = roleNamed(member.role)
    const created = seed.daysAgo(TEAM_AGES_IN_DAYS[index], 4)
    const email =
      `${member.firstName}.${member.lastName}@${TEAM_DOMAIN}`.toLowerCase()
    const user = seed.insert(
      "users",
      userAttributes({
        email,
        firstName: member.firstName,
        lastName: member.lastName,
        role,
        password: "demo",
        permissions:
          role === UserRole.Developer
            ? [...NARROWED_DEVELOPER_PERMISSIONS]
            : [...DefaultPermissionsByRole[role]],
      }),
      { account, environment: null, group: null },
      { created, updated: seed.later(created, 120) },
    )

    if (role === UserRole.Admin) {
      const secret = base32Secret(() => seed.rng.next())
      const enabledAt = seed.later(created, 30)
      seed.insert(
        "second-factors",
        { secret, uri: totpUri(user.attributes.email, secret), enabled: true },
        { account, environment: null, user: { type: "users", id: user.id } },
        { created: enabledAt, updated: enabledAt },
      )
    }
  })
}

function seedCustomers(seed: SeedContext): void {
  const account = seed.accountRef()
  const usedEmails = new Set<string>()
  let index = 0

  while (index < CUSTOMER_COUNT) {
    const firstName = seed.rng.pick(MOCK_FIRST_NAMES)
    const lastName = seed.rng.pick(MOCK_LAST_NAMES)
    const domain = seed.rng.pick(MOCK_CUSTOMER_DOMAINS)
    const email = `${firstName}.${lastName}@${domain}`.toLowerCase()
    if (usedEmails.has(email)) continue
    usedEmails.add(email)

    const created = seed.daysAgo(CUSTOMER_AGES_IN_DAYS[index], 0.2)
    const anonymous = ANONYMOUS_CUSTOMER_INDEXES.includes(index)

    seed.insert(
      "users",
      userAttributes({
        email,
        firstName: anonymous ? null : firstName,
        lastName: anonymous ? null : lastName,
        role: UserRole.User,
        password: seed.rng.chance(0.7) ? "demo" : null,
        permissions: customerPermissions(index),
        bannedAt: BANNED_CUSTOMER_INDEXES.includes(index)
          ? seed.between(created, seed.daysAgo(1))
          : null,
        metadata: seed.metadataFor(
          seed.rng.weighted([
            ["empty", 5],
            ["small", 3],
            ["rich", 2],
          ]),
        ),
      }),
      {
        account,
        environment: seed.environmentRef(CUSTOMER_ENVIRONMENTS[index] ?? null),
        group: null,
      },
      {
        created,
        updated: seed.rng.chance(0.6) ? seed.later(created, 90) : created,
      },
    )

    index += 1
  }
}

export function seedMockUsers(seed: SeedContext): void {
  seedAdmin(seed)
  if (seed.profile === "fresh") return

  seedTeam(seed)
  seedCustomers(seed)
}
