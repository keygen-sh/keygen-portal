import {
  APIResponse,
  Resource,
  Relationship,
  Linkage,
  APIVersion,
} from "@/types/api"

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

export const EndpointAttributeDescriptions = {
  url: "The URL that webhook events are delivered to. Must use the https protocol.",
  subscriptions: "The events this endpoint is subscribed to.",
  signatureAlgorithm:
    "The algorithm used to sign webhook event payloads, so you can verify their authenticity.",
  apiVersion: "The API version that webhook event payloads are formatted for.",
} as const

export const EndpointFormFieldDescriptions = {
  url: "The URL that webhook events are delivered to. Must use the https protocol.",
  subscriptions:
    "Select which events this endpoint should receive. Choose “All” to subscribe to every event.",
  signatureAlgorithm:
    "The cryptographic algorithm used to sign webhook event payloads.",
  apiVersion: "The API version that webhook event payloads are formatted for.",
  product: "Optionally scope this endpoint to a single product.",
} as const
