import type { LucideIcon } from "lucide-react"

import type { LicenseFilters } from "@/types/licenses"
import type { UserFilters } from "@/types/users"
import type { MachineFilters } from "@/types/machines"
import type { ReleaseFilters } from "@/types/releases"
import type { ArtifactFilters } from "@/types/artifacts"

export type CommandSearchResource =
  | "licenses"
  | "groups"
  | "users"
  | "machines"
  | "entitlements"
  | "products"
  | "policies"
  | "releases"

export type FilterableResource = CommandSearchResource | "artifacts"

export enum DialogKey {
  License = "license",
  User = "user",
  Group = "group",
  Policy = "policy",
  Product = "product",
  Package = "package",
  Release = "release",
}

export interface AccountAction {
  id: string
  label: string
  icon: LucideIcon
  to: string
  cloudOnly?: boolean
}

export interface CreateAction {
  key: DialogKey
  label: string
  icon: LucideIcon
}

interface RecentItemBase {
  id: string
  label: string
}

export type RecentItem =
  | (RecentItemBase & { kind: "resource"; resource: CommandSearchResource })
  | (RecentItemBase & { kind: "preset"; presetId: string })
  | (RecentItemBase & { kind: "create"; dialog: DialogKey })

export interface FilterPresetBase {
  id: string
  label: string
  icon: LucideIcon
}

export type FilterPreset =
  | (FilterPresetBase & { type: "licenses"; search: LicenseFilters })
  | (FilterPresetBase & { type: "users"; search: UserFilters })
  | (FilterPresetBase & { type: "machines"; search: MachineFilters })
  | (FilterPresetBase & { type: "releases"; search: ReleaseFilters })
  | (FilterPresetBase & { type: "artifacts"; search: ArtifactFilters })

export type Keyword =
  | "type"
  | "id"
  | "name"
  | "key"
  | "email"
  | "firstName"
  | "lastName"
  | "fullName"
  | "fingerprint"
  | "code"
  | "version"
  | "tag"
  | "role"
  | "metadata"
  | "owner"
  | "user"

export type FieldKeyword = Exclude<Keyword, "type">

export interface SearchChip {
  keyword: Keyword
  value: string
}

export interface ParsedSearch {
  type: CommandSearchResource | null
  fields: Partial<Record<FieldKeyword, string>>
  freeTerm: string | null
}

export interface SearchInputState {
  chips: SearchChip[]
  pending: Keyword | null
  text: string
}
