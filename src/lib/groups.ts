import { AttributeType } from "@/components/attribute/value"

import { Group } from "@/types/groups"

export const groupAttributeTypeSchema: Record<
  keyof Omit<Group["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  name: "string",
  maxUsers: "number",
  maxLicenses: "number",
  maxMachines: "number",
}

export function getGroupLabel(group: Group) {
  return group.attributes.name
}
