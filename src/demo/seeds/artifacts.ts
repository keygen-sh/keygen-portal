import type { Linkage, MockRow } from "@/demo/server/types"
import { newestFirst, oldestFirst } from "@/demo/server/store"
import type { SeedContext } from "./context"
import { MOCK_RELEASES } from "./universe"

const KIB = 1024
const MIB = 1024 * KIB
const WAITING = "WAITING"
const UPLOADED = "UPLOADED"
const FAILED = "FAILED"
const DRAFT = "DRAFT"
const FIRMWARE_PRODUCT_CODE = "TERMINAL_FIRMWARE"
const OTHER_ARTIFACT_BUDGET = 14
const WAITING_COUNT = 2
const FAILED_COUNT = 2

interface Build {
  filename: (slug: string, version: string) => string
  filetype: string | null
  platform: string | null
  arch: string | null
  minBytes: number
  maxBytes: number
}

interface ArtifactPlan {
  release: MockRow
  build: Build
  status: string
  created: string
}

const DARWIN_ARM64: Build = {
  filename: (slug, version) => `${slug}-${version}-darwin-arm64.dmg`,
  filetype: "dmg",
  platform: "darwin",
  arch: "arm64",
  minBytes: 58 * MIB,
  maxBytes: 140 * MIB,
}

const DARWIN_X86_64: Build = {
  filename: (slug, version) => `${slug}-${version}-darwin-x86_64.dmg`,
  filetype: "dmg",
  platform: "darwin",
  arch: "x86_64",
  minBytes: 60 * MIB,
  maxBytes: 150 * MIB,
}

const WINDOWS_X86_64: Build = {
  filename: (slug, version) => `${slug}-${version}-windows-x86_64.msi`,
  filetype: "msi",
  platform: "windows",
  arch: "x86_64",
  minBytes: 45 * MIB,
  maxBytes: 120 * MIB,
}

const WINDOWS_ARM64: Build = {
  filename: (slug, version) => `${slug}-${version}-windows-arm64.msi`,
  filetype: "msi",
  platform: "windows",
  arch: "arm64",
  minBytes: 42 * MIB,
  maxBytes: 110 * MIB,
}

const FREEBSD_X86_64_TARBALL: Build = {
  filename: (slug, version) => `${slug}-${version}-freebsd-x86_64.tar.gz`,
  filetype: "tar.gz",
  platform: "freebsd",
  arch: "x86_64",
  minBytes: 26 * MIB,
  maxBytes: 80 * MIB,
}

const WHEEL: Build = {
  filename: (slug, version) =>
    `${slug.replace(/-/g, "_")}-${version}-py3-none-any.whl`,
  filetype: "whl",
  platform: null,
  arch: null,
  minBytes: 400 * KIB,
  maxBytes: 6 * MIB,
}

const SDIST: Build = {
  filename: (slug, version) => `${slug.replace(/-/g, "_")}-${version}.tar.gz`,
  filetype: "tar.gz",
  platform: null,
  arch: null,
  minBytes: 300 * KIB,
  maxBytes: 4 * MIB,
}

const FIRMWARE_ARM64: Build = {
  filename: (slug, version) => `${slug}-${version}-arm64.bin`,
  filetype: "bin",
  platform: null,
  arch: "arm64",
  minBytes: 12 * MIB,
  maxBytes: 40 * MIB,
}

const FIRMWARE_ARM: Build = {
  filename: (slug, version) => `${slug}-${version}-arm.bin`,
  filetype: "bin",
  platform: null,
  arch: "arm",
  minBytes: 8 * MIB,
  maxBytes: 26 * MIB,
}

const SHA256SUMS: Build = {
  filename: () => "SHA256SUMS",
  filetype: null,
  platform: null,
  arch: null,
  minBytes: 320,
  maxBytes: 960,
}

const DESKTOP_BUILDS: readonly Build[] = [
  DARWIN_ARM64,
  DARWIN_X86_64,
  WINDOWS_X86_64,
  WINDOWS_ARM64,
  FREEBSD_X86_64_TARBALL,
  SHA256SUMS,
]

const PYTHON_BUILDS: readonly Build[] = [WHEEL, SDIST, SHA256SUMS]

