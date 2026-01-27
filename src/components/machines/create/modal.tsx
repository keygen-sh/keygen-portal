import { useMemo, useCallback, useState } from "react"
import { useForm, FieldPath } from "react-hook-form"
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

import { Machine, MachineErrorCode } from "@/types/machines"

import { toast } from "@/lib/toast"

import { useSlide } from "@/hooks/use-slide"
import { useMobile } from "@/hooks/use-mobile"

import { useCreateMachine } from "@/queries/machines"

import * as Motion from "@/components/motion"
import * as Machines from "@/components/machines"
import * as Loading from "@/components/loading"
import StepProgress from "@/components/step-progress"
import DocumentationLink from "@/components/documentation-link"
import CollapsedBreadcrumb from "@/components/collapsed-breadcrumb"

enum Steps {
  General = "general",
  Attributes = "attributes",
  Additional = "additional",
}

type StepKey = (typeof Steps)[keyof typeof Steps]

type Step = {
  key: StepKey
  title: string
  fields?: FieldPath<Forms.Machines.CreateValues>[]
  render: () => React.ReactElement
}

interface MachinesCreateModalProps {
  onSelectMachine: (machine: Machine | null) => void
  onClose: () => void
}

export default function MachinesCreateModal({
  onSelectMachine,
  onClose,
}: MachinesCreateModalProps) {
  const isMobile = useMobile()
  const createMachine = useCreateMachine()

  const [completedStep, setCompletedStep] = useState<Set<string>>(new Set())

  const form = useForm<Forms.Machines.CreateValues>({
    resolver: zodResolver(Forms.Machines.CreateSchema),
    mode: "onChange",
    defaultValues: {
      fingerprint: "",
      name: null,
      licenseId: "",
      groupId: null,
      ownerId: null,
      ip: null,
      hostname: null,
      platform: null,
      cores: null,
      memory: null,
      disk: null,
      metadata: {},
    },
  })

  const steps: Step[] = useMemo(
    () => [
      {
        key: Steps.General,
        title: "General configuration",
        fields: ["fingerprint", "licenseId"],
        render: () => <Machines.Fields.General />,
      },
      {
        key: Steps.Attributes,
        title: "Machine attributes",
        fields: ["ip", "hostname", "platform", "cores", "memory", "disk"],
        render: () => <Machines.Fields.Attributes />,
      },
      {
        key: Steps.Additional,
        title: "Additional configuration",
        fields: ["groupId", "ownerId", "metadata"],
        render: () => <Machines.Fields.Additional />,
      },
    ],
    [],
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

  const handleCreateMachine = useCallback(
    (values: Forms.Machines.CreateValues) => {
      createMachine.mutate(values, {
        onSuccess: (machine) => {
          toast({ message: "Machine activated", variant: "success" })
          onSelectMachine(machine)
          onClose()
        },
        onError: (error) => {
          // TODO(cazden) Add standardized form error handling
          if (error.code === MachineErrorCode.MachineLimitExceeded) {
            form.setError("licenseId", {
              type: "manual",
              message: "Machine limit exceeded for this license",
            })
            goTo(0)
          }

          toast({
            message: "Failed to activate machine",
            description: error.detail,
            variant: "error",
          })
        },
      })
    },
    [createMachine, onSelectMachine, onClose, form, goTo],
  )

  return (
    <DialogContent className="min-w-fit">
      <DialogHeader className="h-fit items-start border-b border-accent p-2">
        <DialogDescription className="text-xs">
          Activating a new machine
        </DialogDescription>
        <DialogTitle className="w-full">
          {!isMobile && (
            <CollapsedBreadcrumb
              crumb={steps}
              step={step}
              goTo={goTo}
              className="mt-1"
              visibleSteps={3}
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

              <DocumentationLink page="machines" />
            </ScrollArea>
          </Motion.Slide>

          <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
            <Button
              variant="outline"
              type="button"
              onClick={step === 0 ? onClose : back}
              disabled={createMachine.isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>

            <Button
              key={last ? "create" : "next"}
              type="button"
              onClick={last ? form.handleSubmit(handleCreateMachine) : next}
              disabled={createMachine.isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              {createMachine.isPending ? (
                <Loading.Dots className="bg-background" />
              ) : last ? (
                "Activate"
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
