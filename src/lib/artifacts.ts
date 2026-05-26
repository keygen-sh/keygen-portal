import { AttributeType } from "@/components/attribute/value"
import { Artifact } from "@/types/artifacts"
import { formatByteSize } from "@/lib/bytes"

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

export function formatFileSize(bytes: number | null | undefined): string {
  return formatByteSize(bytes)
}
