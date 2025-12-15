import { useFormContext } from "react-hook-form"

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

import * as Forms from "@/forms"
import {
  HeartbeatBasis,
  HeartbeatCullStrategy,
  HeartbeatResurrectionStrategy,
  PolicyAttributeDescriptions,
  PolicyOptionLabels,
  PolicyMode,
} from "@/types/policies"

import DurationInput, { HeartbeatPresets } from "@/components/duration-input"
import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import NullableSelect from "@/components/nullable-select"

type Layout = "default" | "advanced"

interface LeaseBasedFieldsProps {
  layout?: Layout
  title?: string
  mode?: PolicyMode
  className?: string
}

export default function LeaseBasedFields({
  layout = "default",
  title,
  mode = PolicyMode.Create,
  className,
}: LeaseBasedFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout className={className} />
  ) : (
    <DefaultLayout title={title} mode={mode} className={className} />
  )
}

function DefaultLayout({
  title,
  mode,
  className,
}: Omit<LeaseBasedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Policies.BaseValues>()

  const requireHeartbeat = form.watch("requireHeartbeat")

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
                onValueChange={(value) => {
                  const newValue = value === "" ? undefined : value === "true"
                  field.onChange(newValue)
                  if (mode === PolicyMode.Create && !newValue) {
                    form.resetField("heartbeatDuration")
                    form.resetField("heartbeatCullStrategy")
                    form.resetField("heartbeatBasis")
                    form.resetField("heartbeatResurrectionStrategy")
                  }
                }}
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
                <DurationInput
                  value={field.value}
                  onChange={field.onChange}
                  units={["seconds", "minutes", "hours", "days"]}
                  presets={HeartbeatPresets}
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
        render={({ field, fieldState }) => (
          <FormItem>
            <Field.Header
              label="Heartbeat cull strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.heartbeatCullStrategy}
            >
              <NullableSelect<HeartbeatCullStrategy>
                value={field.value}
                onChange={(value) => field.onChange(value)}
                invalid={!!fieldState.error}
                disabled={!requireHeartbeat}
                disabledTooltip="Enable heartbeat to configure this field."
              >
                {Object.values(HeartbeatCullStrategy).map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {PolicyOptionLabels.heartbeatCullStrategy[strategy]}
                  </SelectItem>
                ))}
              </NullableSelect>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="heartbeatBasis"
        render={({ field, fieldState }) => (
          <FormItem>
            <Field.Header
              label="Heartbeat basis"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.heartbeatBasis}
            >
              <NullableSelect<HeartbeatBasis>
                value={field.value}
                onChange={(value) => field.onChange(value)}
                invalid={!!fieldState.error}
                disabled={!requireHeartbeat}
                disabledTooltip="Enable heartbeat to configure this field."
              >
                {Object.values(HeartbeatBasis).map((basis) => (
                  <SelectItem key={basis} value={basis}>
                    {PolicyOptionLabels.heartbeatBasis[basis]}
                  </SelectItem>
                ))}
              </NullableSelect>
            </Field.Header>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="heartbeatResurrectionStrategy"
        render={({ field, fieldState }) => (
          <FormItem>
            <Field.Header
              label="Heartbeat resurrection strategy"
              variant="stacking"
              tooltip={
                PolicyAttributeDescriptions.heartbeatResurrectionStrategy
              }
            >
              <NullableSelect<HeartbeatResurrectionStrategy>
                value={field.value}
                onChange={(value) => field.onChange(value)}
                invalid={!!fieldState.error}
                disabled={!requireHeartbeat}
                disabledTooltip="Enable heartbeat to configure this field."
              >
                {Object.values(HeartbeatResurrectionStrategy).map(
                  (strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {
                        PolicyOptionLabels.heartbeatResurrectionStrategy[
                          strategy
                        ]
                      }
                    </SelectItem>
                  ),
                )}
              </NullableSelect>
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
  const form = useFormContext<Forms.Policies.BaseValues>()

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
                    <DurationInput
                      value={field.value}
                      onChange={field.onChange}
                      units={["seconds", "minutes", "hours", "days"]}
                      presets={HeartbeatPresets}
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
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Heartbeat cull strategy"
                  tooltip={PolicyAttributeDescriptions.heartbeatCullStrategy}
                >
                  <NullableSelect<HeartbeatCullStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(HeartbeatCullStrategy).map((strategy) => (
                      <SelectItem key={strategy} value={strategy}>
                        {PolicyOptionLabels.heartbeatCullStrategy[strategy]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
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
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Heartbeat basis"
                  tooltip={PolicyAttributeDescriptions.heartbeatBasis}
                >
                  <NullableSelect<HeartbeatBasis>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(HeartbeatBasis).map((basis) => (
                      <SelectItem key={basis} value={basis}>
                        {PolicyOptionLabels.heartbeatBasis[basis]}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heartbeatResurrectionStrategy"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field.Header
                  label="Heartbeat resurrection strategy"
                  tooltip={
                    PolicyAttributeDescriptions.heartbeatResurrectionStrategy
                  }
                >
                  <NullableSelect<HeartbeatResurrectionStrategy>
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    invalid={!!fieldState.error}
                  >
                    {Object.values(HeartbeatResurrectionStrategy).map(
                      (strategy) => (
                        <SelectItem key={strategy} value={strategy}>
                          {
                            PolicyOptionLabels.heartbeatResurrectionStrategy[
                              strategy
                            ]
                          }
                        </SelectItem>
                      ),
                    )}
                  </NullableSelect>
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
