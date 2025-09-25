import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { humanize } from "@/lib/utils"

import {
  PolicyFormValues,
  PolicyAttributeDescriptions,
  AuthenticationStrategy,
} from "@/types/policies"

import * as Field from "@/components/field"
import KeyValueInput from "@/components/key-value-input"

export default function GeneralFields(): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <div className="space-y-6 md:w-md">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <Field.Header label="Policy name" variant="stacking">
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter policy name..."
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
        name="authenticationStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Authentication strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.authenticationStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === ""
                      ? undefined
                      : (value as AuthenticationStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(AuthenticationStrategy).map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {humanize(String(strategy))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metadata"
        render={() => (
          <FormItem>
            <Field.Header label="Metadata" variant="stacking">
              <FormControl>
                <KeyValueInput<PolicyFormValues> name="metadata" />
              </FormControl>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
