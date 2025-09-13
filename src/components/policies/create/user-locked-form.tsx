import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import type { CreatePolicyFormValues } from "./modal"
import { PolicyAttributeDescriptions } from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"

export default function UserLockedForm({ loading }: { loading?: boolean }) {
  const form = useFormContext<CreatePolicyFormValues>()

  return (
    <SectionCard title="User-locked policy attributes" className="m-4 md:mb-0">
      <FormField
        control={form.control}
        name="maxUsers"
        render={({ field }) => (
          <FormItem>
            <div className="mt-2 flex flex-col pr-4 md:w-1/2 md:flex-row md:items-center md:justify-between">
              <Field.Header
                label="Max users"
                tooltip={PolicyAttributeDescriptions.maxUsers}
              >
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 1"
                    disabled={loading}
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
