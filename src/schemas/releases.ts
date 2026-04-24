import { FieldPath } from "react-hook-form"
import { z } from "zod"
import semver from "semver"

import { CombineFormValues } from "@/types/forms"
import { Writable, OptionalExcept } from "@/types/utility"
import { ReleaseAttributes, ReleaseChannel } from "@/types/releases"
import { MetadataPairsSchema } from "@/schemas/metadata"

export type BaseValues = Writable<
  OptionalExcept<ReleaseAttributes, "version">
> & {
  packageId?: string | null
  constraints?: { attach?: string[] }
}
export type CreateValues = BaseValues & { productId: string }
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type FieldNames =
  | Exclude<FieldPath<AllValues>, "constraints">
  | "constraints.attach"
  | "productId"

const BaseShape = z.object({
  name: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
  version: z
    .string()
    .trim()
    .min(1, "Version is required")
    .refine((v) => semver.valid(v) !== null, "Must be a valid semver"),
  tag: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
  channel: z.enum([
    ReleaseChannel.Stable,
    ReleaseChannel.Rc,
    ReleaseChannel.Beta,
    ReleaseChannel.Alpha,
    ReleaseChannel.Dev,
  ]),
  description: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
  metadata: MetadataPairsSchema,
  backdated: z.string().nullable().optional(),
  constraints: z
    .object({
      attach: z.array(z.string()).default([]),
    })
    .default({ attach: [] }),
  packageId: z.string().nullable().optional(),
})

const ProductShape = z.object({
  productId: z.string().min(1, "Product is required"),
})

const BaseRules = <
  S extends z.ZodType<BaseValues, z.ZodTypeDef, z.input<typeof BaseShape>>,
>(
  schema: S,
): z.ZodType<BaseValues, z.ZodTypeDef, z.input<typeof BaseShape>> => {
  return schema.superRefine((data, ctx) => {
    const version = semver.parse(data.version)
    if (!version) {
      return
    }

    const channel = data.channel
    const preTag =
      version.prerelease.length > 0 ? String(version.prerelease[0]) : null

    if (channel === ReleaseChannel.Stable) {
      if (preTag !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stable versions must not include a prerelease tag",
          path: ["version"],
        })
      }
    } else {
      if (preTag !== channel) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Version must include a -${channel}.x prerelease tag`,
          path: ["version"],
        })
      }
    }
  }) as unknown as z.ZodType<
    BaseValues,
    z.ZodTypeDef,
    z.input<typeof BaseShape>
  >
}
export const BaseSchema: z.ZodType<
  BaseValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape>
> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape> & z.input<typeof ProductShape>
> = BaseRules(
  BaseShape.merge(ProductShape) as unknown as z.ZodType<
    BaseValues,
    z.ZodTypeDef,
    z.input<typeof BaseShape>
  >,
) as unknown as z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  z.input<typeof BaseShape> & z.input<typeof ProductShape>
>
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  Partial<z.input<typeof BaseShape>>
> = BaseSchema

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>
