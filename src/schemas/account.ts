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

const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)

const UpdateShape = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.string().trim().min(1, "Slug is required"),
})

const UpdateRules = (
  schema: z.ZodType<UpdateValues>,
): z.ZodType<UpdateValues> => {
  return schema
}

export const UpdateSchema: z.ZodType<UpdateValues> = UpdateRules(UpdateShape)

const DeveloperShape = z.object({
  apiVersion: z.string().trim().min(1, "API Version is required"),
  protected: z.boolean(),
})

const DeveloperRules = (
  schema: z.ZodType<DeveloperValues>,
): z.ZodType<DeveloperValues> => {
  return schema
}

export const DeveloperSchema: z.ZodType<DeveloperValues> =
  DeveloperRules(DeveloperShape)

const PermissionsShape = z.object({
  defaultUserPermissions: z.array(z.string()).nullable().optional(),
  defaultLicensePermissions: z.array(z.string()).nullable().optional(),
})

const PermissionsRules = (
  schema: z.ZodType<PermissionsValues>,
): z.ZodType<PermissionsValues> => {
  return schema
}

export const PermissionsSchema: z.ZodType<PermissionsValues> =
  PermissionsRules(PermissionsShape)
