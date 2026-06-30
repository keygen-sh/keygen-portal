import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { TokenBearerKind } from "@/types/tokens"

const BaseShape = z.object({
  bearerKind: z.nativeEnum(TokenBearerKind),
  bearerId: z.string().trim().nullable().optional(),
  name: z.string().trim().nullable().optional(),
  expiry: z.string().nullable().optional(),
  maxActivations: z.number().int().nullable().optional(),
  maxDeactivations: z.number().int().nullable().optional(),
  permissions: z.array(z.string()).nullable().optional(),
})

const BaseRules = <S extends typeof BaseShape>(schema: S) =>
  schema.refine(
    (data) => data.bearerKind === TokenBearerKind.Admin || !!data.bearerId,
    { message: "Select a bearer", path: ["bearerId"] },
  )

export const BaseSchema = BaseRules(BaseShape)
export const CreateSchema = BaseSchema

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>

export type BaseValues = z.output<typeof BaseSchema>
export type CreateValues = z.output<typeof CreateSchema>
export type AllValues = CombineFormValues<BaseValues, CreateValues, BaseValues>

export type FieldNames = FieldPath<AllValues>

export const SchemaMap = {
  base: BaseSchema,
  create: CreateSchema,
} as const

export type SchemaNames = keyof typeof SchemaMap
