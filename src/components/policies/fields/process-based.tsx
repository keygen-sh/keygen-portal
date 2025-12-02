import { useState } from "react"
import { useFormContext, useFormState } from "react-hook-form"

import { Input } from "@/components/ui/input"
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

import * as Forms from "@/forms"
import {
  PolicyAttributeDescriptions,
  PolicyOptionLabels,
  MachineLeasingStrategy,
  ProcessLeasingStrategy,
} from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import NullableSelect from "@/components/nullable-select"

type ProcessBasedLayout = "default" | "advanced"

interface ProcessBasedFieldsProps {
  layout?: ProcessBasedLayout
  title?: string
  className?: string
}

export default function ProcessBasedFields({
  layout = "default",
  title,
  className,
}: ProcessBasedFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout className={className} />
  ) : (
    <DefaultLayout title={title} className={className} />
  )
}

function DefaultLayout({
  title,
  className,
}: Omit<ProcessBasedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Policies.BaseValues>()

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      <FormField
        control={form.control}
        name="maxProcesses"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Max processes"
              variant="stacking"
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
        name="machineLeasingStrategy"
        render={({ field, fieldState }) => (
          <FormItem>
            <Field.Header
              label="Machine leasing strategy"
              variant="stacking"
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
        name="processLeasingStrategy"
        render={({ field, fieldState }) => (
          <FormItem className="flex">
            <Field.Header
              label="Process leasing strategy"
              variant="stacking"
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
    </div>
  )
}

function AdvancedLayout({
  className,
}: Omit<ProcessBasedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Policies.BaseValues>()

  const [showAdvanced, setShowAdvanced] = useState(false)

  const advancedFields: (keyof Forms.Policies.BaseValues)[] = [
    "machineLeasingStrategy",
    "processLeasingStrategy",
  ]

  const { errors } = useFormState({
    control: form.control,
    name: advancedFields,
  })

  const open = showAdvanced || advancedFields.some((field) => !!errors[field])

  return (
    <SectionCard
      title="Process-based policy attributes"
      className={cn("m-4 md:mb-0", className)}
    >
      <FormField
        control={form.control}
        name="maxProcesses"
        render={({ field }) => (
          <FormItem>
            <div className="mt-2 flex flex-col pr-4 md:w-1/2 md:flex-row md:items-center md:justify-between">
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
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <Switch checked={open} onCheckedChange={setShowAdvanced} />
          <span className="ml-2 font-owners-text text-sm font-medium text-content-muted">
            Advanced configuration
          </span>
        </div>

        {open && (
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
            <div className="flex-1 space-y-4">
              <FormField
                control={form.control}
                name="machineLeasingStrategy"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Field.Header
                      label="Machine leasing strategy"
                      tooltip={
                        PolicyAttributeDescriptions.machineLeasingStrategy
                      }
                    >
                      <NullableSelect<MachineLeasingStrategy>
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        invalid={!!fieldState.error}
                      >
                        {Object.values(MachineLeasingStrategy).map(
                          (strategy) => (
                            <SelectItem key={strategy} value={strategy}>
                              {
                                PolicyOptionLabels.machineLeasingStrategy[
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
            </div>

            <div className="mx-4 hidden md:block">
              <Separator orientation="vertical" dashed />
            </div>

            <div className="flex-1 space-y-4">
              <FormField
                control={form.control}
                name="processLeasingStrategy"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Field.Header
                      label="Process leasing strategy"
                      tooltip={
                        PolicyAttributeDescriptions.processLeasingStrategy
                      }
                    >
                      <NullableSelect<ProcessLeasingStrategy>
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        invalid={!!fieldState.error}
                      >
                        {Object.values(ProcessLeasingStrategy).map(
                          (strategy) => (
                            <SelectItem key={strategy} value={strategy}>
                              {
                                PolicyOptionLabels.processLeasingStrategy[
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
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
