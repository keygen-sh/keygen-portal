import {
  Linkage,
  Resource,
  APIVersion,
  APIResponse,
  Relationship,
} from "@/types/api"
import { Writable } from "@/types/utility"
import { SigningAlgorithm } from "@/types/files"

export enum WebhookEndpointView {
  List = "list",
  Details = "details",
}

export type WebhookEndpointAttributes = {
  url: string
  subscriptions: string[]
  signatureAlgorithm: SigningAlgorithm
  apiVersion: APIVersion
  created: string
  updated: string
}

export type WebhookEndpointRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  product: Relationship<Linkage<"products"> | null>
}

export type WebhookEndpoint = Resource<
  "webhook-endpoints",
  WebhookEndpointAttributes,
  WebhookEndpointRelationships
>

export type WebhookEndpointResponse = APIResponse<WebhookEndpoint>
export type WebhookEndpointListResponse = APIResponse<WebhookEndpoint[]>

export const WebhookEndpointAttributeDescriptions: Readonly<
  Record<keyof Writable<WebhookEndpointAttributes>, string>
> = {
  url: "The URL that webhook events are delivered to.",
  signatureAlgorithm: "The signature algorithm for the webhook endpoint.",
  subscriptions: "The event types the webhook endpoint subscribes to.",
  apiVersion: "The API version that webhook event payloads are formatted for.",
} as const

export const WebhookEndpointFormFieldDescriptions: Readonly<
  typeof WebhookEndpointAttributeDescriptions & {
    product: string
  }
> = {
  ...WebhookEndpointAttributeDescriptions,
  url: "The url that events are dispatched to. Must use the https protocol. Must have a valid SSL certificate. You may include a username and password in the URL, e.g. https://user:pass@example.com/webhooks.",
  product: "Optionally scope this endpoint to a single product.",
} as const
