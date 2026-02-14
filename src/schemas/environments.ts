import { z } from "zod"

import { Writable } from "@/types/utility"
import { CombineFormValues } from "@/types/forms"
import { EnvironmentAttributes, IsolationStrategy } from "@/types/environments"

export type BaseValues = Writable<EnvironmentAttributes>
export type CreateValues = BaseValues
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

const BaseShape = z.object({
  name: z.string().trim().min(1, "Environment name is required"),
  code: z.string().trim().min(1, "Environment code is required"),
  isolationStrategy: z.enum([
    IsolationStrategy.Isolated,
    IsolationStrategy.Shared,
  ]),
})
const BaseRules = (schema: z.ZodType<BaseValues>): z.ZodType<BaseValues> => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}
export const BaseSchema: z.ZodType<BaseValues> = BaseRules(BaseShape)
export const CreateSchema: z.ZodType<CreateValues> = BaseSchema
export const UpdateSchema: z.ZodType<UpdateValues> = BaseSchema

const StrategyShape = BaseShape.pick({ isolationStrategy: true })
const StrategyRules = (
  schema: z.ZodObject<Pick<typeof BaseShape.shape, "isolationStrategy">>,
): z.ZodObject<Pick<typeof BaseShape.shape, "isolationStrategy">> => {
  // schema.refine(...)
  return schema
}
export const StrategySchema = StrategyRules(StrategyShape)
export type StrategyValues = z.infer<typeof StrategySchema>

const AttributesShape = BaseShape.omit({ isolationStrategy: true })
const AttributesRules = (
  schema: z.ZodObject<Omit<typeof BaseShape.shape, "isolationStrategy">>,
): z.ZodObject<Omit<typeof BaseShape.shape, "isolationStrategy">> => {
  // schema.refine(...)
  return schema
}
export const AttributesSchema = AttributesRules(AttributesShape)
export type AttributesValues = z.infer<typeof AttributesSchema>
