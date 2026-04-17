import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { UserPermissions } from "@/types/users"
import { LicensePermissions } from "@/types/licenses"
import { type FieldVariant } from "@/components/forms/field"
import { AccountFormFieldDescriptions } from "@/types/accounts"

import * as Schemas from "@/schemas"

import * as Forms from "@/components/forms"
import MultiSelect from "@/components/multi-select"

type FieldNames = Schemas.Account.FieldNames

interface SettingsFormFieldsProps {
  include?: FieldNames[]
  exclude?: FieldNames[]
  autoFocus?: FieldNames
  fieldVariant?: FieldVariant
}

const IncludeDefaultFields: FieldNames[] = ["name", "slug"]

export default function SettingsFormFields({
  include,
  exclude = [],
  autoFocus,
  fieldVariant = "row",
}: SettingsFormFieldsProps) {
  const fields = include
    ? include
    : IncludeDefaultFields.filter((field) => !exclude.includes(field))

  return (
    <>
      {fields.map((field) => {
        switch (field) {
          case "name":
            return (
              <AccountNameField
                key="name"
                autoFocus={autoFocus === "name"}
                fieldVariant={fieldVariant}
              />
            )
          case "slug":
            return (
              <AccountSlugField
                key="slug"
                autoFocus={autoFocus === "slug"}
                fieldVariant={fieldVariant}
              />
            )
          case "apiVersion":
            return (
              <ApiVersionField
                key="apiVersion"
                autoFocus={autoFocus === "apiVersion"}
                fieldVariant={fieldVariant}
              />
            )
          case "protected":
            return (
              <ProtectedField
                key="protected"
                autoFocus={autoFocus === "protected"}
                fieldVariant={fieldVariant}
              />
            )
          case "defaultLicensePermissions":
            return (
              <LicensePermissionsField
                key="defaultLicensePermissions"
                autoFocus={autoFocus === "slug"}
              />
            )
          case "defaultUserPermissions":
            return (
              <UserPermissionsField
                key="defaultUserPermissions"
                autoFocus={autoFocus === "slug"}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}

function AccountNameField({
  autoFocus,
  fieldVariant = "row",
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
}) {
  const form = useFormContext<Schemas.Account.UpdateValues>()

  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Account name"
            variant={fieldVariant}
            tooltip={AccountFormFieldDescriptions.name}
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Account name"
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

function AccountSlugField({
  autoFocus,
  fieldVariant = "row",
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
}) {
  const form = useFormContext<Schemas.Account.UpdateValues>()

  return (
    <FormField
      control={form.control}
      name="slug"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Account slug"
            variant={fieldVariant}
            tooltip={AccountFormFieldDescriptions.slug}
            tooltipVariant="warning"
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="account-slug"
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

function ApiVersionField({
  autoFocus,
  fieldVariant = "row",
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
}) {
  const form = useFormContext<Schemas.Account.DeveloperValues>()

  return (
    <FormField
      control={form.control}
      name="apiVersion"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="API Version"
            variant={fieldVariant}
            tooltip={AccountFormFieldDescriptions.apiVersion}
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="1.0"
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

function ProtectedField({
  autoFocus,
  fieldVariant = "row",
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
}) {
  const form = useFormContext<Schemas.Account.DeveloperValues>()

  return (
    <FormField
      control={form.control}
      name="protected"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Protected"
            variant={fieldVariant}
            tooltip={AccountFormFieldDescriptions.protected}
          >
            <FormControl>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  autoFocus={autoFocus}
                />
                <span className="text-sm text-content-muted">
                  Enable account protection
                </span>
              </div>
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function LicensePermissionsField({ autoFocus }: { autoFocus?: boolean }) {
  const form = useFormContext<Schemas.Account.PermissionsValues>()

  return (
    <FormField
      control={form.control}
      name="defaultLicensePermissions"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="License permissions"
            variant="stacking"
            tooltip={AccountFormFieldDescriptions.defaultLicensePermissions}
          >
            <MultiSelect
              value={field.value}
              onChange={field.onChange}
              options={[
                { label: "*", value: "*" },
                ...LicensePermissions.map((p) => ({
                  label: p,
                  value: p,
                })),
              ]}
              includeNone
              includeWildcard
              placeholder="Leave blank to use defaults"
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function UserPermissionsField({ autoFocus }: { autoFocus?: boolean }) {
  const form = useFormContext<Schemas.Account.PermissionsValues>()

  return (
    <FormField
      control={form.control}
      name="defaultUserPermissions"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="User permissions"
            variant="stacking"
            tooltip={AccountFormFieldDescriptions.defaultUserPermissions}
          >
            <MultiSelect
              value={field.value}
              onChange={field.onChange}
              options={[
                { label: "*", value: "*" },
                ...UserPermissions.map((p) => ({
                  label: p,
                  value: p,
                })),
              ]}
              includeNone
              includeWildcard
              placeholder="Leave blank to use defaults"
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
