import { useFormContext } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"

import * as Forms from "@/forms"
import { LicenseFormFieldDescriptions } from "@/types/licenses"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import KeyValueInput from "@/components/key-value-input"

type Layout = "create" | "edit"

interface OptionsFieldsProps {
  layout?: Layout
  title?: string
  className?: string
}

export default function OptionsFields({
  layout = "create",
  title,
  className,
}: OptionsFieldsProps): React.ReactElement {
  return layout === "edit" ? (
    <EditLayout title={title} className={className} />
  ) : (
    <CreateLayout title={title} className={className} />
  )
}

function CreateLayout({
  title,
  className,
}: Omit<OptionsFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Licenses.CreateValues>()

  return (
    <div className={cn("m-4 md:mb-0", className)}>
      <SectionCard title={title ?? "Additional configuration"}>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="protected"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <Field.Header
                    label="Protected"
                    variant="inline"
                    tooltip={LicenseFormFieldDescriptions.protected}
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
              name="suspended"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <Field.Header
                    label="Suspended"
                    variant="inline"
                    tooltip={LicenseFormFieldDescriptions.suspended}
                  >
                    <FormControl>
                      <Checkbox
                        id="suspended"
                        checked={!!field.value}
                        onCheckedChange={(value) => field.onChange(!!value)}
                      />
                    </FormControl>
                  </Field.Header>
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
                    tooltip={LicenseFormFieldDescriptions.metadata}
                  >
                    <FormControl>
                      <KeyValueInput<Forms.Licenses.BaseValues> name="metadata" />
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
  title,
  className,
}: Omit<OptionsFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Licenses.UpdateValues>()

  return (
    <div className={cn("space-y-6", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}

      <div className="flex flex-col md:flex-row">
        <div className="w-full space-y-6">
          <FormField
            control={form.control}
            name="protected"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Protected"
                  variant="inline"
                  tooltip={LicenseFormFieldDescriptions.protected}
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
            name="suspended"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <Field.Header
                  label="Suspended"
                  variant="inline"
                  tooltip={LicenseFormFieldDescriptions.suspended}
                >
                  <FormControl>
                    <Checkbox
                      id="suspended"
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </Field.Header>
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
                  tooltip={LicenseFormFieldDescriptions.metadata}
                >
                  <FormControl>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <KeyValueInput<any> name="metadata" />
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
