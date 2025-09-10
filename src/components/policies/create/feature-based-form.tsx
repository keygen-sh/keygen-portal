import { useFieldArray, useFormContext } from "react-hook-form"

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

import type { CreatePolicyFormValues } from "./modal"
import { MockEntitlements } from "@/types/entitlements"

import MultiSelect from "@/components/multi-select"
import SectionCard from "@/components/section-card"

export default function FeatureBasedForm({ loading }: { loading?: boolean }) {
  const form = useFormContext<CreatePolicyFormValues>()

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entitlements.create" as const,
  })

  return (
    <SectionCard title="Feature-based policy attributes" className="m-4 mb-0">
      <FormField
        control={form.control}
        name="entitlements.link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link existing entitlements</FormLabel>
            <FormControl>
              <MultiSelect
                value={field.value ?? []}
                onChange={field.onChange}
                options={MockEntitlements.map((e) => ({
                  label: e.data.attributes.name,
                  value: e.data.id,
                }))}
                placeholder="Search entitlements"
                disabled={loading}
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
                    <Input
                      placeholder="Enter name..."
                      disabled={loading}
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter code..."
                      disabled={loading}
                      {...field}
                    />
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
                disabled={loading}
              >
                <X className="h-4 w-4 stroke-content-subdued" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          size="sm"
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={() => append({ name: "", code: "" })}
          className="text-content-muted"
        >
          + New entitlement
        </Button>
      </div>
    </SectionCard>
  )
}
