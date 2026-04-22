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
  GroupFormFieldDescriptions,
  GroupCreateFormFieldDescriptions,
  GroupEditFormFieldDescriptions,
} from "@/types/groups"
import { type FieldVariant } from "@/components/forms/field"

import * as Forms from "@/components/forms"
import KeyValueInput from "@/components/key-value-input"

type Descriptions = typeof GroupFormFieldDescriptions

interface GroupsFormFieldsProps {
  include?: Schemas.Groups.FieldNames[]
  exclude?: Schemas.Groups.FieldNames[]
  autoFocus?: Schemas.Groups.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const INCLUDE_DEFAULT_FIELDS: Schemas.Groups.FieldNames[] = [
  "name",
  "maxUsers",
  "maxLicenses",
  "maxMachines",
  "metadata",
]

export default function GroupsFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: GroupsFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? GroupCreateFormFieldDescriptions
      : schema === "edit"
        ? GroupEditFormFieldDescriptions
        : GroupFormFieldDescriptions

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
          case "maxUsers":
            return (
              <MaxUsersField
                key="maxUsers"
                autoFocus={autoFocus === "maxUsers"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "maxLicenses":
            return (
              <MaxLicensesField
                key="maxLicenses"
                autoFocus={autoFocus === "maxLicenses"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "maxMachines":
            return (
              <MaxMachinesField
                key="maxMachines"
                autoFocus={autoFocus === "maxMachines"}
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
  const form = useFormContext<Schemas.Groups.BaseValues>()

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
                placeholder="Enter group name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus ?? field.value.length === 0}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Group name"
              variant={fieldVariant}
              tooltip={descriptions.name}
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter group name..."
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

function MaxUsersField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Groups.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="maxUsers"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max users"
            variant={fieldVariant}
            tooltip={descriptions.maxUsers}
            optional
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 10"
                {...field}
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? null : Number(value))
                }}
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MaxLicensesField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Groups.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="maxLicenses"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max licenses"
            variant={fieldVariant}
            tooltip={descriptions.maxLicenses}
            optional
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 100"
                {...field}
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? null : Number(value))
                }}
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MaxMachinesField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Groups.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="maxMachines"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max machines"
            variant={fieldVariant}
            tooltip={descriptions.maxMachines}
            optional
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 50"
                {...field}
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? null : Number(value))
                }}
              />
            </FormControl>
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
  const form = useFormContext<Schemas.Groups.BaseValues>()

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
              <KeyValueInput<Schemas.Groups.BaseValues>
                name="metadata"
                autoFocus={autoFocus}
              />
            </FormControl>
          </Forms.Field.Header>
        </FormItem>
      )}
    />
  )
}
