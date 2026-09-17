import { AttributeType } from "@/components/attribute/value"
import { Package } from "@/types/packages"
import { truncateId } from "@/lib/truncate"

export const packageAttributeTypeSchema: Record<
  keyof Omit<Package["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  name: "string",
  key: "raw",
  engine: "enum",
}

export function getPackageLabel(pkg: Package): string {
  return pkg.attributes.name || truncateId(pkg.id)
}
