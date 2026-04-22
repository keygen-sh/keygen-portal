import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { GroupAttributes } from "@/types/groups"
import { CombineFormValues } from "@/types/forms"
import { Writable, OptionalExcept } from "@/types/utility"
import { MetadataPairsSchema, WithMetadataInput } from "@/schemas/metadata"

export type BaseValues = Writable<OptionalExcept<GroupAttributes, "name">>
export type CreateValues = BaseValues
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type BaseInputValues = WithMetadataInput<BaseValues>
export type CreateInputValues = WithMetadataInput<CreateValues>
export type UpdateInputValues = WithMetadataInput<UpdateValues>

export type FieldNames = FieldPath<AllValues>

const BaseShape = z.object({
  name: z.string().trim().min(1, "Name is required"),
  maxUsers: z.number().int().positive().nullable().optional(),
  maxLicenses: z.number().int().positive().nullable().optional(),
  maxMachines: z.number().int().positive().nullable().optional(),
  metadata: MetadataPairsSchema,
})

const BaseRules = <
  S extends z.ZodType<BaseValues, z.ZodTypeDef, BaseInputValues>,
>(
  schema: S,
): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema: z.ZodType<BaseValues, z.ZodTypeDef, BaseInputValues> =
  BaseRules(BaseShape)
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  CreateInputValues
> = BaseSchema
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  UpdateInputValues
> = BaseSchema
