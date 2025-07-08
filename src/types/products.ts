import { APIResponse } from "@/types/api"

export enum ProductErrorCode {
  CODE_TAKEN = "CODE_TAKEN",
}

export enum ProductMode {
  VIEW = "view",
  EDIT = "edit",
  CREATE = "create",
}

export enum ProductView {
  LIST = "list",
  DETAILS = "details",
}

export enum DistributionStrategy {
  LICENSED = "LICENSED",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export enum ProductDescription {
  LICENSED = "Creating a new Licensed product",
  OPEN = "Creating a new Open product",
  CLOSED = "Creating a new Closed product",
  LICENSED_UPDATE = "Updating a Licensed product",
  OPEN_UPDATE = "Updating an Open product",
  CLOSED_UPDATE = "Updating a Closed product",
}

export interface ProductAttributes {
  name: string
  code: string
  distributionStrategy: DistributionStrategy
  url: string
  platforms: string[]
  permissions: string[]
  metadata: Record<string, any>
  created: string
  updated: string
}

export interface ProductRelationships {
  account: {
    links: {
      related: string
    }
    data: {
      id: string
      type: "accounts"
    }
  }
}

export interface Product {
  id: string
  name: string
  code: string
  distributionStrategy: DistributionStrategy
  url: string
  platforms: string[]
  permissions: string[]
  metadata: Record<string, any>
  created: string
  updated: string
}

export type ProductResponse = APIResponse<Product>

export type ProductsListResponse = APIResponse<Product[]>

export const Permissions = [
  "*",
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

export const ProductsData: Product[] = [
  {
    id: "31339351-b0c2-4f1e-8d3a-9f5c6b7d8e9f",
    name: "MDR Cloud",
    code: "mdr",
    distributionStrategy: DistributionStrategy.LICENSED,
    url: "https://cloud.lumon.industries/",
    platforms: ["Windows", "macOS"],
    permissions: Permissions,
    metadata: {},
    created: "2025-05-28T12:34:56.789Z",
    updated: "2025-05-30T14:20:00.000Z",
  },
  {
    id: "79a2ccb8-f1c3-4b2e-9d8a-5e6f7a8b9c0d",
    name: "Waffle Party Planner",
    code: "planner",
    distributionStrategy: DistributionStrategy.OPEN,
    url: "https://planner.lumon.industries/",
    platforms: ["Linux", "macOS"],
    permissions: Permissions,
    metadata: {},
    created: "2025-06-01T08:15:42.123Z",
    updated: "2025-06-02T10:00:00.000Z",
  },
]
