import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { SigningAlgorithm, TtlMode } from "@/types/files"
import { CombineFormValues } from "@/types/forms"
import { License } from "@/types/licenses"
import { Policy } from "@/types/policies"
import {
  normalizeLicenseLimits,
  normalizeLicensePermissions,
} from "@/lib/licenses"
import { NumberSchema } from "@/schemas/numbers"
import { MetadataPairsSchema, recordToMetadataPairs } from "@/schemas/metadata"

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
  maxMachines: NumberSchema.int().positive().nullable().optional(),
  maxProcesses: NumberSchema.int().positive().nullable().optional(),
  maxUsers: NumberSchema.int().positive().nullable().optional(),
  maxCores: NumberSchema.int().positive().nullable().optional(),
  maxMemory: NumberSchema.int().positive().nullable().optional(),
  maxDisk: NumberSchema.int().positive().nullable().optional(),
  maxUses: NumberSchema.int().positive().nullable().optional(),
  permissions: z.array(z.string()).nullable().optional(),
  metadata: MetadataPairsSchema.optional(),
  groupId: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
  policyId: z.string().min(1, "Policy is required"),
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

const CreateShape = BaseShape.merge(KeyShape)
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
  include: z.array(z.string()).default([]),
  ttlMode: z.nativeEnum(TtlMode).default(TtlMode.Default),
  ttl: NumberSchema.nullable().default(null),
  encryptEnabled: z.boolean().default(false),
  algorithm: z.string().default(SigningAlgorithm.Ed25519),
})

const CheckOutRules = <S extends typeof CheckOutShape>(schema: S) =>
  schema.refine(
    (data) =>
      data.ttlMode !== TtlMode.Expiry || data.ttl === null || data.ttl >= 0,
    {
      message: "License has expired, so its expiry cannot be matched",
      path: ["ttlMode"],
    },
  )

export const CheckOutSchema = CheckOutRules(CheckOutShape)

export type CheckOutFormValues = z.input<typeof CheckOutSchema>
export type CheckOutValues = z.output<typeof CheckOutSchema>

export function getFormValuesFromLicense<
  T extends BaseFormValues = BaseFormValues,
>(license: License, policy: Policy | null | undefined): T {
  const base: BaseFormValues = {
    name: license.attributes.name ?? "",
    expiry: license.attributes.expiry,
    metadata: recordToMetadataPairs(license.attributes.metadata),

    suspended: license.attributes.suspended,
    protected: license.attributes.protected,

    ...normalizeLicenseLimits(license, policy),

    permissions: normalizeLicensePermissions(
      license.attributes.permissions ?? null,
    ),

    policyId: license.relationships.policy?.data?.id ?? "",
    groupId: license.relationships.group?.data?.id ?? null,
    ownerId: license.relationships.owner?.data?.id ?? null,

    entitlements: {
      attach: (license.relationships.entitlements?.data ?? []).map((e) => e.id),
      create: [],
    },
    users: {
      attach: (license.relationships.users?.data ?? []).map((u) => u.id),
    },
  }

  return base as T
}
