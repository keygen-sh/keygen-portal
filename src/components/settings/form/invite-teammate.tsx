import { useCallback } from "react"
import { useForm, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
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

import {
  UserRole,
  InternalRoles,
  UserRoleLabels,
  UserRoleDescriptions,
} from "@/types/users"
import { InviteFormFieldDescriptions } from "@/types/teams"

import * as Schemas from "@/schemas"

import * as Forms from "@/components/forms"
import TooltipSelectItem from "@/components/tooltip-select-item"

interface InviteTeammateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function InviteTeammateForm({
  open,
  onOpenChange,
}: InviteTeammateFormProps) {
  const form = useForm<Schemas.Team.BaseValues>({
    resolver: zodResolver(Schemas.Team.BaseSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: UserRole.Developer,
    },
  })

  const handleSubmit = useCallback(
    (values: Schemas.Team.BaseValues) => {
      // TODO(cazden) wire up to API
      console.log("Invite teammate:", values)
      form.reset()
    },
    [form],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Sheet
          title="Invite teammate"
          onSubmit={handleSubmit}
          errorMessage="Failed to send invite"
          submitLabel="Send Invite"
          className="md:h-[50vh]!"
        >
          <Forms.Section.Stacking>
            <EmailField />
            <RoleField />
          </Forms.Section.Stacking>
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}

function EmailField() {
  const form = useFormContext<Schemas.Team.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Email"
            variant="stacking"
            tooltip={InviteFormFieldDescriptions.email}
          >
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder="Enter email address..."
                autoFocus
                autoComplete="off"
              />
            </FormControl>
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function RoleField() {
  const form = useFormContext<Schemas.Team.BaseValues>()

  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <Forms.Field.Header
            label="Role"
            variant="stacking"
            tooltip={InviteFormFieldDescriptions.role}
          >
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
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
          </Forms.Field.Header>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
