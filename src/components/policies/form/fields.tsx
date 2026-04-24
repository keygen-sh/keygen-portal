import { useFormContext, useFieldArray, useWatch } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { X } from "lucide-react"

import { useListProducts } from "@/queries/products"
import { useListEntitlements } from "@/queries/entitlements"

import * as Schemas from "@/schemas"
import {
  PolicyFormFieldDescriptions,
  PolicyCreateFormFieldDescriptions,
  PolicyEditFormFieldDescriptions,
  PolicyOptionLabels,
  AuthenticationStrategy,
  ExpirationBasis,
  ExpirationStrategy,
  RenewalBasis,
  TransferStrategy,
  HeartbeatBasis,
  HeartbeatCullStrategy,
  HeartbeatResurrectionStrategy,
  MachineUniquenessStrategy,
  MachineMatchingStrategy,
  ComponentUniquenessStrategy,
  ComponentMatchingStrategy,
  OverageStrategy,
  MachineLeasingStrategy,
  CheckInInterval,
  ProcessLeasingStrategy,
  PolicyMode,
} from "@/types/policies"
import { type FieldVariant } from "@/components/forms/field"

import * as Forms from "@/components/forms"
import * as Search from "@/components/search"
import KeyValueInput from "@/components/key-value-input"
import NullableSelect from "@/components/nullable-select"
import DurationInput from "@/components/duration-input"
import { useDeferredMount } from "@/hooks/use-deferred-mount"

type Descriptions = typeof PolicyFormFieldDescriptions

const HEARTBEAT_PRESETS = [
  { seconds: 60 * 1, label: "1 Minute" },
  { seconds: 60 * 2, label: "2 Minutes" },
  { seconds: 60 * 5, label: "5 Minutes" },
  { seconds: 60 * 10, label: "10 Minutes" },
  { seconds: 60 * 15, label: "15 Minutes" },
  { seconds: 60 * 30, label: "30 Minutes" },
  { seconds: 3600 * 1, label: "1 Hour" },
  { seconds: 3600 * 12, label: "12 Hours" },
  { seconds: 86400 * 1, label: "1 Day" },
]

interface PoliciesFormFieldsProps {
  include?: Schemas.Policies.FieldNames[]
  exclude?: Schemas.Policies.FieldNames[]
  autoFocus?: Schemas.Policies.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  mode?: PolicyMode
  schema?: "create" | "edit"
}

const INCLUDE_DEFAULT_FIELDS: Schemas.Policies.FieldNames[] = [
  "authenticationStrategy",
  "checkInInterval",
  "checkInIntervalCount",
  "componentMatchingStrategy",
  "componentUniquenessStrategy",
  "duration",
  "entitlements.attach",
  "entitlements.create",
  "expirationBasis",
  "expirationStrategy",
  "floating",
  "heartbeatBasis",
  "heartbeatCullStrategy",
  "heartbeatDuration",
  "heartbeatResurrectionStrategy",
  "machineLeasingStrategy",
  "machineMatchingStrategy",
  "machineUniquenessStrategy",
  "maxCores",
  "maxMachines",
  "maxProcesses",
  "maxUsers",
  "maxUses",
  "metadata",
  "name",
  "overageStrategy",
  "processLeasingStrategy",
  "product",
  "protected",
  "renewalBasis",
  "requireCheckIn",
  "requireChecksumScope",
  "requireComponentsScope",
  "requireFingerprintScope",
  "requireHeartbeat",
  "requireMachineScope",
  "requirePolicyScope",
  "requireProductScope",
  "requireUserScope",
  "requireVersionScope",
  "strict",
  "transferStrategy",
  "usePool",
]