const FIRMWARE_BUILDS: readonly Build[] = [
  FIRMWARE_ARM64,
  FIRMWARE_ARM,
  SHA256SUMS,
]

const PLATFORM_NAMES: Readonly<Record<string, string | null>> = {
  darwin: "macOS",
  windows: "Windows",
  freebsd: null,
}

const ARCH_NAMES: Readonly<Record<string, string | null>> = {
  arm64: "ARM64",
  x86_64: "x86-64",
  arm: "ARM",
}

function uniqueRows(rows: readonly MockRow[]): MockRow[] {
  const seen = new Set<string>()
  return rows.filter((row) => {
    if (seen.has(row.id)) return false
    seen.add(row.id)
    return true
  })
}

function distinctIso(used: Set<string>, iso: string): string {
  let candidate = iso
  while (used.has(candidate)) {
    candidate = new Date(Date.parse(candidate) + 1).toISOString()
  }
  used.add(candidate)
  return candidate
}

function packageFor(seed: SeedContext, release: MockRow): MockRow | null {
  const packageId = release.refs.package?.id
  if (packageId == null) return null
  return seed.store.table("packages").get(packageId) ?? null
}

function productFor(seed: SeedContext, release: MockRow): MockRow | null {
  const productId = release.refs.product?.id
  if (productId == null) return null
  return seed.store.table("products").get(productId) ?? null
}

