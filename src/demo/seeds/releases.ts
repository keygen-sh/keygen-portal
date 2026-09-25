import type { Linkage, MockRow } from "@/demo/server/types"
import type { EnvironmentKey, SeedContext } from "./context"
import { ensureLookupRow } from "./packages"
import {
  MOCK_ENTITLEMENTS,
  MOCK_PACKAGES,
  MOCK_PRODUCTS,
  MOCK_RELEASES,
} from "./universe"

type ReleaseStatus = "DRAFT" | "PUBLISHED" | "YANKED"

interface ReleaseBlueprint {
  id?: string
  name: string | null
  description: string | null
  version: string
  channel: string
  status: ReleaseStatus
  tag: string | null
  backdatedDaysAgo: number | null
  metadata: Record<string, unknown>
  productCode: string
  packageKey: string | null
  environment: EnvironmentKey | null
  constraints: readonly string[]
  created: string
}

const ARCHIVE_PACKAGE_KEY = "archive-sdk"
const GATEWAY_PACKAGE_KEY = "@ecorp/gateway"
const TERMINAL_PACKAGE_KEY = "terminal-firmware"
const TERMINAL_PRODUCT_CODE = "TERMINAL_FIRMWARE"

const WALLET_6_0_CHANGELOG = `## Ecoin Wallet 6.0

Major release of the desktop wallet client.

### Added
- Balance reconciliation pipeline v2 with sub-second settlement
- Hardware Keys attestation for all managed workstations
- Offline transaction cache for disconnected branches

### Changed
- Encryption at Rest profiles now persist across restarts
- Reduced cold-start time by 38%

### Fixed
- Ledger view flicker on account switching
- Heartbeat race during rapid session handoff`

const WALLET_6_1_CHANGELOG = `## Ecoin Wallet 6.1

Withdrawn on request from affected accounts. Upgrade to 6.2.

### Known issues
- Reconciliation replays a settled batch when a workstation reconnects
- Ledger export truncates transfers above 50,000 rows`

const WALLET_6_2_CHANGELOG = `## Ecoin Wallet 6.2

### Added
- High Availability relay discovery
- Role-Based Access Control conflict resolution

### Fixed
- Transfer retry timing under sustained load
- Memory leak in the telemetry uploader`

const ARCHIVE_1_9_CHANGELOG = `## Enterprise Archive SDK 1.9

### Added
- Retention policy templates for multi-site deployments
- Ledger Export streaming with resumable cursors

### Changed
- Archive verification now runs incrementally

### Fixed
- Chunked upload retries against slow storage backends`

const TERMINAL_1_4_CHANGELOG = `## Terminal Firmware 1.4.2

Maintenance build for the payment terminal fleet.

### Fixed
- Card reader timeout during contactless retries
- Clock drift after an extended power loss

### Security
- Rotated the attestation chain to the current signing key`

function sha256(seed: SeedContext): string {
  return seed.rng.hex(64)
}

function sha512(seed: SeedContext): string {
  return seed.rng.hex(128)
}

