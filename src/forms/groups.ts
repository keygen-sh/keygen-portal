import { z } from "zod"

import { Writable, OptionalExcept } from "@/types/api"
import { GroupAttributes } from "@/types/groups"

export type BaseValues = Writable<OptionalExcept<GroupAttributes, "name">>
export type CreateValues = BaseValues
export type UpdateValues = Partial<BaseValues>

const BaseShape = z.object({
  name: z.string().trim().min(1, "Name is required"),
  maxUsers: z.number().int().positive().nullable().optional(),
  maxLicenses: z.number().int().positive().nullable().optional(),
  maxMachines: z.number().int().positive().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
})

const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<CreateValues> = BaseSchema
export const UpdateSchema: z.ZodType<UpdateValues> = BaseSchema
