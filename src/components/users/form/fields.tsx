import { useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"

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
import { useGetAccountSettings } from "@/queries/accounts"

import { usePermissions } from "@/hooks/use-permissions"

import { permissionPreset } from "@/lib/permissions"

import {
  UserRole,
  Permissions,
  ExternalRoles,
  InternalRoles,
  UserRoleLabels,
  WildcardPermission,
  UserRoleDescriptions,
  DefaultUserPermissions,
  DefaultPermissionsByRole,
  UserFormFieldDescriptions,
  PortalRequiredPermissions,
  UserEditFormFieldDescriptions,
  UserCreateFormFieldDescriptions,
  UserPasswordFormFieldDescriptions,
} from "@/types/users"
import { type FieldVariant } from "@/components/forms/field"

import * as Forms from "@/components/forms"
import * as Search from "@/components/search"
import MetadataInput from "@/components/metadata-input"
import PermissionSelect from "@/components/permission-select"
import TooltipSelectItem from "@/components/tooltip-select-item"

type Descriptions = typeof UserFormFieldDescriptions

interface UsersFormFieldsProps {
  include?: Schemas.Users.FieldNames[]
  exclude?: Schemas.Users.FieldNames[]
  autoFocus?: Schemas.Users.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: Schemas.Users.SchemaNames
}

const INCLUDE_DEFAULT_FIELDS: Schemas.Users.FieldNames[] = [
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
    : INCLUDE_DEFAULT_FIELDS.filter((field) => !exclude.includes(field))

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
          case "oldPassword":
            return (
              <OldPasswordField
                key="oldPassword"
                autoFocus={autoFocus === "oldPassword"}
                fieldVariant={fieldVariant}
                descriptions={UserPasswordFormFieldDescriptions}
              />
            )
          case "newPassword":
            return (
              <NewPasswordField
                key="newPassword"
                autoFocus={autoFocus === "newPassword"}
                fieldVariant={fieldVariant}
                descriptions={UserPasswordFormFieldDescriptions}
              />
            )
          case "confirmPassword":
            return (
              <ConfirmPasswordField
                key="confirmPassword"
                autoFocus={autoFocus === "confirmPassword"}
                fieldVariant={fieldVariant}
                descriptions={UserPasswordFormFieldDescriptions}
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
          case "internalRole":
            return (
              <InternalRoleField
                key="internalRole"
                autoFocus={autoFocus === "internalRole"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "permissions":
            return (
              <PermissionsField
                key="permissions"
                schema={schema}
                autoFocus={autoFocus === "permissions"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "internalPermissions":
            return (
              <InternalPermissionsField
                key="internalPermissions"
                autoFocus={autoFocus === "internalPermissions"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "metadata":
            return (
              <MetadataField
                key="metadata"
                autoFocus={autoFocus === "metadata"}
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
            tooltipVariant="destructive"
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

function useAccountDefaultPermissions(): readonly string[] {
  const { data: settings = [] } = useGetAccountSettings()

  return useMemo(() => {
    const value = settings.find(
      (s) => s.attributes.key === "default_user_permissions",
    )?.attributes.value

    return value?.length ? value : DefaultUserPermissions
  }, [settings])
}

function defaultPermissionsFor(
  role: UserRole,
  accountDefaults?: readonly string[],
): readonly string[] {
  const defaults =
    role === UserRole.User && accountDefaults != null
      ? accountDefaults
      : DefaultPermissionsByRole[role]

  if (!InternalRoles.includes(role)) {
    return defaults
  }

  return [...new Set([...defaults, ...PortalRequiredPermissions])]
}

function rolePermissionsFor(
  role: UserRole,
  currentPermissions: ReadonlySet<string>,
  accountDefaults?: readonly string[],
): string[] {
  return defaultPermissionsFor(role, accountDefaults).filter((p) =>
    currentPermissions.has(p),
  )
}

function nextPermissionsForRoleChange({
  value,
  from,
  to,
  currentPermissions,
  accountDefaults,
}: {
  value: string[] | null | undefined
  from: UserRole
  to: UserRole
  currentPermissions: ReadonlySet<string>
  accountDefaults?: readonly string[]
}): string[] | null | undefined {
  if (value == null) {
    return undefined
  }

  const selected = new Set(value)
  const grantable = Permissions.filter(
    (p) => currentPermissions.has(p) || selected.has(p),
  )
  const grantableSet = new Set<string>(grantable)

  const required = InternalRoles.includes(from)
    ? PortalRequiredPermissions.filter((p) => currentPermissions.has(p))
    : []
  const preset = permissionPreset(value, {
    grantable,
    defaults: defaultPermissionsFor(from, accountDefaults).filter((p) =>
      grantableSet.has(p),
    ),
    required,
  })

  if (preset === "custom") {
    return undefined
  }

  const next = rolePermissionsFor(to, currentPermissions, accountDefaults)

  return next.length > 0 ? next : null
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
  const { permissions: currentPermissions } = usePermissions()
  const accountDefaults = useAccountDefaultPermissions()

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
                onValueChange={(next) => {
                  const to = next as UserRole
                  const synced = nextPermissionsForRoleChange({
                    value: form.getValues("permissions"),
                    from: field.value ?? UserRole.User,
                    to,
                    currentPermissions,
                    accountDefaults,
                  })

                  field.onChange(to)
                  if (synced !== undefined) {
                    form.setValue("permissions", synced, { shouldDirty: true })
                  }
                }}
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

function InternalRoleField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()
  const { permissions: currentPermissions } = usePermissions()

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
                value={field.value ?? UserRole.Admin}
                onValueChange={(next) => {
                  const to = next as UserRole
                  const synced = nextPermissionsForRoleChange({
                    value: form.getValues("permissions"),
                    from: field.value ?? UserRole.Admin,
                    to,
                    currentPermissions,
                  })

                  field.onChange(to)
                  if (synced !== undefined) {
                    form.setValue("permissions", synced, { shouldDirty: true })
                  }
                }}
              >
                <SelectTrigger className="w-full" autoFocus={autoFocus}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
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
  schema,
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  schema?: Schemas.Users.SchemaNames
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()
  const role = useWatch({ control: form.control, name: "role" })
  const selectedPermissions = useWatch({
    control: form.control,
    name: "permissions",
  })

  const resolvedRole = role ?? UserRole.User
  const { permissions: currentPermissions } = usePermissions()
  const options = useMemo(() => {
    const selected = new Set(selectedPermissions ?? [])

    return Permissions.filter(
      (p) => currentPermissions.has(p) || selected.has(p),
    ).map((p) => ({ label: p, value: p }))
  }, [currentPermissions, selectedPermissions])
  const requiredOptions = useMemo(() => {
    if (!InternalRoles.includes(resolvedRole)) {
      return []
    }

    return PORTAL_REQUIRED_OPTIONS.filter((o) =>
      currentPermissions.has(o.value),
    )
  }, [resolvedRole, currentPermissions])
  const accountDefaults = useAccountDefaultPermissions()

  const defaults = defaultPermissionsFor(resolvedRole, accountDefaults)

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
            <PermissionSelect
              value={field.value}
              onChange={field.onChange}
              options={options}
              defaults={defaults}
              includeNone
              includeWildcard
              requiredOptions={requiredOptions}
              placeholder={
                schema === "create" || schema === "invite"
                  ? "Leave blank to use defaults"
                  : "Select permissions..."
              }
              autoFocus={autoFocus}
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

const PORTAL_REQUIRED_OPTIONS = PortalRequiredPermissions.map((permission) => ({
  label: permission,
  value: permission,
  tooltip: "This permission is required for Portal access.",
}))

function InternalPermissionsField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()
  const role = useWatch({ control: form.control, name: "role" })
  const selectedPermissions = useWatch({
    control: form.control,
    name: "permissions",
  })

  const { permissions: currentPermissions } = usePermissions()
  const options = useMemo(() => {
    const selected = new Set(selectedPermissions ?? [])

    return Permissions.filter(
      (p) => currentPermissions.has(p) || selected.has(p),
    ).map((p) => ({ label: p, value: p }))
  }, [currentPermissions, selectedPermissions])
  const requiredOptions = useMemo(
    () =>
      PORTAL_REQUIRED_OPTIONS.filter((o) => currentPermissions.has(o.value)),
    [currentPermissions],
  )

  return (
    <FormField
      control={form.control}
      name="permissions"
      render={({ field }) => {
        const value = field.value
        const selected = value ?? []
        const isWildcardSelected = selected.includes(WildcardPermission)
        const missingPortalPermissions = isWildcardSelected
          ? []
          : requiredOptions
              .map((o) => o.value)
              .filter((p) => !selected.includes(p))

        return (
          <FormItem>
            <Forms.Field.Header
              label="Permissions"
              variant={fieldVariant}
              tooltip={descriptions.permissions}
              warning={
                missingPortalPermissions.length > 0 ? (
                  <>
                    <div>
                      Missing some permissions required for Portal access:
                    </div>
                    <ul className="mt-1 list-disc pl-4">
                      {missingPortalPermissions.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </>
                ) : undefined
              }
            >
              <PermissionSelect
                value={value}
                onChange={field.onChange}
                options={options}
                defaults={role != null ? defaultPermissionsFor(role) : []}
                includeNone
                includeWildcard
                requiredOptions={requiredOptions}
                autoFocus={autoFocus}
              />
            </Forms.Field.Header>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

function MetadataField({
  autoFocus,
  descriptions,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Users.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="metadata"
      render={() => (
        <FormItem>
          <MetadataInput<Schemas.Users.BaseValues>
            name="metadata"
            tooltip={descriptions.metadata}
            optional
            autoFocus={autoFocus}
          />
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
            <Search.Select
              resource="groups"
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

type PasswordDescriptions = typeof UserPasswordFormFieldDescriptions

function OldPasswordField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: PasswordDescriptions
}) {
  const form = useFormContext<Schemas.Users.PasswordValues>()

  return (
    <FormField
      control={form.control}
      name="oldPassword"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Current password"
            variant={fieldVariant}
            tooltip={descriptions.oldPassword}
          >
            <FormControl>
              <Input
                {...field}
                type="password"
                toggle={true}
                placeholder="Enter current password..."
                autoFocus={autoFocus}
                autoComplete="current-password"
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function NewPasswordField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: PasswordDescriptions
}) {
  const form = useFormContext<Schemas.Users.PasswordValues>()

  return (
    <FormField
      control={form.control}
      name="newPassword"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="New password"
            variant={fieldVariant}
            tooltip={descriptions.newPassword}
          >
            <FormControl>
              <Input
                {...field}
                type="password"
                toggle={true}
                placeholder="Enter new password..."
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

function ConfirmPasswordField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: PasswordDescriptions
}) {
  const form = useFormContext<Schemas.Users.PasswordValues>()

  return (
    <FormField
      control={form.control}
      name="confirmPassword"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Confirm password"
            variant={fieldVariant}
            tooltip={descriptions.confirmPassword}
          >
            <FormControl>
              <Input
                {...field}
                type="password"
                toggle={true}
                placeholder="Confirm new password..."
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
