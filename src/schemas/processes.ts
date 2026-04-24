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

export const BaseSchema: z.ZodType<
  BaseValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape>
> = BaseShape as unknown as z.ZodType<
  BaseValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape>
>
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape> &
    z.input<typeof PidShape> &
    z.input<typeof MachineRelationshipShape>
> = BaseShape.merge(PidShape).merge(
  MachineRelationshipShape,
) as unknown as z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape> &
    z.input<typeof PidShape> &
    z.input<typeof MachineRelationshipShape>
>
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape>
> = BaseSchema

export type BaseInputValues = z.input<typeof BaseSchema>
export type CreateInputValues = z.input<typeof CreateSchema>
export type UpdateInputValues = z.input<typeof UpdateSchema>
