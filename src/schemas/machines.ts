import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { SigningAlgorithm } from "@/types/files"
import { CombineFormValues } from "@/types/forms"
import { MetadataPairsSchema } from "@/schemas/metadata"

const BaseShape = z.object({
  name: z.string().trim().nullable().optional(),
  ip: z.string().trim().nullable().optional(),
  hostname: z.string().trim().nullable().optional(),
  platform: z.string().trim().nullable().optional(),
  cores: z.number().int().positive().nullable().optional(),
  memory: z.number().int().positive().nullable().optional(),
  disk: z.number().int().positive().nullable().optional(),
  metadata: MetadataPairsSchema.optional(),
  groupId: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
})

const FingerprintShape = z.object({
  fingerprint: z.string().trim().min(1, "Fingerprint is required"),
})

const LicenseRelationshipShape = z.object({
  licenseId: z.string().min(1, "License is required"),
})

const CreateShape = BaseShape.merge(FingerprintShape).merge(
  LicenseRelationshipShape,
)
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

export type FieldNames = FieldPath<AllValues>

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