function blueprints(seed: SeedContext): ReleaseBlueprint[] {
  return [
    {
      name: "Ecoin Wallet 6.0",
      description: WALLET_6_0_CHANGELOG,
      version: "6.0.0",
      channel: "stable",
      status: "PUBLISHED",
      tag: null,
      backdatedDaysAgo: 420,
      metadata: { sha256: sha256(seed), sha512: sha512(seed) },
      productCode: MOCK_PRODUCTS.wallet.code,
      packageKey: MOCK_PACKAGES.wallet.key,
      environment: null,
      constraints: [],
      created: seed.daysAgo(310, 3),
    },
    {
      name: "Ecoin Wallet 6.1",
      description: WALLET_6_1_CHANGELOG,
      version: "6.1.0",
      channel: "stable",
      status: "YANKED",
      tag: null,
      backdatedDaysAgo: 260,
      metadata: { sha256: sha256(seed) },
      productCode: MOCK_PRODUCTS.wallet.code,
      packageKey: MOCK_PACKAGES.wallet.key,
      environment: null,
      constraints: [],
      created: seed.daysAgo(212, 4),
    },
    {
      id: MOCK_RELEASES.walletStable.id,
      name: "Ecoin Wallet 6.2",
      description: WALLET_6_2_CHANGELOG,
      version: MOCK_RELEASES.walletStable.version,
      channel: "stable",
      status: "PUBLISHED",
      tag: "latest",
      backdatedDaysAgo: null,
      metadata: { sha256: sha256(seed), minimumOsVersion: "12.0" },
      productCode: MOCK_PRODUCTS.wallet.code,
      packageKey: MOCK_PACKAGES.wallet.key,
      environment: null,
      constraints: [],
      created: seed.daysAgo(96, 2),
    },
    {
      name: "Ecoin Wallet 6.3 Beta 2",
      description:
        "Beta of the 6.3 line. Requires Encryption at Rest and Hardware Keys entitlements.",
      version: "6.3.0-beta.2",
      channel: "beta",
      status: "PUBLISHED",
      tag: null,
      backdatedDaysAgo: null,
      metadata: {},
      productCode: MOCK_PRODUCTS.wallet.code,
      packageKey: MOCK_PACKAGES.wallet.key,
      environment: null,
      constraints: [
        MOCK_ENTITLEMENTS.encryptionAtRest.code,
        MOCK_ENTITLEMENTS.hardwareKeys.code,
      ],
      created: seed.daysAgo(23, 1),
    },
    {
      name: "Ecoin Wallet 6.3 RC 1",
      description:
        "Release candidate for the 6.3 line. Staged for internal validation before the beta channel promotion.",
      version: "6.3.0-rc.1",
      channel: "rc",
      status: "DRAFT",
      tag: null,
      backdatedDaysAgo: null,
      metadata: { buildNumber: 5218, reviewers: ["release-eng@ecorp.example"] },
      productCode: MOCK_PRODUCTS.wallet.code,
      packageKey: MOCK_PACKAGES.wallet.key,
      environment: null,
      constraints: [],
      created: seed.daysAgo(7, 1),
    },
    {
      name: "Enterprise Archive SDK 1.9",
      description: ARCHIVE_1_9_CHANGELOG,
      version: "1.9.0",
      channel: "stable",
      status: "PUBLISHED",
      tag: "latest",
      backdatedDaysAgo: null,
      metadata: { sha256: sha256(seed), requiresPython: ">=3.10" },
      productCode: MOCK_PRODUCTS.archive.code,
      packageKey: ARCHIVE_PACKAGE_KEY,
      environment: null,
      constraints: [
        MOCK_ENTITLEMENTS.encryptionAtRest.code,
        MOCK_ENTITLEMENTS.ledgerExport.code,
      ],
      created: seed.daysAgo(184, 4),
    },
    {
      name: "Enterprise Archive SDK 2.0 RC 1",
      description: "Release candidate for the Archive 2.0 retention engine.",
      version: "2.0.0-rc.1",
      channel: "rc",
      status: "DRAFT",
      tag: null,
      backdatedDaysAgo: null,
      metadata: { experimental: true },
      productCode: MOCK_PRODUCTS.archive.code,
      packageKey: ARCHIVE_PACKAGE_KEY,
      environment: null,
      constraints: [],
      created: seed.daysAgo(4, 1),
    },
    {
      name: "Gateway Client 3.1",
      description:
        "Yanked: settlement handshake regression on mixed-version deployments.",
      version: "3.1.0",
      channel: "stable",
      status: "YANKED",
      tag: null,
      backdatedDaysAgo: null,
      metadata: {},
      productCode: MOCK_PRODUCTS.gateway.code,
      packageKey: GATEWAY_PACKAGE_KEY,
      environment: null,
      constraints: [],
      created: seed.daysAgo(150, 3),
    },
    {
      name: "Gateway Client 3.2",
      description:
        "Settlement handshake fix plus relay failover for merchant sites running mixed client versions.",
      version: "3.2.0",
      channel: "stable",
      status: "PUBLISHED",
      tag: "latest",
      backdatedDaysAgo: null,
      metadata: { sha256: sha256(seed), requiresNode: ">=20" },
      productCode: MOCK_PRODUCTS.gateway.code,
      packageKey: GATEWAY_PACKAGE_KEY,
      environment: null,
      constraints: [MOCK_ENTITLEMENTS.highAvailability.code],
      created: seed.daysAgo(88, 2),
    },
    {
      name: "Gateway Client 4.0 Alpha 1",
      description:
        "Early preview of the 4.0 client. Interfaces are still changing and are not covered by support.",
      version: "4.0.0-alpha.1",
      channel: "alpha",
      status: "PUBLISHED",
      tag: null,
      backdatedDaysAgo: null,
      metadata: { experimental: true, buildNumber: 4472 },
      productCode: MOCK_PRODUCTS.gateway.code,
      packageKey: GATEWAY_PACKAGE_KEY,
      environment: null,
      constraints: [],
      created: seed.daysAgo(16, 2),
    },
    {
      name: "Terminal Firmware 1.4.2",
      description: TERMINAL_1_4_CHANGELOG,
      version: "1.4.2",
      channel: "stable",
      status: "PUBLISHED",
      tag: "latest",
      backdatedDaysAgo: null,
      metadata: { sha256: sha256(seed), bootloader: "2.4.1" },
      productCode: TERMINAL_PRODUCT_CODE,
      packageKey: TERMINAL_PACKAGE_KEY,
      environment: "production",
      constraints: [],
      created: seed.daysAgo(58, 3),
    },
    {
      name: "Terminal Firmware 1.5.0 RC 1",
      description:
        "Release candidate for the 1.5 firmware line. Staged in the production environment for fleet validation.",
      version: "1.5.0-rc.1",
      channel: "rc",
      status: "DRAFT",
      tag: null,
      backdatedDaysAgo: null,
      metadata: {},
      productCode: TERMINAL_PRODUCT_CODE,
      packageKey: null,
      environment: "production",
      constraints: [],
      created: seed.daysAgo(9, 1),
    },
  ]
}

