import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { ArtifactAttributes } from "@/types/artifacts"
import { Writable, OptionalExcept } from "@/types/utility"

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
  metadata: z.record(z.unknown()).default({}),
})

const ReleaseShape = z.object({
  releaseId: z.string().min(1, "Release is required"),
})

const UpdateShape = z.object({
  filesize: z.coerce.number().int().min(0).nullable().optional(),
  signature: z.string().trim().nullable().optional(),
  checksum: z.string().trim().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
})

const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  return schema
}
export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<CreateValues> = BaseRules(
  BaseShape.merge(ReleaseShape),
) as z.ZodType<CreateValues>
export const UpdateSchema: z.ZodType<UpdateValues> =
  UpdateShape as z.ZodType<UpdateValues>
