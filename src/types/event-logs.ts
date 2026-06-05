import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export enum EventLogView {
  List = "list",
  Details = "details",
}

export type EventLogAttributes = {
  event: string
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export type EventLogRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  request: Relationship<Linkage<"request-logs"> | null>
  whodunnit: Relationship<Linkage | null>
  resource: Relationship<Linkage | null>
}

export type EventLog = Resource<
  "event-logs",
  EventLogAttributes,
  EventLogRelationships
>

export type EventLogResponse = APIResponse<EventLog>
export type EventLogListResponse = APIResponse<EventLog[]>

export const EventLogAttributeDescriptions: Readonly<
  Record<keyof Writable<EventLogAttributes>, string>
> = {
  event: "The event that occurred.",
  metadata: "Additional metadata associated with the event log.",
} as const

export type EventLogResourceFilter =
  | string
  | {
      type: string
      id: string
    }

export type EventLogFilters = {
  events?: string[]
  request?: string
  resource?: EventLogResourceFilter
  whodunnit?: EventLogResourceFilter
  date?: {
    start?: string
    end?: string
  }
}

export const EVENT_TYPES = [
  "account.billing.updated",
  "account.plan.updated",
  "account.settings.created",
  "account.settings.deleted",
  "account.settings.updated",
  "account.subscription.canceled",
  "account.subscription.paused",
  "account.subscription.renewed",
  "account.subscription.resumed",
  "account.updated",

  "artifact.created",
  "artifact.deleted",
  "artifact.downloaded",
  "artifact.updated",
  "artifact.upload.failed",
  "artifact.upload.processing",
  "artifact.upload.succeeded",
  "artifact.uploaded",

  "component.created",
  "component.deleted",
  "component.updated",

  "entitlement.created",
  "entitlement.deleted",
  "entitlement.updated",

  "environment.created",
  "environment.deleted",
  "environment.updated",

  "group.created",
  "group.deleted",
  "group.updated",

  "key.created",
  "key.deleted",
  "key.updated",

  "license.check-in-overdue",
  "license.check-in-required-soon",
  "license.checked-in",
  "license.checked-out",
  "license.created",
  "license.deleted",
  "license.entitlements.attached",
  "license.entitlements.detached",
  "license.expired",
  "license.expiring-soon",
  "license.group.updated",
  "license.owner.updated",
  "license.policy.updated",
  "license.reinstated",
  "license.renewed",
  "license.revoked",
  "license.suspended",
  "license.updated",
  "license.usage.decremented",
  "license.usage.incremented",
  "license.usage.reset",
  "license.user.updated",
  "license.users.attached",
  "license.users.detached",
  "license.validated",
  "license.validation.failed",
  "license.validation.succeeded",

  "machine.checked-out",
  "machine.created",
  "machine.deleted",
  "machine.group.updated",
  "machine.heartbeat.dead",
  "machine.heartbeat.ping",
  "machine.heartbeat.pong",
  "machine.heartbeat.reset",
  "machine.heartbeat.resurrected",
  "machine.owner.updated",
  "machine.proofs.generated",
  "machine.updated",

  "package.created",
  "package.deleted",
  "package.updated",

  "policy.created",
  "policy.deleted",
  "policy.entitlements.attached",
  "policy.entitlements.detached",
  "policy.pool.popped",
  "policy.updated",

  "process.created",
  "process.deleted",
  "process.heartbeat.dead",
  "process.heartbeat.ping",
  "process.heartbeat.pong",

  "product.created",
  "product.deleted",
  "product.updated",

  "release.constraints.attached",
  "release.constraints.detached",
  "release.created",
  "release.deleted",
  "release.downloaded",
  "release.package.updated",
  "release.published",
  "release.updated",
  "release.upgraded",
  "release.uploaded",
  "release.yanked",

  "second-factor.created",
  "second-factor.deleted",
  "second-factor.disabled",
  "second-factor.enabled",

  "token.generated",
  "token.regenerated",
  "token.revoked",

  "user.banned",
  "user.created",
  "user.deleted",
  "user.group.updated",
  "user.password-reset",
  "user.unbanned",
  "user.updated",
] as const
