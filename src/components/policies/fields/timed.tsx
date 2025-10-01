import { useState } from "react"
import { useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import DurationInput from "@/components/duration-input"

import {
  PolicyFormValues,
  PolicyAttributeDescriptions,
  PolicyOptionLabels,
  ExpirationBasis,
  ExpirationStrategy,
  RenewalStrategy,
  RenewalBasis,
  TransferStrategy,
} from "@/types/policies"

type Layout = "default" | "advanced"

interface TimedFieldsProps {
  layout?: Layout
  title?: string
  className?: string
}

export default function TimedFields({
  layout = "default",
  title,
  className,
}: TimedFieldsProps): React.ReactElement {
  return layout === "advanced" ? (
    <AdvancedLayout className={className} />
  ) : (
    <DefaultLayout title={title} className={className} />
  )
}

function DefaultLayout({
  title,
  className,
}: Omit<TimedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()

  return (
    <div className={cn("space-y-6 md:w-md", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}
      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Duration"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.duration}
            >
              <FormControl>
                <DurationInput
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
            </Field.Header>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="expirationStrategy"
        render={({ field }) => (
          <FormItem className="flex">
            <Field.Header
              label="Expiration strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.expirationStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === "" ? undefined : (value as ExpirationStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ExpirationStrategy).map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {PolicyOptionLabels.expirationStrategy[strategy]}
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
        name="expirationBasis"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Expiration basis"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.expirationBasis}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === "" ? undefined : (value as ExpirationBasis),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.value ?? "Select one..."} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ExpirationBasis).map((basis) => (
                    <SelectItem key={basis} value={basis}>
                      {PolicyOptionLabels.expirationBasis[basis]}
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
        name="renewalStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Renewal strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.renewalStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === "" ? undefined : (value as RenewalStrategy),
                  )
                }
                disabled
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(RenewalStrategy).map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {PolicyOptionLabels.renewalStrategy[strategy]}
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
        name="renewalBasis"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Renewal basis"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.renewalBasis}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === "" ? undefined : (value as RenewalBasis),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(RenewalBasis).map((basis) => (
                    <SelectItem key={basis} value={basis}>
                      {PolicyOptionLabels.renewalBasis[basis]}
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
        name="transferStrategy"
        render={({ field }) => (
          <FormItem>
            <Field.Header
              label="Transfer strategy"
              variant="stacking"
              tooltip={PolicyAttributeDescriptions.transferStrategy}
            >
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(
                    value === "" ? undefined : (value as TransferStrategy),
                  )
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(TransferStrategy).map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {PolicyOptionLabels.transferStrategy[strategy]}
                    </SelectItem>
                  ))}
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
}: Omit<TimedFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<PolicyFormValues>()
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <SectionCard
      title="Timed policy attributes"
      className={cn("m-4 md:mb-0", className)}
    >
      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <div className="mt-2 flex flex-col pr-4 md:w-1/2 md:flex-row md:items-center md:justify-between">
              <Field.Header
                label="Duration"
                tooltip={PolicyAttributeDescriptions.duration}
              >
                <FormControl>
                  <DurationInput
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
              </Field.Header>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
          <span className="ml-2 font-owners-text text-sm font-medium text-content-muted">
            Advanced configuration
          </span>
        </div>

        {showAdvanced && (
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
            <div className="flex-1 space-y-4">
              <FormField
                control={form.control}
                name="transferStrategy"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Transfer strategy"
                      tooltip={PolicyAttributeDescriptions.transferStrategy}
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as TransferStrategy),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(TransferStrategy).map((strategy) => (
                            <SelectItem key={strategy} value={strategy}>
                              {PolicyOptionLabels.transferStrategy[strategy]}
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
                name="expirationStrategy"
                render={({ field }) => (
                  <FormItem className="flex">
                    <Field.Header
                      label="Expiration strategy"
                      tooltip={PolicyAttributeDescriptions.expirationStrategy}
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as ExpirationStrategy),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select one..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ExpirationStrategy).map((strategy) => (
                            <SelectItem key={strategy} value={strategy}>
                              {PolicyOptionLabels.expirationStrategy[strategy]}
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
                name="renewalStrategy"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Renewal strategy"
                      tooltip={PolicyAttributeDescriptions.renewalStrategy}
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as RenewalStrategy),
                          )
                        }
                        disabled
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select one..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(RenewalStrategy).map((strategy) => (
                            <SelectItem key={strategy} value={strategy}>
                              {PolicyOptionLabels.renewalStrategy[strategy]}
                            </SelectItem>
                          ))}
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
                name="expirationBasis"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Expiration basis"
                      tooltip={PolicyAttributeDescriptions.expirationBasis}
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === ""
                              ? undefined
                              : (value as ExpirationBasis),
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
                          {Object.values(ExpirationBasis).map((basis) => (
                            <SelectItem key={basis} value={basis}>
                              {PolicyOptionLabels.expirationBasis[basis]}
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
                name="renewalBasis"
                render={({ field }) => (
                  <FormItem>
                    <Field.Header
                      label="Renewal basis"
                      tooltip={PolicyAttributeDescriptions.renewalBasis}
                    >
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(
                            value === "" ? undefined : (value as RenewalBasis),
                          )
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(RenewalBasis).map((basis) => (
                            <SelectItem key={basis} value={basis}>
                              {PolicyOptionLabels.renewalBasis[basis]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field.Header>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
