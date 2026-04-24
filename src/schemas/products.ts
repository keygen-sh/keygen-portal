import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { DistributionStrategy } from "@/types/products"
import { MetadataPairsSchema } from "@/schemas/metadata"

const BaseShape = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  code: z.string().trim().min(1, "Product code is required"),
  distributionStrategy: z.enum([
    DistributionStrategy.Licensed,
    DistributionStrategy.Open,
    DistributionStrategy.Closed,
  ]),
  url: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .refine((v) => !v || z.string().url().safeParse(v).success, {
      message: "Must be a valid URL",
    }),
  permissions: z.array(z.string()).nullable().default(null),
  platforms: z.array(z.string()).default([]),
  metadata: MetadataPairsSchema.optional(),
})
const UpdateShape = BaseShape.partial()

type AnyShape = typeof BaseShape | typeof UpdateShape

const BaseRules = <S extends AnyShape>(schema: S): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}

export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseSchema
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

const StrategyShape = BaseShape.pick({ distributionStrategy: true })
const StrategyRules = <S extends typeof StrategyShape>(schema: S): S => {
  // schema.refine(...)
  return schema
}
export const StrategySchema = StrategyRules(StrategyShape)
export type StrategyValues = z.infer<typeof StrategySchema>

const AttributesShape = BaseShape.omit({ distributionStrategy: true })
const AttributesRules = <S extends typeof AttributesShape>(schema: S): S => {
  // schema.refine(...)
  return schema
}
export const AttributesSchema = AttributesRules(AttributesShape)
export type AttributesValues = z.infer<typeof AttributesSchema>

export const SchemaMap = {
  base: BaseSchema,
  create: CreateSchema,
  edit: UpdateSchema,
} as const

export type SchemaNames = keyof typeof SchemaMap
