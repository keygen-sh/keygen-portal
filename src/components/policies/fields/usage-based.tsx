import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"

import { PolicyFormValues, PolicyAttributeDescriptions } from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"

type Layout = "default" | "advanced"

interface UsageBasedFieldsProps {
  layout?: Layout
  className?: string
}

export default function UsageBasedFields({
  layout = "default",
  className,
}: UsageBasedFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout className={className} />
  ) : (
    <DefaultLayout className={className} />
  )
}

function DefaultLayout({
  className,
}: Omit<UsageBasedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      <FormField
        control={form.control}
        name="maxUses"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Max uses"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.maxUses}
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
    </div>
  )
}

function AdvancedLayout({
  className,
}: Omit<UsageBasedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <SectionCard
      title="Usage-based policy attributes"
      className={cn("m-4 md:mb-0", className)}
    >
      <FormField
        control={form.control}
        name="maxUses"
        render={({ field }) => (
          <FormItem>
            <div className="mt-2 flex flex-col pr-4 md:w-1/2 md:flex-row md:items-center md:justify-between">
              <Field.Header
                label="Max uses"
                tooltip={PolicyAttributeDescriptions.maxUses}
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
    </SectionCard>
  )
}
