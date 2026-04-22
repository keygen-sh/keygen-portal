import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues, FormFieldError } from "@/types/forms"
import { Writable, OptionalExcept } from "@/types/utility"
import { EntitlementAttributes } from "@/types/entitlements"
import { MetadataSchema } from "@/schemas/metadata"

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
  metadata: MetadataSchema,
})

const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<CreateValues> = BaseSchema
export const UpdateSchema: z.ZodType<UpdateValues> = BaseSchema

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
