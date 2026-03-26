import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export enum PackageMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum PackageView {
  List = "list",
  Details = "details",
}

export enum PackageEngine {
  PyPI = "pypi",
  Tauri = "tauri",
  RubyGems = "rubygems",
  Npm = "npm",
  OCI = "oci",
  Raw = "raw",
}

export type PackageAttributes = {
  name: string
  key: string
  engine: PackageEngine | null
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export type PackageRelationships = {
  account: Relationship<Linkage<"accounts">>
  product: Relationship<Linkage<"products">>
}

export type Package = Resource<
  "packages",
  PackageAttributes,
  PackageRelationships
>

export type PackageResponse = APIResponse<Package>
export type PackagesListResponse = APIResponse<Package[]>

export const PackageAttributeDescriptions: Readonly<
  Record<keyof Writable<PackageAttributes>, string>
> = {
  name: "The human-readable name of the package.",
  key: "The machine-readable key of the package.",
  engine:
    "The package distribution engine. One of: pypi, tauri, rubygems, npm, oci, or raw.",
  metadata:
    "This can be used to store arbitrary key-value data for the package, e.g. for book keeping or display purposes.",
} as const

export const PackageFormFieldDescriptions: Readonly<
  typeof PackageAttributeDescriptions & {
    product: string
  }
> = {
  ...PackageAttributeDescriptions,
  key: "The machine-readable key of the package. This must be unique per-product.",
  product: "The product this package belongs to.",
}

export const PackageCreateFormFieldDescriptions: typeof PackageFormFieldDescriptions =
  {
    ...PackageFormFieldDescriptions,
  }

export const PackageEditFormFieldDescriptions: typeof PackageFormFieldDescriptions =
  {
    ...PackageFormFieldDescriptions,
  }

export const PackageEngineDescriptions: Readonly<
  Record<PackageEngine, string>
> = {
  [PackageEngine.PyPI]:
    "Python packages that can be built and installed via our PyPI package API.",
  [PackageEngine.Tauri]:
    "Desktop applications built with Tauri, compatible with Tauri's native auto-updater via our Tauri distribution API.",
  [PackageEngine.RubyGems]:
    "Ruby packages that can be built and installed via our RubyGems API.",
  [PackageEngine.Npm]:
    "JavaScript packages that can be built and installed via our npm package API.",
  [PackageEngine.OCI]:
    "Container images that can be built and installed via OCI-compatible tooling such as Docker CLI using our OCI registry.",
  [PackageEngine.Raw]:
    "Other types of artifacts, such as binaries, tarballs, text files, scripts, etc., which can be downloaded via our distribution API.",
} as const

export const PackageEngineLabels: Readonly<Record<PackageEngine, string>> = {
  [PackageEngine.PyPI]: "PyPI",
  [PackageEngine.Tauri]: "Tauri",
  [PackageEngine.RubyGems]: "RubyGems",
  [PackageEngine.Npm]: "npm",
  [PackageEngine.OCI]: "OCI",
  [PackageEngine.Raw]: "Other",
} as const
