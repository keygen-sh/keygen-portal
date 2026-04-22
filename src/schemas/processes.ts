import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { ProcessAttributes } from "@/types/processes"
import { MetadataSchema } from "@/schemas/metadata"

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
  metadata: MetadataSchema,
})

const PidShape = z.object({
  pid: z.string().trim().min(1, "Pid is required"),
})

const MachineRelationshipShape = z.object({
  machineId: z.string().min(1, "Machine is required"),
})

export const BaseSchema: z.ZodType<BaseValues> = BaseShape
export const CreateSchema: z.ZodType<CreateValues> = BaseShape.merge(
  PidShape,
).merge(MachineRelationshipShape) as z.ZodType<CreateValues>
export const UpdateSchema: z.ZodType<UpdateValues> = BaseSchema
