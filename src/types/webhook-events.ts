import {
  Linkage,
  Resource,
  APIVersion,
  APIResponse,
  Relationship,
} from "@/types/api"
import { Writable } from "@/types/utility"
import { EventType } from "@/types/events"

export enum WebhookEventStatus {
  Delivering = "DELIVERING",
  Delivered = "DELIVERED",
  Failing = "FAILING",
  Failed = "FAILED",
}

export const WebhookEventStatusDescriptions: Readonly<
  Record<WebhookEventStatus, string>
> = {
  [WebhookEventStatus.Delivering]: "The event is currently being delivered.",
  [WebhookEventStatus.Delivered]: "The event has been successfully delivered.",
  [WebhookEventStatus.Failing]: "The event is failing to be delivered.",
  [WebhookEventStatus.Failed]: "The event has failed to be delivered.",
} as const

export const WebhookEventStatusLabels: Readonly<
  Record<WebhookEventStatus, string>
> = {
  [WebhookEventStatus.Delivering]: "Delivering",
  [WebhookEventStatus.Delivered]: "Delivered",
  [WebhookEventStatus.Failing]: "Failing",
  [WebhookEventStatus.Failed]: "Failed",
} as const

export const WebhookEventStatusVariants: Readonly<
  Record<
    WebhookEventStatus,
    "success" | "secondary" | "warning" | "destructive"
  >
> = {
  [WebhookEventStatus.Delivering]: "secondary",
  [WebhookEventStatus.Delivered]: "success",
  [WebhookEventStatus.Failing]: "warning",
  [WebhookEventStatus.Failed]: "destructive",
} as const

export enum WebhookEventView {
  List = "list",
  Details = "details",
}

export type WebhookEventAttributes = {
  endpoint: string
  apiVersion: APIVersion
  payload: string | null
  event: EventType
  status: WebhookEventStatus
  lastResponseCode: number | null
  lastResponseBody: string | null
  created: string
  updated: string
}

export type WebhookEventRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
}

export type WebhookEvent = Resource<
  "webhook-events",
  WebhookEventAttributes,
  WebhookEventRelationships
>

export type WebhookEventResponse = APIResponse<WebhookEvent>
export type WebhookEventListResponse = APIResponse<WebhookEvent[]>

export const WebhookEventAttributeDescriptions: Readonly<
  Record<keyof Writable<WebhookEventAttributes>, string>
> = {
  endpoint: "The endpoint that the event will be sent to.",
  payload: "The event payload in serialized JSON format.",
  event: "The event type.",
  status: "The current status of the event.",
  apiVersion:
    "The API version that the webhook event payload is formatted for.",
  lastResponseCode:
    "The last HTTP response code that your webhook endpoint sent in response to the webhook.",
  lastResponseBody:
    "The last HTTP response body that your webhook endpoint sent in response to the webhook.",
} as const
