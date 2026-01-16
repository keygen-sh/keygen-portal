import { AttributeType } from "@/components/attribute/value"

import { Process } from "@/types/processes"

export const processAttributeTypeSchema: Record<
  keyof Omit<Process["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  pid: "string",
  status: "string",
  lastHeartbeat: "date",
  nextHeartbeat: "date",
  interval: "number",
}
