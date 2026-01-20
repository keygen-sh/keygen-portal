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
import TooltipSelectItem from "@/components/tooltip-select-item"

import { cn } from "@/lib/utils"

import * as Forms from "@/forms"
import {
  UserRole,
  ExternalRoles,
  InternalRoles,
  UserRoleLabels,
  UserRoleDescriptions,
  UserCreateFormFieldDescriptions,
} from "@/types/users"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"

interface ProfileFieldsProps {
  title?: string
  className?: string
}

export default function ProfileFields({
  title,
  className,
}: ProfileFieldsProps): React.ReactElement {
  const form = useFormContext<Forms.Users.CreateValues>()

  return (
    <div className={cn("m-4 md:mb-0", className)}>
      <SectionCard title={title ?? "User profile"}>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="First Name"
                    variant="stacking"
                    optional
                    tooltip={UserCreateFormFieldDescriptions.firstName}
                  >
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="First name..."
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
                    label="Last Name"
                    variant="stacking"
                    optional
                    tooltip={UserCreateFormFieldDescriptions.lastName}
                  >
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Last name..."
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Role"
                    variant="stacking"
                    tooltip={UserCreateFormFieldDescriptions.role}
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
        </div>
      </SectionCard>
    </div>
  )
}