function isCompatible(
  parent: Linkage | null | undefined,
  environment: Linkage | null,
): boolean {
  return parent == null || parent.id === environment?.id
}

function findPackage(seed: SeedContext, key: string | null): MockRow | null {
  if (key == null) return null
  return seed.rows("packages").find((row) => row.attributes.key === key) ?? null
}

function findProduct(seed: SeedContext, code: string): MockRow {
  const products = seed.rows("products")
  return products.find((row) => row.attributes.code === code) ?? products[0]
}

function compatibleEntitlements(
  seed: SeedContext,
  codes: readonly string[],
  environment: Linkage | null,
): MockRow[] {
  const rows = seed.rows("entitlements")

  return codes.flatMap((code) => {
    const row = rows.find((candidate) => candidate.attributes.code === code)
    if (!row || !isCompatible(row.refs.environment, environment)) return []
    return [row]
  })
}

function timestamps(
  seed: SeedContext,
  blueprint: ReleaseBlueprint,
): { updated: string; yanked: string | null } {
  if (blueprint.status === "YANKED") {
    const yanked = seed.later(blueprint.created, 45)
    return { updated: yanked, yanked }
  }
  if (blueprint.status === "PUBLISHED") {
    return { updated: seed.later(blueprint.created, 20), yanked: null }
  }
  return {
    updated: seed.rng.chance(0.5)
      ? seed.later(blueprint.created, 3)
      : blueprint.created,
    yanked: null,
  }
}

export function seedMockReleases(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const account = seed.accountRef()

  for (const blueprint of blueprints(seed)) {
    const environment = seed.environmentRef(blueprint.environment)
    const pkg = findPackage(seed, blueprint.packageKey)
    const productId =
      pkg?.refs.product?.id ?? findProduct(seed, blueprint.productCode).id
    const { updated, yanked } = timestamps(seed, blueprint)

    const release = seed.insert(
      "releases",
      {
        name: blueprint.name,
        description: blueprint.description,
        version: blueprint.version,
        channel: blueprint.channel,
        status: blueprint.status,
        tag: blueprint.tag,
        backdated:
          blueprint.backdatedDaysAgo != null
            ? seed.daysAgo(blueprint.backdatedDaysAgo, 5)
            : null,
        yanked,
        metadata: { ...blueprint.metadata },
      },
      {
        account,
        environment,
        product: { type: "products", id: productId },
        package: pkg ? { type: "packages", id: pkg.id } : null,
      },
      { id: blueprint.id, created: blueprint.created, updated },
    )

    ensureLookupRow(seed, "channels", blueprint.channel, blueprint.created)

    for (const entitlement of compatibleEntitlements(
      seed,
      blueprint.constraints,
      environment,
    )) {
      seed.insert(
        "constraints",
        {},
        {
          account,
          environment,
          release: { type: "releases", id: release.id },
          entitlement: { type: "entitlements", id: entitlement.id },
        },
        { created: seed.later(release.created, 1) },
      )
    }
  }
}
