import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { Writable, OptionalExcept } from "@/types/utility"
import { ProductAttributes, DistributionStrategy } from "@/types/products"
import { MetadataPairsSchema, WithMetadataInput } from "@/schemas/metadata"

export type BaseValues = Writable<
  OptionalExcept<ProductAttributes, "name" | "code">
>
export type CreateValues = BaseValues
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type BaseInputValues = WithMetadataInput<BaseValues>
export type CreateInputValues = WithMetadataInput<CreateValues>
export type UpdateInputValues = WithMetadataInput<UpdateValues>

export type FieldNames = FieldPath<AllValues>

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
  metadata: MetadataPairsSchema,
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
  BaseRules(BaseShape)
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  CreateInputValues
> = BaseSchema
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  UpdateInputValues
> = BaseSchema

const StrategyShape = BaseShape.pick({ distributionStrategy: true })
const StrategyRules = (
  schema: z.ZodObject<Pick<typeof BaseShape.shape, "distributionStrategy">>,
): z.ZodObject<Pick<typeof BaseShape.shape, "distributionStrategy">> => {
  // schema.refine(...)
  return schema
}
export const StrategySchema = StrategyRules(StrategyShape)
export type StrategyValues = z.infer<typeof StrategySchema>

const AttributesShape = BaseShape.omit({ distributionStrategy: true })
const AttributesRules = (
  schema: z.ZodObject<Omit<typeof BaseShape.shape, "distributionStrategy">>,
): z.ZodObject<Omit<typeof BaseShape.shape, "distributionStrategy">> => {
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
