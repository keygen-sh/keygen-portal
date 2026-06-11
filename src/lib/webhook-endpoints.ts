import { AttributeType } from "@/components/attribute/value"

import { WebhookEndpoint } from "@/types/webhook-endpoints"

export const webhookEndpointAttributeTypeSchema: Record<
  keyof Omit<WebhookEndpoint["attributes"], "created" | "updated">,
  AttributeType
> = {
  url: "raw",
  subscriptions: "json",
  signatureAlgorithm: "raw",
  apiVersion: "raw",
}
