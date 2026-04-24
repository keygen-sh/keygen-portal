import { FieldPath } from "react-hook-form"
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

export type FieldNames = FieldPath<AllValues>

const BaseShape = z.object({
  name: z.string().trim().min(1, "Environment name is required"),
  code: z.string().trim().min(1, "Environment code is required"),
  isolationStrategy: z.enum([
    IsolationStrategy.Isolated,
    IsolationStrategy.Shared,
  ]),
})
const BaseRules = <S extends z.ZodTypeAny>(schema: S): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
  return schema
}
export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseSchema
export const UpdateSchema = BaseRules(BaseShape.partial())

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>

const StrategyShape = BaseShape.pick({ isolationStrategy: true })
const StrategyRules = <S extends z.ZodTypeAny>(schema: S): S => {
  // schema.refine(...)
  return schema
}
export const StrategySchema = StrategyRules(StrategyShape)
export type StrategyValues = z.infer<typeof StrategySchema>

const AttributesShape = BaseShape.omit({ isolationStrategy: true })
const AttributesRules = <S extends z.ZodTypeAny>(schema: S): S => {
  // schema.refine(...)
  return schema
}
export const AttributesSchema = AttributesRules(AttributesShape)
export type AttributesValues = z.infer<typeof AttributesSchema>
