import { useFormContext, FieldValues } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import * as Schemas from "@/schemas"
import {
  EntitlementFormFieldDescriptions,
  EntitlementCreateFormFieldDescriptions,
  EntitlementEditFormFieldDescriptions,
} from "@/types/entitlements"
import { type FieldVariant } from "@/components/forms/field"

import * as Forms from "@/components/forms"
import KeyValueInput from "@/components/key-value-input"
type Descriptions = typeof EntitlementFormFieldDescriptions

interface EntitlementsFormFieldsProps {
  include?: Schemas.Entitlements.FieldNames[]
  exclude?: Schemas.Entitlements.FieldNames[]
  autoFocus?: Schemas.Entitlements.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const INCLUDE_DEFAULT_FIELDS: Schemas.Entitlements.FieldNames[] = [
  "name",
  "code",
  "metadata",
]

export default function EntitlementsFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: EntitlementsFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? EntitlementCreateFormFieldDescriptions
      : schema === "edit"
        ? EntitlementEditFormFieldDescriptions
        : EntitlementFormFieldDescriptions

  const fields = include
    ? include
    : INCLUDE_DEFAULT_FIELDS.filter((field) => !exclude.includes(field))

  return (
    <>
      {fields.map((field) => {
        switch (field) {
          case "name":
            return (
              <NameField
                key="name"
                autoFocus={autoFocus === "name"}
                titleVariant={titleVariant}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "code":
            return (
              <CodeField
                key="code"
                autoFocus={autoFocus === "code"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "metadata":
            return (
              <MetadataField
                key="metadata"
                autoFocus={autoFocus === "metadata"}
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

function NameField({
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
  const form = useFormContext<
    Schemas.Entitlements.CreateValues | Schemas.Entitlements.UpdateValues
  >()

  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          {titleVariant ? (
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                variant="title"
                placeholder="Enter entitlement name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Entitlement name"
              variant={fieldVariant}
              tooltip={descriptions.name}
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Enter entitlement name..."
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

function CodeField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<
    Schemas.Entitlements.CreateValues | Schemas.Entitlements.UpdateValues
  >()

  return (
    <FormField
      control={form.control}
      name="code"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Code"
            variant={fieldVariant}
            tooltip={descriptions.code}
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="example"
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

function MetadataField<T extends FieldValues>({
  autoFocus,
  fieldVariant = "stacking",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<T>()

  return (
    <FormField
      control={form.control}
      name={"metadata" as never}
      render={() => (
        <FormItem>
          <Forms.Field.Header
            label="Metadata"
            variant={fieldVariant}
            optional
            tooltip={descriptions.metadata}
          >
            <FormControl>
              <KeyValueInput<T>
                name={"metadata" as never}
                autoFocus={autoFocus}
              />
            </FormControl>
          </Forms.Field.Header>
        </FormItem>
      )}
    />
  )
}
