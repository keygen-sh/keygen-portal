import { useState, useCallback } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

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

import * as Schemas from "@/schemas"

import { SigningAlgorithm, SigningAlgorithmLabels } from "@/types/files"

import { toast } from "@/lib/toast"
import { downloadBlob } from "@/lib/download"
import { formatTtlLabel } from "@/lib/licenses"

import { useCheckOutLicense } from "@/queries/licenses"

import * as Forms from "@/components/forms"
import MultiSelect from "@/components/multi-select"
import SecretModal from "@/components/secret-modal"
import DurationInput from "@/components/duration-input"

const IncludeOptions = [
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
  const checkOutLicense = useCheckOutLicense(id)

  const [showResult, setShowResult] = useState(false)
  const [certificate, setCertificate] = useState("")

  const form = useForm<Schemas.Licenses.CheckOutValues>({
    resolver: zodResolver(Schemas.Licenses.CheckOutSchema),
    mode: "onChange",
    defaultValues: {
      includeEnabled: false,
      ttlEnabled: false,
      encryptEnabled: false,
      include: [],
      ttl: null,
      algorithm: SigningAlgorithm.Ed25519,
    },
  })

  const includeEnabled = useWatch({
    control: form.control,
    name: "includeEnabled",
  })
  const ttlEnabled = useWatch({ control: form.control, name: "ttlEnabled" })
  const encryptEnabled = useWatch({
    control: form.control,
    name: "encryptEnabled",
  })
  const include = useWatch({
    control: form.control,
    name: "include",
  })
  const ttl = useWatch({ control: form.control, name: "ttl" })
  const algorithm = useWatch({ control: form.control, name: "algorithm" })

  const handleCheckOut = useCallback(
    (values: Schemas.Licenses.CheckOutValues) => {
      checkOutLicense.mutate(values, {
        onSuccess: (licenseFile) => {
          setCertificate(licenseFile.attributes.certificate)
          setShowResult(true)
        },
        onError: () => {
          toast({ message: "Failed to check out license", variant: "error" })
        },
      })
    },
    [checkOutLicense],
  )

  const handleOpenChange = useCallback(
    (value: boolean) => {
      onOpenChange(value)
      if (!value) {
        setShowResult(false)
        setCertificate("")
        form.reset()
      }
    },
    [onOpenChange, form],
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
            onSubmit={() => form.handleSubmit(handleCheckOut)()}
            isPending={checkOutLicense.isPending}
            submitLabel="Checkout license"
            description="Checking out a license"
          >
            <Forms.Section.Step
              crumb="Include relationships"
              fields={["includeEnabled", "include"]}
            >
              <Forms.Section.Card title="Relationships">
                <FormField
                  control={form.control}
                  name="includeEnabled"
                  render={({ field }) => (
                    <FormItem>
                      <Forms.Field.Header
                        label="Include relationship data"
                        variant="inline"
                        tooltip="You can include additional relationship data in the license file,
                                  such as a license's entitlements, or its product.
                                  This data will be embedded into the license file and can be decoded for offline use."
                      >
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(value) => {
                              field.onChange(!!value)
                              if (!value) {
                                form.resetField("include")
                              }
                            }}
                          />
                        </FormControl>
                      </Forms.Field.Header>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="include"
                  render={({ field }) => (
                    <FormItem>
                      <Forms.Field.Header
                        label="Relationships"
                        variant="stacking"
                        tooltip="Select the resource relationships to include in the license file."
                      >
                        <FormControl>
                          <MultiSelect
                            value={field.value ?? []}
                            onChange={field.onChange}
                            options={IncludeOptions}
                            placeholder="Select relationships..."
                            disabled={!includeEnabled}
                            disabledTooltip="Enable relationship data to configure this field."
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
              fields={["ttlEnabled", "ttl"]}
            >
              <Forms.Section.Card title="Time to live">
                <FormField
                  control={form.control}
                  name="ttlEnabled"
                  render={({ field }) => (
                    <FormItem>
                      <Forms.Field.Header
                        label="Add a custom TTL"
                        variant="inline"
                        tooltip="A time-to-live (TTL) defines how long before the license file expires.
                                  If no TTL is set, the license file will default to a TTL of 30 days."
                      >
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(value) => {
                              field.onChange(!!value)
                              if (!value) {
                                form.resetField("ttl")
                              }
                            }}
                          />
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
                            disabled={!ttlEnabled}
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
                  {includeEnabled && include.length > 0 && (
                    <li>
                      The following relationships will be included in the
                      license file: {include.join(", ")}.
                    </li>
                  )}
                  <li>
                    {ttlEnabled
                      ? `The license file has a TTL of ${formatTtlLabel(ttl)}.`
                      : "It has the default TTL of 30 days."}
                  </li>
                </ul>
              </div>
            </Forms.Section.Step>
          </Forms.Layout.Wizard>
        </Forms.Container.Dialog>
      )}

      {showResult && (
        <SecretModal
          value={certificate}
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
        />
      )}
    </Forms.Provider>
  )
}
