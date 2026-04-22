import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { UserAttributes, UserRole } from "@/types/users"
import { Writable, OptionalExcept } from "@/types/utility"
import { MetadataPairsSchema, WithMetadataInput } from "@/schemas/metadata"

export type BaseValues = Writable<OptionalExcept<UserAttributes, "email">> & {
  groupId?: string | null
  password?: string | null
}
export type CreateValues = BaseValues
export type UpdateValues = Partial<BaseValues>

export type BaseInputValues = WithMetadataInput<BaseValues>
export type CreateInputValues = WithMetadataInput<CreateValues>
export type UpdateInputValues = WithMetadataInput<UpdateValues>
export type PasswordValues = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
export type InviteValues = {
  email: string
  firstName?: string | null
  lastName?: string | null
  role: UserRole
  permissions?: string[]
}
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
> &
  PasswordValues

export type FieldNames =
  | FieldPath<AllValues>
  | "internalRole"
  | "internalPermissions"

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
  permissions: z.array(z.string()).nullable().optional(),
  metadata: MetadataPairsSchema,
  groupId: z.string().nullable().optional(),
})

const BaseRules = <
  S extends z.ZodType<BaseValues, z.ZodTypeDef, BaseInputValues>,
>(
  schema: S,
): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema: z.ZodType<BaseValues, z.ZodTypeDef, BaseInputValues> =
  BaseRules(BaseShape)
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  CreateInputValues
> = BaseSchema
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  UpdateInputValues
> = BaseSchema

const PasswordShape = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const PasswordRules = (
  schema: z.ZodType<PasswordValues>,
): z.ZodType<PasswordValues> => {
  return schema
}

export const PasswordSchema: z.ZodType<PasswordValues> = PasswordRules(
  PasswordShape as z.ZodType<PasswordValues>,
)

const InviteShape = z.object({
  email: z.string().trim().email("Email is invalid"),
  firstName: z.string().trim().nullable().optional(),
  lastName: z.string().trim().nullable().optional(),
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.string()).nullable().optional(),
})

const InviteRules = (
  schema: z.ZodType<InviteValues>,
): z.ZodType<InviteValues> => {
  return schema
}

export const InviteSchema: z.ZodType<InviteValues> = InviteRules(
  InviteShape as z.ZodType<InviteValues>,
)

export const SchemaMap = {
  base: BaseSchema,
  create: CreateSchema,
  edit: UpdateSchema,
  profile: UpdateSchema,
  password: PasswordSchema,
  invite: InviteSchema,
} as const

export type SchemaNames = keyof typeof SchemaMap
