import { useState, useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { SelectItem } from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"

import {
  PolicyFormValues,
  PolicyAttributeDescriptions,
  PolicyOptionLabels,
  ExpirationBasis,
  ExpirationStrategy,
  RenewalBasis,
  TransferStrategy,
} from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import DurationInput from "@/components/duration-input"
import NullableSelect from "@/components/nullable-select"

type Layout = "default" | "advanced"

interface TimedFieldsProps {
  layout?: Layout
  title?: string
  className?: string
}

export default function TimedFields({
  layout = "default",
  title,
  className,
}: TimedFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout className={className} />
  ) : (
    <DefaultLayout title={title} className={className} />
  )
}

function DefaultLayout({
  title,
  className,
}: Omit<TimedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

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
      if (form.getValues(field) !== null || form.formState.errors[field]) {
        form.setValue(field, null, { shouldDirty: true, shouldValidate: false })
        changed = true
      }
    }
    if (changed) {
      form.clearErrors(fields)
      form.trigger(fields)
    }
  }, [duration])

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Duration"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.duration}
            >
              <FormControl>
                <DurationInput
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
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
              variant="stacking"
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
        name="expirationBasis"
        render={({ field, fieldState }) => (
          <FormItem>
            <Field.Header
              label="Expiration basis"
              variant="stacking"
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
        name="renewalBasis"
        render={({ field, fieldState }) => (
          <FormItem>
            <Field.Header
              label="Renewal basis"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.renewalBasis}
            >
              <NullableSelect<RenewalBasis>
                value={field.value}
                onChange={(value) => field.onChange(value)}
                invalid={!!fieldState.error}
                disabled={!duration}
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
        name="transferStrategy"
        render={({ field, fieldState }) => (
          <FormItem>
            <Field.Header
              label="Transfer strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.transferStrategy}
            >
              <NullableSelect<TransferStrategy>
                value={field.value}
                onChange={(value) => field.onChange(value)}
                invalid={!!fieldState.error}
                disabled={!duration}
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
    </div>
  )
}

function AdvancedLayout({
  className,
}: Omit<TimedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <SectionCard
      title="Timed policy attributes"
      className={cn("m-4 md:mb-0", className)}
    >
      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <div className="mt-2 flex flex-col pr-4 md:w-1/2 md:flex-row md:items-center md:justify-between">
              <Field.Header
                label="Duration"
                tooltip={PolicyAttributeDescriptions.duration}
              >
                <FormControl>
                  <DurationInput
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
              </Field.Header>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
          <span className="ml-2 font-owners-text text-sm font-medium text-content-muted">
            Advanced configuration
          </span>
        </div>

        {showAdvanced && (
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
            <div className="flex-1 space-y-4">
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
            </div>

            <div className="mx-4 hidden md:block">
              <Separator orientation="vertical" dashed />
            </div>

            <div className="flex-1 space-y-4">
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
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
