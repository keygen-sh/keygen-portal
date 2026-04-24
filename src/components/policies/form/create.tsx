import { useState, useMemo, useCallback } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import {
  Clock,
  ClockFading,
  Infinity as InfinityIcon,
  Hexagon,
  User,
  Cpu,
  Activity,
  Binary,
  Hash,
  Info,
} from "lucide-react"

import * as Schemas from "@/schemas"
import {
  PolicyTemplateSelection,
  TimingTemplates,
  AccessTemplates,
  MeteredTemplates,
} from "@/schemas/policies"

import { toast } from "@/lib/toast"
import { settleCreateEntitlements } from "@/lib/entitlements"
import { useMobile } from "@/hooks/use-mobile"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import {
  useCreatePolicy,
  useAttachPolicyEntitlements,
} from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"

import * as Forms from "@/components/forms"
import * as Policies from "@/components/policies"
import DocumentationLink from "@/components/documentation-link"
import { CardSelector, CardOption } from "@/components/card-selector"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"

type CreatePolicyMode = "templates" | "scratch"

interface CreatePolicyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreatePolicyForm({
  open,
  onOpenChange,
}: CreatePolicyFormProps) {
  const createPolicy = useCreatePolicy()
  const createEntitlement = useCreateEntitlement()
  const attachEntitlements = useAttachPolicyEntitlements()

  const navigateToResource = useResourceNavigate()

  const [mode, setMode] = useState<CreatePolicyMode>("templates")
  const [selection, setSelection] = useState<PolicyTemplateSelection | null>(
    null,
  )

  const schema = useMemo(
    () =>
      Schemas.Policies.composePolicySchema<
        Schemas.Policies.CreateValues,
        Schemas.Policies.CreateFormValues
      >(
        {
          timing: selection?.timing ?? null,
          access: selection?.access ?? [],
          metered: selection?.metered ?? [],
          offline: selection?.offline ?? false,
        },
        { product: true },
      ),
    [selection],
  )

  const form = useForm<
    Schemas.Policies.CreateFormValues,
    unknown,
    Schemas.Policies.CreateValues
  >({
    resolver: zodResolver(schema),
    defaultValues: Schemas.Policies.getCreateSchemaDefaults(schema),
  })

  const handleTemplatesSubmit = useCallback(
    (values: Schemas.Policies.TemplateValues) => {
      const newSelection: PolicyTemplateSelection = {
        timing: values.timing ?? null,
        access: values.access ?? [],
        metered: values.metered ?? [],
        advanced: !!values.advanced,
        offline: !!values.offline,
      }

      setSelection(newSelection)

      const newSchema = Schemas.Policies.composePolicySchema<
        Schemas.Policies.CreateValues,
        Schemas.Policies.CreateFormValues
      >(newSelection, { product: true })
      form.reset(Schemas.Policies.getCreateSchemaDefaults(newSchema), {
        keepDefaultValues: false,
      })
    },
    [form],
  )

  const handleCreatePolicy = useCallback(
    async (values: Schemas.Policies.CreateValues) => {
      const createdEntitlementIds = await settleCreateEntitlements({
        form,
        createMutation: createEntitlement,
        values: values.entitlements,
      })
      if (!createdEntitlementIds) return

      const policy = await createPolicy.mutateAsync({
        ...values,
        entitlements: { attach: [], create: [] },
      })

      if (createdEntitlementIds.length > 0)
        await attachEntitlements.mutateAsync({
          policyId: policy.id,
          entitlementIds: createdEntitlementIds,
        })

      toast({ message: "Policy created", variant: "success" })
      await navigateToResource(policy)
    },
    [
      form,
      createPolicy,
      createEntitlement,
      attachEntitlements,
      navigateToResource,
    ],
  )

  const handleSubmit = useCallback(
    async (values: Schemas.Policies.CreateValues) => {
      await handleCreatePolicy(values)
    },
    [handleCreatePolicy],
  )

  const handleOpenChange = useCallback(
    (value: boolean) => {
      onOpenChange(value)
      if (!value) {
        setMode("templates")
        setSelection(null)
      }
    },
    [onOpenChange],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Overlay open={open} onOpenChange={handleOpenChange} />

      {mode === "templates" && !selection && (
        <TemplatesSelectionForm
          open={open}
          onOpenChange={handleOpenChange}
          onSubmit={handleTemplatesSubmit}
          onStartScratch={() => {
            form.reset(
              Schemas.Policies.getCreateSchemaDefaults(
                Schemas.Policies.CreateSchema,
              ),
              {
                keepDefaultValues: false,
              },
            )
            setMode("scratch")
          }}
        />
      )}

      {mode === "templates" && selection && (
        <TemplatesForm
          form={form}
          open={open}
          onOpenChange={handleOpenChange}
          selection={selection}
          onBack={() => setSelection(null)}
          onSubmit={handleSubmit}
          isPending={
            createPolicy.isPending ||
            createEntitlement.isPending ||
            attachEntitlements.isPending
          }
          errorMessage="Failed to create policy"
        />
      )}

      {mode === "scratch" && (
        <ScratchForm
          form={form}
          open={open}
          onOpenChange={handleOpenChange}
          onBack={() => {
            setMode("templates")
            setSelection(null)
          }}
          onSubmit={handleSubmit}
          isPending={
            createPolicy.isPending ||
            createEntitlement.isPending ||
            attachEntitlements.isPending
          }
          errorMessage="Failed to create policy"
        />
      )}
    </Forms.Provider>
  )
}

