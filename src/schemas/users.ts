import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { UserAttributes, UserRole } from "@/types/users"
import { Writable, OptionalExcept } from "@/types/utility"
import { MetadataPairsSchema } from "@/schemas/metadata"

export type BaseValues = Writable<OptionalExcept<UserAttributes, "email">> & {
  groupId?: string | null
  password?: string | null
}
export type CreateValues = BaseValues
export type UpdateValues = Partial<BaseValues>

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

const UpdateShape = BaseShape.partial()

type AnyShape = typeof BaseShape | typeof UpdateShape

const BaseRules = <S extends AnyShape>(schema: S): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseSchema
export const UpdateSchema = BaseRules(UpdateShape)

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>

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

const PasswordRules = <S extends typeof PasswordShape>(schema: S): S => {
  return schema
}

export const PasswordSchema = PasswordRules(PasswordShape)

const InviteShape = z.object({
  email: z.string().trim().email("Email is invalid"),
  firstName: z.string().trim().nullable().optional(),
  lastName: z.string().trim().nullable().optional(),
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.string()).optional(),
})

const InviteRules = <S extends typeof InviteShape>(schema: S): S => {
  return schema
}

export const InviteSchema = InviteRules(InviteShape)

export const SchemaMap = {
  base: BaseSchema,
  create: CreateSchema,
  edit: UpdateSchema,
  profile: UpdateSchema,
  password: PasswordSchema,
  invite: InviteSchema,
} as const

export type SchemaNames = keyof typeof SchemaMap
