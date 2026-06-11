import {
  Linkage,
  Resource,
  APIVersion,
  APIResponse,
  Relationship,
} from "@/types/api"
import { Writable } from "@/types/utility"
import { SigningAlgorithm } from "@/types/files"

export enum EndpointView {
  List = "list",
  Details = "details",
}

export type EndpointAttributes = {
  url: string
  subscriptions: string[]
  signatureAlgorithm: SigningAlgorithm
  apiVersion: APIVersion
  created: string
  updated: string
}

export type EndpointRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments"> | null>
  product: Relationship<Linkage<"products"> | null>
}

export type Endpoint = Resource<
  "webhook-endpoints",
  EndpointAttributes,
  EndpointRelationships
>

export type EndpointResponse = APIResponse<Endpoint>
export type EndpointListResponse = APIResponse<Endpoint[]>

export const EndpointAttributeDescriptions: Readonly<
  Record<keyof Writable<EndpointAttributes>, string>
> = {
  url: "The URL that webhook events are delivered to.",
  signatureAlgorithm: "The signature algorithm for the webhook endpoint.",
  subscriptions: "The event types the webhook endpoint subscribes to.",
  apiVersion: "The API version that webhook event payloads are formatted for.",
} as const

export const EndpointFormFieldDescriptions: Readonly<
  typeof EndpointAttributeDescriptions & {
    product: string
  }
> = {
  ...EndpointAttributeDescriptions,
  url: "The url that events are dispatched to. Must use the https protocol. Must have a valid SSL certificate. You may include a username and password in the URL, e.g. https://user:pass@example.com/webhooks.",
  product: "Optionally scope this endpoint to a single product.",
} as const
