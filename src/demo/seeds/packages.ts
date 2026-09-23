import type { Linkage } from "@/demo/server/types"
import type { EnvironmentKey, SeedContext } from "./context"
import { MOCK_PACKAGES, MOCK_PRODUCTS } from "./universe"

const TERMINAL_PRODUCT_CODE = "TERMINAL_FIRMWARE"

interface PackageBlueprint {
  id?: string
  name: string
  key: string
  engine: string | null
  productCode: string
  environment: EnvironmentKey | null
  metadata: Record<string, unknown>
  createdDaysAgo: number
  updatedHoursAgo?: number
  updatedWithinDays?: number
}

const BLUEPRINTS: readonly PackageBlueprint[] = [
  {
    id: MOCK_PACKAGES.wallet.id,
    name: MOCK_PACKAGES.wallet.name,
    key: MOCK_PACKAGES.wallet.key,
    engine: "raw",
    productCode: MOCK_PRODUCTS.wallet.code,
    environment: null,
    metadata: {
      homepage: "https://ecorp.example/ecoin-wallet",
      installer: "msi",
      minimumOsVersion: "12.0",
      signed: true,
    },
    createdDaysAgo: 388,
    updatedHoursAgo: 26,
  },
  {
    name: "Enterprise Archive Python SDK",
    key: "archive-sdk",
    engine: "pypi",
    productCode: MOCK_PRODUCTS.archive.code,
    environment: null,
    metadata: {
      requiresPython: ">=3.10",
      homepage: "https://ecorp.example/archive/sdk",
      schemaVersion: 1.2,
      prerelease: false,
    },
    createdDaysAgo: 296,
  },
  {
    name: "Payments Gateway Client",
    key: "@ecorp/gateway",
    engine: "npm",
    productCode: MOCK_PRODUCTS.gateway.code,
    environment: null,
    metadata: {
      requiresNode: ">=20",
      maintainers: { primary: "gateway-team@ecorp.example" },
      deprecatedAt: null,
    },
    createdDaysAgo: 274,
    updatedWithinDays: 40,
  },
  {
    name: "Terminal Firmware Bundle",
    key: "terminal-firmware",
    engine: null,
    productCode: TERMINAL_PRODUCT_CODE,
    environment: "production",
    metadata: {
      distribution: "fleet",
      minimumBootloader: "2.4.1",
      rollout: "maintenance-window",
      signed: true,
    },
    createdDaysAgo: 64,
    updatedWithinDays: 30,
  },
]

export function ensureLookupRow(
  seed: SeedContext,
  type: "engines" | "channels",
  key: string,
  created: string,
): void {
  const exists = seed.rows(type).some((row) => row.attributes.key === key)
  if (exists) return

  seed.insert(
    type,
    { key, name: null },
    { account: seed.accountRef() },
    { created },
  )
}

function productRef(seed: SeedContext, code: string): Linkage {
  const products = seed.rows("products")
  const product =
    products.find((row) => row.attributes.code === code) ?? products[0]

  return { type: "products", id: product.id }
}

export function seedMockPackages(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const account = seed.accountRef()

  for (const blueprint of BLUEPRINTS) {
    const created = seed.daysAgo(blueprint.createdDaysAgo, 3)
    const updated =
      blueprint.updatedHoursAgo != null
        ? seed.hoursAgo(blueprint.updatedHoursAgo, 2)
        : blueprint.updatedWithinDays != null
          ? seed.later(created, blueprint.updatedWithinDays)
          : created

    seed.insert(
      "packages",
      {
        name: blueprint.name,
        key: blueprint.key,
        engine: blueprint.engine,
        metadata: { ...blueprint.metadata },
      },
      {
        account,
        environment: seed.environmentRef(blueprint.environment),
        product: productRef(seed, blueprint.productCode),
      },
      { id: blueprint.id, created, updated },
    )

    if (blueprint.engine != null) {
      ensureLookupRow(seed, "engines", blueprint.engine, created)
    }
  }
}
