import { AttributeType } from "@/components/attribute/value"
import { Package } from "@/types/packages"

export const packageAttributeTypeSchema: Record<
  keyof Omit<Package["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  name: "string",
  key: "raw",
  engine: "enum",
}
