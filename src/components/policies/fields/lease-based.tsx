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

import { cn } from "@/lib/utils"

import {
  PolicyFormValues,
  HeartbeatBasis,
  HeartbeatCullStrategy,
  HeartbeatResurrectionStrategy,
  PolicyAttributeDescriptions,
  PolicyOptionLabels,
} from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"

type Layout = "default" | "advanced"

interface LeaseBasedFieldsProps {
  layout?: Layout
  title?: string
  className?: string
}

export default function LeaseBasedFields({
  layout = "default",
  title,
  className,
}: LeaseBasedFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout className={className} />
  ) : (
    <DefaultLayout title={title} className={className} />
  )
}

function DefaultLayout({
  title,
  className,
}: Omit<LeaseBasedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      <FormField
        control={form.control}
        name="requireHeartbeat"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Require heartbeat"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.requireHeartbeat}
            >
              <Select
                value={
                  field.value === undefined
                    ? ""
                    : field.value
                      ? "true"
                      : "false"
                }
                onValueChange={(value) =>
                  field.onChange(value === "" ? undefined : value === "true")
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="heartbeatDuration"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Heartbeat duration"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.heartbeatDuration}
            >
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 60"
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
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.heartbeatCullStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === "" ? undefined : (value as HeartbeatCullStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(HeartbeatCullStrategy).map(
                    (strategy: HeartbeatCullStrategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.heartbeatCullStrategy[strategy]}
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
        name="heartbeatBasis"
        render={({ field }) => (
          <FormItem className="flex">
            <Field.Header
              label="Heartbeat basis"
              variant="stacking"
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
                        {PolicyOptionLabels.heartbeatBasis[basis]}
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
              variant="stacking"
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
                    <SelectValue placeholder={field.value ?? "Select one..."} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(HeartbeatResurrectionStrategy).map(
                    (strategy: HeartbeatResurrectionStrategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {
                          PolicyOptionLabels.heartbeatResurrectionStrategy[
                            strategy
                          ]
                        }
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
  )
}

function AdvancedLayout({
  className,
}: Omit<LeaseBasedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <SectionCard
      title="Heartbeat policy attributes"
      className={cn("m-4 md:mb-0", className)}
    >
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
                            {PolicyOptionLabels.heartbeatCullStrategy[strategy]}
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
                            {PolicyOptionLabels.heartbeatBasis[basis]}
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
                            {
                              PolicyOptionLabels.heartbeatResurrectionStrategy[
                                strategy
                              ]
                            }
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
