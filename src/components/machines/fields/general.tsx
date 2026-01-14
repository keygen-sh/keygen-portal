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

import { MockLicenses } from "@/types/licenses"
import { MachineFormFieldDescriptions } from "@/types/machines"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import SearchSelect from "@/components/search-select"

interface GeneralFieldsProps {
  title?: string
  className?: string
}

export default function GeneralFields({
  title,
  className,
}: GeneralFieldsProps): React.ReactElement {
  const form = useFormContext<Forms.Machines.CreateValues>()

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
                placeholder="Enter machine name..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={!field.value}
                autoComplete="off"
              />
            </FormControl>
            <FormMessage className="ml-2" />
          </FormItem>
        )}
      />

      <SectionCard title={title ?? "General machine configuration"}>
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
                    tooltip={MachineFormFieldDescriptions.fingerprint}
                  >
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Enter machine fingerprint..."
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
              name="licenseId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field.Header label="License Relationship" variant="stacking">
                    <SearchSelect
                      resource="license"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      options={MockLicenses}
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
        </div>
      </SectionCard>
    </div>
  )
}