interface TemplatesSelectionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: Schemas.Policies.TemplateValues) => void
  onStartScratch: () => void
}

function TemplatesSelectionForm({
  open,
  onOpenChange,
  onSubmit,
  onStartScratch,
}: TemplatesSelectionFormProps) {
  const isMobile = useMobile()

  const form = useForm<
    Schemas.Policies.TemplateFormValues,
    unknown,
    Schemas.Policies.TemplateValues
  >({
    resolver: zodResolver(Schemas.Policies.TemplateSchema),
    defaultValues: {
      timing: null,
      access: [],
      metered: [],
      advanced: true,
      offline: true,
    },
  })

  const timingOptions: CardOption<TimingTemplates>[] = [
    {
      value: TimingTemplates.Perpetual,
      label: "Perpetual",
      icon: <InfinityIcon className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: TimingTemplates.Timed,
      label: "Timed",
      icon: <Clock className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: TimingTemplates.PerpetualFallback,
      label: "Perpetual-fallback",
      icon: <ClockFading className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
  ]

  const accessOptions: CardOption<AccessTemplates>[] = [
    {
      value: AccessTemplates.NodeLocked,
      label: "Node-locked",
      icon: <Hexagon className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: AccessTemplates.UserLocked,
      label: "User-locked",
      icon: <User className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
  ]

  const meteredOptions: CardOption<MeteredTemplates>[] = [
    {
      value: MeteredTemplates.ProcessBased,
      label: "Process-based",
      icon: <Cpu className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: MeteredTemplates.LeaseBased,
      label: "Lease-based",
      icon: <Activity className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: MeteredTemplates.FeatureBased,
      label: "Feature-based",
      icon: <Binary className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
    {
      value: MeteredTemplates.UsageBased,
      label: "Usage-based",
      icon: <Hash className="size-6 text-content-subdued md:size-5" />,
      tooltip: "TODO",
    },
  ]

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog
        open={open}
        onOpenChange={onOpenChange}
        disableOverlay
      >
        <Forms.Section.Header>
          <Forms.Section.Title className="text-base">
            New policy
          </Forms.Section.Title>
          <Forms.Section.Description className="text-sm">
            Select all parameters that apply to the policy
          </Forms.Section.Description>
        </Forms.Section.Header>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="h-[calc(100vh-15rem)] md:w-3xl">
            <div className="space-y-8">
              <Forms.Field.CardSelector title="Timing">
                <FormField
                  control={form.control}
                  name="timing"
                  render={({ field }) => (
                    <FormItem>
                      <CardSelector
                        options={timingOptions}
                        value={field.value}
                        onChange={(value) =>
                          field.onChange(
                            field.value === value ? undefined : value,
                          )
                        }
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Forms.Field.CardSelector>

              <Forms.Field.CardSelector title="Access" multiselect>
                <FormField
                  control={form.control}
                  name="access"
                  render={({ field }) => (
                    <FormItem>
                      <CardSelector
                        options={accessOptions}
                        multiple
                        value={field.value ?? []}
                        onChange={(value) => field.onChange(value)}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Forms.Field.CardSelector>

              <Forms.Field.CardSelector title="Metered" multiselect>
                <FormField
                  control={form.control}
                  name="metered"
                  render={({ field }) => (
                    <FormItem>
                      <CardSelector
                        options={meteredOptions}
                        multiple
                        value={field.value ?? []}
                        onChange={(value) => field.onChange(value)}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Forms.Field.CardSelector>
            </div>
          </ScrollArea>

          <div className="flex flex-col">
            <div className="flex items-center gap-8 border-t border-accent p-4">
              <FormField
                control={form.control}
                name="offline"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox
                        id="offline"
                        checked={!!field.value}
                        onCheckedChange={(value) => field.onChange(!!value)}
                      />
                    </FormControl>
                    <Label htmlFor="offline">Offline</Label>
                    {isMobile ? (
                      <Popover>
                        <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                          <Info className="size-5 text-content-subdued" />
                        </PopoverTrigger>
                        <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                          Enable offline license validation
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-4 text-content-subdued" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64 bg-background-4 text-content-muted">
                          Enable offline license validation
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="advanced"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox
                        id="advanced"
                        checked={!!field.value}
                        onCheckedChange={(value) => field.onChange(!!value)}
                      />
                    </FormControl>
                    <Label htmlFor="advanced">
                      Include advanced configuration
                    </Label>
                    {isMobile ? (
                      <Popover>
                        <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                          <Info className="size-5 text-content-subdued" />
                        </PopoverTrigger>
                        <PopoverContent className="ml-2 max-w-64 bg-background-4 text-content-muted">
                          Include additional configuration options
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-4 text-content-subdued" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64 bg-background-4 text-content-muted">
                          Include additional configuration options
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between gap-4 border-t border-accent p-4">
              <Button
                variant="outline"
                type="button"
                onClick={onStartScratch}
                className="max-w-48 flex-1 basis-1/2"
              >
                Start from scratch
              </Button>
              <Button type="submit" className="max-w-48 flex-1 basis-1/2">
                Continue
              </Button>
            </div>
          </div>
        </form>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}

interface TemplatesFormProps {
  form: UseFormReturn<
    Schemas.Policies.CreateFormValues,
    unknown,
    Schemas.Policies.CreateValues
  >
  open: boolean
  onOpenChange: (open: boolean) => void
  selection: PolicyTemplateSelection
  onSubmit: (data: Schemas.Policies.CreateValues) => void | Promise<void>
  onBack: () => void
  isPending: boolean
  errorMessage?: string
}

function TemplatesForm({
  form,
  open,
  onOpenChange,
  selection,
  onSubmit,
  onBack,
  isPending,
  errorMessage,
}: TemplatesFormProps) {
  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog
        open={open}
        onOpenChange={onOpenChange}
        disableOverlay
      >
        <Forms.Layout.Wizard
          onSubmit={onSubmit}
          onBack={onBack}
          isPending={isPending}
          errorMessage={errorMessage}
          description={
            <BadgeGroup prefix="Creating a new" suffix="policy" mobileMax={1}>
              {selection.timing === TimingTemplates.Perpetual && (
                <BadgeGroupItem>
                  <InfinityIcon />
                  Perpetual
                </BadgeGroupItem>
              )}
              {selection.timing === TimingTemplates.Timed && (
                <BadgeGroupItem>
                  <Clock />
                  Timed
                </BadgeGroupItem>
              )}
              {selection.timing === TimingTemplates.PerpetualFallback && (
                <BadgeGroupItem>
                  <ClockFading />
                  Perpetual-fallback
                </BadgeGroupItem>
              )}
              {selection.access.includes(AccessTemplates.NodeLocked) && (
                <BadgeGroupItem>
                  <Hexagon />
                  Node-locked
                </BadgeGroupItem>
              )}
              {selection.access.includes(AccessTemplates.UserLocked) && (
                <BadgeGroupItem>
                  <User />
                  User-locked
                </BadgeGroupItem>
              )}
              {selection.metered.includes(MeteredTemplates.ProcessBased) && (
                <BadgeGroupItem>
                  <Cpu />
                  Process-based
                </BadgeGroupItem>
              )}
              {selection.metered.includes(MeteredTemplates.LeaseBased) && (
                <BadgeGroupItem>
                  <Activity />
                  Lease-based
                </BadgeGroupItem>
              )}
              {selection.metered.includes(MeteredTemplates.FeatureBased) && (
                <BadgeGroupItem>
                  <Binary />
                  Feature-based
                </BadgeGroupItem>
              )}
              {selection.metered.includes(MeteredTemplates.UsageBased) && (
                <BadgeGroupItem>
                  <Hash />
                  Usage-based
                </BadgeGroupItem>
              )}
            </BadgeGroup>
          }
        >
          <Forms.Section.Step
            crumb="General attributes"
            fields={["name", "product.id"]}
          >
            <Forms.Field.Title>
              <Policies.Form.Fields
                schema="create"
                include={["name"]}
                titleVariant
                autoFocus="name"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="General attributes">
              <Policies.Form.Fields
                schema="create"
                include={["product"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Card>

            <DocumentationLink page="policies" />
          </Forms.Section.Step>

          {(selection.timing === TimingTemplates.Timed ||
            selection.timing === TimingTemplates.PerpetualFallback) && (
            <Forms.Section.Step
              crumb={
                selection.timing === TimingTemplates.Timed
                  ? "Timed configuration"
                  : "Perpetual-fallback configuration"
              }
              fields={[
                "duration",
                "expirationStrategy",
                "expirationBasis",
                "renewalBasis",
                "transferStrategy",
              ]}
            >
              <Forms.Section.Card title="Timing">
                <Policies.Form.Fields schema="create" include={["duration"]} />
                <Forms.Section.Toggled>
                  <Forms.Section.Columns>
                    <Forms.Section.Column>
                      <Policies.Form.Fields
                        schema="create"
                        include={["expirationStrategy", "expirationBasis"]}
                      />
                    </Forms.Section.Column>
                    <Forms.Section.Column>
                      <Policies.Form.Fields
                        schema="create"
                        include={["renewalBasis", "transferStrategy"]}
                      />
                    </Forms.Section.Column>
                  </Forms.Section.Columns>
                </Forms.Section.Toggled>
              </Forms.Section.Card>

              <DocumentationLink page="policies" />
            </Forms.Section.Step>
          )}

          {(selection.access.includes(AccessTemplates.NodeLocked) ||
            selection.metered.includes(MeteredTemplates.ProcessBased) ||
            selection.metered.includes(MeteredTemplates.LeaseBased)) && (
            <Forms.Section.Step
              crumb="Node-locked configuration"
              fields={[
                "maxMachines",
                "requireFingerprintScope",
                "machineUniquenessStrategy",
                "machineMatchingStrategy",
                "componentUniquenessStrategy",
                "componentMatchingStrategy",
                "overageStrategy",
                "machineLeasingStrategy",
              ]}
            >
              <Forms.Section.Card title="Machine configuration">
                <Policies.Form.Fields
                  schema="create"
                  include={["maxMachines"]}
                />
                <Forms.Section.Toggled>
                  <Forms.Section.Columns>
                    <Forms.Section.Column>
                      <Policies.Form.Fields
                        schema="create"
                        include={[
                          "machineUniquenessStrategy",
                          "machineMatchingStrategy",
                          "componentUniquenessStrategy",
                        ]}
                      />
                    </Forms.Section.Column>
                    <Forms.Section.Column>
                      <Policies.Form.Fields
                        schema="create"
                        include={[
                          "componentMatchingStrategy",
                          "overageStrategy",
                          "machineLeasingStrategy",
                        ]}
                      />
                    </Forms.Section.Column>
                  </Forms.Section.Columns>
                </Forms.Section.Toggled>
              </Forms.Section.Card>

              <DocumentationLink page="policies" />
            </Forms.Section.Step>
          )}

          {selection.access.includes(AccessTemplates.UserLocked) && (
            <Forms.Section.Step
              crumb="User-locked configuration"
              fields={["maxUsers"]}
            >
              <Forms.Section.Card title="User limits">
                <Policies.Form.Fields schema="create" include={["maxUsers"]} />
              </Forms.Section.Card>

              <DocumentationLink page="policies" />
            </Forms.Section.Step>
          )}

          {selection.metered.includes(MeteredTemplates.ProcessBased) && (
            <Forms.Section.Step
              crumb="Process-based configuration"
              fields={[
                "maxProcesses",
                "machineLeasingStrategy",
                "processLeasingStrategy",
              ]}
            >
              <Forms.Section.Card title="Process-based configuration">
                <Policies.Form.Fields
                  schema="create"
                  include={["maxProcesses"]}
                />
                <Forms.Section.Toggled>
                  <Forms.Section.Columns>
                    <Forms.Section.Column>
                      <Policies.Form.Fields
                        schema="create"
                        include={["machineLeasingStrategy"]}
                      />
                    </Forms.Section.Column>
                    <Forms.Section.Column>
                      <Policies.Form.Fields
                        schema="create"
                        include={["processLeasingStrategy"]}
                      />
                    </Forms.Section.Column>
                  </Forms.Section.Columns>
                </Forms.Section.Toggled>
              </Forms.Section.Card>

              <DocumentationLink page="policies" />
            </Forms.Section.Step>
          )}

          {selection.metered.includes(MeteredTemplates.LeaseBased) && (
            <Forms.Section.Step
              crumb="Lease-based configuration"
              fields={[
                "heartbeatDuration",
                "heartbeatBasis",
                "heartbeatCullStrategy",
                "heartbeatResurrectionStrategy",
              ]}
            >
              <Forms.Section.Card title="Lease-based configuration">
                <Forms.Section.Columns>
                  <Forms.Section.Column>
                    <Policies.Form.Fields
                      schema="create"
                      include={["heartbeatDuration", "heartbeatBasis"]}
                    />
                  </Forms.Section.Column>
                  <Forms.Section.Column>
                    <Policies.Form.Fields
                      schema="create"
                      include={[
                        "heartbeatCullStrategy",
                        "heartbeatResurrectionStrategy",
                      ]}
                    />
                  </Forms.Section.Column>
                </Forms.Section.Columns>
              </Forms.Section.Card>

              <DocumentationLink page="policies" />
            </Forms.Section.Step>
          )}

          {selection.metered.includes(MeteredTemplates.FeatureBased) && (
            <Forms.Section.Step
              crumb="Feature-based configuration"
              fields={["entitlements.attach", "entitlements.create"]}
            >
              <Forms.Section.Card title="Entitlements">
                <Policies.Form.Fields
                  schema="create"
                  include={["entitlements.attach", "entitlements.create"]}
                />
              </Forms.Section.Card>

              <DocumentationLink page="policies" />
            </Forms.Section.Step>
          )}

          {selection.metered.includes(MeteredTemplates.UsageBased) && (
            <Forms.Section.Step
              crumb="Usage-based configuration"
              fields={["maxUses"]}
            >
              <Forms.Section.Card title="Usage limits">
                <Policies.Form.Fields schema="create" include={["maxUses"]} />
              </Forms.Section.Card>

              <DocumentationLink page="policies" />
            </Forms.Section.Step>
          )}

          {selection.advanced && (
            <Forms.Section.Step
              crumb="Advanced configuration"
              fields={[
                "strict",
                "floating",
                "usePool",
                "checkInInterval",
                "checkInIntervalCount",
                "authenticationStrategy",
                "metadata",
              ]}
            >
              <Forms.Section.Card title="Advanced configuration">
                <Forms.Section.Columns>
                  <Forms.Section.Column>
                    <Policies.Form.Fields
                      schema="create"
                      include={[
                        "checkInInterval",
                        "checkInIntervalCount",
                        "authenticationStrategy",
                      ]}
                    />
                  </Forms.Section.Column>
                  <Forms.Section.Column>
                    <Policies.Form.Fields
                      schema="create"
                      include={["strict", "floating", "usePool"]}
                    />
                  </Forms.Section.Column>
                </Forms.Section.Columns>
                <Policies.Form.Fields schema="create" include={["metadata"]} />
              </Forms.Section.Card>

              <DocumentationLink page="policies" />
            </Forms.Section.Step>
          )}
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}

interface ScratchFormProps {
  form: UseFormReturn<
    Schemas.Policies.CreateFormValues,
    unknown,
    Schemas.Policies.CreateValues
  >
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Schemas.Policies.CreateValues) => void | Promise<void>
  onBack: () => void
  isPending: boolean
  errorMessage?: string
}

function ScratchForm({
  form,
  open,
  onOpenChange,
  onSubmit,
  onBack,
  isPending,
  errorMessage,
}: ScratchFormProps) {
  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog
        open={open}
        onOpenChange={onOpenChange}
        size="fullscreen"
        disableOverlay
      >
        <Forms.Layout.Wizard
          variant="sidebar"
          title="Creating a new policy"
          onSubmit={onSubmit}
          onBack={onBack}
          isPending={isPending}
          errorMessage={errorMessage}
        >
          <Forms.Section.Step
            crumb="General attributes"
            fields={[
              "name",
              "product.id",
              "authenticationStrategy",
              "metadata",
            ]}
          >
            <Forms.Section.Stacking>
              <Policies.Form.Fields
                schema="create"
                include={[
                  "name",
                  "product",
                  "authenticationStrategy",
                  "metadata",
                ]}
                fieldVariant="stacking"
              />
            </Forms.Section.Stacking>

            <DocumentationLink page="policies" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Timed attributes"
            fields={[
              "duration",
              "transferStrategy",
              "expirationStrategy",
              "expirationBasis",
              "renewalBasis",
            ]}
          >
            <Forms.Section.Stacking>
              <Policies.Form.Fields
                schema="create"
                include={[
                  "duration",
                  "expirationStrategy",
                  "expirationBasis",
                  "renewalBasis",
                  "transferStrategy",
                ]}
                fieldVariant="stacking"
              />
            </Forms.Section.Stacking>

            <DocumentationLink page="policies" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Node-locked attributes"
            fields={[
              "requireHeartbeat",
              "heartbeatDuration",
              "heartbeatBasis",
              "heartbeatCullStrategy",
              "heartbeatResurrectionStrategy",
              "maxMachines",
              "maxProcesses",
              "machineUniquenessStrategy",
              "machineMatchingStrategy",
              "componentUniquenessStrategy",
              "componentMatchingStrategy",
              "overageStrategy",
              "machineLeasingStrategy",
              "processLeasingStrategy",
            ]}
          >
            <Forms.Section.Stacking>
              <Policies.Form.Fields
                schema="create"
                include={[
                  "requireHeartbeat",
                  "heartbeatDuration",
                  "heartbeatBasis",
                  "heartbeatCullStrategy",
                  "heartbeatResurrectionStrategy",
                  "maxMachines",
                  "machineUniquenessStrategy",
                  "machineMatchingStrategy",
                  "componentUniquenessStrategy",
                  "componentMatchingStrategy",
                  "overageStrategy",
                  "machineLeasingStrategy",
                  "maxProcesses",
                  "processLeasingStrategy",
                ]}
                fieldVariant="stacking"
              />
            </Forms.Section.Stacking>

            <DocumentationLink page="policies" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Requirements"
            fields={[
              "strict",
              "floating",
              "protected",
              "usePool",
              "checkInInterval",
              "checkInIntervalCount",
              "maxUses",
              "maxUsers",
              "maxMachines",
            ]}
          >
            <Forms.Section.Stacking>
              <Policies.Form.Fields
                schema="create"
                include={[
                  "strict",
                  "floating",
                  "protected",
                  "usePool",
                  "checkInInterval",
                  "checkInIntervalCount",
                  "maxUses",
                  "maxUsers",
                  "maxMachines",
                ]}
                fieldVariant="stacking"
              />
            </Forms.Section.Stacking>

            <DocumentationLink page="policies" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Scope"
            fields={[
              "requireProductScope",
              "requirePolicyScope",
              "requireMachineScope",
              "requireFingerprintScope",
              "requireComponentsScope",
              "requireUserScope",
              "requireChecksumScope",
              "requireVersionScope",
            ]}
          >
            <Forms.Section.Stacking>
              <Policies.Form.Fields
                schema="create"
                include={[
                  "requireChecksumScope",
                  "requireComponentsScope",
                  "requireFingerprintScope",
                  "requireMachineScope",
                  "requirePolicyScope",
                  "requireProductScope",
                  "requireUserScope",
                  "requireVersionScope",
                ]}
                fieldVariant="stacking"
              />
            </Forms.Section.Stacking>

            <DocumentationLink page="policies" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Entitlements"
            fields={["entitlements.attach", "entitlements.create"]}
          >
            <Forms.Section.Stacking>
              <Policies.Form.Fields
                schema="create"
                include={["entitlements.attach", "entitlements.create"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Stacking>

            <DocumentationLink page="policies" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
