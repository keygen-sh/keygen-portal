import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"

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

export type BaseValues = z.output<typeof BaseSchema>
export type UpdateValues = z.output<typeof UpdateSchema>
export type DeveloperValues = z.output<typeof DeveloperSchema>
export type PermissionsValues = z.output<typeof PermissionsSchema>
export type AllValues = CombineFormValues<BaseValues, UpdateValues> &
  DeveloperValues &
  PermissionsValues

export type FieldNames = FieldPath<AllValues>