function slugFor(seed: SeedContext, release: MockRow): string {
  const packageKey = packageFor(seed, release)?.attributes.key
  const productCode = productFor(seed, release)?.attributes.code
  const raw =
    typeof packageKey === "string"
      ? packageKey
      : typeof productCode === "string"
        ? productCode
        : "ecoin"

  return raw
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function catalogFor(seed: SeedContext, release: MockRow): readonly Build[] {
  if (packageFor(seed, release)?.attributes.engine === "pypi") {
    return PYTHON_BUILDS
  }
  if (productFor(seed, release)?.attributes.code === FIRMWARE_PRODUCT_CODE) {
    return FIRMWARE_BUILDS
  }
  return DESKTOP_BUILDS
}

function ed25519Signature(seed: SeedContext): string {
  const bytes = Array.from({ length: 64 }, () => seed.rng.int(0, 255))
  return btoa(String.fromCharCode(...bytes)).replace(/=+$/, "")
}

function metadataFor(seed: SeedContext, build: Build): Record<string, unknown> {
  if (build === WHEEL || build === SDIST) {
    return { requires: { python: ">=3.10" }, sha256: seed.rng.hex(64) }
  }

  return seed.rng.weighted<Record<string, unknown>>([
    [{}, 6],
    [
      {
        sha256: seed.rng.hex(64),
        notarized: build.platform === "darwin",
        buildNumber: seed.rng.int(4100, 5300),
      },
      2,
    ],
    [
      {
        signedBy: "ci@ecorp.example",
        notes: "Signed with the E Corp release key.",
      },
      1,
    ],
  ])
}

function releaseWindowCreated(seed: SeedContext, release: MockRow): string {
  return seed.between(release.created, seed.later(release.created, 3))
}

function ensureLookupRows(
  seed: SeedContext,
  type: string,
  parents: readonly MockRow[],
  attribute: string,
  names: Readonly<Record<string, string | null>>,
  account: Linkage,
): void {
  const earliest = new Map<string, string>()
  for (const parent of oldestFirst([...parents])) {
    const key = parent.attributes[attribute]
    if (typeof key !== "string" || key === "" || earliest.has(key)) continue
    earliest.set(key, parent.created)
  }
  for (const key of Object.keys(names)) {
    if (!earliest.has(key)) earliest.set(key, seed.daysAgo(330, 40))
  }

  for (const [key, created] of earliest) {
    if (seed.rows(type).some((row) => row.attributes.key === key)) continue
    seed.insert(
      type,
      { key, name: names[key] ?? null },
      { account },
      { created },
    )
  }
}

export function seedMockArtifacts(seed: SeedContext): void {
  if (seed.profile === "fresh") return

  const account = seed.accountRef()
  const releases = oldestFirst(seed.rows("releases"))
  const hero = releases.find(
    (release) => release.id === MOCK_RELEASES.walletStable.id,
  )
  const others = releases.filter((release) => release !== hero)
  const usedBuilds = new Map<string, Set<Build>>()
  const plans: ArtifactPlan[] = []

  const claim = (release: MockRow, build: Build): void => {
    const used = usedBuilds.get(release.id) ?? new Set<Build>()
    used.add(build)
    usedBuilds.set(release.id, used)
  }
  const unusedBuild = (release: MockRow, offset: number): Build | undefined => {
    const catalog = catalogFor(seed, release)
    for (let step = 0; step < catalog.length; step++) {
      const build = catalog[(offset + step) % catalog.length]
      if (!usedBuilds.get(release.id)?.has(build)) return build
    }
    return undefined
  }

  if (hero) {
    for (const build of catalogFor(seed, hero)) {
      claim(hero, build)
      plans.push({
        release: hero,
        build,
        status: UPLOADED,
        created: releaseWindowCreated(seed, hero),
      })
    }
  }

  let budget = OTHER_ARTIFACT_BUDGET
  while (budget > 0) {
    let spent = 0
    for (let index = 0; index < others.length; index++) {
      if (budget <= 0) break
      const release = others[index]
      const catalog = catalogFor(seed, release)
      const offset = index % Math.max(1, catalog.length - 1)
      const build = unusedBuild(release, offset)
      if (!build) continue
      claim(release, build)
      plans.push({
        release,
        build,
        status: UPLOADED,
        created: releaseWindowCreated(seed, release),
      })
      budget -= 1
      spent += 1
    }
    if (spent === 0) break
  }

  const drafts = newestFirst(
    releases.filter((release) => release.attributes.status === DRAFT),
  )
  const waitingHosts = uniqueRows([...drafts, ...newestFirst(releases)]).slice(
    0,
    WAITING_COUNT,
  )
  for (const release of waitingHosts) {
    const build = unusedBuild(release, seed.rng.int(0, 2))
    if (!build) continue
    claim(release, build)
    plans.push({
      release,
      build,
      status: WAITING,
      created: seed.minutesAgo(6, 40),
    })
  }

  const failedHosts = seed.rng.sample(
    releases.filter(
      (release) =>
        !waitingHosts.includes(release) && unusedBuild(release, 0) != null,
    ),
    FAILED_COUNT,
  )
  for (const release of failedHosts) {
    const build = unusedBuild(release, seed.rng.int(0, 2))
    if (!build) continue
    claim(release, build)
    plans.push({
      release,
      build,
      status: FAILED,
      created: seed.hoursAgo(5, 30),
    })
  }

  const usedTimestamps = new Set<string>()
  const inserted: MockRow[] = []

  for (const plan of plans) {
    const { release, build, status } = plan
    const version =
      typeof release.attributes.version === "string"
        ? release.attributes.version
        : "0.0.0"
    const created = distinctIso(usedTimestamps, plan.created)
    const uploaded = status === UPLOADED
    const isHero = release.id === MOCK_RELEASES.walletStable.id
    const filesize =
      status === WAITING || (!isHero && seed.rng.chance(0.06))
        ? null
        : seed.rng.int(build.minBytes, build.maxBytes)
    const signed = uploaded && (isHero || seed.rng.chance(0.85))

    inserted.push(
      seed.insert(
        "artifacts",
        {
          filename: build.filename(slugFor(seed, release), version),
          filetype: build.filetype,
          filesize,
          platform: build.platform,
          arch: build.arch,
          signature: signed ? ed25519Signature(seed) : null,
          checksum: signed ? seed.rng.hex(64) : null,
          status,
          metadata: uploaded ? metadataFor(seed, build) : {},
        },
        {
          account,
          environment: release.refs.environment ?? null,
          release: { type: "releases", id: release.id },
        },
        {
          created,
          updated:
            uploaded && seed.rng.chance(0.3)
              ? seed.later(created, 20)
              : created,
        },
      ),
    )
  }

  ensureLookupRows(
    seed,
    "platforms",
    inserted,
    "platform",
    PLATFORM_NAMES,
    account,
  )
  ensureLookupRows(seed, "arches", inserted, "arch", ARCH_NAMES, account)
  ensureLookupRows(seed, "channels", releases, "channel", {}, account)
  ensureLookupRows(
    seed,
    "engines",
    seed.rows("packages"),
    "engine",
    {},
    account,
  )
}
