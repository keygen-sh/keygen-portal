import { useState } from "react"
import { useFormContext } from "react-hook-form"

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

import {
  PolicyFormValues,
  PolicyAttributeDescriptions,
  PolicyOptionLabels,
  MachineUniquenessStrategy,
  MachineMatchingStrategy,
  ComponentUniquenessStrategy,
  ComponentMatchingStrategy,
  OverageStrategy,
} from "@/types/policies"

import { cn } from "@/lib/utils"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import NullableSelect from "@/components/nullable-select"

type Layout = "default" | "advanced"

interface NodeLockedFieldsProps {
  layout?: Layout
  title?: string
  className?: string
}

export default function NodeLockedFields({
  layout = "default",
  title,
  className,
}: NodeLockedFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout className={className} />
  ) : (
    <DefaultLayout title={title} className={className} />
  )
}

function DefaultLayout({
  title,
  className,
}: Omit<NodeLockedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      <FormField
        control={form.control}
        name="maxMachines"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Max machines"
              variant="stacking"
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

      <FormField
        control={form.control}
        name="machineUniquenessStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Machine uniqueness strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.machineUniquenessStrategy}
            >
              <NullableSelect<MachineUniquenessStrategy>
                value={field.value}
                onChange={(value) => field.onChange(value)}
              >
                {Object.values(MachineUniquenessStrategy).map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {PolicyOptionLabels.machineUniquenessStrategy[strategy]}
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
        name="componentUniquenessStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Component uniqueness strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.componentUniquenessStrategy}
            >
              <NullableSelect<ComponentUniquenessStrategy>
                value={field.value}
                onChange={(value) => field.onChange(value)}
              >
                {Object.values(ComponentUniquenessStrategy).map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {PolicyOptionLabels.componentUniquenessStrategy[strategy]}
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
        name="overageStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Overage strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.overageStrategy}
            >
              <NullableSelect<OverageStrategy>
                value={field.value}
                onChange={(value) => field.onChange(value)}
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
        name="machineMatchingStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Machine matching strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.machineMatchingStrategy}
            >
              <NullableSelect<MachineMatchingStrategy>
                value={field.value}
                onChange={(value) => field.onChange(value)}
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
        name="componentMatchingStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Component matching strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.componentMatchingStrategy}
            >
              <NullableSelect<ComponentMatchingStrategy>
                value={field.value}
                onChange={(value) => field.onChange(value)}
              >
                {Object.values(ComponentMatchingStrategy).map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {PolicyOptionLabels.componentMatchingStrategy[strategy]}
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
}: Omit<NodeLockedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <SectionCard
      title="Node-locked policy attributes"
      className={cn("m-4 md:mb-0", className)}
    >
      <FormField
        control={form.control}
        name="maxMachines"
        render={({ field }) => (
          <FormItem>
            <div className="mt-2 flex flex-col pr-4 md:w-1/2 md:flex-row md:items-center md:justify-between">
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
                name="machineUniquenessStrategy"
                render={({ field }) => (
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
                name="componentUniquenessStrategy"
                render={({ field }) => (
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
                name="overageStrategy"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Overage strategy"
                      tooltip={PolicyAttributeDescriptions.overageStrategy}
                    >
                      <NullableSelect<OverageStrategy>
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
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
            </div>

            <div className="mx-4 hidden md:block">
              <Separator orientation="vertical" dashed />
            </div>

            <div className="flex-1 space-y-4">
              <FormField
                control={form.control}
                name="machineMatchingStrategy"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Machine matching strategy"
                      tooltip={
                        PolicyAttributeDescriptions.machineMatchingStrategy
                      }
                    >
                      <NullableSelect<MachineMatchingStrategy>
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      >
                        {Object.values(MachineMatchingStrategy).map(
                          (strategy) => (
                            <SelectItem key={strategy} value={strategy}>
                              {
                                PolicyOptionLabels.machineMatchingStrategy[
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
                name="componentMatchingStrategy"
                render={({ field }) => (
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
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
