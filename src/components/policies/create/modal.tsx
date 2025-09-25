import { useEffect, useMemo, useCallback, useState } from "react"
import { useForm, DeepPartial, FieldPath } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
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
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

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
  TimingParameters,
  AccessParameters,
  MeteredParameters,
  PolicyParameterSelection,
  CreatePolicyPayload,
  CheckInInterval,
  AuthenticationStrategy,
  ExpirationStrategy,
  OverageStrategy,
  ExpirationBasis,
  RenewalStrategy,
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
} from "@/types/policies"

import { useSlide } from "@/hooks/use-slide"
import { useMobile } from "@/hooks/use-mobile"

import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"
import * as Motion from "@/components/motion"
import * as Policies from "@/components/policies"
import StepProgress from "@/components/step-progress"
import DocumentationLink from "@/components/documentation-link"
import CollapsedBreadcrumb from "@/components/collapsed-breadcrumb"

import ScratchForm from "./scratch-form"
import ParametersForm, { ParametersValues } from "./parameters-form"

export const BaseSchema: z.ZodType<PolicyFormValues> = z
  .object({
    name: z.string().trim().min(1, "Policy name is required."),

    duration: z.coerce
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .transform((value) => (value === 0 ? null : value)),

    expirationStrategy: z.nativeEnum(ExpirationStrategy).optional(),
    expirationBasis: z.nativeEnum(ExpirationBasis).optional(),
    renewalStrategy: z.nativeEnum(RenewalStrategy).optional(),
    renewalBasis: z.nativeEnum(RenewalBasis).optional(),
    transferStrategy: z.nativeEnum(TransferStrategy).optional(),

    maxMachines: z.coerce
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .transform((value) => (value === 0 ? null : value)),

    machineUniquenessStrategy: z
      .nativeEnum(MachineUniquenessStrategy)
      .optional(),
    machineMatchingStrategy: z.nativeEnum(MachineMatchingStrategy).optional(),
    machineLeasingStrategy: z.nativeEnum(MachineLeasingStrategy).optional(),
    processLeasingStrategy: z.nativeEnum(ProcessLeasingStrategy).optional(),
    componentUniquenessStrategy: z
      .nativeEnum(ComponentUniquenessStrategy)
      .optional(),
    componentMatchingStrategy: z
      .nativeEnum(ComponentMatchingStrategy)
      .optional(),
    overageStrategy: z.nativeEnum(OverageStrategy).optional(),

    maxUsers: z.coerce
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .transform((value) => (value === 0 ? null : value)),
    maxProcesses: z.coerce
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .transform((value) => (value === 0 ? null : value)),
    maxUses: z.coerce.number().int().positive().nullable().optional(),

    requireHeartbeat: z.boolean().optional(),
    heartbeatDuration: z.coerce.number().int().nullable().optional(),
    heartbeatBasis: z.nativeEnum(HeartbeatBasis).optional(),
    heartbeatCullStrategy: z.nativeEnum(HeartbeatCullStrategy).optional(),
    heartbeatResurrectionStrategy: z
      .nativeEnum(HeartbeatResurrectionStrategy)
      .optional(),

    strict: z.boolean().optional(),
    floating: z.boolean().optional(),
    protected: z.boolean().optional(),
    usePool: z.boolean().optional(),
    checkInInterval: z.nativeEnum(CheckInInterval).nullable().optional(),
    checkInIntervalCount: z.coerce
      .number()
      .int()
      .min(1)
      .max(365)
      .nullable()
      .optional(),

    authenticationStrategy: z.nativeEnum(AuthenticationStrategy).optional(),

    requireProductScope: z.boolean().optional(),
    requirePolicyScope: z.boolean().optional(),
    requireMachineScope: z.boolean().optional(),
    requireFingerprintScope: z.boolean().optional(),
    requireComponentsScope: z.boolean().optional(),
    requireUserScope: z.boolean().optional(),
    requireChecksumScope: z.boolean().optional(),
    requireVersionScope: z.boolean().optional(),

    entitlements: z
      .object({
        attach: z.array(z.string()).optional(),
        create: z
          .array(
            z.object({
              name: z.string().min(1),
              code: z.string().min(1),
              metadata: z.record(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),

    metadata: z.record(z.string()).default({}),
  })
  .strict()

type Step = {
  key: string
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

  const [isParametersOpen, setIsParametersOpen] = useState(false)
  const [isAttributesOpen, setIsAttributesOpen] = useState(false)
  const [isScratchOpen, setIsScratchOpen] = useState(false)

  const [completedStep, setCompletedStep] = useState<Set<string>>(new Set())
  const [selection, setSelection] = useState<PolicyParameterSelection>({
    timing: null,
    access: [],
    metered: [],
    advanced: true,
    offline: true,
  })

  const schema = useMemo(
    () => createSchemaFromSelection(selection),
    [selection],
  )

  const defaultValues: DeepPartial<PolicyFormValues> = useMemo(
    () => ({ name: "", ...getFormDefaults(selection) }),
    [selection],
  )

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  })

  const selectedParametersSteps = useMemo(
    () => createStepsFromSelection(selection),
    [selection],
  )

  const steps: Step[] = useMemo(
    () => [
      {
        key: "parameters",
        title: "",
        render: () => (
          <ParametersForm
            onSubmit={(values) => {
              setSelection({
                timing: values.timing ?? null,
                access: values.access ?? [],
                metered: values.metered ?? [],
                advanced: !!values.advanced,
                offline: !!values.offline,
              })

              handleSubmitParameters(values)
            }}
          />
        ),
      },
      ...selectedParametersSteps,
    ],
    [selectedParametersSteps, setSelection],
  )
  const [step, direction, goTo] = useSlide(steps.map((_, i) => i))

  const current = steps[step]
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

  useEffect(() => {
    const allowed = new Set(steps.map((step) => step.key))

    setCompletedStep((prev) => {
      const next = new Set<string>()
      prev.forEach((key) => {
        if (allowed.has(key)) next.add(key)
      })

      return next
    })
  }, [steps])

  useEffect(() => {
    setIsParametersOpen(step === 0 && open)
    setIsAttributesOpen(step > 0 && open)
  }, [open, step])

  const handleSubmitParameters = useCallback(
    (values: ParametersValues) => {
      const newSelection: PolicyParameterSelection = {
        timing: values.timing ?? null,
        access: values.access ?? [],
        metered: values.metered ?? [],
        advanced: !!values.advanced,
        offline: !!values.offline,
      }

      setSelection(newSelection)
      setCompletedStep(new Set())

      form.reset(
        { name: "", ...getFormDefaults(newSelection) },
        { keepDefaultValues: false },
      )

      const nextSteps = createStepsFromSelection(newSelection)
      if (nextSteps.length > 0) goTo(1)
    },
    [form, goTo, setSelection],
  )

  const handleCreatePolicy = useCallback((payload: PolicyFormValues) => {
    console.log(payload)

    onSelectPolicy(null)
  }, [])

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
        <Dialog open={isParametersOpen} onOpenChange={onClose}>
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
                  Select all parameters that apply to your license
                </span>
              </DialogDescription>
            </DialogHeader>
            <ParametersForm
              key="parameters-form"
              onSubmit={handleSubmitParameters}
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
                  {selection.timing === TimingParameters.PERPETUAL && (
                    <BadgeGroupItem>
                      <Infinity />
                      Perpetual
                    </BadgeGroupItem>
                  )}
                  {selection.timing === TimingParameters.TIMED && (
                    <BadgeGroupItem>
                      <Clock />
                      Timed
                    </BadgeGroupItem>
                  )}
                  {selection.timing === TimingParameters.PERPETUAL_FALLBACK && (
                    <BadgeGroupItem>
                      <ClockFading />
                      Perpetual-fallback
                    </BadgeGroupItem>
                  )}
                  {selection.access.includes(AccessParameters.NODE_LOCKED) && (
                    <BadgeGroupItem>
                      <Hexagon />
                      Node-locked
                    </BadgeGroupItem>
                  )}
                  {selection.access.includes(AccessParameters.USER_LOCKED) && (
                    <BadgeGroupItem>
                      <User />
                      User-locked
                    </BadgeGroupItem>
                  )}
                  {selection.metered.includes(
                    MeteredParameters.PROCESS_BASED,
                  ) && (
                    <BadgeGroupItem>
                      <Cpu />
                      Process-based
                    </BadgeGroupItem>
                  )}
                  {selection.metered.includes(
                    MeteredParameters.LEASE_BASED,
                  ) && (
                    <BadgeGroupItem>
                      <Activity />
                      Lease-based
                    </BadgeGroupItem>
                  )}
                  {selection.metered.includes(
                    MeteredParameters.FEATURE_BASED,
                  ) && (
                    <BadgeGroupItem>
                      <Binary />
                      Feature-based
                    </BadgeGroupItem>
                  )}
                  {selection.metered.includes(
                    MeteredParameters.USAGE_BASED,
                  ) && (
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
              <form onSubmit={form.handleSubmit(handleCreatePolicy)}>
                <Motion.Slide direction={direction}>
                  <ScrollArea
                    key={current?.key ?? "attributes"}
                    className="flex h-[calc(100vh-11rem)] flex-col justify-between md:h-[50vh] md:w-4xl"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="m-4 md:my-6">
                          <FormControl>
                            <Input
                              {...field}
                              variant="title"
                              placeholder="Enter policy name..."
                              className="border-none text-xl placeholder:text-content-subdued! md:text-2xl"
                              autoFocus
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage className="ml-2" />
                        </FormItem>
                      )}
                    />

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

                  {step < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={next}
                      className="max-w-[12rem] flex-1 basis-1/2"
                    >
                      Next step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="max-w-[12rem] flex-1 basis-1/2"
                      disabled={!form.formState.isValid}
                    >
                      Create
                    </Button>
                  )}
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </DialogContent>
  )
}

function createSchemaFromSelection(selection: PolicyParameterSelection) {
  return BaseSchema.superRefine((values, context) => {
    if (
      selection.timing === TimingParameters.TIMED ||
      selection.timing === TimingParameters.PERPETUAL_FALLBACK
    ) {
      if (values.duration == null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["duration"],
          message: "Duration is required for a timed policy.",
        })
      }
    }

    if (selection.access.includes(AccessParameters.USER_LOCKED)) {
      if (values.maxUsers == null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxUsers"],
          message: "Please provide a value for max users.",
        })
      }
    }

    if (
      selection.access.includes(AccessParameters.NODE_LOCKED) ||
      selection.metered.includes(MeteredParameters.PROCESS_BASED) ||
      selection.metered.includes(MeteredParameters.LEASE_BASED)
    ) {
      const floating = values.floating === true
      const maxMachines = values.maxMachines

      if (floating) {
        if (maxMachines != null && maxMachines <= 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxMachines"],
            message:
              "Provide a number > 0 or leave blank for unlimited when floating.",
          })
        }
      } else {
        if (maxMachines !== 1) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxMachines"],
            message:
              "Max machines must equal 1 when the policy is not floating.",
          })
        }
      }
    }
  })
}

