import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { MetadataPairsSchema } from "@/schemas/metadata"

const BaseShape = z.object({
  metadata: MetadataPairsSchema.optional(),
})

const PidShape = z.object({
  pid: z.string().trim().min(1, "Pid is required"),
})

const MachineRelationshipShape = z.object({
  machineId: z.string().min(1, "Machine is required"),
})

const CreateShape = BaseShape.merge(PidShape).merge(MachineRelationshipShape)

type AnyShape = typeof BaseShape | typeof CreateShape

const BaseRules = <S extends AnyShape>(schema: S): S => {
  return schema
}

export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseRules(CreateShape)
export const UpdateSchema = BaseSchema

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

export type FieldNames = FieldPath<AllValues>
