import {
  APIResponse,
  Resource,
  Relationship,
  Linkage,
  Writable,
  OptionalExcept,
} from "@/types/api"

export enum ProductErrorCode {
  CodeTaken = "CODE_TAKEN",
}

export enum ProductMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum ProductView {
  List = "list",
  Details = "details",
}

export enum DistributionStrategy {
  Licensed = "LICENSED",
  Open = "OPEN",
  Closed = "CLOSED",
}

export type ProductAttributes = {
  name: string
  code: string
  distributionStrategy: DistributionStrategy
  url: string
  platforms: string[]
  permissions: string[]
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export type ProductRelationships = {
  account: Relationship<Linkage<"accounts">>
  policies: Relationship<Linkage<"policies">[]>
  licenses: Relationship<Linkage<"licenses">[]>
  machines: Relationship<Linkage<"machines">[]>
  users: Relationship<Linkage<"users">[]>
  tokens: Relationship<Linkage<"tokens">[]>
}

export type Product = Resource<
  "products",
  ProductAttributes,
  ProductRelationships
>

export type ProductResponse = APIResponse<Product>
export type ProductsListResponse = APIResponse<Product[]>

export type CreateProductPayload = OptionalExcept<
  Writable<ProductAttributes>,
  "name"
>
export type UpdateProductPayload = Partial<Writable<ProductAttributes>>

export const Permissions = [
  "account.read",
  "arch.read",
  "artifact.create",
  "artifact.delete",
  "artifact.read",
  "artifact.update",
  "channel.read",
  "component.create",
  "component.delete",
  "component.read",
  "component.update",
  "constraint.read",
  "engine.read",
  "entitlement.read",
  "group.create",
  "group.delete",
  "group.licenses.read",
  "group.machines.read",
  "group.owners.attach",
  "group.owners.detach",
  "group.owners.read",
  "group.read",
  "group.update",
  "key.read",
  "key.create",
  "key.delete",
  "key.update",
  "license.check-in",
  "license.check-out",
  "license.create",
  "license.delete",
  "license.entitlements.attach",
  "license.entitlements.detach",
  "license.group.update",
  "license.owner.update",
  "license.policy.update",
  "license.read",
  "license.reinstate",
  "license.renew",
  "license.revoke",
  "license.suspend",
  "license.tokens.generate",
  "license.update",
  "license.usage.decrement",
  "license.usage.increment",
  "license.usage.reset",
  "license.users.attach",
  "license.users.detach",
  "license.user.update",
  "license.validate",
  "machine.check-out",
  "machine.create",
  "machine.delete",
  "machine.group.update",
  "machine.heartbeat",
  "machine.ping",
  "machine.reset",
  "machine.owner.update",
  "machine.proofs.generate",
  "machine.read",
  "machine.update",
  "package.create",
  "package.delete",
  "package.read",
  "package.update",
  "platform.read",
  "policy.create",
  "policy.delete",
  "policy.entitlements.attach",
  "policy.entitlements.detach",
  "policy.pool.pop",
  "policy.read",
  "policy.update",
  "process.create",
  "process.delete",
  "process.heartbeat",
  "process.ping",
  "process.read",
  "process.update",
  "product.read",
  "product.update",
  "release.constraints.attach",
  "release.constraints.detach",
  "release.create",
  "release.delete",
  "release.download",
  "release.package.update",
  "release.publish",
  "release.read",
  "release.update",
  "release.upgrade",
  "release.upload",
  "release.yank",
  "token.generate",
  "token.read",
  "token.regenerate",
  "token.revoke",
  "user.ban",
  "user.create",
  "user.delete",
  "user.group.update",
  "user.read",
  "user.tokens.generate",
  "user.unban",
  "user.update",
  "webhook-endpoint.create",
  "webhook-endpoint.delete",
  "webhook-endpoint.read",
  "webhook-endpoint.update",
  "webhook-event.read",
]

export const KnownPlatforms = ["Windows", "macOS", "Linux", "iOS", "Android"]

export type Permission = (typeof Permissions)[number]
