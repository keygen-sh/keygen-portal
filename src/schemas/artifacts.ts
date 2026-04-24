import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { ArtifactAttributes } from "@/types/artifacts"
import { Writable, OptionalExcept } from "@/types/utility"
import { MetadataPairsSchema } from "@/schemas/metadata"

export type BaseValues = Writable<
  OptionalExcept<ArtifactAttributes, "filename">
>
export type CreateValues = BaseValues & { releaseId: string }
export type UpdateValues = Pick<
  Partial<BaseValues>,
  "filesize" | "signature" | "checksum" | "metadata"
>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type FieldNames = Exclude<FieldPath<AllValues>, never> | "releaseId"

const BaseShape = z.object({
  filename: z.string().trim().min(1, "Filename is required"),
  filetype: z.string().trim().nullable().optional(),
  filesize: z.coerce.number().int().min(0).nullable().optional(),
  platform: z.string().trim().nullable().optional(),
  arch: z.string().trim().nullable().optional(),
  signature: z.string().trim().nullable().optional(),
  checksum: z.string().trim().nullable().optional(),
  metadata: MetadataPairsSchema,
})

const ReleaseShape = z.object({
  releaseId: z.string().min(1, "Release is required"),
})

const UpdateShape = z.object({
  filesize: z.coerce.number().int().min(0).nullable().optional(),
  signature: z.string().trim().nullable().optional(),
  checksum: z.string().trim().nullable().optional(),
  metadata: MetadataPairsSchema,
})

const BaseRules = <S extends z.ZodTypeAny>(schema: S): S => {
  return schema
}
export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseRules(BaseShape.merge(ReleaseShape))
export const UpdateSchema = UpdateShape

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>
