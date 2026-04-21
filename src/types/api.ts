import { Arch } from "@/types/arches"
import { User } from "@/types/users"
import { Group } from "@/types/groups"
import { Engine } from "@/types/engines"
import { Policy } from "@/types/policies"
import { Package } from "@/types/packages"
import { Machine } from "@/types/machines"
import { Process } from "@/types/processes"
import { Release } from "@/types/releases"
import { Channel } from "@/types/channels"
import { Product } from "@/types/products"
import { License } from "@/types/licenses"
import { Artifact } from "@/types/artifacts"
import { Platform } from "@/types/platforms"
import { Component } from "@/types/components"
import { Entitlement } from "@/types/entitlements"

export type APIResponse<
  TData,
  TMeta extends Record<string, unknown> | undefined = undefined,
> =
  | {
      data: TData
      meta?: TMeta
      links?: Link
      errors?: never
    }
  | {
      data?: never
      meta?: TMeta
      links?: Link
      errors: APIError[]
    }

export interface ErrorSource {
  pointer?: string
  parameter?: string
}

export class APIError extends Error {
  title: string
  detail?: string
  code?: string
  source?: ErrorSource
  links?: Link
  meta?: Record<string, unknown>

  constructor(error: {
    title: string
    detail?: string
    code?: string
    source?: ErrorSource
    links?: Link
    meta?: Record<string, unknown>
  }) {
    super(error.detail ?? error.title)
    this.name = "APIError"
    this.title = error.title
    this.detail = error.detail
    this.code = error.code
    this.source = error.source
    this.links = error.links
    this.meta = error.meta
  }
}

export interface Link {
  related?: string | null
  self?: string | null
  prev?: string | null
  next?: string | null
  first?: string | null
  last?: string | null
  meta?: {
    pages?: number
    count?: number
  }
}

export interface Linkage<T extends string = string> {
  id: string
  type: T
}

export type Relationship<
  T extends Linkage | Linkage[] | null = Linkage | Linkage[] | null,
> = {
  data?: T
  links?: Link
  meta?: Record<string, unknown>
} | null

export interface Resource<
  TType extends string,
  TAttribute,
  TRelationship extends Record<string, Relationship> = {
    account: Relationship<Linkage<"accounts">>
  },
> {
  id: string
  type: TType
  attributes: TAttribute
  relationships: TRelationship
  links: { self: string; redirect?: string }
}

export type AnyResource =
  | Product
  | Entitlement
  | Group
  | Policy
  | License
  | Machine
  | Component
  | Process
  | User
  | Package
  | Release
  | Artifact
  | Platform
  | Arch
  | Channel
  | Engine

export type ResourceType =
  | "products"
  | "entitlements"
  | "groups"
  | "policies"
  | "licenses"
  | "machines"
  | "components"
  | "processes"
  | "users"
  | "environments"
  | "packages"
  | "releases"
  | "artifacts"
  | "platforms"
  | "arches"
  | "channels"
  | "engines"
