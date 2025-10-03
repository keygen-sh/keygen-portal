import { useFormContext, useFieldArray } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { X } from "lucide-react"

import { cn } from "@/lib/utils"

import { PolicyFormValues } from "@/types/policies"
import { MockEntitlements } from "@/types/entitlements"

import MultiSelect from "@/components/multi-select"
import SectionCard from "@/components/section-card"
import KeyValueInput from "@/components/key-value-input"

type Layout = "default" | "advanced"

interface FeatureBasedFieldsProps {
  layout?: Layout
  title?: string
  className?: string
}

export default function FeatureBasedFields({
  layout = "default",
  title,
  className,
}: FeatureBasedFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout className={className} />
  ) : (
    <DefaultLayout title={title} className={className} />
  )
}

function DefaultLayout({
  title,
  className,
}: Omit<FeatureBasedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      <FormField
        control={form.control}
        name="entitlements.attach"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Attach existing entitlements</FormLabel>
            <FormControl>
              <MultiSelect
                value={field.value ?? []}
                onChange={field.onChange}
                options={MockEntitlements.map((e) => ({
                  label: e.attributes.name,
                  value: e.id,
                }))}
                placeholder="Search entitlements"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-2 space-y-3">
        <FormLabel>Create entitlements</FormLabel>
        <KeyValueInput<PolicyFormValues>
          name="entitlements.create"
          addLabel="New enitlement"
          keyPlaceholder="Enter name..."
          valuePlaceholder="Enter code..."
        />
      </div>
    </div>
  )
}

function AdvancedLayout({
  className,
}: Omit<FeatureBasedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entitlements.create" as const,
  })

  return (
    <SectionCard
      title="Feature-based policy attributes"
      className={cn("m-4 md:mb-0", className)}
    >
      <FormField
        control={form.control}
        name="entitlements.attach"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link existing entitlements</FormLabel>
            <FormControl>
              <MultiSelect
                value={field.value ?? []}
                onChange={field.onChange}
                options={MockEntitlements.map((e) => ({
                  label: e.attributes.name,
                  value: e.id,
                }))}
                placeholder="Search entitlements"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-2 space-y-3">
        <FormLabel>Create entitlements</FormLabel>
        {fields.map((f, i) => (
          <div key={f.id} className="grid gap-2 md:grid-cols-3">
            <FormField
              control={form.control}
              name={`entitlements.create.${i}.name` as const}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter name..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`entitlements.create.${i}.code` as const}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter code..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-center">
              <Button
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => remove(i)}
              >
                <X className="h-4 w-4 text-content-subdued" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          size="sm"
          type="button"
          variant="ghost"
          onClick={() => append({ name: "", code: "" })}
          className="text-content-muted"
        >
          + New entitlement
        </Button>
      </div>
    </SectionCard>
  )
}
