import { useState, useCallback } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"
import { differenceInSeconds, parseISO } from "date-fns"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { Copy } from "lucide-react"

import * as Schemas from "@/schemas"

import {
  TtlMode,
  TtlModeLabels,
  SigningAlgorithm,
  SigningAlgorithmLabels,
} from "@/types/files"

import { toast } from "@/lib/toast"
import { downloadBlob } from "@/lib/download"
import { formatTtlLabel } from "@/lib/licenses"
import { SECONDS_PER_DAY } from "@/lib/temporal"

import { useGetLicense, useCheckOutLicense } from "@/queries/licenses"

import * as Forms from "@/components/forms"
import MultiSelect from "@/components/multi-select"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { copyToClipboard } from "@/lib/clipboard"

import GuardModal from "@/components/guard-modal"
import DurationInput from "@/components/duration-input"

const INCLUDE_OPTIONS = [
  { value: "entitlements", label: "Entitlements" },
  { value: "product", label: "Product" },
  { value: "policy", label: "Policy" },
  { value: "group", label: "Group" },
  { value: "owner", label: "Owner" },
  { value: "users", label: "Users" },
]

interface CheckOutLicenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CheckOutLicenseForm({
  open,
  onOpenChange,
}: CheckOutLicenseFormProps) {
  const { id } = useParams({ from: "/$accountId/app/licenses/$id" })
  const license = useGetLicense(id)
  const checkOutLicense = useCheckOutLicense(id)

  const expiry = license.data?.attributes.expiry
  const expiryTtl = expiry
    ? differenceInSeconds(parseISO(expiry), new Date())
    : null

  const [showResult, setShowResult] = useState(false)
  const [certificate, setCertificate] = useState("")

  const form = useForm<
    Schemas.Licenses.CheckOutFormValues,
    unknown,
    Schemas.Licenses.CheckOutValues
  >({
    resolver: zodResolver(Schemas.Licenses.CheckOutSchema),
    mode: "onChange",
    defaultValues: {
      ttlMode: TtlMode.Default,
      encryptEnabled: false,
      include: [],
      ttl: SECONDS_PER_DAY * 30,
      algorithm: SigningAlgorithm.Ed25519,
    },
  })

  const ttlMode = useWatch({ control: form.control, name: "ttlMode" })
  const encryptEnabled = useWatch({
    control: form.control,
    name: "encryptEnabled",
  })
  const include =
    useWatch({
      control: form.control,
      name: "include",
    }) ?? []
  const ttl = useWatch({ control: form.control, name: "ttl" }) ?? null
  const algorithm = useWatch({ control: form.control, name: "algorithm" })

  const handleCheckOut = useCallback(
    (values: Schemas.Licenses.CheckOutValues) => {
      const ttl = values.ttlMode === TtlMode.Expiry ? expiryTtl : values.ttl

      checkOutLicense.mutate(
        { ...values, ttl },
        {
          onSuccess: (licenseFile) => {
            setCertificate(licenseFile.attributes.certificate)
            setShowResult(true)
          },
          onError: () => {
            toast({
              message: "Failed to check out license",
              variant: "error",
            })
          },
        },
      )
    },
    [checkOutLicense, expiryTtl],
  )

  const handleOpenChange = useCallback(
    (value: boolean) => {
      onOpenChange(value)
      if (!value) {
        setShowResult(false)
        setCertificate("")
      }
    },
    [onOpenChange],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Overlay open={open} onOpenChange={handleOpenChange} />

      {!showResult && (
        <Forms.Container.Dialog
          open={open}
          onOpenChange={handleOpenChange}
          disableOverlay
        >
          <Forms.Layout.Wizard
            onSubmit={handleCheckOut}
            autoClose={false}
            isPending={checkOutLicense.isPending}
            submitLabel="Checkout license"
            description="Checking out a license"
          >
            <Forms.Section.Step
              crumb="Include relationships"
              fields={["include"]}
            >
              <Forms.Section.Card title="Relationships">
                <FormField
                  control={form.control}
                  name="include"
                  render={({ field }) => (
                    <FormItem>
                      <Forms.Field.Header
                        label="Relationships"
                        variant="stacking"
                        tooltip="Select the resource relationships to include in the license file, if any."
                      >
                        <FormControl>
                          <MultiSelect
                            value={field.value ?? []}
                            onChange={(value) => field.onChange(value ?? [])}
                            options={INCLUDE_OPTIONS}
                            placeholder="Select relationships..."
                          />
                        </FormControl>
                      </Forms.Field.Header>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Forms.Section.Card>
            </Forms.Section.Step>

            <Forms.Section.Step
              crumb="Time to live"
              fields={["ttlMode", "ttl"]}
            >
              <Forms.Section.Card title="Time to live">
                <FormField
                  control={form.control}
                  name="ttlMode"
                  render={({ field }) => (
                    <FormItem>
                      <Forms.Field.Header
                        label="TTL"
                        variant="stacking"
                        tooltip="A time-to-live (TTL) defines how long before the license file expires.
                                  If no TTL is set, the license file will default to a TTL of 30 days."
                      >
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              const mode = value as TtlMode
                              field.onChange(mode)
                              if (mode === TtlMode.Default) {
                                form.resetField("ttl")
                              }
                              if (mode === TtlMode.Expiry) {
                                form.setValue("ttl", expiryTtl)
                              }
                              if (mode === TtlMode.None) {
                                form.setValue("ttl", null)
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(TtlMode).map((mode) => (
                                <SelectItem key={mode} value={mode}>
                                  {TtlModeLabels[mode]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </Forms.Field.Header>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ttl"
                  render={({ field }) => (
                    <FormItem>
                      <Forms.Field.Header
                        label="Duration"
                        variant="stacking"
                        tooltip="Set a custom TTL duration for the license file."
                      >
                        <FormControl>
                          <DurationInput
                            value={field.value}
                            onChange={field.onChange}
                            units={["days", "weeks", "months", "years"]}
                            disabled={ttlMode !== TtlMode.Custom}
                            disabledTooltip="Enable a custom TTL to configure this field."
                          />
                        </FormControl>
                      </Forms.Field.Header>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Forms.Section.Card>
            </Forms.Section.Step>

            <Forms.Section.Step
              crumb="Additional configuration"
              fields={["encrypt", "algorithm"]}
            >
              <Forms.Section.Card title="Additional options">
                <FormField
                  control={form.control}
                  name="encryptEnabled"
                  render={({ field }) => (
                    <FormItem>
                      <Forms.Field.Header
                        label="Encrypt the license file"
                        variant="inline"
                        tooltip="Encryption adds another layer of security to your offline licensing system."
                      >
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(value) => field.onChange(!!value)}
                          />
                        </FormControl>
                      </Forms.Field.Header>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="algorithm"
                  render={({ field }) => (
                    <FormItem>
                      <Forms.Field.Header
                        label="Signing algorithm"
                        variant="stacking"
                        tooltip="The cryptographic algorithm used to sign the license file."
                      >
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(SigningAlgorithm).map((alg) => (
                                <SelectItem key={alg} value={alg}>
                                  {SigningAlgorithmLabels[alg]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </Forms.Field.Header>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Forms.Section.Card>

              <div className="space-y-2 px-8 text-sm text-content-subdued">
                <p>
                  Checking out a license will generate a License File, which can
                  be decoded and used in offline/air-gap environments.
                </p>
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    You're currently checking out an{" "}
                    {encryptEnabled ? "encrypted" : "unencrypted"} license file,
                    signed with{" "}
                    {SigningAlgorithmLabels[algorithm as SigningAlgorithm] ??
                      algorithm}
                    {encryptEnabled && " and encrypted with AES-256-GCM"}.
                  </li>
                  {include.length > 0 && (
                    <li>
                      The following relationships will be included in the
                      license file: {include.join(", ")}.
                    </li>
                  )}
                  <li>
                    {ttlMode === TtlMode.Custom
                      ? `The license file has a TTL of ${formatTtlLabel(ttl)}.`
                      : ttlMode === TtlMode.Expiry
                        ? "The license file's TTL matches the license expiry."
                        : ttlMode === TtlMode.None
                          ? "The license file has no TTL."
                          : "It has the default TTL of 30 days."}
                  </li>
                </ul>
              </div>
            </Forms.Section.Step>
          </Forms.Layout.Wizard>
        </Forms.Container.Dialog>
      )}

      {showResult && (
        <GuardModal
          open={open}
          onOpenChange={handleOpenChange}
          title="Checkout summary"
          warning={
            "Once this modal is closed, the license file cannot be read again.\nPlease download the file and store it in a safe location before continuing."
          }
          acknowledgment="I understand and/or I have downloaded or copied the license file."
          action={{
            label: "Download file",
            onClick: () => downloadBlob(certificate, `license-${id}.lic`),
          }}
        >
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                void copyToClipboard(certificate)
              }}
              className="absolute top-3 right-3 z-10 h-7 w-7"
            >
              <Copy className="size-3.5" />
            </Button>

            <ScrollArea className="h-64 rounded border border-accent">
              <pre className="p-3 font-mono text-sm leading-snug break-all whitespace-pre-wrap">
                {certificate}
              </pre>
            </ScrollArea>
          </div>
        </GuardModal>
      )}
    </Forms.Provider>
  )
}
