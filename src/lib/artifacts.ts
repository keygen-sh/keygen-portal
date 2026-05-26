import { AttributeType } from "@/components/attribute/value"
import { Artifact } from "@/types/artifacts"

export const artifactAttributeTypeSchema: Record<
  keyof Omit<Artifact["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  filename: "string",
  filetype: "string",
  filesize: "bytes",
  platform: "string",
  arch: "string",
  status: "enum",
  signature: "string",
  checksum: "string",
}
