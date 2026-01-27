import { useState } from "react"
import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"

import * as Forms from "@/forms"

import { useMobile } from "@/hooks/use-mobile"

import { ProcessFormFieldDescriptions } from "@/types/processes"

import { useListMachines } from "@/queries/machines"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import SearchSelect from "@/components/search-select"
import KeyValueInput from "@/components/key-value-input"
import { Info } from "lucide-react"

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
  const form = useFormContext<Forms.Processes.CreateValues>()
  const isMobile = useMobile()
  const [pidFocused, setPidFocused] = useState(false)
  const { data: machines = [] } = useListMachines()

  return (
    <div className={cn("m-4 md:mb-0", className)}>
      <FormField
        control={form.control}
        name="pid"
        render={({ field }) => (
          <FormItem className="m-4 md:my-6">
            <Popover open={isMobile && pidFocused}>
              <PopoverAnchor asChild>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    variant="title"
                    placeholder="Enter process pid..."
                    className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                    autoFocus={!field.value}
                    autoComplete="off"
                    onFocus={() => setPidFocused(true)}
                    onBlur={() => setPidFocused(false)}
                  />
                </FormControl>
              </PopoverAnchor>
              <PopoverContent
                side="bottom"
                align="start"
                className="m-1 w-76 bg-background-4 text-pretty text-content-muted"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <p className="flex gap-1 text-pretty">
                  <Info className="mt-1.5 h-4 w-4 shrink-0" />
                  {ProcessFormFieldDescriptions.pid}
                </p>
              </PopoverContent>
            </Popover>
            <FormMessage className="ml-2" />
            <p className="ml-2 hidden items-center gap-1 text-sm text-content-normal md:flex">
              <Info className="mt-0.25 h-4 w-4 shrink-0" />
              {ProcessFormFieldDescriptions.pid}
            </p>
          </FormItem>
        )}
      />

      <SectionCard title="Process configuration">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="machineId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field.Header label="Machine relationship" variant="stacking">
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
                    tooltip={ProcessFormFieldDescriptions.metadata}
                    optional
                  >
                    <FormControl>
                      <KeyValueInput<Forms.Processes.CreateValues> name="metadata" />
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
  const form = useFormContext<Forms.Processes.UpdateValues>()

  return (
    <div className={cn("p-4", className)}>
      <h2 className="text-content-loud/90">Attributes</h2>
      <section className="mt-4 flex flex-col md:flex-row">
        <div className="w-full space-y-6">
          <FormField
            control={form.control}
            name="metadata"
            render={() => (
              <FormItem>
                <Field.Header
                  label="Metadata"
                  variant="stacking"
                  tooltip={ProcessFormFieldDescriptions.metadata}
                  optional
                >
                  <FormControl>
                    <KeyValueInput<Forms.Processes.UpdateValues> name="metadata" />
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
