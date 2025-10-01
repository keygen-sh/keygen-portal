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
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

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
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === ""
                      ? undefined
                      : (value as MachineUniquenessStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(MachineUniquenessStrategy).map(
                    (strategy: MachineUniquenessStrategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.machineUniquenessStrategy[strategy]}
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
        name="componentUniquenessStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Component uniqueness strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.componentUniquenessStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === ""
                      ? undefined
                      : (value as ComponentUniquenessStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ComponentUniquenessStrategy).map(
                    (strategy: ComponentUniquenessStrategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {
                          PolicyOptionLabels.componentUniquenessStrategy[
                            strategy
                          ]
                        }
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
        name="overageStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Overage strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.overageStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === "" ? undefined : (value as OverageStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(OverageStrategy).map(
                    (basis: OverageStrategy) => (
                      <SelectItem key={basis} value={basis}>
                        {PolicyOptionLabels.overageStrategy[basis]}
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
        name="machineMatchingStrategy"
        render={({ field }) => (
          <FormItem className="flex">
            <Field.Header
              label="Machine matching strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.machineMatchingStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === ""
                      ? undefined
                      : (value as MachineMatchingStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(MachineMatchingStrategy).map(
                    (strategy: MachineMatchingStrategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.machineMatchingStrategy[strategy]}
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
        name="componentMatchingStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Component matching strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.componentMatchingStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === ""
                      ? undefined
                      : (value as ComponentMatchingStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.value ?? "Select one..."} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ComponentMatchingStrategy).map(
                    (basis: ComponentMatchingStrategy) => (
                      <SelectItem key={basis} value={basis}>
                        {PolicyOptionLabels.componentMatchingStrategy[basis]}
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
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as MachineUniquenessStrategy),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(MachineUniquenessStrategy).map(
                            (strategy: MachineUniquenessStrategy) => (
                              <SelectItem key={strategy} value={strategy}>
                                {
                                  PolicyOptionLabels.machineUniquenessStrategy[
                                    strategy
                                  ]
                                }
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
                name="componentUniquenessStrategy"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Component uniqueness strategy"
                      tooltip={
                        PolicyAttributeDescriptions.componentUniquenessStrategy
                      }
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as ComponentUniquenessStrategy),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select one..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ComponentUniquenessStrategy).map(
                            (strategy: ComponentUniquenessStrategy) => (
                              <SelectItem key={strategy} value={strategy}>
                                {
                                  PolicyOptionLabels
                                    .componentUniquenessStrategy[strategy]
                                }
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
                name="overageStrategy"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Overage strategy"
                      tooltip={PolicyAttributeDescriptions.overageStrategy}
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as OverageStrategy),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select one..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(OverageStrategy).map(
                            (strategy: OverageStrategy) => (
                              <SelectItem key={strategy} value={strategy}>
                                {PolicyOptionLabels.overageStrategy[strategy]}
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
                name="machineMatchingStrategy"
                render={({ field }) => (
                  <FormItem className="flex">
                    <Field.Header
                      label="Machine matching strategy"
                      tooltip={
                        PolicyAttributeDescriptions.machineMatchingStrategy
                      }
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as MachineMatchingStrategy),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select one..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(MachineMatchingStrategy).map(
                            (strategy: MachineMatchingStrategy) => (
                              <SelectItem key={strategy} value={strategy}>
                                {
                                  PolicyOptionLabels.machineMatchingStrategy[
                                    strategy
                                  ]
                                }
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
                name="componentMatchingStrategy"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Component matching strategy"
                      tooltip={
                        PolicyAttributeDescriptions.componentMatchingStrategy
                      }
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as ComponentMatchingStrategy),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={field.value ?? "Select one..."}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ComponentMatchingStrategy).map(
                            (basis: ComponentMatchingStrategy) => (
                              <SelectItem key={basis} value={basis}>
                                {
                                  PolicyOptionLabels.componentMatchingStrategy[
                                    basis
                                  ]
                                }
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
