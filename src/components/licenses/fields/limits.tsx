import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"
import { getLimitPlaceholder } from "@/lib/licenses"

import * as Forms from "@/forms"
import { LicenseFormFieldDescriptions } from "@/types/licenses"
import { Policy } from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"

type Layout = "create" | "edit"

interface LimitsFieldsProps {
  layout?: Layout
  title?: string
  className?: string
  selectedPolicy?: Policy | null
}

export default function LimitsFields({
  layout = "create",
  title,
  className,
  selectedPolicy,
}: LimitsFieldsProps): React.ReactElement {
  return layout === "edit" ? (
    <EditLayout
      title={title}
      selectedPolicy={selectedPolicy}
      className={className}
    />
  ) : (
    <CreateLayout
      title={title}
      selectedPolicy={selectedPolicy}
      className={className}
    />
  )
}

function CreateLayout({
  title,
  className,
  selectedPolicy,
}: Omit<LimitsFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Licenses.BaseValues>()

  return (
    <div className={cn("m-4 md:mb-0", className)}>
      <SectionCard title={title ?? "Usage limits"}>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="maxMachines"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Max Machines"
                    optional
                    tooltip={LicenseFormFieldDescriptions.maxMachines}
                  >
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        placeholder={
                          selectedPolicy
                            ? getLimitPlaceholder(
                                selectedPolicy.attributes.maxMachines,
                              )
                            : "Inherit from policy"
                        }
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                  </Field.Header>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxProcesses"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Max Processes"
                    optional
                    tooltip={LicenseFormFieldDescriptions.maxProcesses}
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
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
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
                    label="Max Users"
                    optional
                    tooltip={LicenseFormFieldDescriptions.maxUsers}
                  >
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        placeholder={
                          selectedPolicy
                            ? getLimitPlaceholder(
                                selectedPolicy.attributes.maxUsers,
                              )
                            : "Inherit from policy"
                        }
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                  </Field.Header>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mx-4 hidden md:block">
            <Separator orientation="vertical" dashed={true} />
          </div>

          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="maxCores"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Max Cores"
                    optional
                    tooltip={LicenseFormFieldDescriptions.maxCores}
                  >
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        placeholder={
                          selectedPolicy
                            ? getLimitPlaceholder(
                                selectedPolicy.attributes.maxCores,
                              )
                            : "Inherit from policy"
                        }
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
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
                    label="Max Uses"
                    optional
                    tooltip={LicenseFormFieldDescriptions.maxUses}
                  >
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        placeholder={
                          selectedPolicy
                            ? getLimitPlaceholder(
                                selectedPolicy.attributes.maxUses,
                              )
                            : "Inherit from policy"
                        }
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                  </Field.Header>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-content-muted">
          Leave empty to inherit limits from the policy. Set a value to override
          the policy's limits for this specific license.
        </p>
      </SectionCard>
    </div>
  )
}

function EditLayout({
  title,
  selectedPolicy,
  className,
}: Omit<LimitsFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Licenses.UpdateValues>()

  return (
    <div className={cn("space-y-6", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}

      <div className="flex flex-col md:flex-row">
        <div className="w-full space-y-6">
          <FormField
            control={form.control}
            name="maxMachines"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Max machines"
                  tooltip={LicenseFormFieldDescriptions.maxMachines}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder={
                        selectedPolicy
                          ? getLimitPlaceholder(
                              selectedPolicy.attributes.maxMachines,
                            )
                          : "Inherit from policy"
                      }
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxProcesses"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Max processes"
                  tooltip={LicenseFormFieldDescriptions.maxProcesses}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder={
                        selectedPolicy
                          ? getLimitPlaceholder(
                              selectedPolicy.attributes.maxProcesses,
                            )
                          : "Inherit from policy"
                      }
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
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
                  tooltip={LicenseFormFieldDescriptions.maxUsers}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder={
                        selectedPolicy
                          ? getLimitPlaceholder(
                              selectedPolicy.attributes.maxUsers,
                            )
                          : "Inherit from policy"
                      }
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
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
            name="maxCores"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Max cores"
                  tooltip={LicenseFormFieldDescriptions.maxCores}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder={
                        selectedPolicy
                          ? getLimitPlaceholder(
                              selectedPolicy.attributes.maxCores,
                            )
                          : "Inherit from policy"
                      }
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
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
                  tooltip={LicenseFormFieldDescriptions.maxUses}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder={
                        selectedPolicy
                          ? getLimitPlaceholder(
                              selectedPolicy.attributes.maxUses,
                            )
                          : "Inherit from policy"
                      }
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
