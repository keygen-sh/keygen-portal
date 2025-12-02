import { useState, useEffect } from "react"
import { useFormContext, useFieldArray, useWatch } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
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

import { X } from "lucide-react"

import { cn } from "@/lib/utils"

import { useListProducts } from "@/queries/products"
import { useListEntitlements } from "@/queries/entitlements"

import * as Forms from "@/forms"
import {
  PolicyAttributeDescriptions,
  PolicyOptionLabels,
  AuthenticationStrategy,
  CheckInInterval,
  ComponentMatchingStrategy,
  ComponentUniquenessStrategy,
  ExpirationBasis,
  ExpirationStrategy,
  HeartbeatBasis,
  HeartbeatCullStrategy,
  HeartbeatResurrectionStrategy,
  MachineLeasingStrategy,
  MachineMatchingStrategy,
  MachineUniquenessStrategy,
  OverageStrategy,
  ProcessLeasingStrategy,
  RenewalBasis,
  TransferStrategy,
} from "@/types/policies"

import * as Field from "@/components/field"
import MultiSelect from "@/components/multi-select"
import KeyValueInput from "@/components/key-value-input"
import NullableSelect from "@/components/nullable-select"
import DurationInput, { HeartbeatPresets } from "@/components/duration-input"

interface AllFieldsProps {
  className?: string
}

