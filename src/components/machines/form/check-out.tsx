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

import * as Schemas from "@/schemas"

import {
  SigningAlgorithm,
  SigningAlgorithmLabels,
  TtlMode,
  TtlModeLabels,
} from "@/types/files"

import { toast } from "@/lib/toast"
import { downloadBlob } from "@/lib/download"
import { formatTtlLabel } from "@/lib/licenses"
import { SECONDS_PER_DAY } from "@/lib/temporal"

import { useGetLicense } from "@/queries/licenses"
import { useGetMachine, useCheckOutMachine } from "@/queries/machines"

import * as Forms from "@/components/forms"
import MultiSelect from "@/components/multi-select"
import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { copyToClipboard } from "@/lib/clipboard"

import GuardModal from "@/components/guard-modal"
import DurationInput from "@/components/duration-input"

const INCLUDE_OPTIONS = [
  { value: "license.entitlements", label: "Entitlements" },
  { value: "components", label: "Components" },
  { value: "license", label: "License" },
  { value: "license.product", label: "Product" },
  { value: "license.policy", label: "Policy" },
  { value: "owner", label: "Owner" },
  { value: "license.users", label: "Users" },
  { value: "group", label: "Group" },
]

interface CheckOutMachineFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CheckOutMachineForm({
  open,
  onOpenChange,
}: CheckOutMachineFormProps) {
  const { id } = useParams({ from: "/$accountId/app/machines/$id" })
  const machine = useGetMachine(id)
  const license = useGetLicense(
    machine.data?.relationships.license?.data?.id ?? "",
  )
  const checkOutMachine = useCheckOutMachine(id)

  const expiry = license.data?.attributes.expiry
  const expiryTtl = expiry
    ? differenceInSeconds(parseISO(expiry), new Date())
    : null

  const [showResult, setShowResult] = useState(false)
  const [certificate, setCertificate] = useState("")

  const form = useForm<
    Schemas.Machines.CheckOutFormValues,
    unknown,
    Schemas.Machines.CheckOutValues
  >({
    resolver: zodResolver(Schemas.Machines.CheckOutSchema),
    mode: "onChange",
    defaultValues: {
      includeEnabled: false,
      ttlMode: TtlMode.Default,
      encryptEnabled: false,
      include: [],
      ttl: SECONDS_PER_DAY * 30,
      algorithm: SigningAlgorithm.Ed25519,
    },
  })

  const includeEnabled = useWatch({
    control: form.control,
    name: "includeEnabled",
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
    (values: Schemas.Machines.CheckOutValues) => {
      const ttl = values.ttlMode === TtlMode.Expiry ? expiryTtl : values.ttl

      checkOutMachine.mutate(
        { ...values, ttl },
        {
          onSuccess: (machineFile) => {
            setCertificate(machineFile.attributes.certificate)
            setShowResult(true)
          },
          onError: () => {
            toast({
              message: "Failed to check out machine",
              variant: "error",
            })
          },
        },
      )
    },
    [checkOutMachine, expiryTtl],
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
            isPending={checkOutMachine.isPending}
            submitLabel="Checkout machine"
            description="Checking out a machine"
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
                        tooltip="You can include additional relationship data in the machine file,
                                  such as a machine's license, or its components.
                                  This data will be embedded into the machine file and can be decoded for offline use."
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
                        tooltip="Select the resource relationships to include in the machine file."
                      >
                        <FormControl>
                          <MultiSelect
                            value={field.value ?? []}
                            onChange={field.onChange}
                            options={INCLUDE_OPTIONS}
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
                        tooltip="A time-to-live (TTL) defines how long before the machine file expires.
                                  If no TTL is set, the machine file will default to a TTL of 30 days."
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
                        tooltip="Set a custom TTL duration for the machine file."
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
                        label="Encrypt the machine file"
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
                        tooltip="The cryptographic algorithm used to sign the machine file."
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
                  Checking out a machine will generate a Machine File, which can
                  be decoded and used in offline/air-gap environments.
                </p>
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    You're currently checking out an{" "}
                    {encryptEnabled ? "encrypted" : "unencrypted"} machine file,
                    signed with{" "}
                    {SigningAlgorithmLabels[algorithm as SigningAlgorithm] ??
                      algorithm}
                    {encryptEnabled && " and encrypted with AES-256-GCM"}.
                  </li>
                  {includeEnabled && include.length > 0 && (
                    <li>
                      The following relationships will be included in the
                      machine file: {include.join(", ")}.
                    </li>
                  )}
                  <li>
                    {ttlMode === TtlMode.Custom
                      ? `The machine file has a TTL of ${formatTtlLabel(ttl)}.`
                      : ttlMode === TtlMode.Expiry
                        ? "The machine file's TTL matches the license expiry."
                        : ttlMode === TtlMode.None
                          ? "The machine file has no TTL."
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
            "Once this modal is closed, the machine file cannot be read again.\nPlease download the file and store it in a safe location before continuing."
          }
          acknowledgment="I understand and/or I have downloaded or copied the machine file."
          action={{
            label: "Download file",
            onClick: () => downloadBlob(certificate, `machine-${id}.lic`),
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
