import { useEffect, useMemo, useCallback, useState } from "react"
import { useForm, FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"

import {
  Clock,
  ClockFading,
  Infinity,
  Hexagon,
  User,
  Cpu,
  Activity,
  Binary,
  Hash,
} from "lucide-react"

import {
  PolicyFormValues,
  Policy,
  TimingTemplates,
  AccessTemplates,
  MeteredTemplates,
  PolicyTemplateSelection,
  AuthenticationStrategy,
  ExpirationStrategy,
  OverageStrategy,
  ExpirationBasis,
  RenewalBasis,
  TransferStrategy,
  MachineUniquenessStrategy,
  MachineMatchingStrategy,
  MachineLeasingStrategy,
  ProcessLeasingStrategy,
  ComponentUniquenessStrategy,
  ComponentMatchingStrategy,
  HeartbeatBasis,
  HeartbeatCullStrategy,
  HeartbeatResurrectionStrategy,
  MockPolicies,
} from "@/types/policies"
import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

import { toast } from "@/lib/toast"

import { useCreateEntitlement } from "@/queries/entitlements"

import { useSlide } from "@/hooks/use-slide"
import { useMobile } from "@/hooks/use-mobile"

import * as Motion from "@/components/motion"
import * as Policies from "@/components/policies"
import StepProgress from "@/components/step-progress"
import DocumentationLink from "@/components/documentation-link"
import CollapsedBreadcrumb from "@/components/collapsed-breadcrumb"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"
import {
  getSchemaDefaults,
  composePolicySchema,
} from "@/components/policies/schema"

import ScratchForm from "./scratch-form"
import TemplatesForm, { TemplatesValues } from "./templates-form"

enum Steps {
  TEMPLATES = "templates",
  GENERAL = "general",
  TIMED = "timed",
  PERPETUAL_FALLBACK = "perpetualFallback",
  NODE_LOCKED = "nodeLocked",
  USER_LOCKED = "userLocked",
  PROCESS_BASED = "processBased",
  LEASE_BASED = "leaseBased",
  FEATURE_BASED = "featureBased",
  USAGE_BASED = "usageBased",
  ADVANCED = "advanced",
  NO_ATTRIBUTES = "noAttributes",
}

type StepKey = (typeof Steps)[keyof typeof Steps]

type Step = {
  key: StepKey
  title: string
  fields?: FieldPath<PolicyFormValues>[]
  render: () => React.ReactElement
}

type PoliciesCreateModalProps = {
  onSelectPolicy: (policy: Policy | null) => void
  open: boolean
  onClose: () => void
}

export default function PoliciesCreateModal({
  onSelectPolicy,
  open,
  onClose,
}: PoliciesCreateModalProps) {
  const isMobile = useMobile()

  const createEntitlement = useCreateEntitlement()

  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [isAttributesOpen, setIsAttributesOpen] = useState(false)
  const [isScratchOpen, setIsScratchOpen] = useState(false)

  const [completedStep, setCompletedStep] = useState<Set<string>>(new Set())
  const [selection, setSelection] = useState<PolicyTemplateSelection>({
    timing: null,
    access: [],
    metered: [],
    advanced: true,
    offline: true,
  })

  const schema = useMemo(
    () =>
      composePolicySchema({
        timing: selection.timing,
        access: selection.access,
        metered: selection.metered,
        offline: selection.offline,
      }),
    [selection],
  )

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getSchemaDefaults(schema),
  })

  const selectedTemplatesSteps = useMemo(
    () => composeStepsFromSelection(selection),
    [selection],
  )

  const steps: Step[] = useMemo(
    () => [
      {
        key: Steps.TEMPLATES,
        title: "",
        render: () => (
          <TemplatesForm
            onSubmit={(values) => {
              setSelection({
                timing: values.timing ?? null,
                access: values.access ?? [],
                metered: values.metered ?? [],
                advanced: !!values.advanced,
                offline: !!values.offline,
              })

              handleSubmitTemplates(values)
            }}
          />
        ),
      },
      ...selectedTemplatesSteps,
    ],
    [selectedTemplatesSteps, setSelection],
  )
  const [step, direction, goTo] = useSlide(steps.map((_, i) => i))

  const current = steps[step]
  const last = step === steps.length - 1

  const crumb = steps.slice(1)

  const next = useCallback(async () => {
    if (current.fields?.length) {
      const ok = await form.trigger(current.fields)

      if (!ok) return
    }

    if (step < steps.length - 1) {
      if (step > 0) {
        setCompletedStep((prev) => {
          const next = new Set(prev)
          next.add(steps[step].key)

          return next
        })
      }

      goTo(step + 1)
    }
  }, [current, step, steps, goTo, form])

  const back = useCallback(() => {
    if (step > 0) goTo(step - 1)
  }, [step, goTo])

  const goToStep = (key: StepKey) => {
    const index = steps.findIndex((s) => s.key === key)
    if (index !== -1) goTo(index)
  }

  useEffect(() => {
    const allowed = new Set<string>(steps.map((step) => step.key))

    setCompletedStep((prev) => {
      const next = new Set<string>()
      prev.forEach((key) => {
        if (allowed.has(key)) next.add(key)
      })

      return next
    })
  }, [steps])

  useEffect(() => {
    setIsTemplatesOpen(step === 0 && open)
    setIsAttributesOpen(step > 0 && open)
  }, [open, step])

  const handleSubmitTemplates = useCallback(
    (values: TemplatesValues) => {
      const newSelection: PolicyTemplateSelection = {
        timing: values.timing ?? null,
        access: values.access ?? [],
        metered: values.metered ?? [],
        advanced: !!values.advanced,
        offline: !!values.offline,
      }

      setSelection(newSelection)
      setCompletedStep(new Set<string>())

      const newSchema = composePolicySchema(newSelection)
      form.reset(getSchemaDefaults(newSchema), { keepDefaultValues: false })

      const nextSteps = composeStepsFromSelection(newSelection)
      if (nextSteps.length > 0) goTo(1)
    },
    [form, goTo, setSelection],
  )

  // TODO(cazden) Replace with API call
  const handleCreatePolicy = useCallback(
    async (payload: PolicyFormValues) => {
      const attachIds = payload.entitlements?.attach ?? []
      const toCreate = payload.entitlements?.create ?? []

      const entitlementsResults = await Promise.allSettled(
        toCreate.map((e) =>
          createEntitlement.mutateAsync({
            name: e.name,
            code: e.code,
            metadata: e.metadata ?? {},
          }),
        ),
      )

      const failed = entitlementsResults
        .map((result, index) => (result.status === "rejected" ? index : -1))
        .filter((index) => index !== -1)
      const succeeded = entitlementsResults
        .map((result, index) => (result.status === "fulfilled" ? index : -1))
        .filter((index) => index !== -1)

      const createdEntitlements = succeeded.map(
        (index) =>
          (entitlementsResults[index] as PromiseFulfilledResult<Entitlement>)
            .value,
      )

      if (failed.length > 0) {
        const nextAttach = Array.from(
          new Set([...attachIds, ...createdEntitlements.map((e) => e.id)]),
        )

        const nextCreate = failed.map((index) => toCreate[index])

        const fieldErrors: {
          path: `entitlements.create.${number}.code`
          message: string
        }[] = failed.map((index, newIndex) => {
          const result = entitlementsResults[index]

          let message = ""
          if (result.status === "rejected") {
            if (result.reason?.code === EntitlementErrorCode.CODE_TAKEN) {
              message = "Code already exists"
            } else {
              message = "Field is invalid"
            }
          }

          return {
            path: `entitlements.create.${newIndex}.code`,
            message,
          }
        })

        toast({
          message: "Failed to create entitlement(s)",
          variant: "error",
        })

        if (isScratchOpen) {
          // Throw to render error messages in scratch form
          throw {
            kind: "entitlements-validation",
            fieldErrors,
            nextAttach,
            nextCreate,
          }
        } else {
          goToStep(Steps.FEATURE_BASED)

          form.setValue("entitlements.attach", nextAttach)
          form.setValue("entitlements.create", nextCreate)

          fieldErrors.forEach((fieldError) => {
            form.setError(fieldError.path, {
              type: "validate",
              message: fieldError.message,
            })
          })
        }

        return
      }

      const entitlementIds = Array.from(
        new Set([...attachIds, ...createdEntitlements.map((e) => e.id)]),
      )

      const policy = buildMockPolicy(payload, selection, entitlementIds)
      MockPolicies.push(policy)

      toast({ message: "Policy created", variant: "success" })

      onClose()
      onSelectPolicy(policy)
    },
    [onSelectPolicy, selection, isScratchOpen],
  )

  return (
    <DialogContent className="min-w-fit">
      {/* Eliminates console warnings; nested dialogs further below handle visual headers */}
      <DialogHeader className="sr-only">
        <DialogDescription></DialogDescription>
        <DialogTitle></DialogTitle>
      </DialogHeader>

      {/* Nested dialogs are used here for smooth transition animations between container sizes */}
      {isScratchOpen ? (
        <Dialog
          open={isScratchOpen}
          onOpenChange={() => setIsScratchOpen(false)}
        >
          <DialogContent
            disableOverlay
            className="min-h-screen min-w-screen"
            onWheelCapture={(e) => e.stopPropagation()} // Prevents parent dialog from absorbing scroll events
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            <ScratchForm
              onClose={() => setIsScratchOpen(false)}
              onCreate={handleCreatePolicy}
            />
          </DialogContent>
        </Dialog>
      ) : step === 0 ? (
        <Dialog open={isTemplatesOpen} onOpenChange={onClose}>
          <DialogContent
            disableOverlay
            className="min-w-fit"
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            <DialogHeader className="h-fit items-start border-b border-accent p-4">
              <DialogTitle className="mb-1 text-base">New policy</DialogTitle>
              <DialogDescription>
                <span className="text-sm">
                  Select all parameters that apply to the policy
                </span>
              </DialogDescription>
            </DialogHeader>
            <TemplatesForm
              key="templates-form"
              onSubmit={handleSubmitTemplates}
              onStartScratch={() => {
                setIsScratchOpen(true)
              }}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog open={isAttributesOpen} onOpenChange={onClose}>
          <DialogContent
            disableOverlay
            className="min-w-fit"
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            <DialogHeader className="h-fit items-start border-b border-accent p-2">
              <DialogDescription>
                <BadgeGroup prefix="Creating a" suffix="policy">
                  {selection.timing === TimingTemplates.PERPETUAL && (
                    <BadgeGroupItem>
                      <Infinity />
                      Perpetual
                    </BadgeGroupItem>
                  )}
                  {selection.timing === TimingTemplates.TIMED && (
                    <BadgeGroupItem>
                      <Clock />
                      Timed
                    </BadgeGroupItem>
                  )}
                  {selection.timing === TimingTemplates.PERPETUAL_FALLBACK && (
                    <BadgeGroupItem>
                      <ClockFading />
                      Perpetual-fallback
                    </BadgeGroupItem>
                  )}
                  {selection.access.includes(AccessTemplates.NODE_LOCKED) && (
                    <BadgeGroupItem>
                      <Hexagon />
                      Node-locked
                    </BadgeGroupItem>
                  )}
                  {selection.access.includes(AccessTemplates.USER_LOCKED) && (
                    <BadgeGroupItem>
                      <User />
                      User-locked
                    </BadgeGroupItem>
                  )}
                  {selection.metered.includes(
                    MeteredTemplates.PROCESS_BASED,
                  ) && (
                    <BadgeGroupItem>
                      <Cpu />
                      Process-based
                    </BadgeGroupItem>
                  )}
                  {selection.metered.includes(MeteredTemplates.LEASE_BASED) && (
                    <BadgeGroupItem>
                      <Activity />
                      Lease-based
                    </BadgeGroupItem>
                  )}
                  {selection.metered.includes(
                    MeteredTemplates.FEATURE_BASED,
                  ) && (
                    <BadgeGroupItem>
                      <Binary />
                      Feature-based
                    </BadgeGroupItem>
                  )}
                  {selection.metered.includes(MeteredTemplates.USAGE_BASED) && (
                    <BadgeGroupItem>
                      <Hash />
                      Usage-based
                    </BadgeGroupItem>
                  )}
                </BadgeGroup>
              </DialogDescription>

              <DialogTitle className="w-full">
                {!isMobile && (
                  <CollapsedBreadcrumb
                    crumb={crumb}
                    step={step}
                    goTo={goTo}
                    className="mt-1"
                  />
                )}
                {isMobile && (
                  <div className="mt-2 w-full px-2">
                    <StepProgress
                      steps={crumb.map((step) => ({
                        key: step.key,
                        label: step.title,
                      }))}
                      currentIndex={Math.max(0, step - 1)}
                      completedSteps={completedStep}
                      orientation="horizontal"
                    />
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={(e) => e.preventDefault()}>
                <Motion.Slide direction={direction}>
                  <ScrollArea
                    key={current?.key ?? "attributes"}
                    className="flex h-[calc(100vh-11rem)] flex-col justify-between md:h-[50vh] md:w-4xl"
                  >
                    {current && <current.render />}

                    <DocumentationLink page="policies" />
                  </ScrollArea>
                </Motion.Slide>

                <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={back}
                    className="max-w-[12rem] flex-1 basis-1/2"
                  >
                    Back
                  </Button>

                  <Button
                    key={last ? "create" : "next"}
                    type="button"
                    onClick={
                      last ? form.handleSubmit(handleCreatePolicy) : next
                    }
                    className="max-w-[12rem] flex-1 basis-1/2"
                  >
                    {last ? "Create" : "Next step"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </DialogContent>
  )
}

function composeStepsFromSelection(selection: PolicyTemplateSelection): Step[] {
  const steps: Step[] = []

  steps.push({
    key: Steps.GENERAL,
    title: "General configuration",
    fields: ["name", "product.id"],
    render: () => (
      <Policies.Fields.General
        layout="advanced"
        includeAuthStrategy={false}
        includeMeta={false}
      />
    ),
  })

  if (selection.timing === TimingTemplates.TIMED) {
    steps.push({
      key: Steps.TIMED,
      title: "Timed configuration",
      fields: [
        "duration",
        "expirationStrategy",
        "expirationBasis",
        "renewalBasis",
        "transferStrategy",
      ],
      render: () => <Policies.Fields.Timed layout="advanced" />,
    })
  }

  if (selection.timing === TimingTemplates.PERPETUAL_FALLBACK) {
    steps.push({
      key: Steps.PERPETUAL_FALLBACK,
      title: "Perpetual‑fallback configuration",
      fields: [
        "duration",
        "expirationBasis",
        "renewalBasis",
        "transferStrategy",
      ],
      render: () => <Policies.Fields.Timed layout="advanced" />,
    })
  }

  const requiresNodeLocked =
    selection.access.includes(AccessTemplates.NODE_LOCKED) ||
    selection.metered.includes(MeteredTemplates.PROCESS_BASED) ||
    selection.metered.includes(MeteredTemplates.LEASE_BASED)

  if (requiresNodeLocked) {
    steps.push({
      key: Steps.NODE_LOCKED,
      title: "Node‑locked configuration",
      fields: [
        "maxMachines",
        "requireFingerprintScope",
        "machineUniquenessStrategy",
        "machineMatchingStrategy",
        "componentUniquenessStrategy",
        "componentMatchingStrategy",
        "overageStrategy",
      ],
      render: () => <Policies.Fields.NodeLocked layout="advanced" />,
    })
  }

  if (selection.access.includes(AccessTemplates.USER_LOCKED)) {
    steps.push({
      key: Steps.USER_LOCKED,
      title: "User‑locked configuration",
      fields: ["maxUsers", "requireUserScope"],
      render: () => <Policies.Fields.UserLocked layout="advanced" />,
    })
  }

  if (selection.metered.includes(MeteredTemplates.PROCESS_BASED)) {
    steps.push({
      key: Steps.PROCESS_BASED,
      title: "Process‑based configuration",
      fields: [
        "maxProcesses",
        "machineLeasingStrategy",
        "processLeasingStrategy",
      ],
      render: () => <Policies.Fields.ProcessBased layout="advanced" />,
    })
  }

  if (selection.metered.includes(MeteredTemplates.LEASE_BASED)) {
    steps.push({
      key: Steps.LEASE_BASED,
      title: "Lease‑based configuration",
      fields: [
        "heartbeatDuration",
        "heartbeatBasis",
        "heartbeatCullStrategy",
        "heartbeatResurrectionStrategy",
      ],
      render: () => <Policies.Fields.LeaseBased layout="advanced" />,
    })
  }

  if (selection.metered.includes(MeteredTemplates.FEATURE_BASED)) {
    steps.push({
      key: Steps.FEATURE_BASED,
      title: "Feature‑based configuration",
      fields: ["entitlements.attach", "entitlements.create"],
      render: () => <Policies.Fields.FeatureBased layout="advanced" />,
    })
  }

  if (selection.metered.includes(MeteredTemplates.USAGE_BASED)) {
    steps.push({
      key: Steps.USAGE_BASED,
      title: "Usage‑based configuration",
      fields: ["maxUses"],
      render: () => <Policies.Fields.UsageBased layout="advanced" />,
    })
  }

  if (selection.advanced) {
    steps.push({
      key: Steps.ADVANCED,
      title: "Advanced configuration",
      fields: [
        "strict",
        "floating",
        "usePool",
        "checkInInterval",
        "checkInIntervalCount",
        "authenticationStrategy",
        "metadata",
      ],
      render: () => <Policies.Fields.Requirements layout="advanced" />,
    })
  }

  if (steps.length === 0) {
    steps.push({
      key: Steps.NO_ATTRIBUTES,
      title: "Attributes configuration",
      render: () => (
        <div className="text-sm text-content-subdued">
          No attributes required.
        </div>
      ),
    })
  }

  return steps
}

const buildMockPolicy = (
  input: PolicyFormValues,
  selection: PolicyTemplateSelection,
  entitlementIds: string[] = [],
): Policy => {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const base = getSchemaDefaults(composePolicySchema(selection))

  const attributes = {
    name: input.name,
    duration: input.duration ?? null,
    strict: input.strict ?? base.strict ?? false,
    floating: input.floating ?? base.floating ?? false,
    scheme: input.scheme ?? null,
    requireProductScope: input.requireProductScope ?? false,
    requirePolicyScope: input.requirePolicyScope ?? false,
    requireMachineScope: input.requireMachineScope ?? false,
    requireFingerprintScope: input.requireFingerprintScope ?? false,
    requireComponentsScope: input.requireComponentsScope ?? false,
    requireUserScope: input.requireUserScope ?? false,
    requireChecksumScope: input.requireChecksumScope ?? false,
    requireVersionScope: input.requireVersionScope ?? false,
    requireCheckIn: input.requireCheckIn ?? false,
    checkInInterval: input.checkInInterval ?? null,
    checkInIntervalCount: input.checkInIntervalCount ?? null,
    usePool: input.usePool ?? false,
    maxMachines: input.maxMachines ?? null,
    maxProcesses: input.maxProcesses ?? null,
    maxUsers: input.maxUsers ?? null,
    maxCores: input.maxCores ?? null,
    maxUses: input.maxUses ?? null,
    encrypted: input.encrypted ?? false,
    protected: input.protected ?? base.protected ?? false,
    requireHeartbeat: input.requireHeartbeat ?? false,
    heartbeatDuration: input.heartbeatDuration ?? null,
    heartbeatCullStrategy:
      input.heartbeatCullStrategy ?? HeartbeatCullStrategy.DEACTIVATE_DEAD,
    heartbeatResurrectionStrategy:
      input.heartbeatResurrectionStrategy ??
      HeartbeatResurrectionStrategy.NO_REVIVE,
    heartbeatBasis: input.heartbeatBasis ?? HeartbeatBasis.FROM_CREATION,
    machineUniquenessStrategy:
      input.machineUniquenessStrategy ??
      MachineUniquenessStrategy.UNIQUE_PER_LICENSE,
    machineMatchingStrategy:
      input.machineMatchingStrategy ?? MachineMatchingStrategy.MATCH_ANY,
    componentUniquenessStrategy:
      input.componentUniquenessStrategy ??
      ComponentUniquenessStrategy.UNIQUE_PER_MACHINE,
    componentMatchingStrategy:
      input.componentMatchingStrategy ?? ComponentMatchingStrategy.MATCH_ANY,
    expirationStrategy:
      input.expirationStrategy ?? ExpirationStrategy.RESTRICT_ACCESS,
    expirationBasis: input.expirationBasis ?? ExpirationBasis.FROM_CREATION,
    renewalBasis:
      input.renewalBasis ?? base.renewalBasis ?? RenewalBasis.FROM_EXPIRY,
    transferStrategy:
      input.transferStrategy ??
      base.transferStrategy ??
      TransferStrategy.KEEP_EXPIRY,
    authenticationStrategy:
      input.authenticationStrategy ??
      base.authenticationStrategy ??
      AuthenticationStrategy.MIXED,
    machineLeasingStrategy:
      input.machineLeasingStrategy ?? MachineLeasingStrategy.PER_LICENSE,
    processLeasingStrategy:
      input.processLeasingStrategy ?? ProcessLeasingStrategy.PER_MACHINE,
    overageStrategy: input.overageStrategy ?? OverageStrategy.NO_OVERAGE,
    metadata: input.metadata ?? {},
    created: now,
    updated: now,
  }

  return {
    id,
    type: "policies",
    links: { self: `/v1/accounts/{ACCOUNT}/policies/${id}` },
    attributes,
    relationships: {
      account: {
        links: { related: "/v1/accounts/{ACCOUNT}" },
        data: { type: "accounts", id: "{ACCOUNT}" },
      },
      product: {
        links: { related: `/v1/accounts/{ACCOUNT}/policies/${id}/product` },
        data: { type: "products", id: input.product.id },
      },
      pool: {
        links: { related: `/v1/accounts/{ACCOUNT}/policies/${id}/pool` },
      },
      licenses: {
        links: { related: `/v1/accounts/{ACCOUNT}/policies/${id}/licenses` },
      },
      entitlements: {
        links: {
          related: `/v1/accounts/{ACCOUNT}/policies/${id}/entitlements`,
        },
        data: entitlementIds.map((eid) => ({ type: "entitlements", id: eid })),
      },
    },
  }
}
