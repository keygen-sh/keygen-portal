import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { cn } from "@/lib/utils"

import * as Forms from "@/forms"

import { useListGroups } from "@/queries/groups"

import { Permissions } from "@/types/products"
import {
  UserRole,
  ExternalRoles,
  InternalRoles,
  UserRoleLabels,
  UserRoleDescriptions,
  UserEditFormFieldDescriptions,
} from "@/types/users"

import * as Field from "@/components/field"
import MultiSelect from "@/components/multi-select"
import SearchSelect from "@/components/search-select"
import KeyValueInput from "@/components/key-value-input"
import TooltipSelectItem from "@/components/tooltip-select-item"

interface AllFieldsProps {
  className?: string
}

export default function AllFields({
  className,
}: AllFieldsProps): React.ReactElement {
  const form = useFormContext<Forms.Users.UpdateValues>()
  const { data: groups = [] } = useListGroups()

  return (
    <div className={cn("p-4", className)}>
      <h2 className="text-content-loud/90">Attributes</h2>

      <div className="flex flex-col md:flex-row">
        <div className="w-full space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Email"
                  tooltip={UserEditFormFieldDescriptions.email}
                >
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      value={field.value || ""}
                      placeholder="Enter user email..."
                      autoComplete="off"
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Password"
                  optional
                  tooltip={UserEditFormFieldDescriptions.password}
                  tooltipVariant="warning"
                >
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter new password..."
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

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Role"
                  tooltip={UserEditFormFieldDescriptions.role}
                >
                  <FormControl>
                    <Select
                      value={field.value ?? UserRole.User}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>External</SelectLabel>
                          {ExternalRoles.map((role) => (
                            <TooltipSelectItem
                              key={role}
                              value={role}
                              tooltip={UserRoleDescriptions[role]}
                              className="pl-4"
                            >
                              {UserRoleLabels[role]}
                            </TooltipSelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Internal</SelectLabel>
                          {InternalRoles.map((role) => (
                            <TooltipSelectItem
                              key={role}
                              value={role}
                              tooltip={UserRoleDescriptions[role]}
                              className="pl-4"
                            >
                              {UserRoleLabels[role]}
                            </TooltipSelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mx-8 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="mt-4 w-full space-y-6 md:mt-0">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="First name"
                  optional
                  tooltip={UserEditFormFieldDescriptions.firstName}
                >
                  <FormControl>
                    <Input
                      placeholder="First name..."
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Last name"
                  optional
                  tooltip={UserEditFormFieldDescriptions.lastName}
                >
                  <FormControl>
                    <Input
                      placeholder="Last name..."
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="permissions"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Permissions"
                  optional
                  tooltip={UserEditFormFieldDescriptions.permissions}
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

      <Separator className="my-6" />

      <FormField
        control={form.control}
        name="metadata"
        render={() => (
          <FormItem>
            <Field.Header
              label="Metadata"
              variant="stacking"
              tooltip={UserEditFormFieldDescriptions.metadata}
            >
              <FormControl>
                <KeyValueInput<Forms.Users.UpdateValues> name="metadata" />
              </FormControl>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator className="my-6" />

      <h2 className="text-content-loud/90">Relationships</h2>
      <section className="mt-4 flex flex-col md:flex-row">
        <div className="w-full space-y-6">
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
                    options={groups}
                    invalid={!!fieldState.error}
                  />
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
