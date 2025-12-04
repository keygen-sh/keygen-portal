import { z } from "zod"

import { Writable, OptionalExcept } from "@/types/api"
import { ProductAttributes, DistributionStrategy } from "@/types/products"

export type BaseValues = Writable<
  OptionalExcept<ProductAttributes, "name" | "code">
>

export type CreatePayload = BaseValues
export type UpdatePayload = Partial<BaseValues>

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
  permissions: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  metadata: z.record(z.string()).default({}),
})
const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}
export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)

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
