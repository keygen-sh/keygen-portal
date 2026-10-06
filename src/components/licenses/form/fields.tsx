import { useMemo, useState } from "react"
import { useFormContext, useFieldArray, useWatch } from "react-hook-form"
import { format, parseISO } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"
import { getLimitPlaceholder } from "@/lib/licenses"

import { useListUsers } from "@/queries/users"
import { useListGroups } from "@/queries/groups"
import { useListPolicies, useListPolicyEntitlements } from "@/queries/policies"
import { useListProducts } from "@/queries/products"
import { useListEntitlements } from "@/queries/entitlements"

import { useDeferredMount } from "@/hooks/use-deferred-mount"
import { useAccountDefaultLicensePermissions } from "@/hooks/use-account-default-license-permissions"

import * as Schemas from "@/schemas"
import {
  LicenseMode,
  LicenseFormFieldDescriptions,
  LicenseCreateFormFieldDescriptions,
  LicenseEditFormFieldDescriptions,
  LicenseDisabledFormFieldDescriptions,
  LicensePermissions,
} from "@/types/licenses"
import { Policy } from "@/types/policies"
import { type FieldVariant } from "@/components/forms/field"

import * as Forms from "@/components/forms"
import * as Search from "@/components/search"
import * as Calendars from "@/components/calendars"
import NumberInput from "@/components/number-input"
import MetadataInput from "@/components/metadata-input"
import ByteSizeInput from "@/components/byte-size-input"
import PermissionSelect from "@/components/permission-select"
import { LimitSourceBadge } from "@/components/limit-badge"

type Descriptions = typeof LicenseFormFieldDescriptions

interface LicensesFormFieldsProps {
  include?: Schemas.Licenses.FieldNames[]
  exclude?: Schemas.Licenses.FieldNames[]
  autoFocus?: Schemas.Licenses.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  selectedPolicy?: Policy | null
  mode?: LicenseMode
  schema?: "create" | "edit"
}

const INCLUDE_DEFAULT_FIELDS: Schemas.Licenses.FieldNames[] = [
  "name",
  "key",
  "policyId",
  "expiry",
  "maxMachines",
  "maxProcesses",
  "maxUsers",
  "maxCores",
  "maxMemory",
  "maxDisk",
  "maxUses",
  "ownerId",
  "groupId",
  "suspended",
  "protected",
  "permissions",
  "metadata",
  "entitlements.attach",
  "entitlements.create",
  "users.attach",
]

