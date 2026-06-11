import { AttributeType } from "@/components/attribute/value"

import { Endpoint } from "@/types/endpoints"

export const endpointAttributeTypeSchema: Record<
  keyof Omit<Endpoint["attributes"], "created" | "updated">,
  AttributeType
> = {
  url: "raw",
  subscriptions: "json",
  signatureAlgorithm: "raw",
  apiVersion: "raw",
}
