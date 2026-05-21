import type { LucideIcon } from "lucide-react"

import type { LicenseFilters } from "@/types/licenses"
import type { UserFilters } from "@/types/users"
import type { MachineFilters } from "@/types/machines"
import type { ReleaseFilters } from "@/types/releases"
import type { ArtifactFilters } from "@/types/artifacts"

export const COMMAND_SEARCH_RESOURCES = [
  "licenses",
  "groups",
  "users",
  "machines",
  "entitlements",
  "products",
  "policies",
  "releases",
] as const

export type CommandSearchResource = (typeof COMMAND_SEARCH_RESOURCES)[number]

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

export interface CreateAction {
  key: DialogKey
  label: string
  icon: LucideIcon
}

export type RecentItem =
  | { kind: "command"; commandId: string; label: string }
  | {
      kind: "resource"
      resource: CommandSearchResource
      id: string
      label: string
    }

export type CommandGroup = "find" | "filter" | "new" | "account" | "help"

interface CommandBase {
  id: string
  label: string
  icon: LucideIcon
  group: CommandGroup
  keywords?: ReadonlyArray<string>
  cloudOnly?: boolean
}

export type Command = CommandBase &
  (
    | { kind: "find"; resource: CommandSearchResource }
    | { kind: "preset"; preset: FilterPreset }
    | { kind: "create"; dialog: DialogKey }
    | { kind: "navigate"; to: string }
    | { kind: "external"; url: string }
    | { kind: "mailto"; email: string }
    | { kind: "copy-account-id" }
    | { kind: "sign-out" }
  )

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

export const KEYWORD = {
  Type: "type",
  Id: "id",
  Name: "name",
  Key: "key",
  Email: "email",
  FirstName: "firstName",
  LastName: "lastName",
  FullName: "fullName",
  Fingerprint: "fingerprint",
  Code: "code",
  Version: "version",
  Tag: "tag",
  Role: "role",
  Metadata: "metadata",
  Owner: "owner",
  User: "user",
} as const

export type Keyword = (typeof KEYWORD)[keyof typeof KEYWORD]

export type FieldKeyword = Exclude<Keyword, typeof KEYWORD.Type>

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

export type SearchSuggestion =
  | {
      kind: "keyword"
      keyword: Keyword
      label: string
      detail: string
    }
  | {
      kind: "type"
      resource: CommandSearchResource
      value: string
      label: string
      detail: string
    }
