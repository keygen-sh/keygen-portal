import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { Writable, OptionalExcept } from "@/types/utility"
import { ReleaseAttributes, ReleaseChannel } from "@/types/releases"

export type BaseValues = Writable<
  OptionalExcept<ReleaseAttributes, "version">
> & {
  constraints?: { attach?: string[] }
  packages?: { attach?: string[] }
}
export type CreateValues = BaseValues & { productId: string }
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type FieldNames =
  | Exclude<FieldPath<AllValues>, "constraints" | "packages">
  | "constraints.attach"
  | "packages.attach"
  | "productId"

const BaseShape = z.object({
  name: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
  version: z.string().trim().min(1, "Version is required"),
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
  metadata: z.record(z.unknown()).default({}),
  backdated: z.string().nullable().optional(),
  constraints: z
    .object({
      attach: z.array(z.string()).default([]),
    })
    .default({ attach: [] }),
  packages: z
    .object({
      attach: z.array(z.string()).default([]),
    })
    .default({ attach: [] }),
})

const ProductShape = z.object({
  productId: z.string().min(1, "Product is required"),
})

const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}
export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<CreateValues> = BaseRules(
  BaseShape.merge(ProductShape),
) as z.ZodType<CreateValues>
export const UpdateSchema: z.ZodType<UpdateValues> = BaseSchema
