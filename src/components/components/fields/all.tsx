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

import * as Forms from "@/forms"

import { ComponentFormFieldDescriptions } from "@/types/components"

import { useListMachines } from "@/queries/machines"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import SearchSelect from "@/components/search-select"
import KeyValueInput from "@/components/key-value-input"

type Layout = "create" | "edit"

interface AllFieldsProps {
  layout?: Layout
  className?: string
}

export default function AllFields({
  layout = "edit",
  className,
}: AllFieldsProps): React.ReactElement {
  return layout === "edit" ? (
    <EditLayout className={className} />
  ) : (
    <CreateLayout className={className} />
  )
}

function CreateLayout({
  className,
}: Omit<AllFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Components.CreateValues>()
  const { data: machines = [] } = useListMachines()

  return (
    <div className={cn("m-4 md:mb-0", className)}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="m-4 md:my-6">
            <FormControl>
              <Input
                {...field}
                value={field.value || ""}
                variant="title"
                placeholder="Enter component name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={!field.value}
                autoComplete="off"
              />
            </FormControl>
            <FormMessage className="ml-2" />
          </FormItem>
        )}
      />

      <SectionCard title="Component configuration">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="fingerprint"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Fingerprint"
                    variant="stacking"
                    tooltip={ComponentFormFieldDescriptions.fingerprint}
                  >
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Enter component fingerprint..."
                      />
                    </FormControl>
                  </Field.Header>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="machineId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field.Header
                    label="Machine"
                    variant="stacking"
                    tooltip={ComponentFormFieldDescriptions.machine}
                  >
                    <SearchSelect
                      resource="machine"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      options={machines}
                      allowClear={false}
                      invalid={!!fieldState.error}
                      truncate="middle"
                    />
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
              name="metadata"
              render={() => (
                <FormItem>
                  <Field.Header
                    label="Metadata"
                    variant="stacking"
                    optional
                    tooltip={ComponentFormFieldDescriptions.metadata}
                  >
                    <FormControl>
                      <KeyValueInput<Forms.Components.CreateValues> name="metadata" />
                    </FormControl>
                  </Field.Header>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

function EditLayout({
  className,
}: Omit<AllFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Components.UpdateValues>()

  return (
    <div className={cn("p-4", className)}>
      <h2 className="text-content-loud/90">Attributes</h2>
      <section className="mt-4 flex flex-col md:flex-row">
        <div className="w-full space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Component name"
                  variant="stacking"
                  tooltip={ComponentFormFieldDescriptions.name}
                >
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter component name..."
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
            name="metadata"
            render={() => (
              <FormItem>
                <Field.Header
                  label="Metadata"
                  variant="stacking"
                  tooltip={ComponentFormFieldDescriptions.metadata}
                >
                  <FormControl>
                    <KeyValueInput<Forms.Components.UpdateValues> name="metadata" />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  )
}
