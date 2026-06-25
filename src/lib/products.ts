import { AttributeType } from "@/components/attribute/value"

import { Product } from "@/types/products"

export const productAttributeTypeSchema: Record<
  keyof Omit<
    Product["attributes"],
    "metadata" | "created" | "updated" | "platforms" | "permissions"
  >,
  AttributeType
> = {
  name: "string",
  code: "raw",
  distributionStrategy: "enum",
  url: "raw",
}
