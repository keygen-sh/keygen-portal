import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { ProcessAttributes } from "@/types/processes"
import { MetadataPairsSchema } from "@/schemas/metadata"

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

export const BaseSchema = BaseShape
export const CreateSchema = BaseShape.merge(PidShape).merge(
  MachineRelationshipShape,
)
export const UpdateSchema = BaseSchema

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>
