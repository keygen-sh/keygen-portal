import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export enum ReleaseMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum ReleaseView {
  List = "list",
  Details = "details",
}

export enum ReleaseStatus {
  Draft = "DRAFT",
  Published = "PUBLISHED",
  Yanked = "YANKED",
}

export enum ReleaseChannel {
  Stable = "stable",
  Rc = "rc",
  Beta = "beta",
  Alpha = "alpha",
  Dev = "dev",
}

export type Semver = {
  major: number
  minor: number
  patch: number
  prerelease: string | null
  build: string | null
}

export type ReleaseAttributes = {
  name: string | null
  description: string | null
  channel: ReleaseChannel
  status: ReleaseStatus
  tag: string | null
  version: string
  semver: Semver
  metadata: Record<string, unknown>
  created: string
  updated: string
  backdated: string | null
  yanked: string | null
}

export type ReleaseRelationships = {
  account: Relationship<Linkage<"accounts">>
  product: Relationship<Linkage<"products">>
  package: Relationship<Linkage<"packages">>
  constraints: Relationship<Linkage<"constraints">[]>
}

export type Release = Resource<
  "releases",
  ReleaseAttributes,
  ReleaseRelationships
>

export type ReleaseResponse = APIResponse<Release>
export type ReleasesListResponse = APIResponse<Release[]>

export type ReleaseFilters = {
  status?: string
  channel?: string
  product?: string
  package?: string
  engine?: string
  entitlements?: string[]
}

export type ReleaseConstraintRelationships = {
  account: Relationship<Linkage<"accounts">>
  release: Relationship<Linkage<"releases">>
  entitlement: Relationship<Linkage<"entitlements">>
}

export type ReleaseConstraint = Resource<
  "constraints",
  Record<string, never>,
  ReleaseConstraintRelationships
>

export type ReleaseConstraintListResponse = APIResponse<ReleaseConstraint[]>

export const ReleaseAttributeDescriptions: Readonly<
  Record<keyof Writable<ReleaseAttributes>, string>
> = {
  name: "The human-readable name of the release.",
  description:
    "The description of the release. Useful for release notes and the like.",
  channel:
    "The channel for the release. One of: stable, rc, beta, alpha, or dev.",
  status:
    "The release's status. Draft and yanked releases are unlisted. One of: Draft, Published, or Yanked.",
  tag: "The tag for the release, used for lookups.",
  version: "The version of the release.",
  semver: "An object containing deconstructed key-value semver components.",
  metadata:
    "This can be used to store things such as hash checksums, e.g. SHA-256 and SHA-512, for integrity verification after download, or for release notes.",
  backdated:
    "When the release was backdated to. This can be used to e.g. allow expired licenses under a Maintain Access or Restrict Access expiration strategy to access new patch releases.",
  yanked: "When the release was yanked.",
} as const

export const ReleaseFormFieldDescriptions: Readonly<
  typeof ReleaseAttributeDescriptions & {
    product: string
    constraints: string
    packages: string
  }
> = {
  ...ReleaseAttributeDescriptions,
  tag: "The tag for the release, used for lookups. This can be an arbitrary string, e.g. latest or app@latest, or something reproducible, such as an MD5 or other checksum, to prevent duplicates. This value must be unique per-product and per-package.",
  version:
    "The version of the release. This must be a valid semantic version (semver) string. Do not include a v prefix. This value must be unique per-product. The version may include prerelease and build tags.",
  product: "The product this release belongs to.",
  constraints: "Constraints require licenses have certain entitlements.",
  packages: "The package this release belongs to.",
}

export const ReleaseCreateFormFieldDescriptions: typeof ReleaseFormFieldDescriptions =
  {
    ...ReleaseFormFieldDescriptions,
  }

export const ReleaseEditFormFieldDescriptions: typeof ReleaseFormFieldDescriptions =
  {
    ...ReleaseFormFieldDescriptions,
  }

export const ReleaseChannelDescriptions: Readonly<
  Record<ReleaseChannel, string>
> = {
  [ReleaseChannel.Stable]: "Production-ready releases.",
  [ReleaseChannel.Rc]: "Release candidates for final testing.",
  [ReleaseChannel.Beta]: "Beta releases for broader testing.",
  [ReleaseChannel.Alpha]: "Alpha releases for early testing.",
  [ReleaseChannel.Dev]: "Development releases for internal use.",
} as const

export const ReleaseChannelLabels: Readonly<Record<ReleaseChannel, string>> = {
  [ReleaseChannel.Stable]: "Stable",
  [ReleaseChannel.Rc]: "RC",
  [ReleaseChannel.Beta]: "Beta",
  [ReleaseChannel.Alpha]: "Alpha",
  [ReleaseChannel.Dev]: "Dev",
} as const

export const ReleaseStatusDescriptions: Readonly<
  Record<ReleaseStatus, string>
> = {
  [ReleaseStatus.Draft]:
    "Release is a draft and is not yet accessible to licensees.",
  [ReleaseStatus.Published]:
    "Release is published and accessible to licensees.",
  [ReleaseStatus.Yanked]:
    "Release has been yanked and is no longer accessible.",
} as const

export const ReleaseStatusLabels: Readonly<Record<ReleaseStatus, string>> = {
  [ReleaseStatus.Draft]: "Draft",
  [ReleaseStatus.Published]: "Published",
  [ReleaseStatus.Yanked]: "Yanked",
} as const

export const ReleaseStatusVariants: Readonly<
  Record<
    ReleaseStatus,
    "default" | "secondary" | "destructive" | "outline" | "disabled"
  >
> = {
  [ReleaseStatus.Draft]: "secondary",
  [ReleaseStatus.Published]: "secondary",
  [ReleaseStatus.Yanked]: "disabled",
} as const
