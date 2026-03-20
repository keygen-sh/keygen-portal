import { AttributeType } from "@/components/attribute/value"
import { Release } from "@/types/releases"

export const releaseAttributeTypeSchema: Record<
  keyof Omit<Release["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  name: "string",
  description: "string",
  channel: "enum",
  status: "enum",
  tag: "string",
  version: "raw",
  semver: "json",
  backdated: "date",
  yanked: "date",
}