export default function PoliciesFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  mode = PolicyMode.Create,
  schema,
}: PoliciesFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? PolicyCreateFormFieldDescriptions
      : schema === "edit"
        ? PolicyEditFormFieldDescriptions
        : PolicyFormFieldDescriptions

  const fields = include
    ? include
    : INCLUDE_DEFAULT_FIELDS.filter((field) => !exclude.includes(field))

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        switch (field) {
          case "authenticationStrategy":
            return (
              <AuthenticationStrategyField
                key="authenticationStrategy"
                autoFocus={autoFocus === "authenticationStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "checkInInterval":
            return (
              <CheckInIntervalField
                key="checkInInterval"
                autoFocus={autoFocus === "checkInInterval"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "checkInIntervalCount":
            return (
              <CheckInIntervalCountField
                key="checkInIntervalCount"
                autoFocus={autoFocus === "checkInIntervalCount"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "componentMatchingStrategy":
            return (
              <ComponentMatchingStrategyField
                key="componentMatchingStrategy"
                autoFocus={autoFocus === "componentMatchingStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "componentUniquenessStrategy":
            return (
              <ComponentUniquenessStrategyField
                key="componentUniquenessStrategy"
                autoFocus={autoFocus === "componentUniquenessStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "duration":
            return (
              <DurationField
                key="duration"
                autoFocus={autoFocus === "duration"}
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
          case "expirationBasis":
            return (
              <ExpirationBasisField
                key="expirationBasis"
                autoFocus={autoFocus === "expirationBasis"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "expirationStrategy":
            return (
              <ExpirationStrategyField
                key="expirationStrategy"
                autoFocus={autoFocus === "expirationStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "floating":
            return (
              <FloatingField
                key="floating"
                autoFocus={autoFocus === "floating"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "heartbeatBasis":
            return (
              <HeartbeatBasisField
                key="heartbeatBasis"
                autoFocus={autoFocus === "heartbeatBasis"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "heartbeatCullStrategy":
            return (
              <HeartbeatCullStrategyField
                key="heartbeatCullStrategy"
                autoFocus={autoFocus === "heartbeatCullStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "heartbeatDuration":
            return (
              <HeartbeatDurationField
                key="heartbeatDuration"
                autoFocus={autoFocus === "heartbeatDuration"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "heartbeatResurrectionStrategy":
            return (
              <HeartbeatResurrectionStrategyField
                key="heartbeatResurrectionStrategy"
                autoFocus={autoFocus === "heartbeatResurrectionStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "machineLeasingStrategy":
            return (
              <MachineLeasingStrategyField
                key="machineLeasingStrategy"
                autoFocus={autoFocus === "machineLeasingStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "machineMatchingStrategy":
            return (
              <MachineMatchingStrategyField
                key="machineMatchingStrategy"
                autoFocus={autoFocus === "machineMatchingStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "machineUniquenessStrategy":
            return (
              <MachineUniquenessStrategyField
                key="machineUniquenessStrategy"
                autoFocus={autoFocus === "machineUniquenessStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
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
          case "overageStrategy":
            return (
              <OverageStrategyField
                key="overageStrategy"
                autoFocus={autoFocus === "overageStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "processLeasingStrategy":
            return (
              <ProcessLeasingStrategyField
                key="processLeasingStrategy"
                autoFocus={autoFocus === "processLeasingStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "product":
            return (
              <ProductField
                key="product"
                autoFocus={autoFocus === "product"}
                fieldVariant={fieldVariant}
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
                mode={mode}
              />
            )
          case "renewalBasis":
            return (
              <RenewalBasisField
                key="renewalBasis"
                autoFocus={autoFocus === "renewalBasis"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "requireCheckIn":
            return (
              <RequireCheckInField
                key="requireCheckIn"
                autoFocus={autoFocus === "requireCheckIn"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "requireChecksumScope":
            return (
              <RequireChecksumScopeField
                key="requireChecksumScope"
                autoFocus={autoFocus === "requireChecksumScope"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "requireComponentsScope":
            return (
              <RequireComponentsScopeField
                key="requireComponentsScope"
                autoFocus={autoFocus === "requireComponentsScope"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "requireFingerprintScope":
            return (
              <RequireFingerprintScopeField
                key="requireFingerprintScope"
                autoFocus={autoFocus === "requireFingerprintScope"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "requireHeartbeat":
            return (
              <RequireHeartbeatField
                key="requireHeartbeat"
                autoFocus={autoFocus === "requireHeartbeat"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "requireMachineScope":
            return (
              <RequireMachineScopeField
                key="requireMachineScope"
                autoFocus={autoFocus === "requireMachineScope"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "requirePolicyScope":
            return (
              <RequirePolicyScopeField
                key="requirePolicyScope"
                autoFocus={autoFocus === "requirePolicyScope"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "requireProductScope":
            return (
              <RequireProductScopeField
                key="requireProductScope"
                autoFocus={autoFocus === "requireProductScope"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "requireUserScope":
            return (
              <RequireUserScopeField
                key="requireUserScope"
                autoFocus={autoFocus === "requireUserScope"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "requireVersionScope":
            return (
              <RequireVersionScopeField
                key="requireVersionScope"
                autoFocus={autoFocus === "requireVersionScope"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "strict":
            return (
              <StrictField
                key="strict"
                autoFocus={autoFocus === "strict"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "transferStrategy":
            return (
              <TransferStrategyField
                key="transferStrategy"
                autoFocus={autoFocus === "transferStrategy"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
                mode={mode}
              />
            )
          case "usePool":
            return (
              <UsePoolField
                key="usePool"
                autoFocus={autoFocus === "usePool"}
                descriptions={descriptions}
                mode={mode}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}

function NameField({
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between md:flex">
        <Skeleton className="h-5 w-28 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
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
                variant="title"
                placeholder="Enter policy name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={autoFocus ?? field.value.length === 0}
                autoComplete="off"
              />
            </FormControl>
          ) : (
            <Forms.Field.Header
              label="Policy name"
              variant={fieldVariant}
              tooltip={descriptions.name}
            >
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter policy name..."
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

function ProductField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const { data: products = [], isLoading: productsLoading } = useListProducts()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount || productsLoading) {
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
      name="product.id"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Product"
            variant={fieldVariant}
            tooltip={descriptions.product}
          >
            <FormControl>
              <Search.Select
                value={field.value}
                onChange={(value) => field.onChange(value ?? undefined)}
                options={products}
                resource="products"
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

function AuthenticationStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-64 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="authenticationStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Authentication strategy"
            variant={fieldVariant}
            tooltip={descriptions.authenticationStrategy}
          >
            <Select
              value={field.value ?? ""}
              onValueChange={(value) =>
                field.onChange(value === "" ? null : value)
              }
            >
              <FormControl>
                <SelectTrigger
                  className="w-full"
                  data-invalid={!!fieldState.error}
                  autoFocus={autoFocus}
                >
                  <SelectValue placeholder="Select strategy..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.values(AuthenticationStrategy).map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {PolicyOptionLabels.authenticationStrategy[strategy]}
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

function MetadataField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllFormValues>()
  const { metadata } = form.getValues()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-sm" />
        {(metadata ?? []).map((_, i) => (
          <div key={i} className="flex space-x-2">
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
          <Forms.Field.Header
            label="Metadata"
            variant="stacking"
            tooltip={descriptions.metadata}
          >
            <FormControl>
              <KeyValueInput<Schemas.Policies.AllFormValues>
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

function DurationField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-32 rounded-sm" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-full rounded-sm md:w-32" />
          <Skeleton className="h-9 w-20 rounded-sm md:w-14" />
        </div>
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="duration"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Duration"
            variant={fieldVariant}
            tooltip={descriptions.duration}
          >
            <FormControl>
              <DurationInput
                value={field.value}
                onChange={(value) => {
                  if (mode === PolicyMode.Create && value === null) {
                    form.reset({
                      ...form.getValues(),
                      duration: value,
                      expirationStrategy: undefined,
                      expirationBasis: undefined,
                      renewalBasis: undefined,
                      transferStrategy: undefined,
                    })
                  } else {
                    field.onChange(value)
                  }
                }}
                units={["unlimited", "days", "weeks", "months", "years"]}
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

function ExpirationStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  disabled,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  disabled?: boolean
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const duration = useWatch<Schemas.Policies.AllValues>({ name: "duration" })
  const isDisabled = disabled || !duration
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-44 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="expirationStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Expiration strategy"
            variant={fieldVariant}
            tooltip={descriptions.expirationStrategy}
          >
            <NullableSelect<ExpirationStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              disabled={isDisabled}
              disabledTooltip="Set a duration to configure this field."
              autoFocus={autoFocus}
            >
              {Object.values(ExpirationStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.expirationStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ExpirationBasisField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  disabled,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  disabled?: boolean
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const duration = useWatch<Schemas.Policies.AllValues>({ name: "duration" })
  const isDisabled = disabled || !duration
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-36 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="expirationBasis"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Expiration basis"
            variant={fieldVariant}
            tooltip={descriptions.expirationBasis}
          >
            <NullableSelect<ExpirationBasis>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              disabled={isDisabled}
              disabledTooltip="Set a duration to configure this field."
              autoFocus={autoFocus}
            >
              {Object.values(ExpirationBasis).map((basis) => (
                <SelectItem key={basis} value={basis}>
                  {PolicyOptionLabels.expirationBasis[basis]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function RenewalBasisField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  disabled,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  disabled?: boolean
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const duration = useWatch<Schemas.Policies.AllValues>({ name: "duration" })
  const isDisabled = disabled || !duration
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-32 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="renewalBasis"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Renewal basis"
            variant={fieldVariant}
            tooltip={descriptions.renewalBasis}
          >
            <NullableSelect<RenewalBasis>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              disabled={isDisabled}
              disabledTooltip="Set a duration to configure this field."
              autoFocus={autoFocus}
            >
              {Object.values(RenewalBasis).map((basis) => (
                <SelectItem key={basis} value={basis}>
                  {PolicyOptionLabels.renewalBasis[basis]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function TransferStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  disabled,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  disabled?: boolean
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const duration = useWatch<Schemas.Policies.AllValues>({ name: "duration" })
  const isDisabled = disabled || !duration
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-36 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="transferStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Transfer strategy"
            variant={fieldVariant}
            tooltip={descriptions.transferStrategy}
          >
            <NullableSelect<TransferStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              disabled={isDisabled}
              disabledTooltip="Set a duration to configure this field."
              autoFocus={autoFocus}
            >
              {Object.values(TransferStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.transferStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function RequireHeartbeatField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-40 rounded-sm" />
        <Skeleton className="h-9 w-48 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="requireHeartbeat"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Require heartbeat"
            variant={fieldVariant}
            tooltip={descriptions.requireHeartbeat}
          >
            <Select
              value={
                field.value === undefined ? "" : field.value ? "true" : "false"
              }
              onValueChange={(value) => {
                const newValue = value === "" ? undefined : value === "true"
                if (mode === PolicyMode.Create && !newValue) {
                  form.reset({
                    ...form.getValues(),
                    requireHeartbeat: newValue,
                    heartbeatDuration: undefined,
                    heartbeatCullStrategy: undefined,
                    heartbeatBasis: undefined,
                    heartbeatResurrectionStrategy: undefined,
                  })
                } else {
                  field.onChange(newValue)
                }
              }}
            >
              <FormControl>
                <SelectTrigger className="w-full" autoFocus={autoFocus}>
                  <SelectValue placeholder="Select one..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="true">Enabled</SelectItem>
                <SelectItem value="false">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function HeartbeatDurationField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  disabled,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  disabled?: boolean
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const requireHeartbeat = useWatch<Schemas.Policies.AllValues>({
    name: "requireHeartbeat",
  })
  const isDisabled = disabled || !requireHeartbeat
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-32 rounded-sm" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-full rounded-sm md:w-26" />
          <Skeleton className="h-9 w-26 rounded-sm md:w-20" />
        </div>
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="heartbeatDuration"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Heartbeat duration"
            variant={fieldVariant}
            tooltip={descriptions.heartbeatDuration}
          >
            <FormControl>
              <DurationInput
                value={field.value}
                onChange={field.onChange}
                units={["seconds", "minutes", "hours", "days"]}
                presets={HEARTBEAT_PRESETS}
                disabled={isDisabled}
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

function HeartbeatBasisField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  disabled,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  disabled?: boolean
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const requireHeartbeat = useWatch<Schemas.Policies.AllValues>({
    name: "requireHeartbeat",
  })
  const isDisabled = disabled || !requireHeartbeat
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-36 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="heartbeatBasis"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Heartbeat basis"
            variant={fieldVariant}
            tooltip={descriptions.heartbeatBasis}
          >
            <NullableSelect<HeartbeatBasis>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              disabled={isDisabled}
              disabledTooltip="Enable heartbeat to configure this field."
              autoFocus={autoFocus}
            >
              {Object.values(HeartbeatBasis).map((basis) => (
                <SelectItem key={basis} value={basis}>
                  {PolicyOptionLabels.heartbeatBasis[basis]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function HeartbeatCullStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  disabled,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  disabled?: boolean
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const requireHeartbeat = useWatch<Schemas.Policies.AllValues>({
    name: "requireHeartbeat",
  })
  const isDisabled = disabled || !requireHeartbeat
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="heartbeatCullStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Heartbeat cull strategy"
            variant={fieldVariant}
            tooltip={descriptions.heartbeatCullStrategy}
          >
            <NullableSelect<HeartbeatCullStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              disabled={isDisabled}
              disabledTooltip="Enable heartbeat to configure this field."
              autoFocus={autoFocus}
            >
              {Object.values(HeartbeatCullStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.heartbeatCullStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function HeartbeatResurrectionStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  disabled,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  disabled?: boolean
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const requireHeartbeat = useWatch<Schemas.Policies.AllValues>({
    name: "requireHeartbeat",
  })
  const isDisabled = disabled || !requireHeartbeat
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-64 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="heartbeatResurrectionStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Heartbeat resurrection strategy"
            variant={fieldVariant}
            tooltip={descriptions.heartbeatResurrectionStrategy}
          >
            <NullableSelect<HeartbeatResurrectionStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              disabled={isDisabled}
              disabledTooltip="Enable heartbeat to configure this field."
              autoFocus={autoFocus}
            >
              {Object.values(HeartbeatResurrectionStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.heartbeatResurrectionStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
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
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-28 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
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
            tooltip={descriptions.maxMachines}
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 1"
                {...field}
                value={field.value ?? ""}
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

function MachineUniquenessStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-56 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="machineUniquenessStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Machine uniqueness strategy"
            variant={fieldVariant}
            tooltip={descriptions.machineUniquenessStrategy}
          >
            <NullableSelect<MachineUniquenessStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            >
              {Object.values(MachineUniquenessStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.machineUniquenessStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MachineMatchingStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-52 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="machineMatchingStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Machine matching strategy"
            variant={fieldVariant}
            tooltip={descriptions.machineMatchingStrategy}
          >
            <NullableSelect<MachineMatchingStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            >
              {Object.values(MachineMatchingStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.machineMatchingStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ComponentUniquenessStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-60 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="componentUniquenessStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Component uniqueness strategy"
            variant={fieldVariant}
            tooltip={descriptions.componentUniquenessStrategy}
          >
            <NullableSelect<ComponentUniquenessStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            >
              {Object.values(ComponentUniquenessStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.componentUniquenessStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ComponentMatchingStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-56 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="componentMatchingStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Component matching strategy"
            variant={fieldVariant}
            tooltip={descriptions.componentMatchingStrategy}
          >
            <NullableSelect<ComponentMatchingStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            >
              {Object.values(ComponentMatchingStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.componentMatchingStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function OverageStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-36 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="overageStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Overage strategy"
            variant={fieldVariant}
            tooltip={descriptions.overageStrategy}
          >
            <NullableSelect<OverageStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            >
              {Object.values(OverageStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.overageStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MachineLeasingStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="machineLeasingStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Machine leasing strategy"
            variant={fieldVariant}
            tooltip={descriptions.machineLeasingStrategy}
          >
            <NullableSelect<MachineLeasingStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            >
              {Object.values(MachineLeasingStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.machineLeasingStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function RequireChecksumScopeField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-44 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="requireChecksumScope"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Require checksum scope"
            variant="inline"
            tooltip={descriptions.requireChecksumScope}
          >
            <FormControl>
              <Checkbox
                id="requireChecksumScope"
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

function RequireComponentsScopeField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-52 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="requireComponentsScope"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Require components scope"
            variant="inline"
            tooltip={descriptions.requireComponentsScope}
          >
            <FormControl>
              <Checkbox
                id="requireComponentsScope"
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

function RequireFingerprintScopeField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="requireFingerprintScope"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Require fingerprint scope"
            variant="inline"
            tooltip={descriptions.requireFingerprintScope}
          >
            <FormControl>
              <Checkbox
                id="requireFingerprintScope"
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

function RequireMachineScopeField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
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
      name="requireMachineScope"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Require machine scope"
            variant="inline"
            tooltip={descriptions.requireMachineScope}
          >
            <FormControl>
              <Checkbox
                id="requireMachineScope"
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

function RequirePolicyScopeField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-36 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="requirePolicyScope"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Require policy scope"
            variant="inline"
            tooltip={descriptions.requirePolicyScope}
          >
            <FormControl>
              <Checkbox
                id="requirePolicyScope"
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

function RequireProductScopeField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
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
      name="requireProductScope"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Require product scope"
            variant="inline"
            tooltip={descriptions.requireProductScope}
          >
            <FormControl>
              <Checkbox
                id="requireProductScope"
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

function RequireUserScopeField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-36 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="requireUserScope"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Require user scope"
            variant="inline"
            tooltip={descriptions.requireUserScope}
          >
            <FormControl>
              <Checkbox
                id="requireUserScope"
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

function RequireVersionScopeField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
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
      name="requireVersionScope"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Require version scope"
            variant="inline"
            tooltip={descriptions.requireVersionScope}
          >
            <FormControl>
              <Checkbox
                id="requireVersionScope"
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

function MaxProcessesField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-32 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
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
            tooltip={descriptions.maxProcesses}
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 1"
                {...field}
                value={field.value ?? ""}
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
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-24 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
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
            tooltip={descriptions.maxUsers}
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 1"
                {...field}
                value={field.value ?? ""}
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
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
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
            tooltip={descriptions.maxUses}
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 1"
                {...field}
                value={field.value ?? ""}
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
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-24 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
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
            tooltip={descriptions.maxCores}
          >
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 1"
                {...field}
                value={field.value ?? ""}
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

function CheckInIntervalField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-40 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="checkInInterval"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Check-in interval"
            variant={fieldVariant}
            tooltip={descriptions.checkInInterval}
          >
            <NullableSelect<CheckInInterval>
              value={field.value}
              onChange={(value) => {
                if (mode === PolicyMode.Create && value === null) {
                  form.reset({
                    ...form.getValues(),
                    checkInInterval: value,
                    checkInIntervalCount: undefined,
                  })
                } else {
                  field.onChange(value)
                }
              }}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            >
              {Object.values(CheckInInterval).map((interval) => (
                <SelectItem key={interval} value={interval}>
                  {PolicyOptionLabels.checkInInterval[interval]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function CheckInIntervalCountField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  disabled,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  disabled?: boolean
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const checkInInterval = useWatch<Schemas.Policies.AllValues>({
    name: "checkInInterval",
  })
  const isDisabled = disabled || !checkInInterval
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="checkInIntervalCount"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Check-in interval count"
            variant={fieldVariant}
            tooltip={descriptions.checkInIntervalCount}
          >
            <FormControl>
              {isDisabled ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0}>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        placeholder="1 - 365"
                        {...field}
                        value={field.value ?? ""}
                        disabled
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-80 bg-background-4 text-pretty text-content-muted">
                    Set a check-in interval to configure this field.
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Input
                  type="number"
                  min={1}
                  max={365}
                  placeholder="1 - 365"
                  {...field}
                  value={field.value ?? ""}
                  autoFocus={autoFocus}
                />
              )}
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ProcessLeasingStrategyField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="w-full justify-between space-y-2 md:flex">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-9 w-full rounded-sm md:w-48" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="processLeasingStrategy"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Process leasing strategy"
            variant={fieldVariant}
            tooltip={descriptions.processLeasingStrategy}
          >
            <NullableSelect<ProcessLeasingStrategy>
              value={field.value}
              onChange={(value) => field.onChange(value)}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
            >
              {Object.values(ProcessLeasingStrategy).map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {PolicyOptionLabels.processLeasingStrategy[strategy]}
                </SelectItem>
              ))}
            </NullableSelect>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function StrictField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-16 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="strict"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Strict"
            variant="inline"
            tooltip={descriptions.strict}
          >
            <FormControl>
              <Checkbox
                id="strict"
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

function FloatingField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="floating"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Floating"
            variant="inline"
            tooltip={descriptions.floating}
          >
            <FormControl>
              <Checkbox
                id="floating"
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
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-24 rounded-sm" />
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

function UsePoolField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="usePool"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Use pool"
            variant="inline"
            tooltip={descriptions.usePool}
          >
            <FormControl>
              <Checkbox
                id="usePool"
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

function RequireCheckInField({
  autoFocus,
  descriptions,
  mode = PolicyMode.Create,
}: {
  autoFocus?: boolean
  descriptions: Descriptions
  mode?: PolicyMode
}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="flex w-full justify-between">
        <Skeleton className="h-5 w-36 rounded-sm" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name="requireCheckIn"
      render={({ field }) => (
        <FormItem className="flex items-center">
          <Forms.Field.Header
            label="Require check-in"
            variant="inline"
            tooltip={descriptions.requireCheckIn}
          >
            <FormControl>
              <Checkbox
                id="requireCheckIn"
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

function AttachEntitlementsField({
  mode = PolicyMode.Create,
}: {
  mode?: PolicyMode
} = {}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const { data: entitlements = [], isLoading: entitlementsLoading } =
    useListEntitlements()
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount || entitlementsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-8 w-full" />
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
  mode = PolicyMode.Create,
}: {
  mode?: PolicyMode
} = {}) {
  const form = useFormContext<Schemas.Policies.AllValues>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entitlements.create",
  })
  const shouldMount = useDeferredMount({
    delay: mode === PolicyMode.Create ? 0 : 500,
  })

  if (!shouldMount) {
    return (
      <div className="space-y-2">
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
