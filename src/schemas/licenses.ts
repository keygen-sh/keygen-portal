import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { SigningAlgorithm } from "@/types/files"
import { CombineFormValues } from "@/types/forms"
import { MetadataPairsSchema } from "@/schemas/metadata"

const BaseShape = z.object({
  name: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
  expiry: z.string().nullable().optional(),
  suspended: z.boolean().optional().nullable().default(null),
  protected: z.boolean().optional().nullable().default(null),
  maxMachines: z.number().int().positive().nullable().optional(),
  maxProcesses: z.number().int().positive().nullable().optional(),
  maxUsers: z.number().int().positive().nullable().optional(),
  maxCores: z.number().int().positive().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  metadata: MetadataPairsSchema.optional(),
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

const KeyShape = z.object({
  key: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? null : value))
    .refine(
      (value) => !value || value.length >= 8,
      "Key must be at least 8 characters",
    ),
})

const PolicyShape = z.object({
  policyId: z.string().min(1, "Policy is required"),
})

const CreateShape = BaseShape.merge(KeyShape).merge(PolicyShape)
const UpdateShape = BaseShape.partial()

type AnyShape = typeof BaseShape | typeof CreateShape | typeof UpdateShape

const BaseRules = <S extends AnyShape>(schema: S): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseRules(CreateShape)
export const UpdateSchema = BaseRules(UpdateShape)

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>

export type BaseValues = z.output<typeof BaseSchema>
export type CreateValues = z.output<typeof CreateSchema>
export type UpdateValues = z.output<typeof UpdateSchema>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type FieldNames = Exclude<FieldPath<AllValues>, "entitlements" | "users">

const CheckOutShape = z.object({
  includeEnabled: z.boolean().default(false),
  include: z.array(z.string()).default([]),
  ttlEnabled: z.boolean().default(false),
  ttl: z.number().nullable().default(null),
  encryptEnabled: z.boolean().default(false),
  algorithm: z.string().default(SigningAlgorithm.Ed25519),
})

const CheckOutRules = <S extends typeof CheckOutShape>(schema: S): S => {
  return schema
}

export const CheckOutSchema = CheckOutRules(CheckOutShape)

export type CheckOutFormValues = z.input<typeof CheckOutSchema>
export type CheckOutValues = z.output<typeof CheckOutSchema>
