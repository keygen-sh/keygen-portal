import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { Override } from "@/types/utility"
import { SigningAlgorithm } from "@/types/files"
import { CombineFormValues } from "@/types/forms"
import { LicenseAttributes, LicenseFileAttributes } from "@/types/licenses"
import {
  MetadataPairsSchema,
  WithMetadataInput,
  type MetadataPair,
} from "@/schemas/metadata"

export type BaseValues = Partial<
  Override<
    Pick<
      LicenseAttributes,
      | "name"
      | "key"
      | "suspended"
      | "protected"
      | "expiry"
      | "maxMachines"
      | "maxProcesses"
      | "maxUsers"
      | "maxCores"
      | "maxUses"
      | "metadata"
    >,
    {
      key?: string | null
      suspended?: boolean | null
      protected?: boolean | null
    }
  >
> & {
  entitlements?: {
    attach?: string[]
    create?: {
      name: string
      code: string
      metadata?: Record<string, unknown>
    }[]
  }
  users?: {
    attach?: string[]
  }
}
export type CreateValues = BaseValues & { policyId: string }
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type BaseInputValues = Omit<
  WithMetadataInput<BaseValues>,
  "entitlements"
> & {
  entitlements?: {
    attach?: string[]
    create?: { name: string; code: string; metadata?: MetadataPair[] }[]
  }
}
export type CreateInputValues = BaseInputValues & { policyId: string }
export type UpdateInputValues = Partial<BaseInputValues>

export type FieldNames = Exclude<FieldPath<AllValues>, "entitlements" | "users">

const BaseShape = z.object({
  name: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
  key: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? null : value))
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
  metadata: MetadataPairsSchema,
  entitlements: z
    .object({
      attach: z.array(z.string()).default([]),
      create: z
        .array(
          z.object({
            name: z.string().min(1),
            code: z.string().min(1),
            metadata: MetadataPairsSchema.optional(),
          }),
        )
        .default([]),
    })
    .default({ attach: [], create: [] }),
  users: z
    .object({
      attach: z.array(z.string()).default([]),
    })
    .default({ attach: [] }),
})

const PolicyShape = z.object({
  policyId: z.string().min(1, "Policy is required"),
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
  BaseRules(
    BaseShape as unknown as z.ZodType<
      BaseValues,
      z.ZodTypeDef,
      BaseInputValues
    >,
  )
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  CreateInputValues
> = BaseRules(
  BaseShape.merge(PolicyShape) as unknown as z.ZodType<
    BaseValues,
    z.ZodTypeDef,
    BaseInputValues
  >,
) as unknown as z.ZodType<CreateValues, z.ZodTypeDef, CreateInputValues>
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  UpdateInputValues
> = BaseSchema

export type CheckOutValues = Pick<
  LicenseFileAttributes,
  "include" | "ttl" | "algorithm"
> & {
  includeEnabled: boolean
  ttlEnabled: boolean
  encryptEnabled: boolean
}

const CheckOutShape = z.object({
  includeEnabled: z.boolean().default(false),
  include: z.array(z.string()).default([]),
  ttlEnabled: z.boolean().default(false),
  ttl: z.number().nullable().default(null),
  encryptEnabled: z.boolean().default(false),
  algorithm: z.string().default(SigningAlgorithm.Ed25519),
})

const CheckOutRules = (
  schema: z.ZodType<CheckOutValues, z.ZodTypeDef, unknown>,
): z.ZodType<CheckOutValues, z.ZodTypeDef, unknown> => {
  return schema
}

export const CheckOutSchema = CheckOutRules(CheckOutShape)
