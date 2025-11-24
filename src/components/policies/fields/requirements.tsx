import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { SelectItem } from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"

import {
  PolicyFormValues,
  PolicyAttributeDescriptions,
  PolicyOptionLabels,
  CheckInInterval,
  AuthenticationStrategy,
} from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import KeyValueInput from "@/components/key-value-input"
import NullableSelect from "@/components/nullable-select"

type Layout = "default" | "advanced"

interface RequirementsFieldsProps {
  layout?: Layout
  title?: string
  includeMeta?: boolean
  includeAuthStrategy?: boolean
  className?: string
}

export default function RequirementsFields({
  layout = "default",
  title,
  includeMeta = true,
  includeAuthStrategy = true,
  className,
}: RequirementsFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout
      includeMeta={includeMeta}
      includeAuthStrategy={includeAuthStrategy}
      className={className}
    />
  ) : (
    <DefaultLayout
      title={title}
      includeMeta={includeMeta}
      includeAuthStrategy={includeAuthStrategy}
      className={className}
    />
  )
}

function DefaultLayout({
  title,
  includeMeta = true,
  includeAuthStrategy = true,
  className,
}: Omit<RequirementsFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  const checkInInterval = useWatch({
    control: form.control,
    name: "checkInInterval",
  })

  useEffect(() => {
    if (checkInInterval !== null) return

    let changed = false
    const field = "checkInIntervalCount"

    if (form.getValues(field) !== null || form.formState.errors[field]) {
      form.setValue(field, null, { shouldDirty: true, shouldValidate: false })
      changed = true
    }

    if (changed) {
      form.clearErrors(field)
      form.trigger(field)
    }
  }, [checkInInterval, form])

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      <FormField
        control={form.control}
        name="checkInInterval"
        render={({ field, fieldState }) => (
          <FormItem>
            <Field.Header
              label="Check-in interval"
              variant="stacking"
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
              variant="stacking"
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
                />
              </FormControl>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />

      {includeAuthStrategy && (
        <FormField
          control={form.control}
          name="authenticationStrategy"
          render={({ field, fieldState }) => (
            <FormItem>
              <Field.Header
                label="Authentication strategy"
                variant="stacking"
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
      )}

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

      {includeMeta && (
        <FormField
          control={form.control}
          name="metadata"
          render={() => (
            <FormItem>
              <FormLabel>Metadata</FormLabel>
              <FormControl>
                <KeyValueInput<PolicyFormValues> name="metadata" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

function AdvancedLayout({
  includeMeta = true,
  includeAuthStrategy = true,
  className,
}: Omit<RequirementsFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  const checkInInterval = useWatch({
    control: form.control,
    name: "checkInInterval",
  })

  useEffect(() => {
    if (checkInInterval !== null) return

    let changed = false
    const field = "checkInIntervalCount"

    if (form.getValues(field) !== null || form.formState.errors[field]) {
      form.setValue(field, null, { shouldDirty: true, shouldValidate: false })
      changed = true
    }

    if (changed) {
      form.clearErrors(field)
      form.trigger(field)
    }
  }, [checkInInterval, form])

  return (
    <SectionCard
      title="Advanced policy attributes"
      className={cn("m-4 md:mb-0", className)}
    >
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
        <div className="flex-1 space-y-4">
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
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          {includeAuthStrategy && (
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
          )}
        </div>

        <div className="mx-4 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="flex-1 space-y-4">
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
      </div>

      {includeMeta && (
        <div className="mt-6">
          <FormField
            control={form.control}
            name="metadata"
            render={() => (
              <FormItem>
                <FormLabel>Metadata</FormLabel>
                <FormControl>
                  <KeyValueInput<PolicyFormValues> name="metadata" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </SectionCard>
  )
}
