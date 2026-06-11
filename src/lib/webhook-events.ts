import { AttributeType } from "@/components/attribute/value"

import { WebhookEvent } from "@/types/webhook-events"

export const webhookEventAttributeTypeSchema: Record<
  keyof Omit<WebhookEvent["attributes"], "payload" | "created" | "updated">,
  AttributeType
> = {
  endpoint: "raw",
  event: "raw",
  status: "enum",
  apiVersion: "raw",
  lastResponseCode: "number",
  lastResponseBody: "raw",
}

export function formatWebhookEventPayload(payload: string | null): string {
  if (payload == null || payload === "") return ""

  try {
    return JSON.stringify(JSON.parse(payload), null, 2)
  } catch {
    return payload
  }
}
