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

import { MachineFormFieldDescriptions } from "@/types/machines"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"

interface AttributesFieldsProps {
  title?: string
  className?: string
}

export default function AttributesFields({
  title,
  className,
}: AttributesFieldsProps): React.ReactElement {
  const form = useFormContext<Forms.Machines.CreateValues>()

  return (
    <div className={cn("m-4 md:mb-0", className)}>
      <SectionCard title={title ?? "Machine attributes"}>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="hostname"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Hostname"
                    variant="stacking"
                    tooltip={MachineFormFieldDescriptions.hostname}
                    optional
                  >
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter hostname..."
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
              name="ip"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="IP Address"
                    variant="stacking"
                    tooltip={MachineFormFieldDescriptions.ip}
                    optional
                  >
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter IP address..."
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
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Platform"
                    variant="stacking"
                    tooltip={MachineFormFieldDescriptions.platform}
                    optional
                  >
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., macOS, Windows, Linux"
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
              name="cores"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="CPU Cores"
                    variant="stacking"
                    tooltip={MachineFormFieldDescriptions.cores}
                    optional
                  >
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        placeholder="Enter CPU cores..."
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                  </Field.Header>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memory"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Memory"
                    variant="stacking"
                    tooltip={MachineFormFieldDescriptions.memory}
                    optional
                  >
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        placeholder="Enter memory in bytes..."
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                  </Field.Header>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="disk"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Disk"
                    variant="stacking"
                    tooltip={MachineFormFieldDescriptions.disk}
                    optional
                  >
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        placeholder="Enter disk space in bytes..."
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                      />
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
