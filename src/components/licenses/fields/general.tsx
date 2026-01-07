import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
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
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"

import * as Forms from "@/forms"

import { useListPolicies } from "@/queries/policies"

import { LicenseFormFieldDescriptions } from "@/types/licenses"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"

type Layout = "create" | "edit"

interface GeneralFieldsProps {
  layout?: Layout
  title?: string
  className?: string
}

export default function GeneralFields({
  layout = "create",
  title,
  className,
}: GeneralFieldsProps): React.ReactElement {
  return layout === "edit" ? (
    <EditLayout title={title} className={className} />
  ) : (
    <CreateLayout title={title} className={className} />
  )
}

function CreateLayout({
  title,
  className,
}: Omit<GeneralFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Licenses.BaseValues>()

  const { data: policies = [], isLoading: policiesLoading } = useListPolicies()

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
                placeholder="Enter license name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={!field.value}
                autoComplete="off"
              />
            </FormControl>
            <FormMessage className="ml-2" />
          </FormItem>
        )}
      />

      <SectionCard title={title ?? "General license attributes"}>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Key"
                    variant="stacking"
                    tooltip={LicenseFormFieldDescriptions.key}
                    optional
                  >
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Leave blank for auto-generation"
                        className="font-mono"
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
              name="policyId"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Policy Relationship"
                    variant="stacking"
                    tooltip=""
                  >
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={policiesLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a policy..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {policies.map((policy) => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.attributes.name}
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
        </div>
      </SectionCard>
    </div>
  )
}

function EditLayout({
  title,
  className,
}: Omit<GeneralFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Licenses.UpdateValues>()

  return (
    <div className={cn("space-y-6", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <Field.Header label="License name" variant="stacking">
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter license name..."
                  autoComplete="off"
                />
              </FormControl>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
