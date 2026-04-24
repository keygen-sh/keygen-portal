import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { PackageEngine } from "@/types/packages"
import { MetadataPairsSchema } from "@/schemas/metadata"

const BaseShape = z.object({
  name: z.string().trim().min(1, "Package name is required"),
  key: z.string().trim().min(1, "Key is required"),
  engine: z
    .enum([
      PackageEngine.PyPI,
      PackageEngine.Tauri,
      PackageEngine.RubyGems,
      PackageEngine.Npm,
      PackageEngine.OCI,
      PackageEngine.Raw,
    ])
    .nullable()
    .optional(),
  metadata: MetadataPairsSchema.optional(),
})

const ProductShape = z.object({
  productId: z.string().min(1, "Product is required"),
})

const CreateShape = BaseShape.merge(ProductShape)
const UpdateShape = BaseShape.partial()

type AnyShape = typeof BaseShape | typeof CreateShape | typeof UpdateShape

const BaseRules = <S extends AnyShape>(schema: S): S => {
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

export type FieldNames = Exclude<FieldPath<AllValues>, never> | "productId"