export default function AllFields({
  className,
}: AllFieldsProps): React.ReactElement {
  const form = useFormContext<Forms.Policies.BaseValues>()

  const { data: products = [], isLoading: productsLoading } = useListProducts()
  const { data: entitlements = [], isLoading: entitlementsLoading } =
    useListEntitlements()

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entitlements.create" as const,
  })

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const duration = useWatch({ control: form.control, name: "duration" })
  useEffect(() => {
    if (duration !== null) return

    const fields = [
      "expirationStrategy",
      "expirationBasis",
      "renewalBasis",
      "transferStrategy",
    ] as const

    let changed = false
    for (const field of fields) {
      if (form.getValues(field) != null) {
        form.setValue(field, null, { shouldDirty: true, shouldValidate: false })
        changed = true
      }
    }
    if (changed) {
      form.clearErrors(fields)
      void form.trigger(fields)
    }
  }, [duration, form])

  const checkInInterval = useWatch({
    control: form.control,
    name: "checkInInterval",
  })
  useEffect(() => {
    if (checkInInterval !== null) return

    let changed = false
    const field = "checkInIntervalCount"

    if (form.getValues(field) != null) {
      form.setValue(field, null, { shouldDirty: true, shouldValidate: false })
      changed = true
    }

    if (changed) {
      form.clearErrors(field)
      void form.trigger(field)
    }
  }, [checkInInterval, form])

  const requireHeartbeat = useWatch({
    control: form.control,
    name: "requireHeartbeat",
  })
  useEffect(() => {
    if (requireHeartbeat) return

    const fields = [
      "heartbeatDuration",
      "heartbeatCullStrategy",
      "heartbeatBasis",
      "heartbeatResurrectionStrategy",
    ] as const

    let changed = false
    for (const field of fields) {
      if (form.getValues(field) != null) {
        form.setValue(field, null, { shouldDirty: true, shouldValidate: false })
        changed = true
      }
    }
    if (changed) {
      form.clearErrors(fields)
      void form.trigger(fields)
    }
  }, [requireHeartbeat, form])

  if (!mounted || productsLoading) {
    return (
      <div className={cn("p-4", className)}>
        <h2 className="text-content-loud/90">General</h2>
        <section className="mt-4 flex flex-col md:flex-row">
          <div className="w-full space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-3/5" />
          </div>

          <div className="mx-8 hidden md:block">
            <Separator orientation="vertical" dashed />
          </div>

          <div className="mt-4 w-full space-y-3 md:mt-0">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-9 w-3/4" />
          </div>
        </section>

        <Separator className="my-6" />

        <h2 className="text-content-loud/90">Attributes</h2>
        <section className="mt-4 flex flex-col md:flex-row">
          <div className="w-full space-y-6">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-9 w-full" />
            <div className="flex w-full justify-between">
              <Skeleton className="h-9 w-1/2" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>

          <div className="mx-8 hidden md:block">
            <Separator orientation="vertical" dashed />
          </div>

          <div className="mt-6 w-full space-y-6 md:mt-0">
            <Skeleton className="hidden h-9 w-3/5 md:block" />
            <Skeleton className="hidden h-9 w-1/3 md:block" />
            <Skeleton className="hidden h-9 w-1/2 md:block" />
          </div>
        </section>

        <Separator className="my-6" />

        <section className="mt-4 flex flex-col md:flex-row">
          <div className="w-full space-y-6">
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-9 w-1/3" />
          </div>

          <div className="mx-8 hidden md:block">
            <Separator orientation="vertical" dashed />
          </div>

          <div className="w-full space-y-6">
            <Skeleton className="hidden h-9 w-full md:block" />
            <Skeleton className="hidden h-9 w-1/3 md:block" />
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className={cn("p-4", className)}>
      <h2 className="text-content-loud/90">General</h2>
      <section className="mt-4 flex flex-col md:flex-row">
        <div className="w-full space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Field.Header label="Policy name" variant="stacking">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter policy name..."
                      autoComplete="off"
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mx-8 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="mt-4 w-full space-y-6 md:mt-0">
          <FormField
            control={form.control}
            name="product.id"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Product relationship"
                  variant="stacking"
                  tooltip="The product to which this policy belongs."
                >
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(value === "" ? undefined : value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select product..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.attributes.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <Separator className="my-6" />

      <h2 className="text-content-loud/90">Attributes</h2>
      <section className="mt-4 flex flex-col md:flex-row">
        <div className="w-full space-y-6">
          <FormField
            control={form.control}
            name="authenticationStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Authentication strategy"
                  tooltip={PolicyAttributeDescriptions.authenticationStrategy}
                >
                  <NullableSelect<AuthenticationStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(AuthenticationStrategy).map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.authenticationStrategy[strategy]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkInInterval"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Check-in interval"
                  tooltip={PolicyAttributeDescriptions.checkInInterval}
                >
                  <NullableSelect<CheckInInterval>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(CheckInInterval).map((interval) => (
                      <SelectItem key={interval} value={interval}>
                        {PolicyOptionLabels.checkInInterval[interval]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkInIntervalCount"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Check-in interval count"
                  tooltip={PolicyAttributeDescriptions.checkInIntervalCount}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      placeholder="1 - 365"
                      {...field}
                      value={field.value ?? ""}
                      disabled={!checkInInterval}
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="componentMatchingStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Component matching strategy"
                  tooltip={
                    PolicyAttributeDescriptions.componentMatchingStrategy
                  }
                >
                  <NullableSelect<ComponentMatchingStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(ComponentMatchingStrategy).map(
                      (strategy) => (
                        <SelectItem key={strategy} value={strategy}>
                          {
                            PolicyOptionLabels.componentMatchingStrategy[
                              strategy
                            ]
                          }
                        </SelectItem>
                      ),
                    )}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="componentUniquenessStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Component uniqueness strategy"
                  tooltip={
                    PolicyAttributeDescriptions.componentUniquenessStrategy
                  }
                >
                  <NullableSelect<ComponentUniquenessStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(ComponentUniquenessStrategy).map(
                      (strategy) => (
                        <SelectItem key={strategy} value={strategy}>
                          {
                            PolicyOptionLabels.componentUniquenessStrategy[
                              strategy
                            ]
                          }
                        </SelectItem>
                      ),
                    )}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Duration"
                  tooltip={PolicyAttributeDescriptions.duration}
                >
                  <FormControl>
                    <DurationInput
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      units={["unlimited", "days", "weeks", "months", "years"]}
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expirationBasis"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Expiration basis"
                  tooltip={PolicyAttributeDescriptions.expirationBasis}
                >
                  <NullableSelect<ExpirationBasis>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                    disabled={!duration}
                  >
                    {Object.values(ExpirationBasis).map((basis) => (
                      <SelectItem key={basis} value={basis}>
                        {PolicyOptionLabels.expirationBasis[basis]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expirationStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Expiration strategy"
                  tooltip={PolicyAttributeDescriptions.expirationStrategy}
                >
                  <NullableSelect<ExpirationStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                    disabled={!duration}
                  >
                    {Object.values(ExpirationStrategy).map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.expirationStrategy[strategy]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="floating"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Floating"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.floating}
                >
                  <FormControl>
                    <Checkbox
                      id="floating"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heartbeatBasis"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Heartbeat basis"
                  tooltip={PolicyAttributeDescriptions.heartbeatBasis}
                >
                  <NullableSelect<HeartbeatBasis>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                    disabled={!requireHeartbeat}
                  >
                    {Object.values(HeartbeatBasis).map((basis) => (
                      <SelectItem key={basis} value={basis}>
                        {PolicyOptionLabels.heartbeatBasis[basis]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heartbeatCullStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Heartbeat cull strategy"
                  tooltip={PolicyAttributeDescriptions.heartbeatCullStrategy}
                >
                  <NullableSelect<HeartbeatCullStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                    disabled={!requireHeartbeat}
                  >
                    {Object.values(HeartbeatCullStrategy).map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.heartbeatCullStrategy[strategy]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heartbeatDuration"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Heartbeat duration"
                  tooltip={PolicyAttributeDescriptions.heartbeatDuration}
                >
                  <FormControl>
                    <DurationInput
                      value={field.value}
                      onChange={field.onChange}
                      units={["seconds", "minutes", "hours", "days"]}
                      presets={HeartbeatPresets}
                    />
                  </FormControl>
                </Field.Header>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heartbeatResurrectionStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Heartbeat resurrection strategy"
                  tooltip={
                    PolicyAttributeDescriptions.heartbeatResurrectionStrategy
                  }
                >
                  <NullableSelect<HeartbeatResurrectionStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                    disabled={!requireHeartbeat}
                  >
                    {Object.values(HeartbeatResurrectionStrategy).map(
                      (strategy) => (
                        <SelectItem key={strategy} value={strategy}>
                          {
                            PolicyOptionLabels.heartbeatResurrectionStrategy[
                              strategy
                            ]
                          }
                        </SelectItem>
                      ),
                    )}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="machineLeasingStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Machine leasing strategy"
                  tooltip={PolicyAttributeDescriptions.machineLeasingStrategy}
                >
                  <NullableSelect<MachineLeasingStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(MachineLeasingStrategy).map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.machineLeasingStrategy[strategy]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="machineMatchingStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Machine matching strategy"
                  tooltip={PolicyAttributeDescriptions.machineMatchingStrategy}
                >
                  <NullableSelect<MachineMatchingStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(MachineMatchingStrategy).map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.machineMatchingStrategy[strategy]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="machineUniquenessStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Machine uniqueness strategy"
                  tooltip={
                    PolicyAttributeDescriptions.machineUniquenessStrategy
                  }
                >
                  <NullableSelect<MachineUniquenessStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(MachineUniquenessStrategy).map(
                      (strategy) => (
                        <SelectItem key={strategy} value={strategy}>
                          {
                            PolicyOptionLabels.machineUniquenessStrategy[
                              strategy
                            ]
                          }
                        </SelectItem>
                      ),
                    )}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCores"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Max cores"
                  tooltip={PolicyAttributeDescriptions.maxCores}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 1"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxMachines"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Max machines"
                  tooltip={PolicyAttributeDescriptions.maxMachines}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 1"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mx-8 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="mt-4 w-full space-y-6 md:mt-0">
          <FormField
            control={form.control}
            name="maxProcesses"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Max processes"
                  tooltip={PolicyAttributeDescriptions.maxProcesses}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 1"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxUsers"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Max users"
                  tooltip={PolicyAttributeDescriptions.maxUsers}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 1"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Max uses"
                  tooltip={PolicyAttributeDescriptions.maxUses}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 1"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="overageStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Overage strategy"
                  tooltip={PolicyAttributeDescriptions.overageStrategy}
                >
                  <NullableSelect<OverageStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(OverageStrategy).map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.overageStrategy[strategy]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="processLeasingStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Process leasing strategy"
                  tooltip={PolicyAttributeDescriptions.processLeasingStrategy}
                >
                  <NullableSelect<ProcessLeasingStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(ProcessLeasingStrategy).map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.processLeasingStrategy[strategy]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="protected"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Protected"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.protected}
                >
                  <FormControl>
                    <Checkbox
                      id="protected"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="renewalBasis"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Renewal basis"
                  tooltip={PolicyAttributeDescriptions.renewalBasis}
                >
                  <NullableSelect<RenewalBasis>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(RenewalBasis).map((basis) => (
                      <SelectItem key={basis} value={basis}>
                        {PolicyOptionLabels.renewalBasis[basis]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireCheckIn"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Require check-in"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.requireCheckIn}
                >
                  <FormControl>
                    <Checkbox
                      id="requireCheckIn"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireChecksumScope"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Require checksum scope"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.requireChecksumScope}
                >
                  <FormControl>
                    <Checkbox
                      id="requireChecksumScope"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireComponentsScope"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Require components scope"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.requireComponentsScope}
                >
                  <FormControl>
                    <Checkbox
                      id="requireComponentsScope"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireFingerprintScope"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Require fingerprint scope"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.requireFingerprintScope}
                >
                  <FormControl>
                    <Checkbox
                      id="requireFingerprintScope"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireHeartbeat"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Require heartbeat"
                  tooltip={PolicyAttributeDescriptions.requireHeartbeat}
                >
                  <Select
                    value={
                      field.value === undefined
                        ? ""
                        : field.value
                          ? "true"
                          : "false"
                    }
                    onValueChange={(value) =>
                      field.onChange(
                        value === "" ? undefined : value === "true",
                      )
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select one..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireMachineScope"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Require machine scope"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.requireMachineScope}
                >
                  <FormControl>
                    <Checkbox
                      id="requireMachineScope"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requirePolicyScope"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Require policy scope"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.requirePolicyScope}
                >
                  <FormControl>
                    <Checkbox
                      id="requirePolicyScope"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireProductScope"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Require product scope"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.requireProductScope}
                >
                  <FormControl>
                    <Checkbox
                      id="requireProductScope"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireUserScope"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Require user scope"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.requireUserScope}
                >
                  <FormControl>
                    <Checkbox
                      id="requireUserScope"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireVersionScope"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Require version scope"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.requireVersionScope}
                >
                  <FormControl>
                    <Checkbox
                      id="requireVersionScope"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="strict"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Strict"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.strict}
                >
                  <FormControl>
                    <Checkbox
                      id="strict"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transferStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Transfer strategy"
                  tooltip={PolicyAttributeDescriptions.transferStrategy}
                >
                  <NullableSelect<TransferStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(TransferStrategy).map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.transferStrategy[strategy]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="usePool"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Use pool"
                  variant="inline"
                  tooltip={PolicyAttributeDescriptions.usePool}
                >
                  <FormControl>
                    <Checkbox
                      id="usePool"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
              </FormItem>
            )}
          />
        </div>
      </section>

      <Separator className="my-6" />

      <section className="mt-4 flex flex-col md:flex-row">
        <div className="w-full">
          <FormField
            control={form.control}
            name="metadata"
            render={() => (
              <FormItem>
                <Field.Header label="Metadata" variant="stacking">
                  <FormControl>
                    <KeyValueInput<Forms.Policies.BaseValues> name="metadata" />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="block md:hidden">
          <Separator className="my-6" />
        </div>

        <div className="mx-8 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="w-full">
          {entitlementsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded-sm" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="entitlements.attach"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attach existing entitlements</FormLabel>
                  <FormControl>
                    <MultiSelect
                      value={field.value ?? []}
                      onChange={field.onChange}
                      options={entitlements.map((e) => ({
                        label: e.attributes.name,
                        value: e.id,
                      }))}
                      placeholder="Search entitlements"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="mt-2 space-y-3">
            <FormLabel>Create entitlements</FormLabel>
            {fields.map((f, i) => (
              <div key={f.id} className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name={`entitlements.create.${i}.name` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Enter name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`entitlements.create.${i}.code` as const}
                  render={({ field }) => (
                    <FormItem>
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
        </div>
      </section>
    </div>
  )
}
