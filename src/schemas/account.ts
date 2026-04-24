import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { Writable } from "@/types/utility"
import { CombineFormValues } from "@/types/forms"
import { AccountAttributes } from "@/types/accounts"

export type BaseValues = Record<string, unknown>
export type UpdateValues = Writable<Pick<AccountAttributes, "name" | "slug">>
export type DeveloperValues = Writable<
  Pick<AccountAttributes, "apiVersion" | "protected">
>
export type PermissionsValues = {
  defaultUserPermissions?: string[] | null
  defaultLicensePermissions?: string[] | null
}
export type AllValues = CombineFormValues<BaseValues, UpdateValues> &
  DeveloperValues &
  PermissionsValues

export type FieldNames = FieldPath<AllValues>

const BaseShape = z.object({})

const BaseRules = <S extends typeof BaseShape>(schema: S): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema = BaseRules(BaseShape)

const UpdateShape = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.string().trim().min(1, "Slug is required"),
})

const UpdateRules = <S extends typeof UpdateShape>(schema: S): S => {
  return schema
}

export const UpdateSchema = UpdateRules(UpdateShape)

const DeveloperShape = z.object({
  apiVersion: z.string().trim().min(1, "API Version is required"),
  protected: z.boolean(),
})

const DeveloperRules = <S extends typeof DeveloperShape>(schema: S): S => {
  return schema
}

export const DeveloperSchema = DeveloperRules(DeveloperShape)

const PermissionsShape = z.object({
  defaultUserPermissions: z.array(z.string()).nullable().optional(),
  defaultLicensePermissions: z.array(z.string()).nullable().optional(),
})

const PermissionsRules = <S extends typeof PermissionsShape>(schema: S): S => {
  return schema
}

export const PermissionsSchema = PermissionsRules(PermissionsShape)
