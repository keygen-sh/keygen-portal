import { APIResponse, Resource, Relationship, Linkage } from "@/types/api"
import { Writable } from "@/types/utility"

export enum ArtifactMode {
  View = "view",
  Edit = "edit",
  Create = "create",
}

export enum ArtifactView {
  List = "list",
  Details = "details",
}

export enum ArtifactStatus {
  Waiting = "WAITING",
  Uploaded = "UPLOADED",
  Failed = "FAILED",
}

export type ArtifactAttributes = {
  filename: string
  filetype: string | null
  filesize: number | null
  platform: string | null
  arch: string | null
  status: ArtifactStatus
  signature: string | null
  checksum: string | null
  metadata: Record<string, unknown>
  created: string
  updated: string
}

export type ArtifactRelationships = {
  account: Relationship<Linkage<"accounts">>
  environment: Relationship<Linkage<"environments">>
  release: Relationship<Linkage<"releases">>
}

export type Artifact = Resource<
  "artifacts",
  ArtifactAttributes,
  ArtifactRelationships
>

export type ArtifactResponse = APIResponse<Artifact>
export type ArtifactsListResponse = APIResponse<Artifact[]>

export type ArtifactFilters = {
  product?: string
  release?: string
  channel?: string
  filetype?: string
  platform?: string
  arch?: string
  status?: string
}

export const ArtifactAttributeDescriptions: Readonly<
  Record<keyof Writable<ArtifactAttributes>, string>
> = {
  filename: "The filename of the artifact.",
  filetype: "The filetype of the artifact.",
  filesize: "The filesize of the artifact, in bytes.",
  platform: "The platform of the artifact.",
  arch: "The architecture of the artifact.",
  status:
    "The artifact's status, indicating whether or not a file has been uploaded.",
  signature: "The signature of the artifact.",
  checksum: "The checksum of the artifact.",
  metadata: "Object containing artifact metadata.",
} as const

export const ArtifactFormFieldDescriptions: Readonly<
  typeof ArtifactAttributeDescriptions & {
    releaseId: string
  }
> = {
  ...ArtifactAttributeDescriptions,
  filename: "Must be unique to the artifact's release relationship.",
  filetype:
    "Must match the filename's extension. When the filename does not contain an extension, filetype can be an arbitrary string, e.g. bin or null. When the release has multiple valid extensions, e.g. tar.gz, we recommend including the complete extension in the filetype.",
  platform: "The platform of the artifact, e.g. darwin.",
  arch: "The architecture of the artifact, e.g. amd64.",
  signature:
    "This can be an arbitrary string, utilized outside of Keygen for verification purposes. For example, Keygen's CLI uses Ed25519ph signatures, base64 encoded without padding.",
  checksum:
    "This can be an arbitrary string, utilized outside of Keygen for verification purposes. For example, Keygen's CLI uses SHA-512 checksums, base64 encoded without padding.",
  metadata:
    "This can be used to store things such as additional checksums, e.g. SHA-256 and SHA-512 for integrity checks, for engine-specific requirements e.g. requiresPython, or for notes.",
  releaseId: "The release this artifact belongs to.",
}

export const ArtifactCreateFormFieldDescriptions: typeof ArtifactFormFieldDescriptions =
  {
    ...ArtifactFormFieldDescriptions,
  }

export const ArtifactEditFormFieldDescriptions: typeof ArtifactFormFieldDescriptions =
  {
    ...ArtifactFormFieldDescriptions,
  }

export const ArtifactStatusDescriptions: Readonly<
  Record<ArtifactStatus, string>
> = {
  [ArtifactStatus.Waiting]:
    "Artifact is waiting for upload. If a file is not uploaded within 1 hour, the artifact will be moved to a Failed status and automatically pruned after 24 hours.",
  [ArtifactStatus.Uploaded]:
    "Artifact has been successfully uploaded and is available.",
  [ArtifactStatus.Failed]:
    "Artifact upload has failed and will be pruned after 24 hours.",
} as const

export const ArtifactStatusLabels: Readonly<Record<ArtifactStatus, string>> = {
  [ArtifactStatus.Waiting]: "Waiting",
  [ArtifactStatus.Uploaded]: "Uploaded",
  [ArtifactStatus.Failed]: "Failed",
} as const

export const ArtifactStatusVariants: Readonly<
  Record<
    ArtifactStatus,
    | "default"
    | "secondary"
    | "destructive"
    | "warning"
    | "success"
    | "outline"
    | "disabled"
  >
> = {
  [ArtifactStatus.Waiting]: "disabled",
  [ArtifactStatus.Uploaded]: "success",
  [ArtifactStatus.Failed]: "destructive",
} as const
