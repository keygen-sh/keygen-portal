import type { MockRow } from "@/demo/server/types"
import type { EnvironmentKey, SeedContext } from "./context"
import { MOCK_GROUPS } from "./universe"

interface GroupBlueprint {
  id?: string
  name: string
  environment: EnvironmentKey | null
  maxUsers: number | null
  maxLicenses: number | null
  maxMachines: number | null
  metadata: Record<string, unknown>
  createdDaysAgo: number
  createdJitterDays: number
  editedWithinDays: number | null
  ownerCount: number
  memberTarget: number
}

interface SeededGroup {
  blueprint: GroupBlueprint
  row: MockRow
  members: MockRow[]
}

const BLUEPRINTS: readonly GroupBlueprint[] = [
  {
    name: "Evaluation Accounts",
    environment: "sandbox",
    maxUsers: 10,
    maxLicenses: 20,
    maxMachines: 40,
    metadata: {
      segment: "trial",
      autoExpireDays: 30,
    },
    createdDaysAgo: 150,
    createdJitterDays: 4,
    editedWithinDays: 30,
    ownerCount: 2,
    memberTarget: 3,
  },
  {
    id: MOCK_GROUPS.enterprise.id,
    name: MOCK_GROUPS.enterprise.name,
    environment: null,
    maxUsers: 25,
    maxLicenses: 100,
    maxMachines: 250,
    metadata: {
      customerId: "cus_enterprise_accounts",
      seats: 25,
      discount: 0.15,
      active: true,
      note: null,
    },
    createdDaysAgo: 390,
    createdJitterDays: 4,
    editedWithinDays: 120,
    ownerCount: 3,
    memberTarget: 7,
  },
  {
    name: "Acme Corporation",
    environment: null,
    maxUsers: 4,
    maxLicenses: null,
    maxMachines: null,
    metadata: {
      billing: { plan: "enterprise", renews: "2027-01-01" },
      tags: ["eu", "priority"],
    },
    createdDaysAgo: 205,
    createdJitterDays: 5,
    editedWithinDays: 40,
    ownerCount: 2,
    memberTarget: 4,
  },
  {
    name: "Contoso Ltd",
    environment: null,
    maxUsers: 12,
    maxLicenses: 40,
    maxMachines: null,
    metadata: {
      billing: { plan: "business", renews: "2026-11-01" },
      region: "us-east-1",
    },
    createdDaysAgo: 310,
    createdJitterDays: 6,
    editedWithinDays: 75,
    ownerCount: 2,
    memberTarget: 5,
  },
  {
    name: "Northwind Traders",
    environment: null,
    maxUsers: null,
    maxLicenses: null,
    maxMachines: null,
    metadata: {},
    createdDaysAgo: 60,
    createdJitterDays: 3,
    editedWithinDays: null,
    ownerCount: 1,
    memberTarget: 3,
  },
  {
    name: "Woodgrove Bank",
    environment: "production",
    maxUsers: 8,
    maxLicenses: null,
    maxMachines: 10000,
    metadata: {
      procurementNotes:
        "Renewal routed through the facilities procurement office, awaiting counter-signature from the site manager before the next fiscal cycle opens.",
    },
    createdDaysAgo: 95,
    createdJitterDays: 3,
    editedWithinDays: null,
    ownerCount: 2,
    memberTarget: 3,
  },
]

function environmentAccepts(
  seed: SeedContext,
  host: MockRow,
  association: MockRow,
): boolean {
  const hostEnvironment = host.refs.environment?.id ?? null
  const associationEnvironment = association.refs.environment?.id ?? null

  if (hostEnvironment == null) return associationEnvironment == null
  if (associationEnvironment === hostEnvironment) return true

  const environment = seed.store.table("environments").get(hostEnvironment)
  return (
    environment?.attributes.isolationStrategy === "SHARED" &&
    associationEnvironment == null
  )
}

function hasSeat(group: SeededGroup): boolean {
  const limit = group.blueprint.maxUsers
  return limit == null || group.members.length < limit
}

function joinGroup(seed: SeedContext, group: SeededGroup, user: MockRow): void {
  seed.store
    .table("users")
    .patch(
      user.id,
      { refs: { group: { type: "groups", id: group.row.id } } },
      { touch: false },
    )
  group.members.push(user)
}

export function seedMockGroups(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const account = seed.accountRef()
  const present = new Date(seed.now).toISOString()
  const customers = seed.rng.shuffle(
    seed.rows("users").filter((user) => user.attributes.role === "user"),
  )

  const seeded = BLUEPRINTS.map((blueprint): SeededGroup => {
    const created = seed.daysAgo(
      blueprint.createdDaysAgo,
      blueprint.createdJitterDays,
    )
    const row: MockRow = seed.insert(
      "groups",
      {
        name: blueprint.name,
        maxUsers: blueprint.maxUsers,
        maxLicenses: blueprint.maxLicenses,
        maxMachines: blueprint.maxMachines,
        metadata: blueprint.metadata,
      },
      { account, environment: seed.environmentRef(blueprint.environment) },
      {
        id: blueprint.id,
        created,
        updated:
          blueprint.editedWithinDays == null
            ? created
            : seed.later(created, blueprint.editedWithinDays),
      },
    )
    return { blueprint, row, members: [] }
  })

  for (const user of customers) {
    const target = seeded.find(
      (group) =>
        group.members.length < group.blueprint.memberTarget &&
        hasSeat(group) &&
        environmentAccepts(seed, user, group.row),
    )
    if (target) joinGroup(seed, target, user)
  }

  for (const group of seeded) {
    const eligible = (pool: MockRow[]): MockRow[] =>
      seed.rng.shuffle(
        pool.filter((user) => environmentAccepts(seed, group.row, user)),
      )
    const outsiders = customers.filter((user) => !group.members.includes(user))
    const owners = [...eligible(group.members), ...eligible(outsiders)].slice(
      0,
      group.blueprint.ownerCount,
    )

    for (const user of owners) {
      const since =
        group.row.created > user.created ? group.row.created : user.created

      seed.insert(
        "group-owners",
        {},
        {
          account,
          environment: group.row.refs.environment,
          group: { type: "groups", id: group.row.id },
          user: { type: "users", id: user.id },
        },
        { created: seed.between(since, present) },
      )
    }
  }
}
