import { AttributeType } from "@/components/attribute/value"

import { Component } from "@/types/components"

export const componentAttributeTypeSchema: Record<
  keyof Omit<Component["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  fingerprint: "string",
  name: "string",
}
