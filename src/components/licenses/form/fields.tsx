import { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { format, parseISO } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"
import { getLimitPlaceholder } from "@/lib/licenses"

import { useListPolicies } from "@/queries/policies"
import { useListProducts } from "@/queries/products"

import * as Schemas from "@/schemas"
import {
  LicenseFormFieldDescriptions,
  LicenseCreateFormFieldDescriptions,
  LicenseEditFormFieldDescriptions,
  LicenseDisabledFormFieldDescriptions,
} from "@/types/licenses"
import { Policy } from "@/types/policies"

import * as Forms from "@/components/forms"
import * as Calendars from "@/components/calendars"
import KeyValueInput from "@/components/key-value-input"

type LicenseFieldName =
  | "name"
  | "key"
  | "policyId"
  | "expiry"
  | "maxMachines"
  | "maxProcesses"
  | "maxUsers"
  | "maxCores"
  | "maxUses"
  | "suspended"
  | "protected"
  | "metadata"

type FieldVariant = "row" | "stacking" | "inline" | "none"
type Descriptions = typeof LicenseFormFieldDescriptions

interface LicensesFormFieldsProps {
  include?: LicenseFieldName[]
  exclude?: LicenseFieldName[]
  autoFocus?: LicenseFieldName
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  selectedPolicy?: Policy | null
  schema?: "create" | "edit"
}

const DefaultFieldSort: LicenseFieldName[] = [
  "name",
  "key",
  "policyId",
  "expiry",
  "maxMachines",
  "maxProcesses",
  "maxUsers",
  "maxCores",
  "maxUses",
  "suspended",
  "protected",
  "metadata",
]

export default function LicensesFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  selectedPolicy,
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
          case "key":
            return (
              <KeyField
                key="key"
                autoFocus={autoFocus === "key"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "policyId":
            return (
              <PolicyIdField
                key="policyId"
                autoFocus={autoFocus === "policyId"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "expiry":
            return (
              <ExpiryField
                key="expiry"
                autoFocus={autoFocus === "expiry"}
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
                selectedPolicy={selectedPolicy}
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
              />
            )
          case "suspended":
            return (
              <SuspendedField
                key="suspended"
                autoFocus={autoFocus === "suspended"}
                descriptions={descriptions}
              />
            )
          case "protected":
            return (
              <ProtectedField
                key="protected"
                autoFocus={autoFocus === "protected"}
                descriptions={descriptions}
                selectedPolicy={selectedPolicy}
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
  const form = useFormContext<Schemas.Licenses.BaseValues>()

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
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()

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
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Licenses.CreateValues>()

  const { data: policies = [], isLoading: policiesLoading } = useListPolicies()
  const { data: products = [], isLoading: productsLoading } = useListProducts()

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
      productId,
      productName: data.productName,
      policies: data.policies,
    }))
  }, [policies, products])

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
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={policiesLoading || productsLoading}
            >
              <FormControl>
                <SelectTrigger className="w-full" autoFocus={autoFocus}>
                  <SelectValue placeholder="Select a policy..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {policiesByProduct.map((group) => (
                  <SelectGroup key={group.productId}>
                    <SelectLabel>{group.productName}</SelectLabel>
                    {group.policies.map((policy) => (
                      <SelectItem
                        key={policy.id}
                        value={policy.id}
                        className="pl-4"
                      >
                        {policy.attributes.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
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

function ExpiryField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()
  const [open, setOpen] = useState(false)

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
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()

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
          >
            <FormControl>
              <Input
                {...field}
                type="number"
                min={1}
                placeholder={
                  selectedPolicy
                    ? getLimitPlaceholder(selectedPolicy.attributes.maxMachines)
                    : "Inherit from policy"
                }
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
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
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()

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
          >
            <FormControl>
              <Input
                {...field}
                type="number"
                min={1}
                placeholder={
                  selectedPolicy
                    ? getLimitPlaceholder(
                        selectedPolicy.attributes.maxProcesses,
                      )
                    : "Inherit from policy"
                }
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
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

function MaxUsersField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  selectedPolicy,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()

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
          >
            <FormControl>
              <Input
                {...field}
                type="number"
                min={1}
                placeholder={
                  selectedPolicy
                    ? getLimitPlaceholder(selectedPolicy.attributes.maxUsers)
                    : "Inherit from policy"
                }
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
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

function MaxCoresField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  selectedPolicy,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()

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
          >
            <FormControl>
              <Input
                {...field}
                type="number"
                min={1}
                placeholder={
                  selectedPolicy
                    ? getLimitPlaceholder(selectedPolicy.attributes.maxCores)
                    : "Inherit from policy"
                }
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
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

function MaxUsesField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  selectedPolicy,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  selectedPolicy?: Policy | null
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()

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
          >
            <FormControl>
              <Input
                {...field}
                type="number"
                min={1}
                placeholder={
                  selectedPolicy
                    ? getLimitPlaceholder(selectedPolicy.attributes.maxUses)
                    : "Inherit from policy"
                }
                value={field.value ?? ""}
                autoFocus={autoFocus}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
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

function SuspendedField({
  autoFocus,
  descriptions,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()

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
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  selectedPolicy?: Policy | null
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()

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

function MetadataField({
  autoFocus,
  descriptions,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Licenses.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="metadata"
      render={() => (
        <FormItem>
          <Forms.Field.Header
            label="Metadata"
            variant="stacking"
            optional
            tooltip={descriptions.metadata}
          >
            <FormControl>
              <KeyValueInput<Schemas.Licenses.BaseValues>
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
