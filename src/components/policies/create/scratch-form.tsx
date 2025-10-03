import { useState, useMemo, useCallback } from "react"
import { useForm, FieldPath, FormProvider } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Form } from "@/components/ui/form"

import { BaseSchema, getFormDefaults } from "./modal"
import { PolicyFormValues } from "@/types/policies"

import { useSlide } from "@/hooks/use-slide"
import { useMobile } from "@/hooks/use-mobile"

import * as Motion from "@/components/motion"
import * as Policies from "@/components/policies"
import StepProgress from "@/components/step-progress"

type Step = {
  key: string
  title: string
  fields?: FieldPath<PolicyFormValues>[]
  render: () => React.ReactElement
}

interface PoliciesScratchFormProps {
  onClose: () => void
  onCreate: (payload: PolicyFormValues) => void
}

export default function PoliciesScratchForm({
  onClose,
  onCreate,
}: PoliciesScratchFormProps): React.ReactElement {
  const isMobile = useMobile()

  const schema = useMemo(() => createSchemaFromValues(), [])

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      ...getFormDefaults(),
      metadata: {},
    },
  })

  const steps: Step[] = useMemo(
    () => [
      {
        key: "general",
        title: "General information",
        fields: ["name", "authenticationStrategy", "metadata"],
        render: () => <Policies.Fields.General />,
      },
      {
        key: "timed",
        title: "Timed attributes",
        fields: [
          "duration",
          "transferStrategy",
          "expirationStrategy",
          "expirationBasis",
          "renewalStrategy",
          "renewalBasis",
        ],
        render: () => <Policies.Fields.Timed />,
      },
      {
        key: "nodeLocked",
        title: "Node‑locked attributes",
        fields: [
          "requireHeartbeat",
          "heartbeatDuration",
          "heartbeatBasis",
          "heartbeatCullStrategy",
          "heartbeatResurrectionStrategy",
          "maxProcesses",
          "machineUniquenessStrategy",
          "machineMatchingStrategy",
          "componentUniquenessStrategy",
          "componentMatchingStrategy",
          "overageStrategy",
          "machineLeasingStrategy",
          "processLeasingStrategy",
        ],
        render: () => (
          <div className="mt-8 space-y-8 md:mb-48">
            <Policies.Fields.LeaseBased title="Heartbeat attributes" />
            <div className="space-y-6">
              <Policies.Fields.NodeLocked title="Strategies" />
              <Policies.Fields.ProcessBased />
            </div>
          </div>
        ),
      },
      {
        key: "requirements",
        title: "Requirements",
        fields: [
          "strict",
          "floating",
          "protected",
          "usePool",
          "checkInInterval",
          "checkInIntervalCount",
          "maxUses",
          "maxUsers",
          "maxMachines",
        ],
        render: () => (
          <div className="mt-8 space-y-6 md:mb-48">
            <Policies.Fields.UsageBased />
            <Policies.Fields.UserLocked />
            <Policies.Fields.Requirements
              includeMeta={false}
              includeAuthStrategy={false}
            />
          </div>
        ),
      },
      {
        key: "scope",
        title: "Scope",
        fields: [
          "requireProductScope",
          "requirePolicyScope",
          "requireMachineScope",
          "requireFingerprintScope",
          "requireComponentsScope",
          "requireUserScope",
          "requireChecksumScope",
          "requireVersionScope",
        ],
        render: () => <Policies.Fields.Scope />,
      },
      {
        key: "entitlements",
        title: "Entitlements",
        fields: ["entitlements.attach", "entitlements.create"],
        render: () => <Policies.Fields.FeatureBased />,
      },
    ],
    [form.control],
  )

  const [step, direction, goTo] = useSlide(steps.map((_, i) => i))
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const last = step === steps.length - 1

  const next = useCallback(async () => {
    const current = steps[step]
    if (current.fields?.length) {
      const ok = await form.trigger(current.fields)
      if (!ok) return
    }

    if (!last) {
      setCompleted((prev) => new Set(prev).add(current.key))
      goTo(step + 1)
    } else {
      const payload = form.getValues()
      onCreate(payload)
      onClose()
    }
  }, [step, steps, form, last, onCreate, onClose, goTo])

  const back = useCallback(() => {
    if (step === 0) return

    goTo(step - 1)
  }, [step, goTo])

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center pt-3 md:justify-between md:border-b md:border-accent md:p-3">
        {!isMobile && (
          <Button variant="outline" type="button" onClick={onClose}>
            Save and exit
          </Button>
        )}
        <div className="text-sm font-medium">Creating a policy</div>
        {!isMobile && (
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={back}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={!form.formState.isValid && last}
              onClick={next}
              className="z-10"
            >
              {last ? "Create" : "Next step"}
            </Button>
          </div>
        )}
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <div className="flex h-[calc(100vh-6.5rem)] flex-col md:h-[calc(100vh-3.25rem)] md:flex-row">
            <div className="border-b p-6 md:w-64 md:border-r md:border-accent md:p-3">
              <StepProgress
                steps={steps.map((step) => ({
                  key: step.key,
                  label: step.title,
                }))}
                currentIndex={step}
                completedSteps={completed}
                orientation={isMobile ? "horizontal" : "vertical"}
                showLabels={!isMobile}
              />
            </div>

            <ScrollArea className="h-1 flex-1 md:h-full">
              <Motion.Slide direction={direction}>
                <div
                  key={steps[step]?.key ?? "scratch"}
                  className="flex w-full justify-center"
                >
                  <div className="w-full p-6 md:w-auto">
                    <h1 className="mb-4 font-owners-wide text-2xl font-medium text-content-muted">
                      {steps[step].title}
                    </h1>

                    {steps[step].render()}
                  </div>
                </div>
              </Motion.Slide>
            </ScrollArea>
          </div>
        </Form>
      </FormProvider>

      {isMobile && (
        <div className="flex items-center justify-between border-t border-accent p-3">
          <Button variant="outline" type="button" onClick={onClose}>
            Save and exit
          </Button>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={back}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={!form.formState.isValid && last}
              onClick={next}
            >
              {last ? "Create" : "Next step"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function createSchemaFromValues() {
  return BaseSchema.superRefine((values, context) => {
    if (values.requireHeartbeat === true) {
      if (values.heartbeatDuration == null || values.heartbeatDuration < 60) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["heartbeatDuration"],
          message: "Heartbeat duration is required and must be >= 60s.",
        })
      }
    }

    const requiresNodeLocked =
      !!(
        values.maxMachines != null ||
        values.machineUniquenessStrategy ||
        values.componentUniquenessStrategy
      ) || false

    const floating = values.floating === true

    if (requiresNodeLocked) {
      if (floating) {
        if (values.maxMachines != null && values.maxMachines <= 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxMachines"],
            message:
              "Provide a number > 0 or leave blank for unlimited when floating.",
          })
        }
      } else {
        if (values.maxMachines !== 1) {
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
