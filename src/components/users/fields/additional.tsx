import { useFormContext } from "react-hook-form"

import { Separator } from "@/components/ui/separator"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn } from "@/lib/utils"

import * as Forms from "@/forms"

import { MockGroups } from "@/types/groups"
import { UserCreateFormFieldDescriptions } from "@/types/users"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import SearchSelect from "@/components/search-select"
import KeyValueInput from "@/components/key-value-input"

interface AdditionalFieldsProps {
  title?: string
  className?: string
}

export default function AdditionalFields({
  title,
  className,
}: AdditionalFieldsProps): React.ReactElement {
  const form = useFormContext<Forms.Users.CreateValues>()

  return (
    <div className={cn("m-4 md:mb-0", className)}>
      <SectionCard title={title ?? "Additional configuration"}>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="groupId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field.Header label="Group" variant="stacking" optional>
                    <SearchSelect
                      resource="group"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      options={MockGroups}
                      invalid={!!fieldState.error}
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
                    optional
                    tooltip={UserCreateFormFieldDescriptions.metadata}
                  >
                    <FormControl>
                      <KeyValueInput<Forms.Users.CreateValues> name="metadata" />
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
