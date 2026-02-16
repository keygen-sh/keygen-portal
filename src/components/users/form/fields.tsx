import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import * as Schemas from "@/schemas"

import { useListGroups } from "@/queries/groups"

import { Permissions } from "@/types/products"
import {
  UserRole,
  ExternalRoles,
  InternalRoles,
  UserRoleLabels,
  UserRoleDescriptions,
  UserFormFieldDescriptions,
  UserCreateFormFieldDescriptions,
  UserEditFormFieldDescriptions,
} from "@/types/users"

import * as Forms from "@/components/forms"
import MultiSelect from "@/components/multi-select"
import SearchSelect from "@/components/search-select"
import KeyValueInput from "@/components/key-value-input"
import TooltipSelectItem from "@/components/tooltip-select-item"

type UserFieldName =
  | "email"
  | "password"
  | "firstName"
  | "lastName"
  | "role"
  | "permissions"
  | "metadata"
  | "groupId"

type FieldVariant = "row" | "stacking" | "inline" | "none"
type Descriptions = typeof UserFormFieldDescriptions

interface UsersFormFieldsProps {
  include?: UserFieldName[]
  exclude?: UserFieldName[]
  autoFocus?: UserFieldName
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const DefaultFieldSort: UserFieldName[] = [
  "email",
  "password",
  "firstName",
  "lastName",
  "role",
  "permissions",
  "metadata",
  "groupId",
]

export default function UsersFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: UsersFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? UserCreateFormFieldDescriptions
      : schema === "edit"
        ? UserEditFormFieldDescriptions
        : UserFormFieldDescriptions

  const fields = include
    ? include
    : DefaultFieldSort.filter((field) => !exclude.includes(field))

  return (
    <>
      {fields.map((field) => {
        switch (field) {
          case "email":
            return (
              <EmailField
                key="email"
                autoFocus={autoFocus === "email"}
                titleVariant={titleVariant}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "password":
            return (
              <PasswordField
                key="password"
                autoFocus={autoFocus === "password"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "firstName":
            return (
              <FirstNameField
                key="firstName"
                autoFocus={autoFocus === "firstName"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "lastName":
            return (
              <LastNameField
                key="lastName"
                autoFocus={autoFocus === "lastName"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "role":
            return (
              <RoleField
                key="role"
                autoFocus={autoFocus === "role"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "permissions":
            return (
              <PermissionsField
                key="permissions"
                autoFocus={autoFocus === "permissions"}
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
          case "groupId":
            return (
              <GroupIdField
                key="groupId"
                autoFocus={autoFocus === "groupId"}
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

function EmailField({
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
  const form = useFormContext<Schemas.Users.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          {titleVariant ? (
            <FormControl>
              <Input
                {...field}
                type="email"
                value={field.value || ""}
                variant="title"
                placeholder="Enter user email..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus ?? field.value.length === 0}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Email"
              variant={fieldVariant}
              tooltip={descriptions.email}
            >
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  value={field.value || ""}
                  placeholder="Enter user email..."
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

function PasswordField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Password"
            variant={fieldVariant}
            optional
            tooltip={descriptions.password}
            tooltipVariant="warning"
          >
            <FormControl>
              <Input
                {...field}
                type="password"
                placeholder="Enter new password..."
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
                autoFocus={autoFocus}
                autoComplete="new-password"
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function FirstNameField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="firstName"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="First name"
            variant={fieldVariant}
            optional
            tooltip={descriptions.firstName}
          >
            <FormControl>
              <Input
                placeholder="First name..."
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
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

function LastNameField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="lastName"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Last name"
            variant={fieldVariant}
            optional
            tooltip={descriptions.lastName}
          >
            <FormControl>
              <Input
                placeholder="Last name..."
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
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

function RoleField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Role"
            variant={fieldVariant}
            tooltip={descriptions.role}
          >
            <FormControl>
              <Select
                value={field.value ?? UserRole.User}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full" autoFocus={autoFocus}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>External</SelectLabel>
                    {ExternalRoles.map((role) => (
                      <TooltipSelectItem
                        key={role}
                        value={role}
                        tooltip={UserRoleDescriptions[role]}
                        className="pl-4"
                      >
                        {UserRoleLabels[role]}
                      </TooltipSelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Internal</SelectLabel>
                    {InternalRoles.map((role) => (
                      <TooltipSelectItem
                        key={role}
                        value={role}
                        tooltip={UserRoleDescriptions[role]}
                        className="pl-4"
                      >
                        {UserRoleLabels[role]}
                      </TooltipSelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function PermissionsField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="permissions"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Permissions"
            variant={fieldVariant}
            optional
            tooltip={descriptions.permissions}
          >
            <MultiSelect
              value={field.value ?? []}
              onChange={field.onChange}
              options={Permissions.map((p) => ({
                label: p,
                value: p,
              }))}
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

function MetadataField({
  autoFocus,
  fieldVariant = "stacking",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()

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
              <KeyValueInput<Schemas.Users.BaseValues>
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

function GroupIdField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()
  const { data: groups = [] } = useListGroups()

  return (
    <FormField
      control={form.control}
      name="groupId"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Group"
            variant={fieldVariant}
            tooltip={descriptions.group}
            optional
          >
            <SearchSelect
              resource="group"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              options={groups}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
