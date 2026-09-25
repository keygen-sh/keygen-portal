import { ProductPermissions } from "@/types/products"
import type { EnvironmentKey, SeedContext } from "./context"
import { MOCK_PRODUCTS } from "./universe"

interface ProductSeed {
  id?: string
  name: string
  code: string
  distributionStrategy: string
  url: string | null
  platforms: readonly string[]
  permissions: readonly string[]
  metadata: Record<string, unknown>
  environment: EnvironmentKey | null
  createdDaysAgo: number
  updatedHoursAgo?: number
}

export const TERMINAL_FIRMWARE_CODE = "TERMINAL_FIRMWARE"

const FULL_PERMISSIONS: readonly string[] = ProductPermissions

const CLIENT_PERMISSIONS = [
  "account.read",
  "license.validate",
  "license.read",
  "machine.create",
  "machine.read",
  "machine.delete",
  "release.download",
  "release.read",
]

const DESKTOP_PLATFORMS = ["Windows", "macOS", "Linux"]

const PRODUCT_SEEDS: readonly ProductSeed[] = [
  {
    ...MOCK_PRODUCTS.wallet,
    platforms: DESKTOP_PLATFORMS,
    permissions: FULL_PERMISSIONS,
    metadata: {
      category: "Core",
      description:
        "Desktop wallet for Ecoin balances, transfers and offline key storage.",
    },
    environment: null,
    createdDaysAgo: 400,
    updatedHoursAgo: 5,
  },
  {
    ...MOCK_PRODUCTS.archive,
    platforms: DESKTOP_PLATFORMS,
    permissions: FULL_PERMISSIONS,
    metadata: {
      category: "Archival",
      description:
        "Records retention and archival server for regulated document storage.",
    },
    environment: null,
    createdDaysAgo: 371,
  },
  {
    ...MOCK_PRODUCTS.gateway,
    platforms: DESKTOP_PLATFORMS,
    permissions: CLIENT_PERMISSIONS,
    metadata: {
      category: "Payments",
      description:
        "Payment and settlement gateway for bank branches and merchant sites.",
    },
    environment: null,
    createdDaysAgo: 338,
  },
  {
    name: "Terminal Firmware",
    code: TERMINAL_FIRMWARE_CODE,
    distributionStrategy: "LICENSED",
    url: null,
    platforms: ["Linux"],
    permissions: [],
    metadata: {},
    environment: "production",
    createdDaysAgo: 19,
  },
]

export function seedMockProducts(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const account = seed.accountRef()

  for (const product of PRODUCT_SEEDS) {
    const created = seed.daysAgo(product.createdDaysAgo, 4)
    const updated =
      product.updatedHoursAgo != null
        ? seed.hoursAgo(product.updatedHoursAgo, 2)
        : seed.rng.chance(0.6)
          ? seed.later(created, 120)
          : created

    seed.insert(
      "products",
      {
        name: product.name,
        code: product.code,
        distributionStrategy: product.distributionStrategy,
        url: product.url,
        platforms: [...product.platforms],
        permissions: [...product.permissions],
        metadata: { ...product.metadata },
      },
      { account, environment: seed.environmentRef(product.environment) },
      { id: product.id, created, updated },
    )
  }
}
