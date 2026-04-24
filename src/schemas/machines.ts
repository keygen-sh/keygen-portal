import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { Writable } from "@/types/utility"
import { SigningAlgorithm } from "@/types/files"
import { CombineFormValues } from "@/types/forms"
import { MachineAttributes, MachineFileAttributes } from "@/types/machines"
import { MetadataPairsSchema } from "@/schemas/metadata"

export type BaseValues = Writable<
  Partial<
    Pick<
      MachineAttributes,
      | "name"
      | "ip"
      | "hostname"
      | "platform"
      | "cores"
      | "memory"
      | "disk"
      | "metadata"
    >
  >
> & {
  groupId?: string | null
  ownerId?: string | null
}
export type CreateValues = BaseValues & {
  fingerprint: string
  licenseId: string
}
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type FieldNames = FieldPath<AllValues>

const BaseShape = z.object({
  name: z.string().trim().nullable().optional(),
  ip: z.string().trim().nullable().optional(),
  hostname: z.string().trim().nullable().optional(),
  platform: z.string().trim().nullable().optional(),
  cores: z.number().int().positive().nullable().optional(),
  memory: z.number().int().positive().nullable().optional(),
  disk: z.number().int().positive().nullable().optional(),
  metadata: MetadataPairsSchema,
  groupId: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
})

const FingerprintShape = z.object({
  fingerprint: z.string().trim().min(1, "Fingerprint is required"),
})

const LicenseRelationshipShape = z.object({
  licenseId: z.string().min(1, "License is required"),
})

const BaseRules = <
  S extends z.ZodType<BaseValues, z.ZodTypeDef, z.input<typeof BaseShape>>,
>(
  schema: S,
): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema: z.ZodType<
  BaseValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape>
> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape> &
    z.input<typeof FingerprintShape> &
    z.input<typeof LicenseRelationshipShape>
> = BaseRules(
  BaseShape.merge(FingerprintShape).merge(
    LicenseRelationshipShape,
  ) as unknown as z.ZodType<
    BaseValues,
    z.ZodTypeDef,
    z.input<typeof BaseShape>
  >,
) as unknown as z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape> &
    z.input<typeof FingerprintShape> &
    z.input<typeof LicenseRelationshipShape>
>
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  Partial<z.input<typeof BaseShape>>
> = BaseSchema

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>

export type CheckOutValues = Pick<
  MachineFileAttributes,
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
