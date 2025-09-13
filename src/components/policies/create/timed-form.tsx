import { useState } from "react"
import { useFormContext } from "react-hook-form"

import { Switch } from "@/components/ui/switch"
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
  PolicyAttributeDescriptions,
  ExpirationStrategy,
  ExpirationBasis,
  RenewalBasis,
  TransferStrategy,
  RenewalStrategy,
} from "@/types/policies"

import * as Field from "@/components/field"
import SectionCard from "@/components/section-card"
import DurationInput from "@/components/duration-input"

export default function TimedForm() {
  const form = useFormContext<CreatePolicyFormValues>()

  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <SectionCard title="Timed policy attributes" className="m-4 md:mb-0">
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
                          {Object.values(TransferStrategy).map(
                            (strategy: TransferStrategy) => (
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
                          {Object.values(ExpirationStrategy).map(
                            (strategy: ExpirationStrategy) => (
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
                          {Object.values(RenewalStrategy).map(
                            (strategy: RenewalStrategy) => (
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
                          {Object.values(ExpirationBasis).map(
                            (basis: ExpirationBasis) => (
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
                          {Object.values(RenewalBasis).map(
                            (basis: RenewalBasis) => (
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
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
