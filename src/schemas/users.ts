import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { UserAttributes, UserRole } from "@/types/users"
import { Writable, OptionalExcept } from "@/types/utility"

export type BaseValues = Writable<OptionalExcept<UserAttributes, "email">> & {
  groupId?: string | null
  password?: string | null
}
export type CreateValues = BaseValues
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type FieldNames = FieldPath<AllValues>

const BaseShape = z.object({
  email: z.string().trim().email("Email is invalid"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .nullable()
    .optional(),
  firstName: z.string().trim().nullable().optional(),
  lastName: z.string().trim().nullable().optional(),
  role: z.nativeEnum(UserRole).optional(),
  permissions: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).default({}),
  groupId: z.string().nullable().optional(),
})

const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  return schema
}

export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<CreateValues> = BaseSchema
export const UpdateSchema: z.ZodType<UpdateValues> = BaseSchema
