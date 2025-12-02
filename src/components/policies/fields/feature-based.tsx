import { useMemo } from "react"
import { useFormContext, useFieldArray } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { X } from "lucide-react"

import { cn } from "@/lib/utils"

import { useListEntitlements } from "@/queries/entitlements"

import * as Forms from "@/forms"
import { Entitlement } from "@/types/entitlements"

import MultiSelect from "@/components/multi-select"
import SectionCard from "@/components/section-card"

type Layout = "default" | "advanced"

interface FeatureBasedFieldsProps {
  layout?: Layout
  title?: string
  className?: string
}

interface LayoutProps extends Omit<FeatureBasedFieldsProps, "layout"> {
  entitlements: Entitlement[]
  entitlementsLoading: boolean
}

export default function FeatureBasedFields({
  layout = "default",
  title,
  className,
}: FeatureBasedFieldsProps): React.ReactElement {
  const { data: entitlementsData = [], isLoading: entitlementsLoading } =
    useListEntitlements()

  const entitlements = useMemo(
    () =>
      (entitlementsData ?? []).filter((e): e is Entitlement =>
        Boolean(e && e.id && e.attributes && e.attributes.name),
      ),
    [entitlementsData],
  )

  return layout === "advanced" ? (
    <AdvancedLayout
      entitlements={entitlements}
      entitlementsLoading={entitlementsLoading}
      className={className}
    />
  ) : (
    <DefaultLayout
      title={title}
      entitlements={entitlements}
      entitlementsLoading={entitlementsLoading}
      className={className}
    />
  )
}

function DefaultLayout({
  title,
  entitlements,
  entitlementsLoading,
  className,
}: LayoutProps): React.ReactElement {
  const form = useFormContext<Forms.Policies.BaseValues>()

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entitlements.create" as const,
  })

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      {entitlementsLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-sm" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ) : (
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
                  options={entitlements.map((e) => ({
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
      )}

      <div className="mt-2 space-y-3">
        <FormLabel>Create entitlements</FormLabel>
        {fields.map((f, i) => (
          <div key={f.id} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name={`entitlements.create.${i}.name` as const}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter name..." {...field} />
                  </FormControl>
                  <FormMessage />
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
                  <FormMessage />
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
    </div>
  )
}

function AdvancedLayout({
  entitlements,
  entitlementsLoading,
  className,
}: LayoutProps): React.ReactElement {
  const form = useFormContext<Forms.Policies.BaseValues>()

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entitlements.create" as const,
  })

  return (
    <SectionCard
      title="Feature-based policy attributes"
      className={cn("m-4 md:mb-0", className)}
    >
      {entitlementsLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-sm" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ) : (
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
                  options={entitlements.map((e) => ({
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
      )}

      <div className="mt-2 space-y-3">
        <FormLabel>Create entitlements</FormLabel>
        {fields.map((f, i) => (
          <div key={f.id} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name={`entitlements.create.${i}.name` as const}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter name..." {...field} />
                  </FormControl>
                  <FormMessage />
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
                  <FormMessage />
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
