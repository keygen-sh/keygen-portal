import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { CombineFormValues } from "@/types/forms"
import { Writable, OptionalExcept } from "@/types/utility"
import { PackageAttributes, PackageEngine } from "@/types/packages"
import { MetadataPairsSchema, WithMetadataInput } from "@/schemas/metadata"

export type BaseValues = Writable<
  OptionalExcept<PackageAttributes, "name" | "key">
>
export type CreateValues = BaseValues & { productId: string }
export type UpdateValues = Partial<BaseValues>
export type AllValues = CombineFormValues<
  BaseValues,
  CreateValues,
  UpdateValues
>

export type BaseInputValues = WithMetadataInput<BaseValues>
export type CreateInputValues = WithMetadataInput<CreateValues>
export type UpdateInputValues = WithMetadataInput<UpdateValues>

export type FieldNames = Exclude<FieldPath<AllValues>, never> | "productId"

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
  metadata: MetadataPairsSchema,
})

const ProductShape = z.object({
  productId: z.string().min(1, "Product is required"),
})

const BaseRules = <
  S extends z.ZodType<BaseValues, z.ZodTypeDef, BaseInputValues>,
>(
  schema: S,
): S => {
  return schema
}
export const BaseSchema: z.ZodType<BaseValues, z.ZodTypeDef, BaseInputValues> =
  BaseRules(BaseShape)
export const CreateSchema: z.ZodType<
  CreateValues,
  z.ZodTypeDef,
  CreateInputValues
> = BaseRules(
  BaseShape.merge(ProductShape) as unknown as z.ZodType<
    BaseValues,
    z.ZodTypeDef,
    BaseInputValues
  >,
) as unknown as z.ZodType<CreateValues, z.ZodTypeDef, CreateInputValues>
export const UpdateSchema: z.ZodType<
  UpdateValues,
  z.ZodTypeDef,
  UpdateInputValues
> = BaseSchema
