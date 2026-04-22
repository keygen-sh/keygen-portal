import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { ProcessAttributes } from "@/types/processes"
import { MetadataPairsSchema, WithMetadataInput } from "@/schemas/metadata"

export type BaseValues = Partial<Pick<ProcessAttributes, "metadata">>
export type CreateValues = BaseValues & {
  pid: string
  machineId: string
}
export type UpdateValues = BaseValues
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
  metadata: MetadataPairsSchema,
})

const PidShape = z.object({
  pid: z.string().trim().min(1, "Pid is required"),
})

const MachineRelationshipShape = z.object({
  machineId: z.string().min(1, "Machine is required"),
})

export const BaseSchema: z.ZodType<BaseValues, z.ZodTypeDef, BaseInputValues> =
  BaseShape as unknown as z.ZodType<BaseValues, z.ZodTypeDef, BaseInputValues>
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  CreateInputValues
> = BaseShape.merge(PidShape).merge(
  MachineRelationshipShape,
) as unknown as z.ZodType<CreateValues, z.ZodTypeDef, CreateInputValues>
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  UpdateInputValues
> = BaseSchema
