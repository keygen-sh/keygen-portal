import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"

import { ComponentAttributes } from "@/types/components"
import { Writable, OptionalExcept } from "@/types/utility"
import { MetadataPairsSchema } from "@/schemas/metadata"

export type BaseValues = Writable<OptionalExcept<ComponentAttributes, "name">>
export type CreateValues = BaseValues & {
  fingerprint: string
  machineId: string
}
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type FieldNames = FieldPath<AllValues>

const BaseShape = z.object({
  name: z.string().trim().min(1, "Name is required"),
  metadata: MetadataPairsSchema,
})

const FingerprintShape = z.object({
  fingerprint: z.string().trim().min(1, "Fingerprint is required"),
})

const MachineRelationshipShape = z.object({
  machineId: z.string().min(1, "Machine is required"),
})

const BaseRules = <
  S extends z.ZodType<BaseValues, z.ZodTypeDef, z.input<typeof BaseShape>>,
>(
  schema: S,
): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema: z.ZodType<
  BaseValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape>
> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape> &
    z.input<typeof FingerprintShape> &
    z.input<typeof MachineRelationshipShape>
> = BaseRules(
  BaseShape.merge(FingerprintShape).merge(
    MachineRelationshipShape,
  ) as unknown as z.ZodType<
    BaseValues,
    z.ZodTypeDef,
    z.input<typeof BaseShape>
  >,
) as unknown as z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape> &
    z.input<typeof FingerprintShape> &
    z.input<typeof MachineRelationshipShape>
>
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  Partial<z.input<typeof BaseShape>>
> = BaseSchema

export type BaseInputValues = z.input<typeof BaseSchema>
export type CreateInputValues = z.input<typeof CreateSchema>
export type UpdateInputValues = z.input<typeof UpdateSchema>
