import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { MetadataPairsSchema } from "@/schemas/metadata"

const BaseShape = z.object({
  filename: z.string().trim().min(1, "Filename is required"),
  filetype: z.string().trim().nullable().optional(),
  filesize: z.coerce.number().int().min(0).nullable().optional(),
  platform: z.string().trim().nullable().optional(),
  arch: z.string().trim().nullable().optional(),
  signature: z.string().trim().nullable().optional(),
  checksum: z.string().trim().nullable().optional(),
  metadata: MetadataPairsSchema.optional(),
})

const ReleaseShape = z.object({
  releaseId: z.string().min(1, "Release is required"),
})

const CreateShape = BaseShape.merge(ReleaseShape)

const UpdateShape = z.object({
  filesize: z.coerce.number().int().min(0).nullable().optional(),
  signature: z.string().trim().nullable().optional(),
  checksum: z.string().trim().nullable().optional(),
  metadata: MetadataPairsSchema.optional(),
})

type AnyShape = typeof BaseShape | typeof CreateShape | typeof UpdateShape

const BaseRules = <S extends AnyShape>(schema: S): S => {
  return schema
}

export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseRules(CreateShape)
export const UpdateSchema = BaseRules(UpdateShape)

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>

export type BaseValues = z.output<typeof BaseSchema>
export type CreateValues = z.output<typeof CreateSchema>
export type UpdateValues = z.output<typeof UpdateSchema>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type FieldNames = Exclude<FieldPath<AllValues>, never> | "releaseId"
