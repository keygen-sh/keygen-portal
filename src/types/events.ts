import {
  APIResponse,
  Resource,
  Relationship,
  Linkage,
  APIVersion,
} from "@/types/api"

export enum EventStatus {
  Delivering = "DELIVERING",
  Delivered = "DELIVERED",
  Failing = "FAILING",
  Failed = "FAILED",
}

export const EventStatusDescriptions: Readonly<Record<EventStatus, string>> = {
  [EventStatus.Delivering]: "The event is currently being delivered.",
  [EventStatus.Delivered]: "The event has been successfully delivered.",
  [EventStatus.Failing]: "The event is failing to be delivered.",
  [EventStatus.Failed]: "The event has failed to be delivered.",
} as const

export const EventStatusLabels: Readonly<Record<EventStatus, string>> = {
  [EventStatus.Delivering]: "Delivering",
  [EventStatus.Delivered]: "Delivered",
  [EventStatus.Failing]: "Failing",
  [EventStatus.Failed]: "Failed",
} as const

export const EventStatusVariants: Readonly<
  Record<EventStatus, "success" | "secondary" | "warning" | "destructive">
> = {
  [EventStatus.Delivering]: "secondary",
  [EventStatus.Delivered]: "success",
  [EventStatus.Failing]: "warning",
  [EventStatus.Failed]: "destructive",
} as const

export enum EventView {
  List = "list",
  Details = "details",
}

export type EventAttributes = {
  endpoint: string
  apiVersion: APIVersion
  payload: string | null
  event: EventType
  status: EventStatus
  lastResponseCode: number | null
  lastResponseBody: string | null
  created: string
  updated: string
}

export type EventRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
}

export type Event = Resource<
  "webhook-events",
  EventAttributes,
  EventRelationships
>

export type EventResponse = APIResponse<Event>
export type EventListResponse = APIResponse<Event[]>

export const EventAttributeDescriptions = {
  endpoint: "The endpoint that the event will be sent to.",
  event: "The event type.",
  status: "The current status of the event.",
  apiVersion:
    "The API version that the webhook event payload is formatted for.",
  lastResponseCode:
    "The last HTTP response code that your webhook endpoint sent in response to the webhook.",
  lastResponseBody:
    "The last HTTP response body that your webhook endpoint sent in response to the webhook.",
} as const

export const EventTypes = [
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

export type EventType = (typeof EventTypes)[number]
