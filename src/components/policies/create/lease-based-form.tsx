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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import { humanize } from "@/lib/utils"

import type { CreatePolicyFormValues } from "./modal"
import {
  HeartbeatBasis,
  HeartbeatCullStrategy,
  HeartbeatResurrectionStrategy,
  PolicyAttributeDescriptions,
} from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"

export default function LeaseBasedForm({ loading }: { loading?: boolean }) {
  const form = useFormContext<CreatePolicyFormValues>()

  return (
    <SectionCard title="Lease-based policy attributes" className="m-4">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
        <div className="flex-1 space-y-4">
          <FormField
            control={form.control}
            name="heartbeatDuration"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Heartbeat duration"
                  tooltip={PolicyAttributeDescriptions.heartbeatDuration}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 1"
                      disabled={loading}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </Field.Header>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heartbeatCullStrategy"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Heartbeat cull strategy"
                  tooltip={PolicyAttributeDescriptions.heartbeatCullStrategy}
                >
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(
                        value === ""
                          ? undefined
                          : (value as HeartbeatCullStrategy),
                      )
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(HeartbeatCullStrategy).map(
                        (strategy: HeartbeatCullStrategy) => (
                          <SelectItem key={strategy} value={strategy}>
                            {humanize(String(strategy))}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mx-4 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="flex-1 space-y-4">
          <FormField
            control={form.control}
            name="heartbeatBasis"
            render={({ field }) => (
              <FormItem className="flex">
                <Field.Header
                  label="Heartbeat basis"
                  tooltip={PolicyAttributeDescriptions.heartbeatBasis}
                >
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(
                        value === "" ? undefined : (value as HeartbeatBasis),
                      )
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select one..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(HeartbeatBasis).map(
                        (basis: HeartbeatBasis) => (
                          <SelectItem key={basis} value={basis}>
                            {humanize(String(basis))}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field.Header>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heartbeatResurrectionStrategy"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Heartbeat resurrection strategy"
                  tooltip={
                    PolicyAttributeDescriptions.heartbeatResurrectionStrategy
                  }
                >
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(
                        value === ""
                          ? undefined
                          : (value as HeartbeatResurrectionStrategy),
                      )
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={field.value ?? "Select one..."}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(HeartbeatResurrectionStrategy).map(
                        (strategy: HeartbeatResurrectionStrategy) => (
                          <SelectItem key={strategy} value={strategy}>
                            {humanize(String(strategy))}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </SectionCard>
  )
}
