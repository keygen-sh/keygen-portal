export type SearchableResource =
  | "licenses"
  | "groups"
  | "users"
  | "machines"
  | "entitlements"
  | "products"
  | "policies"

export type SearchOperator = "AND" | "OR"

export type SearchOption = { id: string }
