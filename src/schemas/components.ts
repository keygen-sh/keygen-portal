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

const CreateShape = BaseShape.merge(FingerprintShape).merge(
  MachineRelationshipShape,
)

type AnyShape = typeof BaseShape | typeof CreateShape

const BaseRules = <S extends AnyShape>(schema: S): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseRules(CreateShape)
export const UpdateSchema = BaseSchema

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>
