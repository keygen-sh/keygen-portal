import { AttributeType } from "@/components/attribute/value"

import { Event } from "@/types/events"

export const eventAttributeTypeSchema: Record<
  keyof Omit<Event["attributes"], "payload" | "created" | "updated">,
  AttributeType
> = {
  endpoint: "raw",
  event: "raw",
  status: "enum",
  apiVersion: "raw",
  lastResponseCode: "number",
  lastResponseBody: "raw",
}

export function formatEventPayload(payload: string | null): string {
  if (payload == null || payload === "") return ""

  try {
    return JSON.stringify(JSON.parse(payload), null, 2)
  } catch {
    return payload
  }
}