export default function LicensesFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  selectedPolicy,
  mode = LicenseMode.Create,
  schema,
}: LicensesFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? LicenseCreateFormFieldDescriptions
      : schema === "edit"
        ? LicenseEditFormFieldDescriptions
        : LicenseFormFieldDescriptions

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
                mode={mode}
              />
            )
          case "key":
            return (
              <KeyField
                key="key"
                autoFocus={autoFocus === "key"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "policyId":
            return (
              <PolicyIdField
                key="policyId"
                autoFocus={autoFocus === "policyId"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "expiry":
            return (
              <ExpiryField
                key="expiry"
                autoFocus={autoFocus === "expiry"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "maxMachines":
            return (
              <MaxMachinesField
                key="maxMachines"
                autoFocus={autoFocus === "maxMachines"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                selectedPolicy={selectedPolicy}
                mode={mode}
              />
            )
          case "maxProcesses":
            return (
              <MaxProcessesField
                key="maxProcesses"
                autoFocus={autoFocus === "maxProcesses"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                selectedPolicy={selectedPolicy}
                mode={mode}
              />
            )
          case "maxUsers":
            return (
              <MaxUsersField
                key="maxUsers"
                autoFocus={autoFocus === "maxUsers"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                selectedPolicy={selectedPolicy}
                mode={mode}
              />
            )
          case "maxCores":
            return (
              <MaxCoresField
                key="maxCores"
                autoFocus={autoFocus === "maxCores"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                selectedPolicy={selectedPolicy}
                mode={mode}
              />
            )
          case "maxMemory":
            return (
              <MaxMemoryField
                key="maxMemory"
                autoFocus={autoFocus === "maxMemory"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                selectedPolicy={selectedPolicy}
                mode={mode}
              />
            )
          case "maxDisk":
            return (
              <MaxDiskField
                key="maxDisk"
                autoFocus={autoFocus === "maxDisk"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                selectedPolicy={selectedPolicy}
                mode={mode}
              />
            )
          case "maxUses":
            return (
              <MaxUsesField
                key="maxUses"
                autoFocus={autoFocus === "maxUses"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                selectedPolicy={selectedPolicy}
                mode={mode}
              />
            )
          case "suspended":
            return (
              <SuspendedField
                key="suspended"
                autoFocus={autoFocus === "suspended"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "protected":
            return (
              <ProtectedField
                key="protected"
                autoFocus={autoFocus === "protected"}
                descriptions={descriptions}
                selectedPolicy={selectedPolicy}
                mode={mode}
              />
            )
          case "ownerId":
            return (
              <OwnerIdField
                key="ownerId"
                autoFocus={autoFocus === "ownerId"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "groupId":
            return (
              <GroupIdField
                key="groupId"
                autoFocus={autoFocus === "groupId"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "entitlements.attach":
            return (
              <AttachEntitlementsField key="entitlements.attach" mode={mode} />
            )
          case "entitlements.create":
            return (
              <CreateEntitlementsField key="entitlements.create" mode={mode} />
            )
          case "users.attach":
            return (
              <AttachUsersField
                key="users.attach"
                autoFocus={autoFocus === "users.attach"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
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
                mode={mode}
              />
            )
          case "metadata":
            return (
              <MetadataField
                key="metadata"
                autoFocus={autoFocus === "metadata"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}

function FieldSkeleton({ variant }: { variant: FieldVariant }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2",
        variant === "row" && "md:flex-row md:items-center md:justify-between",
      )}
    >
      <Skeleton className="h-5 w-32 rounded-sm" />
      <Skeleton
        className={cn("h-9 w-full rounded-sm", variant === "row" && "md:w-48")}
      />
    </div>
  )
}

function NameField({
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  descriptions,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

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
                placeholder="Enter license name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus ?? !field.value}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="License name"
              variant={fieldVariant}
              tooltip={descriptions.name}
              optional
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Enter license name..."
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

function KeyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.CreateValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

  return (
    <FormField
      control={form.control}
      name="key"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Key"
            variant={fieldVariant}
            tooltip={descriptions.key}
            optional
          >
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Leave blank for auto-generation"
                className="font-mono"
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

function PolicyIdField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.AllValues>()

  const { data: policies = [], isLoading: policiesLoading } = useListPolicies()
  const { data: products = [], isLoading: productsLoading } = useListProducts()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  const policiesByProduct = useMemo(() => {
    const grouped = new Map<
      string,
      { productName: string; policies: typeof policies }
    >()

    for (const policy of policies) {
      const productId = policy.relationships.product?.data?.id
      if (!productId) continue

      const product = products.find((p) => p.id === productId)
      const productName = product?.attributes.name ?? "Unknown Product"

      if (!grouped.has(productId)) {
        grouped.set(productId, { productName, policies: [] })
      }
      grouped.get(productId)!.policies.push(policy)
    }

    return Array.from(grouped.entries()).map(([productId, data]) => ({
      key: productId,
      label: data.productName,
      options: data.policies,
    }))
  }, [policies, products])

  if (!shouldMount || policiesLoading || productsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="policyId"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Policy"
            variant={fieldVariant}
            tooltip={descriptions.policy}
          >
            <FormControl>
              <Search.GroupedSelect
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
                groups={policiesByProduct}
                resource="policies"
                allowClear={false}
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

function ExpiryField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const [open, setOpen] = useState(false)
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

  return (
    <FormField
      control={form.control}
      name="expiry"
      render={({ field }) => {
        const selectedDate = field.value ? parseISO(field.value) : undefined

        return (
          <FormItem>
            <Forms.Field.Header
              label="Expiry date"
              variant={fieldVariant}
              optional
              tooltip={descriptions.expiry}
            >
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      autoFocus={autoFocus}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-content-normal" />
                      {field.value ? (
                        format(selectedDate!, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                      {field.value && (
                        <span
                          role="button"
                          tabIndex={0}
                          className="ml-auto flex h-6 w-6 items-center justify-center rounded-sm opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            field.onChange(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              e.stopPropagation()
                              field.onChange(null)
                            }
                          }}
                        >
                          <X className="size-4" />
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendars.DatePicker
                      key={selectedDate?.toISOString()}
                      selected={selectedDate}
                      onApply={(date) => {
                        field.onChange(date ? date.toISOString() : null)
                        setOpen(false)
                      }}
                      onCancel={() => setOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
            </Forms.Field.Header>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

function MaxMachinesField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  selectedPolicy,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

  return (
    <FormField
      control={form.control}
      name="maxMachines"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max machines"
            variant={fieldVariant}
            optional
            tooltip={descriptions.maxMachines}
            suffix={
              selectedPolicy && (
                <LimitSourceBadge
                  value={field.value}
                  policyValue={selectedPolicy.attributes.maxMachines}
                />
              )
            }
          >
            <FormControl>
              <NumberInput
                {...field}
                placeholder={
                  selectedPolicy
                    ? getLimitPlaceholder(selectedPolicy.attributes.maxMachines)
                    : "Inherit from policy"
                }
                autoFocus={autoFocus}
                disabled={selectedPolicy?.attributes.floating === false}
                disabledTooltip={
                  LicenseDisabledFormFieldDescriptions.maxMachines
                }
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MaxProcessesField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  selectedPolicy,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

  return (
    <FormField
      control={form.control}
      name="maxProcesses"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max processes"
            variant={fieldVariant}
            optional
            tooltip={descriptions.maxProcesses}
            suffix={
              selectedPolicy && (
                <LimitSourceBadge
                  value={field.value}
                  policyValue={selectedPolicy.attributes.maxProcesses}
                />
              )
            }
          >
            <FormControl>
              <NumberInput
                {...field}
                placeholder={
                  selectedPolicy
                    ? getLimitPlaceholder(
                        selectedPolicy.attributes.maxProcesses,
                      )
                    : "Inherit from policy"
                }
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

function MaxUsersField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  selectedPolicy,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

  return (
    <FormField
      control={form.control}
      name="maxUsers"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max users"
            variant={fieldVariant}
            optional
            tooltip={descriptions.maxUsers}
            suffix={
              selectedPolicy && (
                <LimitSourceBadge
                  value={field.value}
                  policyValue={selectedPolicy.attributes.maxUsers}
                />
              )
            }
          >
            <FormControl>
              <NumberInput
                {...field}
                placeholder={
                  selectedPolicy
                    ? getLimitPlaceholder(selectedPolicy.attributes.maxUsers)
                    : "Inherit from policy"
                }
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

function MaxCoresField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  selectedPolicy,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

  return (
    <FormField
      control={form.control}
      name="maxCores"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max cores"
            variant={fieldVariant}
            optional
            tooltip={descriptions.maxCores}
            suffix={
              selectedPolicy && (
                <LimitSourceBadge
                  value={field.value}
                  policyValue={selectedPolicy.attributes.maxCores}
                />
              )
            }
          >
            <FormControl>
              <NumberInput
                {...field}
                placeholder={
                  selectedPolicy
                    ? getLimitPlaceholder(selectedPolicy.attributes.maxCores)
                    : "Inherit from policy"
                }
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

function MaxMemoryField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  selectedPolicy,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

  return (
    <FormField
      control={form.control}
      name="maxMemory"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max memory"
            variant={fieldVariant}
            optional
            tooltip={descriptions.maxMemory}
            suffix={
              selectedPolicy && (
                <LimitSourceBadge
                  value={field.value}
                  policyValue={selectedPolicy.attributes.maxMemory}
                />
              )
            }
          >
            <FormControl>
              <ByteSizeInput
                value={field.value}
                onChange={field.onChange}
                placeholder={selectedPolicy ? undefined : "Inherit from policy"}
                placeholderBytes={selectedPolicy?.attributes.maxMemory}
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

function MaxDiskField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  selectedPolicy,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

  return (
    <FormField
      control={form.control}
      name="maxDisk"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max disk"
            variant={fieldVariant}
            optional
            tooltip={descriptions.maxDisk}
            suffix={
              selectedPolicy && (
                <LimitSourceBadge
                  value={field.value}
                  policyValue={selectedPolicy.attributes.maxDisk}
                />
              )
            }
          >
            <FormControl>
              <ByteSizeInput
                value={field.value}
                onChange={field.onChange}
                placeholder={selectedPolicy ? undefined : "Inherit from policy"}
                placeholderBytes={selectedPolicy?.attributes.maxDisk}
                defaultUnit="TB"
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

function MaxUsesField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  selectedPolicy,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

  return (
    <FormField
      control={form.control}
      name="maxUses"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Max uses"
            variant={fieldVariant}
            optional
            tooltip={descriptions.maxUses}
            suffix={
              selectedPolicy && (
                <LimitSourceBadge
                  value={field.value}
                  policyValue={selectedPolicy.attributes.maxUses}
                />
              )
            }
          >
            <FormControl>
              <NumberInput
                {...field}
                placeholder={
                  selectedPolicy
                    ? getLimitPlaceholder(selectedPolicy.attributes.maxUses)
                    : "Inherit from policy"
                }
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

function SuspendedField({
  autoFocus,
  descriptions,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-40 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="suspended"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Suspended"
            variant="inline"
            tooltip={descriptions.suspended}
          >
            <FormControl>
              <Checkbox
                id="suspended"
                checked={!!field.value}
                onCheckedChange={(value) => field.onChange(!!value)}
                autoFocus={autoFocus}
              />
            </FormControl>
          </Forms.Field.Header>
        </FormItem>
      )}
    />
  )
}

function ProtectedField({
  autoFocus,
  descriptions,
  selectedPolicy,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  selectedPolicy?: Policy | null
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-40 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="protected"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Protected"
            variant="inline"
            tooltip={descriptions.protected}
          >
            <FormControl>
              <Checkbox
                id="protected"
                checked={
                  field.value ?? selectedPolicy?.attributes.protected ?? false
                }
                onCheckedChange={(value) => field.onChange(!!value)}
                autoFocus={autoFocus}
              />
            </FormControl>
          </Forms.Field.Header>
        </FormItem>
      )}
    />
  )
}

const PERMISSION_OPTIONS = LicensePermissions.map((permission) => ({
  label: permission,
  value: permission,
}))

function PermissionsField({
  schema,
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = LicenseMode.Create,
}: {
  schema?: "create" | "edit"
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const defaults = useAccountDefaultLicensePermissions()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return <FieldSkeleton variant={fieldVariant} />
  }

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
              options={PERMISSION_OPTIONS}
              defaults={defaults}
              includeNone={schema === "edit"}
              includeWildcard
              placeholder={
                schema === "create"
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

function MetadataField({
  autoFocus,
  descriptions,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseFormValues>()
  const { metadata = [] } = form.getValues()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-sm" />
        {metadata.map(({ id }) => (
          <div key={id} className="flex space-x-2">
            <Skeleton className="h-9 w-1/2 rounded-sm" />
            <Skeleton className="h-9 w-1/2 rounded-sm" />
          </div>
        ))}
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="metadata"
      render={() => (
        <FormItem>
          <MetadataInput<Schemas.Licenses.BaseFormValues>
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

function AttachEntitlementsField({
  mode = LicenseMode.Create,
}: {
  mode?: LicenseMode
} = {}) {
  const form = useFormContext<Schemas.Licenses.AllValues>()
  const policyId = useWatch({ control: form.control, name: "policyId" })
  const { data: entitlements = [], isLoading: entitlementsLoading } =
    useListEntitlements()
  const { data: policyEntitlements = [] } = useListPolicyEntitlements(
    policyId ?? "",
    { limit: 100 },
  )
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount || entitlementsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="entitlements.attach"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Attach existing entitlements</FormLabel>
          <FormControl>
            <Search.MultiSelect
              value={field.value ?? []}
              onChange={field.onChange}
              options={entitlements}
              locked={policyEntitlements}
              lockedDescription="This entitlement is automatically attached through the selected policy."
              resource="entitlements"
              placeholder="Search entitlements"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function CreateEntitlementsField({
  mode = LicenseMode.Create,
}: {
  mode?: LicenseMode
} = {}) {
  const form = useFormContext<Schemas.Licenses.AllValues>()

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entitlements.create",
  })
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="mt-4 space-y-2">
        <Skeleton className="h-5 w-32 rounded-sm" />
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <FormLabel>Create entitlements</FormLabel>
      {fields.map((f, i) => (
        <div key={f.id} className="flex items-start gap-2">
          <FormField
            control={form.control}
            name={`entitlements.create.${i}.name`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Enter name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`entitlements.create.${i}.code`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Enter code..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center">
            <Button
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => remove(i)}
            >
              <X className="h-4 w-4 text-content-subdued" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        size="sm"
        type="button"
        variant="ghost"
        onClick={() => append({ name: "", code: "" })}
        className="text-content-muted"
      >
        + New entitlement
      </Button>
    </div>
  )
}

function AttachUsersField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.AllValues>()
  const { data: users = [], isLoading: usersLoading } = useListUsers()
  const ownerId = useWatch({ control: form.control, name: "ownerId" })
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount || usersLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    )
  }

  const attachableUsers = ownerId
    ? users.filter((user) => user.id !== ownerId)
    : users

  return (
    <FormField
      control={form.control}
      name="users.attach"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Attach users"
            tooltip={descriptions.users}
            variant={fieldVariant}
            optional
          >
            <FormControl>
              <Search.MultiSelect
                value={(field.value ?? []).filter((id) => id !== ownerId)}
                onChange={(value) =>
                  field.onChange(value.filter((id) => id !== ownerId))
                }
                autoFocus={autoFocus}
                options={attachableUsers}
                resource="users"
                placeholder="Search users"
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function OwnerIdField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const { data: users = [], isLoading: usersLoading } = useListUsers()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount || usersLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="ownerId"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Owner"
            variant={fieldVariant}
            tooltip={descriptions.owner}
            optional
          >
            <FormControl>
              <Search.Select
                resource="users"
                value={field.value ?? null}
                onChange={(value) => field.onChange(value)}
                options={users}
                invalid={!!fieldState.error}
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
  mode = LicenseMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: LicenseMode
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const { data: groups = [], isLoading: groupsLoading } = useListGroups()
  const shouldMount = useDeferredMount({
    delay: mode === LicenseMode.Create ? 0 : 500,
  })

  if (!shouldMount || groupsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    )
  }

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
            <FormControl>
              <Search.Select
                resource="groups"
                value={field.value ?? null}
                onChange={(value) => field.onChange(value)}
                options={groups}
                invalid={!!fieldState.error}
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
