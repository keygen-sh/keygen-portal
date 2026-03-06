import { AttributeType } from "@/components/attribute/value"

import { User } from "@/types/users"

export function getUserLabel(user: User) {
  return user.attributes.fullName ?? user.attributes.email
}

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
