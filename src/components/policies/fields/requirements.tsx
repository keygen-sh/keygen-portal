import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  FormField,
  FormItem,
  FormLabel,
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

import { cn, humanize } from "@/lib/utils"

import {
  PolicyFormValues,
  PolicyAttributeDescriptions,
  CheckInInterval,
  AuthenticationStrategy,
} from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import KeyValueInput from "@/components/key-value-input"

type Layout = "default" | "advanced"

interface RequirementsFieldsProps {
  layout?: Layout
  title?: string
  includeMeta?: boolean
  includeAuthStrategy?: boolean
  className?: string
}

export default function RequirementsFields({
  layout = "default",
  title,
  includeMeta = true,
  includeAuthStrategy = true,
  className,
}: RequirementsFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout
      includeMeta={includeMeta}
      includeAuthStrategy={includeAuthStrategy}
      className={className}
    />
  ) : (
    <DefaultLayout
      title={title}
      includeMeta={includeMeta}
      includeAuthStrategy={includeAuthStrategy}
      className={className}
    />
  )
}

function DefaultLayout({
  title,
  includeMeta = true,
  includeAuthStrategy = true,
  className,
}: Omit<RequirementsFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      <FormField
        control={form.control}
        name="strict"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Strict"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.strict}
            >
              <FormControl>
                <Checkbox
                  id="strict"
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
        name="floating"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Floating"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.floating}
            >
              <FormControl>
                <Checkbox
                  id="floating"
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
        name="usePool"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <Field.Header
              label="Use pool"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.usePool}
            >
              <FormControl>
                <Checkbox
                  id="usePool"
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
        name="checkInInterval"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Check-in interval"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.checkInInterval}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === "" ? undefined : (value as CheckInInterval),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(CheckInInterval).map(
                    (interval: CheckInInterval) => (
                      <SelectItem key={interval} value={interval}>
                        {humanize(String(interval))}
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

      {includeAuthStrategy && (
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
                    {Object.values(AuthenticationStrategy).map(
                      (strategy: AuthenticationStrategy) => (
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
      )}

      <FormField
        control={form.control}
        name="checkInIntervalCount"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Check-in interval count"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.checkInIntervalCount}
            >
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  placeholder="1 - 365"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />

      {includeMeta && (
        <FormField
          control={form.control}
          name="metadata"
          render={() => (
            <FormItem>
              <FormLabel>Metadata</FormLabel>
              <FormControl>
                <KeyValueInput<PolicyFormValues> name="metadata" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

function AdvancedLayout({
  includeMeta = true,
  includeAuthStrategy = true,
  className,
}: Omit<RequirementsFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <SectionCard
      title="Advanced policy attributes"
      className={cn("m-4 md:mb-0", className)}
    >
      <div className="flex flex-col space-y-4 md:w-1/2">
        <FormField
          control={form.control}
          name="strict"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <Field.Header
                label="Strict"
                tooltip={PolicyAttributeDescriptions.strict}
              >
                <FormControl>
                  <Checkbox
                    id="strict"
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
          name="floating"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <Field.Header
                label="Floating"
                tooltip={PolicyAttributeDescriptions.floating}
              >
                <FormControl>
                  <Checkbox
                    id="floating"
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
          name="usePool"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <Field.Header
                label="Use pool"
                tooltip={PolicyAttributeDescriptions.usePool}
              >
                <FormControl>
                  <Checkbox
                    id="usePool"
                    checked={!!field.value}
                    onCheckedChange={(value) => field.onChange(!!value)}
                  />
                </FormControl>
              </Field.Header>
            </FormItem>
          )}
        />
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
        <div className="flex-1 space-y-4">
          <FormField
            control={form.control}
            name="checkInInterval"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Check-in interval"
                  tooltip={PolicyAttributeDescriptions.checkInInterval}
                >
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(
                        value === "" ? undefined : (value as CheckInInterval),
                      )
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CheckInInterval).map(
                        (interval: CheckInInterval) => (
                          <SelectItem key={interval} value={interval}>
                            {humanize(String(interval))}
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

          {includeAuthStrategy && (
            <FormField
              control={form.control}
              name="authenticationStrategy"
              render={({ field }) => (
                <FormItem>
                  <Field.Header
                    label="Authentication strategy"
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
                        {Object.values(AuthenticationStrategy).map(
                          (strategy: AuthenticationStrategy) => (
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
          )}
        </div>

        <div className="mx-4 hidden md:block">
          <Separator orientation="vertical" dashed />
        </div>

        <div className="flex-1 space-y-4">
          <FormField
            control={form.control}
            name="checkInIntervalCount"
            render={({ field }) => (
              <FormItem>
                <Field.Header
                  label="Check-in interval count"
                  tooltip={PolicyAttributeDescriptions.checkInIntervalCount}
                >
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      placeholder="1 - 365"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </Field.Header>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {includeMeta && (
        <div className="mt-6">
          <FormField
            control={form.control}
            name="metadata"
            render={() => (
              <FormItem>
                <FormLabel>Metadata</FormLabel>
                <FormControl>
                  <KeyValueInput<PolicyFormValues> name="metadata" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </SectionCard>
  )
}
