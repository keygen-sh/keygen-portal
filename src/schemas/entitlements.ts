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
  z.input<typeof BaseShape>
> = BaseSchema
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  Partial<z.input<typeof BaseShape>>
> = BaseSchema

export type BaseInputValues = z.input<typeof BaseSchema>
export type CreateInputValues = z.input<typeof CreateSchema>
export type UpdateInputValues = z.input<typeof UpdateSchema>

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
