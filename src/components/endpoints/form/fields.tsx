import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import * as Schemas from "@/schemas"
import { APIVersion } from "@/types/api"
import { EventTypes } from "@/types/events"
import { type FieldVariant } from "@/components/forms/field"
import { EndpointFormFieldDescriptions } from "@/types/endpoints"
import { SigningAlgorithm, SigningAlgorithmLabels } from "@/types/files"

import { useListProducts } from "@/queries/products"

import * as Forms from "@/components/forms"
import * as Search from "@/components/search"
import MultiSelect from "@/components/multi-select"

type Descriptions = typeof EndpointFormFieldDescriptions

interface EndpointsFormFieldsProps {
  include?: Schemas.Endpoints.FieldNames[]
  exclude?: Schemas.Endpoints.FieldNames[]
  autoFocus?: Schemas.Endpoints.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const INCLUDE_DEFAULT_FIELDS: Schemas.Endpoints.FieldNames[] = [
  "url",
  "subscriptions",
  "signatureAlgorithm",
  "apiVersion",
  "product",
]

export default function EndpointsFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
}: EndpointsFormFieldsProps) {
  const descriptions = EndpointFormFieldDescriptions

  const fields = include
    ? include
    : INCLUDE_DEFAULT_FIELDS.filter((field) => !exclude.includes(field))

  return (
    <>
      {fields.map((field) => {
        switch (field) {
          case "url":
            return (
              <UrlField
                key="url"
                autoFocus={autoFocus === "url"}
                titleVariant={titleVariant}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "subscriptions":
            return (
              <SubscriptionsField
                key="subscriptions"
                autoFocus={autoFocus === "subscriptions"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "signatureAlgorithm":
            return (
              <SignatureAlgorithmField
                key="signatureAlgorithm"
                autoFocus={autoFocus === "signatureAlgorithm"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "apiVersion":
            return (
              <ApiVersionField
                key="apiVersion"
                autoFocus={autoFocus === "apiVersion"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "product":
            return (
              <ProductField
                key="product"
                autoFocus={autoFocus === "product"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}

function UrlField({
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Endpoints.AllValues>()

  return (
    <FormField
      control={form.control}
      name="url"
      render={({ field }) => (
        <FormItem>
          {titleVariant ? (
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                variant="title"
                placeholder="https://example.com/webhooks"
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="URL"
              variant={fieldVariant}
              tooltip={descriptions.url}
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="https://example.com/webhooks"
                  autoFocus={autoFocus}
                  autoComplete="off"
                />
              </FormControl>
            </Forms.Field.Header>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SubscriptionsField({
  autoFocus,
  fieldVariant = "stacking",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Endpoints.AllValues>()

  return (
    <FormField
      control={form.control}
      name="subscriptions"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Subscriptions"
            variant={fieldVariant}
            tooltip={descriptions.subscriptions}
          >
            <MultiSelect
              value={field.value ?? []}
              onChange={(value) => field.onChange(value ?? [])}
              options={EventTypes.map((event) => ({
                label: event,
                value: event,
              }))}
              includeWildcard
              placeholder="Select events..."
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SignatureAlgorithmField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Endpoints.AllValues>()

  return (
    <FormField
      control={form.control}
      name="signatureAlgorithm"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Signature algorithm"
            variant={fieldVariant}
            tooltip={descriptions.signatureAlgorithm}
          >
            <Select
              value={field.value ?? ""}
              onValueChange={(value) => field.onChange(value)}
            >
              <FormControl>
                <SelectTrigger
                  className="w-full"
                  data-invalid={!!fieldState.error}
                  autoFocus={autoFocus}
                >
                  <SelectValue placeholder="Select algorithm..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.values(SigningAlgorithm).map((algorithm) => (
                  <SelectItem key={algorithm} value={algorithm}>
                    {SigningAlgorithmLabels[algorithm]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ApiVersionField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Endpoints.AllValues>()

  return (
    <FormField
      control={form.control}
      name="apiVersion"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="API version"
            variant={fieldVariant}
            tooltip={descriptions.apiVersion}
          >
            <Select
              value={field.value ?? ""}
              onValueChange={(value) => field.onChange(value)}
            >
              <FormControl>
                <SelectTrigger
                  className="w-full"
                  data-invalid={!!fieldState.error}
                  autoFocus={autoFocus}
                >
                  <SelectValue placeholder="Select version..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.values(APIVersion).map((version) => (
                  <SelectItem key={version} value={version}>
                    {version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ProductField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Endpoints.AllValues>()
  const { data: products = [] } = useListProducts()

  return (
    <FormField
      control={form.control}
      name="product.id"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Product relationship"
            variant={fieldVariant}
            optional
            tooltip={descriptions.product}
          >
            <FormControl>
              <Search.Select
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
                options={products}
                resource="products"
                autoFocus={autoFocus}
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
