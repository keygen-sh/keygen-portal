import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues, FormFieldError } from "@/types/forms"
import { Writable, OptionalExcept } from "@/types/utility"
import { EntitlementAttributes } from "@/types/entitlements"
import { MetadataPairsSchema } from "@/schemas/metadata"

import * as Forms from "@/schemas"

export type BaseValues = Writable<
  OptionalExcept<EntitlementAttributes, "name" | "code">
>
export type CreateValues = BaseValues
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type FieldNames = FieldPath<AllValues>

const BaseShape = z.object({
  name: z.string().trim().min(1, "Entitlement name is required"),
  code: z.string().trim().min(1, "Entitlement code is required"),
  metadata: MetadataPairsSchema,
})

const BaseRules = <S extends z.ZodTypeAny>(schema: S): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseSchema
export const UpdateSchema = BaseRules(BaseShape.partial())

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>

export class CreateValidationError<
  T extends Forms.Policies.BaseValues = Forms.Policies.BaseValues,
> extends Error {
  constructor(
    public nextAttach: string[],
    public nextCreate: NonNullable<T["entitlements"]>["create"],
    public fieldErrors: FormFieldError<T>[],
  ) {
    super("Failed to create entitlement(s)")
    this.name = "CreateEntitlementValidationError"
  }
}
