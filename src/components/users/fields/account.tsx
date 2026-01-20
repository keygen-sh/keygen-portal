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
import { UserCreateFormFieldDescriptions } from "@/types/users"

import { Permissions } from "@/types/products"

import * as Field from "@/components/field"
import MultiSelect from "@/components/multi-select"
import SectionCard from "@/components/section-card"

interface AccountFieldsProps {
  title?: string
  className?: string
}

export default function AccountFields({
  title,
  className,
}: AccountFieldsProps): React.ReactElement {
  const form = useFormContext<Forms.Users.CreateValues>()

  return (
    <div className={cn("m-4 md:mb-0", className)}>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="m-4 md:my-6">
            <FormControl>
              <Input
                {...field}
                type="email"
                variant="title"
                placeholder="Enter user email..."
                className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                autoFocus={!field.value || field.value.length === 0}
                autoComplete="off"
              />
            </FormControl>
            <FormMessage className="ml-2" />
          </FormItem>
        )}
      />

      <SectionCard title={title ?? "Account configuration"}>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Password"
                    variant="stacking"
                    optional
                    tooltip={UserCreateFormFieldDescriptions.password}
                  >
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter password..."
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        autoComplete="new-password"
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
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Permissions"
                    variant="stacking"
                    optional
                    tooltip={UserCreateFormFieldDescriptions.permissions}
                  >
                    <MultiSelect
                      value={field.value ?? []}
                      onChange={field.onChange}
                      options={Permissions.map((p) => ({
                        label: p,
                        value: p,
                      }))}
                      placeholder="Leave blank to use defaults"
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
