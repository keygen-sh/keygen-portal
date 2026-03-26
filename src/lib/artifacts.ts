import { AttributeType } from "@/components/attribute/value"
import { Artifact } from "@/types/artifacts"

export const artifactAttributeTypeSchema: Record<
  keyof Omit<Artifact["attributes"], "metadata" | "created" | "updated">,
  AttributeType
> = {
  filename: "string",
  filetype: "string",
  filesize: "number",
  platform: "string",
  arch: "string",
  status: "enum",
  signature: "string",
  checksum: "string",
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) return "--"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
