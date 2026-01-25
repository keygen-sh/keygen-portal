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

import { useListGroups } from "@/queries/groups"

import { MachineFormFieldDescriptions } from "@/types/machines"

import * as Field from "@/components/field"
import SearchSelect from "@/components/search-select"
import KeyValueInput from "@/components/key-value-input"

interface AllFieldsProps {
  className?: string
}

export default function AllFields({
  className,
}: AllFieldsProps): React.ReactElement {
  const form = useFormContext<Forms.Machines.UpdateValues>()
  const { data: groups = [] } = useListGroups()

  return (
    <div className={cn("p-4", className)}>
      <h2 className="text-content-loud/90">Attributes</h2>
      <section className="mt-4 flex flex-col md:flex-row">
        <div className="w-full space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Machine name"
                  variant="stacking"
                  tooltip={MachineFormFieldDescriptions.name}
                  optional
                >
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter machine name..."
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
                      value={field.value || ""}
                      placeholder="Enter platform..."
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
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
                      value={field.value || ""}
                      placeholder="Enter hostname..."
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
                  label="IP address"
                  variant="stacking"
                  tooltip={MachineFormFieldDescriptions.ip}
                  optional
                >
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter IP address..."
                    />
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
            name="cores"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Cores"
                  variant="stacking"
                  tooltip={MachineFormFieldDescriptions.cores}
                  optional
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 4"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? null : Number(value))
                      }}
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
                      type="number"
                      min={1}
                      placeholder="e.g. 8"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? null : Number(value))
                      }}
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
                      type="number"
                      min={1}
                      placeholder="e.g. 256"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? null : Number(value))
                      }}
                    />
                  </FormControl>
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
                <Field.Header
                  label="Metadata"
                  variant="stacking"
                  tooltip={MachineFormFieldDescriptions.metadata}
                >
                  <FormControl>
                    <KeyValueInput<Forms.Machines.UpdateValues> name="metadata" />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

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

        <div className="mx-8 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="mt-4 w-full space-y-6 md:mt-0">
          <FormField
            control={form.control}
            name="ownerId"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header label="Owner" variant="stacking" optional>
                  <SearchSelect
                    resource="user"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={[]}
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
