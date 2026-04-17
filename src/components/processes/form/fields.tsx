import { useState } from "react"
import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"

import { Info } from "lucide-react"

import { useMobile } from "@/hooks/use-mobile"

import * as Schemas from "@/schemas"

import {
  ProcessFormFieldDescriptions,
  ProcessCreateFormFieldDescriptions,
  ProcessEditFormFieldDescriptions,
} from "@/types/processes"

import { useListMachines } from "@/queries/machines"
import { type FieldVariant } from "@/components/forms/field"

import * as Forms from "@/components/forms"
import * as Search from "@/components/search"
import KeyValueInput from "@/components/key-value-input"

type Descriptions = typeof ProcessFormFieldDescriptions

interface ProcessesFormFieldsProps {
  include?: Schemas.Processes.FieldNames[]
  exclude?: Schemas.Processes.FieldNames[]
  autoFocus?: Schemas.Processes.FieldNames
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  schema?: "create" | "edit"
}

const INCLUDE_DEFAULT_FIELDS: Schemas.Processes.FieldNames[] = [
  "pid",
  "machineId",
  "metadata",
]

export default function ProcessesFormFields({
  include,
  exclude = [],
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  schema,
}: ProcessesFormFieldsProps) {
  const descriptions =
    schema === "create"
      ? ProcessCreateFormFieldDescriptions
      : schema === "edit"
        ? ProcessEditFormFieldDescriptions
        : ProcessFormFieldDescriptions

  const fields = include
    ? include
    : INCLUDE_DEFAULT_FIELDS.filter((field) => !exclude.includes(field))

  return (
    <>
      {fields.map((field) => {
        switch (field) {
          case "pid":
            return (
              <PidField
                key="pid"
                autoFocus={autoFocus === "pid"}
                titleVariant={titleVariant}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "machineId":
            return (
              <MachineIdField
                key="machineId"
                autoFocus={autoFocus === "machineId"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          case "metadata":
            return (
              <MetadataField
                key="metadata"
                autoFocus={autoFocus === "metadata"}
                fieldVariant={fieldVariant}
                descriptions={descriptions}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}

function PidField({
  autoFocus,
  titleVariant,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  titleVariant?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Processes.CreateValues>()
  const [pidFocused, setPidFocused] = useState(false)
  const isMobile = useMobile()

  return (
    <FormField
      control={form.control}
      name="pid"
      render={({ field }) => (
        <FormItem>
          {titleVariant ? (
            <Popover open={isMobile && pidFocused}>
              <PopoverAnchor asChild>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    variant={titleVariant ? "title" : "default"}
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
                  {descriptions.pid}
                </p>
              </PopoverContent>
            </Popover>
          ) : (
            <Forms.Field.Header
              label="Process ID (PID)"
              variant={fieldVariant}
              tooltip={descriptions.pid}
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter process pid..."
                  autoFocus={autoFocus}
                  autoComplete="off"
                />
              </FormControl>
            </Forms.Field.Header>
          )}
          <FormMessage className={titleVariant ? "ml-2" : undefined} />
          <p className="ml-2 hidden items-center gap-1 text-sm text-content-normal md:flex">
            <Info className="mt-0.25 h-4 w-4 shrink-0" />
            {descriptions.pid}
          </p>
        </FormItem>
      )}
    />
  )
}

function MachineIdField({
  autoFocus,
  fieldVariant = "row",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Processes.CreateValues>()
  const { data: machines = [] } = useListMachines()

  return (
    <FormField
      control={form.control}
      name="machineId"
      render={({ field, fieldState }) => (
        <FormItem>
          <Forms.Field.Header
            label="Machine"
            variant={fieldVariant}
            tooltip={descriptions.machine}
          >
            <Search.Select
              resource="machines"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              options={machines}
              allowClear={false}
              invalid={!!fieldState.error}
              autoFocus={autoFocus}
              truncate="middle"
            />
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MetadataField({
  autoFocus,
  fieldVariant = "stacking",
  descriptions,
}: {
  autoFocus?: boolean
  fieldVariant?: FieldVariant
  descriptions: Descriptions
}) {
  const form = useFormContext<Schemas.Processes.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="metadata"
      render={() => (
        <FormItem>
          <Forms.Field.Header
            label="Metadata"
            variant={fieldVariant}
            tooltip={descriptions.metadata}
            optional
          >
            <FormControl>
              <KeyValueInput<Schemas.Processes.BaseValues>
                name="metadata"
                autoFocus={autoFocus}
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
