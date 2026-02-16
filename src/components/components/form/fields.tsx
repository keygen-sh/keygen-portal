import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import * as Schemas from "@/schemas"

import {
  ComponentFormFieldDescriptions,
  ComponentCreateFormFieldDescriptions,
  ComponentEditFormFieldDescriptions,
} from "@/types/components"

import { useListMachines } from "@/queries/machines"

import * as Forms from "@/components/forms"
import SearchSelect from "@/components/search-select"
import KeyValueInput from "@/components/key-value-input"

type ComponentFieldName = "name" | "fingerprint" | "machineId" | "metadata"

type FieldVariant = "row" | "stacking" | "inline" | "none"
type Descriptions = typeof ComponentFormFieldDescriptions

interface ComponentsFormFieldsProps {
  include?: ComponentFieldName[]
  exclude?: ComponentFieldName[]
  autoFocus?: ComponentFieldName
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const DefaultFieldSort: ComponentFieldName[] = [
  "name",
  "fingerprint",
  "machineId",
  "metadata",
]

export default function ComponentsFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: ComponentsFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? ComponentCreateFormFieldDescriptions
      : schema === "edit"
        ? ComponentEditFormFieldDescriptions
        : ComponentFormFieldDescriptions

  const fields = include
    ? include
    : DefaultFieldSort.filter((field) => !exclude.includes(field))

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
          case "fingerprint":
            return (
              <FingerprintField
                key="fingerprint"
                autoFocus={autoFocus === "fingerprint"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "machineId":
            return (
              <MachineIdField
                key="machineId"
                autoFocus={autoFocus === "machineId"}
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
  const form = useFormContext<Schemas.Components.BaseValues>()

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
                value={field.value || ""}
                variant="title"
                placeholder="Enter component name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Component name"
              variant={fieldVariant}
              tooltip={descriptions.name}
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter component name..."
                  autoFocus={autoFocus}
                  autoComplete="off"
                />
              </FormControl>
            </Forms.Field.Header>
          )}
          <FormMessage className={titleVariant ? "ml-2" : undefined} />
        </FormItem>
      )}
    />
  )
}

function FingerprintField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Components.CreateValues>()

  return (
    <FormField
      control={form.control}
      name="fingerprint"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Fingerprint"
            variant={fieldVariant}
            tooltip={descriptions.fingerprint}
          >
            <FormControl>
              <Input
                {...field}
                value={field.value || ""}
                placeholder="Enter component fingerprint..."
                autoFocus={autoFocus}
                autoComplete="off"
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MachineIdField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Components.CreateValues>()
  const { data: machines = [] } = useListMachines()

  return (
    <FormField
      control={form.control}
      name="machineId"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Machine"
            variant={fieldVariant}
            tooltip={descriptions.machine}
          >
            <SearchSelect
              resource="machine"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              options={machines}
              allowClear={false}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
              truncate="middle"
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MetadataField({
  autoFocus,
  fieldVariant = "stacking",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Components.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="metadata"
      render={() => (
        <FormItem>
          <Forms.Field.Header
            label="Metadata"
            variant={fieldVariant}
            tooltip={descriptions.metadata}
          >
            <FormControl>
              <KeyValueInput<Schemas.Components.BaseValues>
                name="metadata"
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