function createStepsFromSelection(selection: PolicyParameterSelection): Step[] {
  const steps: Step[] = []

  if (selection.timing === TimingParameters.TIMED) {
    steps.push({
      key: "timed",
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

  if (selection.timing === TimingParameters.PERPETUAL_FALLBACK) {
    steps.push({
      key: "perpetualFallback",
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
    selection.access.includes(AccessParameters.NODE_LOCKED) ||
    selection.metered.includes(MeteredParameters.PROCESS_BASED) ||
    selection.metered.includes(MeteredParameters.LEASE_BASED)

  if (requiresNodeLocked) {
    steps.push({
      key: "nodeLocked",
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

  if (selection.access.includes(AccessParameters.USER_LOCKED)) {
    steps.push({
      key: "userLocked",
      title: "User‑locked configuration",
      fields: ["maxUsers", "requireUserScope"],
      render: () => <Policies.Fields.UserLocked layout="advanced" />,
    })
  }

  if (selection.metered.includes(MeteredParameters.PROCESS_BASED)) {
    steps.push({
      key: "processBased",
      title: "Process‑based configuration",
      fields: [
        "maxProcesses",
        "machineLeasingStrategy",
        "processLeasingStrategy",
      ],
      render: () => <Policies.Fields.ProcessBased layout="advanced" />,
    })
  }

  if (selection.metered.includes(MeteredParameters.LEASE_BASED)) {
    steps.push({
      key: "leaseBased",
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

  if (selection.metered.includes(MeteredParameters.FEATURE_BASED)) {
    steps.push({
      key: "featureBased",
      title: "Feature‑based configuration",
      fields: ["entitlements.link", "entitlements.create"],
      render: () => <Policies.Fields.FeatureBased layout="advanced" />,
    })
  }

  if (selection.metered.includes(MeteredParameters.USAGE_BASED)) {
    steps.push({
      key: "usageBased",
      title: "Usage‑based configuration",
      fields: ["maxUses"],
      render: () => <Policies.Fields.UsageBased layout="advanced" />,
    })
  }

  if (selection.advanced) {
    steps.push({
      key: "advanced",
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
      key: "noAttributes",
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

export function getFormDefaults(selection?: PolicyParameterSelection) {
  const base: Partial<CreatePolicyPayload> = {
    authenticationStrategy: AuthenticationStrategy.MIXED,
    renewalBasis: RenewalBasis.FROM_NOW_IF_EXPIRED,
    transferStrategy: TransferStrategy.RESET_EXPIRY,
    protected: true,
    floating: true,
    strict: true,
  }

  if (!selection) return base // Scratch flow

  if (selection.timing === TimingParameters.PERPETUAL) base.duration = null

  if (selection.timing === TimingParameters.TIMED) {
    base.expirationStrategy = ExpirationStrategy.RESTRICT_ACCESS
    base.expirationBasis = ExpirationBasis.FROM_CREATION

    if (base.duration == null) base.duration = 86400 * 14
  }

  if (selection.timing === TimingParameters.PERPETUAL_FALLBACK) {
    base.expirationStrategy = ExpirationStrategy.MAINTAIN_ACCESS
    base.expirationBasis = ExpirationBasis.FROM_CREATION

    if (base.duration == null) base.duration = 86400 * 14
  }

  const requiresNodeLocked =
    selection.access.includes(AccessParameters.NODE_LOCKED) ||
    selection.metered.includes(MeteredParameters.PROCESS_BASED) ||
    selection.metered.includes(MeteredParameters.LEASE_BASED)

  if (requiresNodeLocked) {
    base.requireFingerprintScope = true

    base.machineUniquenessStrategy =
      MachineUniquenessStrategy.UNIQUE_PER_LICENSE
    base.machineMatchingStrategy = MachineMatchingStrategy.MATCH_ANY
    base.componentUniquenessStrategy =
      ComponentUniquenessStrategy.UNIQUE_PER_MACHINE
    base.componentMatchingStrategy = ComponentMatchingStrategy.MATCH_ANY
    base.overageStrategy = OverageStrategy.NO_OVERAGE

    if (selection.metered.includes(MeteredParameters.PROCESS_BASED)) {
      base.machineLeasingStrategy = MachineLeasingStrategy.PER_LICENSE
      base.processLeasingStrategy = ProcessLeasingStrategy.PER_MACHINE
    }

    if (selection.metered.includes(MeteredParameters.LEASE_BASED)) {
      base.requireHeartbeat = true
      base.heartbeatDuration = 60
      base.heartbeatBasis = HeartbeatBasis.FROM_CREATION
      base.heartbeatCullStrategy = HeartbeatCullStrategy.DEACTIVATE_DEAD
      base.heartbeatResurrectionStrategy =
        HeartbeatResurrectionStrategy.NO_REVIVE
    }
  }

  if (selection.access.includes(AccessParameters.USER_LOCKED)) {
    base.requireUserScope = true
  }

  if (selection.offline)
    base.authenticationStrategy = AuthenticationStrategy.LICENSE

  return base
}
