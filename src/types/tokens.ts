import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export const TokenKinds = [
  "admin-token",
  "user-token",
  "product-token",
  "activation-token",
  "environment-token",
  "developer-token",
  "sales-token",
  "support-token",
  "read-only-token",
] as const

export type TokenKind = (typeof TokenKinds)[number]

export type TokenAttributes = {
  kind: TokenKind
  token?: string
  name?: string | null
  expiry?: string | null
  permissions?: string[] | null
  maxActivations?: number | null
  activations?: number | null
  maxDeactivations?: number | null
  deactivations?: number | null
  created: string
  updated: string
}

export type TokenRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment?: Relationship<Linkage<"environments">>
  bearer?: Relationship<
    | Linkage<"users">
    | Linkage<"products">
    | Linkage<"licenses">
    | Linkage<"environments">
  >
}

export type Token = Resource<"tokens", TokenAttributes, TokenRelationships>

export type TokenResponse = APIResponse<Token>
export type TokensListResponse = APIResponse<Token[]>

export enum TokenBearerType {
  User = "user",
  License = "license",
  Product = "product",
  Environment = "environment",
}

export enum TokenBearerKind {
  Admin = "admin",
  User = "user",
  License = "license",
  Product = "product",
  Environment = "environment",
}

export const TokenBearerKindLabels: Readonly<Record<TokenBearerKind, string>> =
  {
    [TokenBearerKind.Admin]: "Admin",
    [TokenBearerKind.User]: "User",
    [TokenBearerKind.License]: "License",
    [TokenBearerKind.Product]: "Product",
    [TokenBearerKind.Environment]: "Environment",
  }

export const TokenBearerKindDescriptions: Readonly<
  Record<TokenBearerKind, string>
> = {
  [TokenBearerKind.Admin]:
    "Authenticates as you, with your account permissions.",
  [TokenBearerKind.User]: "Authenticates as one of your users.",
  [TokenBearerKind.License]: "Authenticates as a license.",
  [TokenBearerKind.Product]:
    "Authenticates as a product, scoped to its resources.",
  [TokenBearerKind.Environment]: "Authenticates as an environment.",
}

export const InternalTokenKinds: readonly TokenKind[] = [
  "admin-token",
  "developer-token",
  "sales-token",
  "support-token",
  "read-only-token",
  "product-token",
  "environment-token",
]

export const TokenKindLabels: Readonly<Record<TokenKind, string>> = {
  "admin-token": "Admin",
  "user-token": "User",
  "product-token": "Product",
  "activation-token": "License",
  "environment-token": "Environment",
  "developer-token": "Developer",
  "sales-token": "Sales",
  "support-token": "Support",
  "read-only-token": "Read-only",
}

export const TokenKindDescriptions: Readonly<Record<TokenKind, string>> = {
  "admin-token": "Authenticates as an admin, with full account access.",
  "user-token": "Authenticates as one of your users.",
  "product-token": "Authenticates as a product, scoped to its resources.",
  "activation-token":
    "A license activation token, authenticating as a license.",
  "environment-token": "Authenticates as an environment.",
  "developer-token":
    "Authenticates as a developer, with management access except billing.",
  "sales-token": "Authenticates as a sales agent.",
  "support-token": "Authenticates as a support agent.",
  "read-only-token": "Authenticates as a read-only user.",
}

export const TokenAttributeDescriptions: Readonly<
  Record<keyof Writable<TokenAttributes>, string>
> = {
  kind: "The kind of token, based on its bearer.",
  token:
    "The raw token of the token. This attribute is only available to read directly after token generation.",
  name: "The name of the token, if any.",
  expiry:
    "The timestamp for when the token expires. Requests using an expired token will be rejected.",
  permissions: "The permissions for the token",
  activations:
    "The number of machine activations that have been performed by this token. This attribute is only applicable to license tokens.",
  maxActivations:
    "The maximum amount of machine activations this token may perform. This attribute is only applicable to license tokens.",
  deactivations:
    "The number of machine deactivations that have been performed by this token. This attribute is only applicable to license tokens.",
  maxDeactivations:
    "The maximum amount of machine deactivations this token may perform. This attribute is only applicable to license tokens.",
}

export const TokenFormFieldDescriptions: Readonly<
  typeof TokenAttributeDescriptions & { bearer: string; bearerKind: string }
> = {
  ...TokenAttributeDescriptions,
  name: "An optional name for the token. This can be used to easily identify tokens at a glance.",
  bearer: "The specific resource this token belongs to and authenticates as.",
  bearerKind: "The type of bearer this token authenticates as.",
}

export enum TokenRole {
  Admin = "admin",
  User = "user",
  Developer = "developer",
  SalesAgent = "sales_agent",
  SupportAgent = "support_agent",
  ReadOnly = "read_only",
  License = "license",
  Product = "product",
  Environment = "environment",
}

export const TokenRoleLabels: Readonly<Record<TokenRole, string>> = {
  [TokenRole.Admin]: "Admin",
  [TokenRole.User]: "User",
  [TokenRole.Developer]: "Developer",
  [TokenRole.SalesAgent]: "Sales",
  [TokenRole.SupportAgent]: "Support",
  [TokenRole.ReadOnly]: "Read-only",
  [TokenRole.License]: "License",
  [TokenRole.Product]: "Product",
  [TokenRole.Environment]: "Environment",
}

export const SubjectTokenRoles: readonly TokenRole[] = [
  TokenRole.User,
  TokenRole.License,
]

export const InternalTokenRoles: readonly TokenRole[] = [
  TokenRole.Admin,
  TokenRole.Developer,
  TokenRole.SalesAgent,
  TokenRole.SupportAgent,
  TokenRole.ReadOnly,
  TokenRole.Product,
  TokenRole.Environment,
]

export const AllTokenRoles: readonly TokenRole[] = [
  TokenRole.Admin,
  TokenRole.User,
  TokenRole.Developer,
  TokenRole.SalesAgent,
  TokenRole.SupportAgent,
  TokenRole.ReadOnly,
  TokenRole.License,
  TokenRole.Product,
  TokenRole.Environment,
]

export type TokenFilters = {
  bearerType?: TokenBearerType
  bearerId?: string
  bearerRoles?: TokenRole[]
  environment?: string
}

export const TokenBearerResourceTypes: Readonly<Record<string, string>> = {
  [TokenBearerKind.User]: "users",
  [TokenBearerKind.License]: "licenses",
  [TokenBearerKind.Product]: "products",
  [TokenBearerKind.Environment]: "environments",
}
