import type { SeedContext } from "./context"
import { MOCK_ENVIRONMENTS } from "./universe"

const ENVIRONMENT_AGES_IN_DAYS = [
  ["sandbox", 380],
  ["production", 147],
] as const

export function seedMockEnvironments(seed: SeedContext): void {
  const account = seed.accountRef()

  ENVIRONMENT_AGES_IN_DAYS.forEach(([key, days]) => {
    const environment = MOCK_ENVIRONMENTS[key]
    const created = seed.daysAgo(days, 4)
    const updated = key === "production" ? seed.later(created, 60) : created

    seed.insert(
      "environments",
      {
        name: environment.name,
        code: environment.code,
        isolationStrategy: environment.isolationStrategy,
      },
      { account },
      { id: environment.id, created, updated },
    )
  })
}
