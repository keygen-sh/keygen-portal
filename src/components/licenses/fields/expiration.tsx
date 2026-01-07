import { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { format, formatDuration, parseISO } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { cn, secondsToParts } from "@/lib/utils"

import * as Forms from "@/forms"
import { LicenseFormFieldDescriptions } from "@/types/licenses"
import { Policy, PolicyOptionLabels } from "@/types/policies"

import * as Field from "@/components/field"
import * as Calendars from "@/components/calendars"
import SectionCard from "@/components/section-card"

type Layout = "create" | "edit"

interface ExpirationFieldsProps {
  layout?: Layout
  selectedPolicy?: Policy | null
  title?: string
  className?: string
}

export default function ExpirationFields({
  layout = "create",
  selectedPolicy,
  title,
  className,
}: ExpirationFieldsProps): React.ReactElement {
  return layout === "edit" ? (
    <EditLayout title={title} className={className} />
  ) : (
    <CreateLayout
      selectedPolicy={selectedPolicy}
      title={title}
      className={className}
    />
  )
}

function CreateLayout({
  selectedPolicy,
  title,
  className,
}: Omit<ExpirationFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Licenses.BaseValues>()
  const [open, setOpen] = useState(false)

  const durationDescription = useMemo(() => {
    if (!selectedPolicy) return null

    const { duration, expirationBasis } = selectedPolicy.attributes

    if (duration == null) {
      return "Leave empty to create a license that never expires."
    }

    const parts = secondsToParts(duration)
    if (!parts) return null

    const durationText = formatDuration(parts, { zero: false })
    const basisText = expirationBasis
      ? PolicyOptionLabels.expirationBasis[expirationBasis].toLowerCase()
      : "from now"

    return `Leave empty to set according to the policy's duration (${durationText} ${basisText}). Select a date to override the policy's duration for this specific license.`
  }, [selectedPolicy])

  return (
    <div className={cn("m-4 md:mb-0", className)}>
      <SectionCard title={title ?? "License expiration"}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="expiry"
            render={({ field }) => {
              const selectedDate = field.value
                ? parseISO(field.value)
                : undefined

              return (
                <FormItem>
                  <Field.Header
                    label="Expiry date"
                    variant="stacking"
                    optional
                    tooltip={LicenseFormFieldDescriptions.expiry}
                  >
                    <FormControl>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 size-4 text-content-normal" />
                            {field.value ? (
                              format(selectedDate!, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            {field.value && (
                              <span
                                role="button"
                                tabIndex={0}
                                className="ml-auto flex h-6 w-6 items-center justify-center rounded-sm opacity-50 hover:opacity-100"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  field.onChange(null)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    field.onChange(null)
                                  }
                                }}
                              >
                                <X className="size-4" />
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendars.DatePicker
                            selected={selectedDate}
                            onApply={(date) => {
                              field.onChange(date ? date.toISOString() : null)
                              setOpen(false)
                            }}
                            onCancel={() => setOpen(false)}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </Field.Header>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {durationDescription && (
            <p className="text-sm text-content-muted">{durationDescription}</p>
          )}
        </div>
      </SectionCard>
    </div>
  )
}

function EditLayout({
  title,
  className,
}: Omit<ExpirationFieldsProps, "layout">): React.ReactElement {
  const form = useFormContext<Forms.Licenses.UpdateValues>()
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("space-y-6", className)}>
      {title && <h2 className="text-content-loud/90">{title}</h2>}

      <FormField
        control={form.control}
        name="expiry"
        render={({ field }) => {
          const selectedDate = field.value ? parseISO(field.value) : undefined

          return (
            <FormItem>
              <Field.Header
                label="Expiry date"
                variant="stacking"
                tooltip={LicenseFormFieldDescriptions.expiry}
              >
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4 text-content-normal" />
                        {field.value ? (
                          format(selectedDate!, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                        {field.value && (
                          <span
                            role="button"
                            tabIndex={0}
                            className="ml-auto flex h-6 w-6 items-center justify-center rounded-sm opacity-50 hover:opacity-100"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              field.onChange(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                e.stopPropagation()
                                field.onChange(null)
                              }
                            }}
                          >
                            <X className="size-4" />
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendars.DatePicker
                        selected={selectedDate}
                        onApply={(date) => {
                          field.onChange(date ? date.toISOString() : null)
                          setOpen(false)
                        }}
                        onCancel={() => setOpen(false)}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
              </Field.Header>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    </div>
  )
}
