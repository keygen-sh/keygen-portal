import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { UserRole } from "@/types/users"

export type BaseValues = {
  email: string
  role: UserRole
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
  email: z.string().email("Please enter a valid email address"),
  role: z.nativeEnum(UserRole),
})

const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  return schema
}

export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<CreateValues> = BaseSchema
export const UpdateSchema: z.ZodType<UpdateValues> = BaseSchema
