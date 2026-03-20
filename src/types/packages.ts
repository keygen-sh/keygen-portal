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
  name: string | null
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
  [PackageEngine.PyPI]: "Python packages distributed via PyPI.",
  [PackageEngine.Tauri]: "Desktop applications built with Tauri.",
  [PackageEngine.RubyGems]: "Ruby packages distributed via RubyGems.",
  [PackageEngine.Npm]: "JavaScript packages distributed via npm.",
  [PackageEngine.OCI]: "Container images distributed via OCI registries.",
  [PackageEngine.Raw]: "Raw package distribution.",
} as const

export const PackageEngineLabels: Readonly<Record<PackageEngine, string>> = {
  [PackageEngine.PyPI]: "PyPI",
  [PackageEngine.Tauri]: "Tauri",
  [PackageEngine.RubyGems]: "RubyGems",
  [PackageEngine.Npm]: "npm",
  [PackageEngine.OCI]: "OCI",
  [PackageEngine.Raw]: "Raw",
} as const
