import { AttributeType } from "@/components/attribute/value"

import { User } from "@/types/users"

export const userAttributeTypeSchema: Record<
  keyof Omit<
    User["attributes"],
    "metadata" | "permissions" | "created" | "updated"
  >,
  AttributeType
> = {
  email: "raw",
  firstName: "string",
  lastName: "string",
  fullName: "string",
  status: "enum",
  role: "enum",
}
