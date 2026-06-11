import { FieldPath } from "react-hook-form"
import { z } from "zod"

import { APIVersion } from "@/types/api"
import { WebhookEndpoint } from "@/types/webhook-endpoints"
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
  product: z.object({
    id: z.string().optional().default(""),
  }),
})

const CreateShape = BaseShape
const UpdateShape = BaseShape

type AnyShape = typeof BaseShape // rest omitted here due to lint issues since they're currently no different from base

const BaseRules = <S extends AnyShape>(schema: S): S => {
  // Custom rules can be added here in the future, e.g.
  // schema.refine(...)
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

export type FieldNames = Exclude<FieldPath<AllValues>, "product.id">

export const CreateDefaults: CreateFormValues = {
  url: "",
  subscriptions: ["*"],
  signatureAlgorithm: SigningAlgorithm.Ed25519,
  apiVersion: APIVersion.V1_8,
  product: { id: "" },
}

export function getFormValuesFromWebhookEndpoint(
  webhookEndpoint: WebhookEndpoint,
): UpdateFormValues {
  return {
    url: webhookEndpoint.attributes.url,
    subscriptions: webhookEndpoint.attributes.subscriptions ?? ["*"],
    signatureAlgorithm: webhookEndpoint.attributes.signatureAlgorithm,
    apiVersion: webhookEndpoint.attributes.apiVersion,
    product: { id: webhookEndpoint.relationships.product?.data?.id ?? "" },
  }
}
