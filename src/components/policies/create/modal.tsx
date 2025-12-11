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
  Infinity as InfinityIcon,
  Hexagon,
  User,
  Cpu,
  Activity,
  Binary,
  Hash,
} from "lucide-react"

import { Policy } from "@/types/policies"
import { FormFieldError } from "@/types/forms"
import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

import * as Forms from "@/forms"
import {
  PolicyTemplateSelection,
  TimingTemplates,
  AccessTemplates,
  MeteredTemplates,
} from "@/forms/policies"

import { toast } from "@/lib/toast"

import { settleMutations } from "@/queries/utils"
import { useCreatePolicy } from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"

import { useSlide } from "@/hooks/use-slide"
import { useMobile } from "@/hooks/use-mobile"

import * as Motion from "@/components/motion"
import * as Policies from "@/components/policies"
import StepProgress from "@/components/step-progress"
import DocumentationLink from "@/components/documentation-link"
import CollapsedBreadcrumb from "@/components/collapsed-breadcrumb"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"

import ScratchForm from "./scratch-form"
import TemplatesForm, { TemplatesValues } from "./templates-form"

enum Steps {
  Templates = "templates",
  General = "general",
  Timed = "timed",
  PerpetualFallback = "perpetualFallback",
  NodeLocked = "nodeLocked",
  UserLocked = "userLocked",
  ProcessBased = "processBased",
  LeaseBased = "leaseBased",
  FeatureBased = "featureBased",
  UsageBased = "usageBased",
  Advanced = "advanced",
  NoAttributes = "noAttributes",
}

type StepKey = (typeof Steps)[keyof typeof Steps]

// TODO(cazden) Move to shared location; 'Step' is being declared in multiple places
type Step = {
  key: StepKey
  title: string
  fields?: FieldPath<Forms.Policies.CreateValues>[]
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

  const createPolicy = useCreatePolicy()
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
      Forms.Policies.composePolicySchema<Forms.Policies.CreateValues>(
        {
          timing: selection.timing,
          access: selection.access,
          metered: selection.metered,
          offline: selection.offline,
        },
        { product: true },
      ),
    [selection],
  )

  const form = useForm<Forms.Policies.CreateValues>({
    resolver: zodResolver(schema),
    defaultValues: Forms.Policies.getSchemaDefaults(schema),
  })

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

      const newSchema =
        Forms.Policies.composePolicySchema<Forms.Policies.CreateValues>(
          newSelection,
          { product: true },
        )
      form.reset(Forms.Policies.getSchemaDefaults(newSchema), {
        keepDefaultValues: false,
      })

      const nextSteps = composeStepsFromSelection(newSelection)
      if (nextSteps.length > 0) goTo(1)
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, setSelection], // Omit goTo to avoid circular dependency
  )

  const selectedTemplatesSteps = useMemo(
    () => composeStepsFromSelection(selection),
    [selection],
  )

  const steps: Step[] = useMemo(
    () => [
      {
        key: Steps.Templates,
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
    [handleSubmitTemplates, selectedTemplatesSteps],
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

  const goToStep = useCallback(
    (key: StepKey) => {
      const index = steps.findIndex((s) => s.key === key)
      if (index !== -1) goTo(index)
    },
    [steps, goTo],
  )

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

  const handleCreatePolicy = useCallback(
    async (values: Forms.Policies.CreateValues) => {
      const attachIds = values.entitlements?.attach ?? []
      const toCreate = values.entitlements?.create ?? []

      const [entitlements, errors] = await settleMutations<Entitlement>(
        toCreate.map((attrs) => createEntitlement.mutateAsync(attrs)),
      )
      const entitlementIds = Array.from(
        new Set([...attachIds, ...entitlements.map((e) => e.id)]),
      )

      const nextAttach = [...entitlementIds]
      const nextCreate = errors.map(({ index }) => toCreate[index])

      form.setValue("entitlements.attach", nextAttach)
      form.setValue("entitlements.create", nextCreate)

      if (errors.length > 0) {
        const fieldErrors: FormFieldError<Forms.Policies.CreateValues>[] =
          errors.map((error, index) => {
            let message = ""
            if (error.reason.code === EntitlementErrorCode.CodeTaken) {
              message = "Code already exists"
            } else {
              message = "Field is invalid"
            }

            return {
              path: `entitlements.create.${index}.code`,
              message,
            }
          })

        toast({
          message: "Failed to create entitlement(s)",
          variant: "error",
        })

        if (isScratchOpen) {
          // Throw to render error messages in scratch form
          throw new Forms.Entitlements.CreateValidationError<Forms.Policies.CreateValues>(
            nextAttach,
            nextCreate,
            fieldErrors,
          )
        } else {
          goToStep(Steps.FeatureBased)

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

      createPolicy.mutate(values, {
        onSuccess: (policy) => {
          toast({ message: "Policy created", variant: "success" })
          onClose()
          onSelectPolicy(policy)
        },
        onError: () => {
          toast({ message: "Failed to create policy", variant: "error" })
        },
      })
    },
    [
      form,
      onClose,
      goToStep,
      createPolicy,
      isScratchOpen,
      onSelectPolicy,
      createEntitlement,
    ],
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
                  {selection.metered.includes(
                    MeteredTemplates.ProcessBased,
                  ) && (
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
                  {selection.metered.includes(
                    MeteredTemplates.FeatureBased,
                  ) && (
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
    key: Steps.General,
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

  if (selection.timing === TimingTemplates.Timed) {
    steps.push({
      key: Steps.Timed,
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

  if (selection.timing === TimingTemplates.PerpetualFallback) {
    steps.push({
      key: Steps.PerpetualFallback,
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
    selection.access.includes(AccessTemplates.NodeLocked) ||
    selection.metered.includes(MeteredTemplates.ProcessBased) ||
    selection.metered.includes(MeteredTemplates.LeaseBased)

  if (requiresNodeLocked) {
    steps.push({
      key: Steps.NodeLocked,
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

  if (selection.access.includes(AccessTemplates.UserLocked)) {
    steps.push({
      key: Steps.UserLocked,
      title: "User‑locked configuration",
      fields: ["maxUsers", "requireUserScope"],
      render: () => <Policies.Fields.UserLocked layout="advanced" />,
    })
  }

  if (selection.metered.includes(MeteredTemplates.ProcessBased)) {
    steps.push({
      key: Steps.ProcessBased,
      title: "Process‑based configuration",
      fields: [
        "maxProcesses",
        "machineLeasingStrategy",
        "processLeasingStrategy",
      ],
      render: () => <Policies.Fields.ProcessBased layout="advanced" />,
    })
  }

  if (selection.metered.includes(MeteredTemplates.LeaseBased)) {
    steps.push({
      key: Steps.LeaseBased,
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

  if (selection.metered.includes(MeteredTemplates.FeatureBased)) {
    steps.push({
      key: Steps.FeatureBased,
      title: "Feature‑based configuration",
      fields: ["entitlements.attach", "entitlements.create"],
      render: () => <Policies.Fields.FeatureBased layout="advanced" />,
    })
  }

  if (selection.metered.includes(MeteredTemplates.UsageBased)) {
    steps.push({
      key: Steps.UsageBased,
      title: "Usage‑based configuration",
      fields: ["maxUses"],
      render: () => <Policies.Fields.UsageBased layout="advanced" />,
    })
  }

  if (selection.advanced) {
    steps.push({
      key: Steps.Advanced,
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
      key: Steps.NoAttributes,
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
