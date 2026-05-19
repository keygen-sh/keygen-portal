export type SearchableResource =
  | "licenses"
  | "groups"
  | "users"
  | "machines"
  | "entitlements"
  | "products"
  | "policies"
  | "packages"
  | "releases"
  | "platforms"
  | "arches"

export type SearchOperator = "AND" | "OR"

export type SearchOption = { id: string }

export type SearchQuery = Record<string, string | Record<string, string>>
