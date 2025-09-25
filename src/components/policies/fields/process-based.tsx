import { useState } from "react"
import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import { cn, humanize } from "@/lib/utils"

import {
  PolicyFormValues,
  PolicyAttributeDescriptions,
  MachineLeasingStrategy,
  ProcessLeasingStrategy,
} from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"

type ProcessBasedLayout = "default" | "advanced"

interface ProcessBasedFieldsProps {
  layout?: ProcessBasedLayout
  className?: string
}

export default function ProcessBasedFields({
  layout = "default",
  className,
}: ProcessBasedFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout className={className} />
  ) : (
    <DefaultLayout className={className} />
  )
}

function DefaultLayout({
  className,
}: Omit<ProcessBasedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
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

      <FormField
        control={form.control}
        name="machineLeasingStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Machine leasing strategy"
              tooltip={PolicyAttributeDescriptions.machineLeasingStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === ""
                      ? undefined
                      : (value as MachineLeasingStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(MachineLeasingStrategy).map(
                    (strategy: MachineLeasingStrategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {humanize(String(strategy))}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="processLeasingStrategy"
        render={({ field }) => (
          <FormItem className="flex">
            <Field.Header
              label="Process leasing strategy"
              tooltip={PolicyAttributeDescriptions.processLeasingStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === ""
                      ? undefined
                      : (value as ProcessLeasingStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ProcessLeasingStrategy).map(
                    (strategy: ProcessLeasingStrategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {humanize(String(strategy))}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
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
  const form = useFormContext<PolicyFormValues>()

  const [showAdvanced, setShowAdvanced] = useState(false)

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
                name="machineLeasingStrategy"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Machine leasing strategy"
                      tooltip={
                        PolicyAttributeDescriptions.machineLeasingStrategy
                      }
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as MachineLeasingStrategy),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(MachineLeasingStrategy).map(
                            (strategy: MachineLeasingStrategy) => (
                              <SelectItem key={strategy} value={strategy}>
                                {humanize(String(strategy))}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
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
                render={({ field }) => (
                  <FormItem className="flex">
                    <Field.Header
                      label="Process leasing strategy"
                      tooltip={
                        PolicyAttributeDescriptions.processLeasingStrategy
                      }
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as ProcessLeasingStrategy),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select one..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ProcessLeasingStrategy).map(
                            (strategy: ProcessLeasingStrategy) => (
                              <SelectItem key={strategy} value={strategy}>
                                {humanize(String(strategy))}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
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
