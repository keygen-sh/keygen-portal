import { z } from "zod"

import { Writable } from "@/types/api"
import { LicenseAttributes } from "@/types/licenses"

export type BaseValues = Writable<
  Partial<
    Pick<
      LicenseAttributes,
      | "name"
      | "key"
      | "expiry"
      | "maxMachines"
      | "maxProcesses"
      | "maxUsers"
      | "maxCores"
      | "maxUses"
      | "metadata"
    >
  >
> & {
  suspended?: boolean | null
  protected?: boolean | null
}

export type CreateValues = BaseValues & { policyId: string }
export type UpdateValues = Partial<BaseValues>

const BaseShape = z.object({
  name: z.string().trim().nullable().optional(),
  key: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || value.length >= 8,
      "Key must be at least 8 characters",
    ),
  expiry: z.string().nullable().optional(),
  suspended: z.boolean().optional().nullable().default(null),
  protected: z.boolean().optional().nullable().default(null),
  maxMachines: z.number().int().positive().nullable().optional(),
  maxProcesses: z.number().int().positive().nullable().optional(),
  maxUsers: z.number().int().positive().nullable().optional(),
  maxCores: z.number().int().positive().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
})

const PolicyShape = z.object({
  policyId: z.string().min(1, "Policy is required"),
})

const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}
export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<CreateValues> = BaseRules(
  BaseShape.merge(PolicyShape),
) as z.ZodType<CreateValues>
export const UpdateSchema: z.ZodType<UpdateValues> = BaseSchema
