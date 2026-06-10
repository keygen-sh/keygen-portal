import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { APIVersion } from "@/types/api"
import { Endpoint } from "@/types/endpoints"
import { SigningAlgorithm } from "@/types/files"
import { CombineFormValues } from "@/types/forms"

const BaseShape = z.object({
  url: z
    .string({ required_error: "URL is required" })
    .trim()
    .min(1, "URL is required")
    .url("Must be a valid URL")
    .startsWith("https://", "URL must use the https protocol"),
  subscriptions: z
    .array(z.string())
    .min(1, "Select at least one event subscription"),
  signatureAlgorithm: z
    .nativeEnum(SigningAlgorithm)
    .default(SigningAlgorithm.Ed25519),
  apiVersion: z.nativeEnum(APIVersion).default(APIVersion.V1_8),
})

export const ProductShape = z.object({
  product: z.object({
    id: z.string().optional().default(""),
  }),
})

export const BaseSchema = BaseShape
export const CreateSchema = BaseShape.merge(ProductShape)
export const UpdateSchema = BaseShape.merge(ProductShape)

export type BaseFormValues = z.input<typeof BaseSchema>
export type CreateFormValues = z.input<typeof CreateSchema>
export type UpdateFormValues = z.input<typeof UpdateSchema>

export type BaseValues = z.output<typeof BaseSchema>
export type CreateValues = z.output<typeof CreateSchema>
export type UpdateValues = z.output<typeof UpdateSchema>
export type AllValues = CombineFormValues<
  CreateValues,
  CreateValues,
  UpdateValues
>

export type FieldNames = Exclude<FieldPath<AllValues>, "product.id">

export const CreateDefaults: CreateFormValues = {
  url: "",
  subscriptions: ["*"],
  signatureAlgorithm: SigningAlgorithm.Ed25519,
  apiVersion: APIVersion.V1_8,
  product: { id: "" },
}

export function getFormValuesFromEndpoint(
  endpoint: Endpoint,
): UpdateFormValues {
  return {
    url: endpoint.attributes.url,
    subscriptions: endpoint.attributes.subscriptions ?? ["*"],
    signatureAlgorithm: endpoint.attributes.signatureAlgorithm,
    apiVersion: endpoint.attributes.apiVersion,
    product: { id: endpoint.relationships.product?.data?.id ?? "" },
  }
}
