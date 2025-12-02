import { z } from "zod"

import { FormFieldError } from "@/types/forms"
import { Writable, OptionalExcept } from "@/types/api"
import { EntitlementAttributes } from "@/types/entitlements"

import * as Forms from "@/forms"

export type BaseValues = Writable<
  OptionalExcept<EntitlementAttributes, "name" | "code">
>

export type CreatePayload = BaseValues
export type UpdatePayload = Partial<BaseValues>

const BaseShape = z.object({
  name: z.string().trim().min(1, "Entitlement name is required"),
  code: z.string().trim().min(1, "Entitlement code is required"),
  metadata: z.record(z.string()).default({}),
})

const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)

export class CreateValidationError extends Error {
  constructor(
    public nextAttach: string[],
    public nextCreate: NonNullable<
      Forms.Policies.BaseValues["entitlements"]
    >["create"],
    public fieldErrors: FormFieldError<Forms.Policies.BaseValues>[],
  ) {
    super("Failed to create entitlement(s)")
    this.name = "CreateEntitlementValidationError"
  }
}
