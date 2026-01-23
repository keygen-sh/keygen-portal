import { useMemo, useCallback, useState } from "react"
import { useForm, FieldPath, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import * as Forms from "@/forms"

import { License } from "@/types/licenses"

import { toast } from "@/lib/toast"

import { useSlide } from "@/hooks/use-slide"
import { useMobile } from "@/hooks/use-mobile"

import { useListPolicies } from "@/queries/policies"
import { useCreateLicense } from "@/queries/licenses"

import * as Motion from "@/components/motion"
import * as Licenses from "@/components/licenses"
import * as Loading from "@/components/loading"
import StepProgress from "@/components/step-progress"
import DocumentationLink from "@/components/documentation-link"
import CollapsedBreadcrumb from "@/components/collapsed-breadcrumb"

enum Steps {
  General = "general",
  Expiration = "expiration",
  Limits = "limits",
  Additional = "additional",
}

type StepKey = (typeof Steps)[keyof typeof Steps]

type Step = {
  key: StepKey
  title: string
  fields?: FieldPath<Forms.Licenses.CreateValues>[]
  render: () => React.ReactElement
}

interface LicensesCreateModalProps {
  onSelectLicense: (license: License | null) => void
  onClose: () => void
}

export default function LicensesCreateModal({
  onSelectLicense,
  onClose,
}: LicensesCreateModalProps) {
  const isMobile = useMobile()

  const createLicense = useCreateLicense()
  const [completedStep, setCompletedStep] = useState<Set<string>>(new Set())

  const form = useForm<Forms.Licenses.CreateValues>({
    resolver: zodResolver(Forms.Licenses.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      key: "",
      expiry: null,
      policyId: "",
      suspended: null,
      protected: null,
      maxMachines: null,
      maxProcesses: null,
      maxUsers: null,
      maxCores: null,
      maxUses: null,
      metadata: {},
    },
  })

  const { data: policies = [] } = useListPolicies()
  const selectedPolicyId = useWatch({ control: form.control, name: "policyId" })
  const selectedPolicy = useMemo(
    () => policies.find((p) => p.id === selectedPolicyId) ?? null,
    [policies, selectedPolicyId],
  )

  const steps: Step[] = useMemo(
    () => [
      {
        key: Steps.General,
        title: "General configuration",
        fields: ["policyId"],
        render: () => <Licenses.Fields.General />,
      },
      {
        key: Steps.Expiration,
        title: "License expiration",
        fields: ["expiry"],
        render: () => <Licenses.Fields.Expiration />,
      },
      {
        key: Steps.Limits,
        title: "Usage limits",
        fields: [
          "maxMachines",
          "maxProcesses",
          "maxUsers",
          "maxCores",
          "maxUses",
        ],
        render: () => (
          <Licenses.Fields.Limits selectedPolicy={selectedPolicy} />
        ),
      },
      {
        key: Steps.Additional,
        title: "Additional configuration",
        fields: ["protected", "suspended", "metadata"],
        render: () => (
          <Licenses.Fields.Additional selectedPolicy={selectedPolicy} />
        ),
      },
    ],
    [selectedPolicy],
  )

  const [step, direction, goTo] = useSlide(steps.map((_, i) => i))

  const current = steps[step]
  const last = step === steps.length - 1

  const next = useCallback(async () => {
    if (current.fields?.length) {
      const ok = await form.trigger(current.fields)

      if (!ok) return
    }

    if (step < steps.length - 1) {
      setCompletedStep((prev) => {
        const next = new Set(prev)
        next.add(steps[step].key)

        return next
      })

      goTo(step + 1)
    }
  }, [current, step, steps, goTo, form])

  const back = useCallback(() => {
    if (step > 0) goTo(step - 1)
  }, [step, goTo])

  const handleCreateLicense = useCallback(
    (values: Forms.Licenses.CreateValues) => {
      if (!values.policyId) {
        toast({
          message: "Failed to create license",
          description: "Policy is required.",
          variant: "error",
        })
        return
      }

      createLicense.mutate(values, {
        onSuccess: (license) => {
          toast({ message: "License created", variant: "success" })
          onSelectLicense(license)
        },
        onError: () => {
          toast({
            message: "Failed to create license",
            variant: "error",
          })
        },
      })
    },
    [createLicense, onSelectLicense],
  )

  return (
    <DialogContent className="min-w-fit">
      <DialogHeader className="h-fit items-start border-b border-accent p-2">
        <DialogDescription className="text-xs">
          Creating a new license
        </DialogDescription>
        <DialogTitle className="w-full">
          {!isMobile && (
            <CollapsedBreadcrumb
              crumb={steps}
              step={step}
              goTo={goTo}
              className="mt-1"
              visibleSteps={4}
            />
          )}
          {isMobile && (
            <div className="mt-2 w-full px-2">
              <StepProgress
                steps={steps.map((step) => ({
                  key: step.key,
                  label: step.title,
                }))}
                currentIndex={step}
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
              key={current?.key ?? Steps.General}
              className="flex h-[calc(100vh-11rem)] flex-col justify-between md:h-[50vh] md:w-4xl"
            >
              {current && <current.render />}

              <DocumentationLink page="licenses" />
            </ScrollArea>
          </Motion.Slide>

          <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
            <Button
              variant="outline"
              type="button"
              onClick={step === 0 ? onClose : back}
              disabled={createLicense.isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>

            <Button
              key={last ? "create" : "next"}
              type="button"
              onClick={last ? form.handleSubmit(handleCreateLicense) : next}
              disabled={createLicense.isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              {createLicense.isPending ? (
                <Loading.Dots className="bg-background" />
              ) : last ? (
                "Create"
              ) : (
                "Next step"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
