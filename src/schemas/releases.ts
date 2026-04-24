import { FieldPath } from "react-hook-form"
import { z } from "zod"
import semver from "semver"

import { CombineFormValues } from "@/types/forms"
import { ReleaseChannel } from "@/types/releases"
import { MetadataPairsSchema } from "@/schemas/metadata"

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
  metadata: MetadataPairsSchema.optional(),
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

const CreateShape = BaseShape.merge(ProductShape)

type AnyShape = typeof BaseShape | typeof CreateShape

const BaseRules = <S extends AnyShape>(schema: S): S =>
  (schema as typeof BaseShape).superRefine(
    (
      data: { version: string; channel: ReleaseChannel },
      ctx: z.RefinementCtx,
    ) => {
      const version = semver.parse(data.version)
      if (!version) {
        return
      }

      const preTag =
        version.prerelease.length > 0 ? String(version.prerelease[0]) : null

      if (data.channel === ReleaseChannel.Stable) {
        if (preTag !== null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Stable versions must not include a prerelease tag",
            path: ["version"],
          })
        }
      } else {
        if (preTag !== data.channel) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Version must include a -${data.channel}.x prerelease tag`,
            path: ["version"],
          })
        }
      }
    },
  ) as unknown as S

const UpdateShape = BaseShape.partial()

export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseRules(CreateShape)
export const UpdateSchema = UpdateShape

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

export type FieldNames =
  | Exclude<FieldPath<AllValues>, "constraints">
  | "constraints.attach"
  | "productId"
