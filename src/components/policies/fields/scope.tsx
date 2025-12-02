import { useFormContext } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { FormField, FormItem, FormControl } from "@/components/ui/form"

import { cn } from "@/lib/utils"

import * as Forms from "@/forms"
import { PolicyAttributeDescriptions } from "@/types/policies"

import * as Field from "@/components/field"

interface ScopeFieldsProps {
  title?: string
  className?: string
}

export default function ScopeFields({
  title,
  className,
}: ScopeFieldsProps): React.ReactElement {
  const form = useFormContext<Forms.Policies.BaseValues>()

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      <FormField
        control={form.control}
        name="requireProductScope"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Require product scope"
              variant="inline"
              tooltip={PolicyAttributeDescriptions.requireProductScope}
            >
              <FormControl>
                <Checkbox
                  id="requireProductScope"
                  checked={!!field.value}
                  onCheckedChange={(value) => field.onChange(!!value)}
                />
              </FormControl>
            </Field.Header>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requirePolicyScope"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Require policy scope"
              variant="inline"
              tooltip={PolicyAttributeDescriptions.requirePolicyScope}
            >
              <FormControl>
                <Checkbox
                  id="requirePolicyScope"
                  checked={!!field.value}
                  onCheckedChange={(value) => field.onChange(!!value)}
                />
              </FormControl>
            </Field.Header>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requireMachineScope"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Require machine scope"
              variant="inline"
              tooltip={PolicyAttributeDescriptions.requireMachineScope}
            >
              <FormControl>
                <Checkbox
                  id="requireMachineScope"
                  checked={!!field.value}
                  onCheckedChange={(value) => field.onChange(!!value)}
                />
              </FormControl>
            </Field.Header>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requireFingerprintScope"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Require fingerprint scope"
              variant="inline"
              tooltip={PolicyAttributeDescriptions.requireFingerprintScope}
            >
              <FormControl>
                <Checkbox
                  id="requireFingerprintScope"
                  checked={!!field.value}
                  onCheckedChange={(value) => field.onChange(!!value)}
                />
              </FormControl>
            </Field.Header>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requireComponentsScope"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Require components scope"
              variant="inline"
              tooltip={PolicyAttributeDescriptions.requireComponentsScope}
            >
              <FormControl>
                <Checkbox
                  id="requireComponentsScope"
                  checked={!!field.value}
                  onCheckedChange={(value) => field.onChange(!!value)}
                />
              </FormControl>
            </Field.Header>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requireUserScope"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Require user scope"
              variant="inline"
              tooltip={PolicyAttributeDescriptions.requireUserScope}
            >
              <FormControl>
                <Checkbox
                  id="requireUserScope"
                  checked={!!field.value}
                  onCheckedChange={(value) => field.onChange(!!value)}
                />
              </FormControl>
            </Field.Header>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requireChecksumScope"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Require checksum scope"
              variant="inline"
              tooltip={PolicyAttributeDescriptions.requireChecksumScope}
            >
              <FormControl>
                <Checkbox
                  id="requireChecksumScope"
                  checked={!!field.value}
                  onCheckedChange={(value) => field.onChange(!!value)}
                />
              </FormControl>
            </Field.Header>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requireVersionScope"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Require version scope"
              variant="inline"
              tooltip={PolicyAttributeDescriptions.requireVersionScope}
            >
              <FormControl>
                <Checkbox
                  id="requireVersionScope"
                  checked={!!field.value}
                  onCheckedChange={(value) => field.onChange(!!value)}
                />
              </FormControl>
            </Field.Header>
          </FormItem>
        )}
      />
    </div>
  )
}
