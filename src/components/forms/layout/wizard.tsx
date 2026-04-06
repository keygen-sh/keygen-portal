import { Children, isValidElement, useCallback, useMemo, useState } from "react"
import { useFormContext, type FieldValues } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { APIError } from "@/types/api"

import { cn } from "@/lib/utils"
import { handleFormError } from "@/lib/form-errors"

import { useMobile } from "@/hooks/use-mobile"
import { useSlide } from "@/hooks/use-slide"
import { useSubmitOnce } from "@/hooks/use-submit-once"

import { useFormGuardContext } from "@/contexts/form-guard-context"

import * as Motion from "@/components/motion"
import * as Loading from "@/components/loading"
import StepProgress from "@/components/step-progress"
import CollapsedBreadcrumb from "@/components/collapsed-breadcrumb"

import FormsSectionStep, {
  type FormsSectionStepProps,
} from "@/components/forms/section/step"

type WizardVariant = "default" | "sidebar"

interface StepDefinition {
  id: string
  crumb: string
  fields: string[]
  element: React.ReactNode
}

interface FormsContentWizardProps<T extends FieldValues = FieldValues> {
  variant?: WizardVariant
  title?: string
  description?: React.ReactNode
  onSubmit: (data: T) => void | Promise<void>
  onBack?: () => void
  autoClose?: boolean
  errorMessage?: string
  submitLabel?: string
  backLabel?: string
  cancelLabel?: string
  isPending?: boolean
  children: React.ReactNode
  className?: string
}

function getStepsFromChildren(children: React.ReactNode): StepDefinition[] {
  const steps: StepDefinition[] = []
  let stepIndex = 0

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === FormsSectionStep) {
      const {
        crumb,
        fields,
        children: stepChildren,
      } = child.props as FormsSectionStepProps

      steps.push({
        id: `step-${stepIndex}`,
        crumb,
        fields: fields ?? [],
        element: stepChildren,
      })

      stepIndex++
    }
  })

  return steps
}

export default function FormsContentWizard<
  T extends FieldValues = FieldValues,
>({
  variant = "default",
  title,
  description,
  onSubmit,
  onBack,
  autoClose = true,
  errorMessage,
  submitLabel = "Submit",
  backLabel = "Back",
  cancelLabel = "Cancel",
  isPending = false,
  children,
  className,
}: FormsContentWizardProps<T>) {
  const form = useFormContext()
  const guard = useFormGuardContext()
  const steps = useMemo(() => getStepsFromChildren(children), [children])

  const stepIndices = useMemo(() => steps.map((_, i) => i), [steps])
  const [currentIndex, direction, goTo] = useSlide(stepIndices, 0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const currentStep = steps[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === steps.length - 1

  const goToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        goTo(index)
      }
    },
    [steps.length, goTo],
  )

  const [submitOnce, resetSubmitOnce] = useSubmitOnce(async () => {
    await form.handleSubmit(
      async (data) => {
        try {
          await onSubmit(data as T)
          if (autoClose) {
            guard.close()
          } else {
            form.reset()
          }
        } catch (error) {
          if (errorMessage && error instanceof APIError) {
            await handleFormError({
              form,
              steps: steps.map((step) => ({
                key: step.id,
                fields: step.fields,
              })),
              goToStep: goToIndex,
              toastMessage: errorMessage ?? "",
              apiError: error,
            })
          }

          throw error
        }
      },
      async () => {
        await handleFormError({
          form,
          steps: steps.map((step) => ({
            key: step.id,
            fields: step.fields,
          })),
          goToStep: goToIndex,
          toastMessage: errorMessage ?? "",
        })

        throw new Error(`Validation error: ${errorMessage ?? "invalid"}`)
      },
    )()
  })

  const next = useCallback(async () => {
    if (currentStep?.fields?.length) {
      const valid = await form.trigger(currentStep.fields)
      if (!valid) return
    }

    if (currentStep) {
      setCompletedSteps((prev) => {
        const next = new Set(prev)
        next.add(currentStep.id)
        return next
      })
    }

    if (isLast) {
      try {
        await submitOnce()
      } catch {
        resetSubmitOnce()
      }
    } else {
      goTo(currentIndex + 1)
    }
  }, [
    currentStep,
    currentIndex,
    isLast,
    form,
    goTo,
    submitOnce,
    resetSubmitOnce,
  ])

  const back = useCallback(() => {
    if (isFirst) {
      if (onBack) {
        guard.abandon(onBack)
      } else {
        guard.abandon()
      }
    } else {
      goTo(currentIndex - 1)
    }
  }, [currentIndex, isFirst, goTo, onBack, guard])

  return variant === "sidebar" ? (
    <SidebarContent
      title={title ?? ""}
      steps={steps}
      currentStep={currentStep}
      currentIndex={currentIndex}
      direction={direction}
      completedSteps={completedSteps}
      isFirst={isFirst}
      isLast={isLast}
      next={next}
      back={back}
      onCancel={() => guard.abandon()}
      submitLabel={submitLabel}
      backLabel={backLabel}
      cancelLabel={cancelLabel}
      isPending={isPending}
      className={className}
    />
  ) : (
    <DefaultContent
      description={description}
      steps={steps}
      currentStep={currentStep}
      currentIndex={currentIndex}
      direction={direction}
      completedSteps={completedSteps}
      isLast={isLast}
      next={next}
      back={back}
      goToIndex={goToIndex}
      submitLabel={submitLabel}
      backLabel={backLabel}
      isPending={isPending}
      className={className}
    />
  )
}

interface DefaultContentProps {
  description?: React.ReactNode
  steps: StepDefinition[]
  currentStep: StepDefinition | undefined
  currentIndex: number
  direction: 1 | -1
  completedSteps: Set<string>
  isLast: boolean
  next: () => Promise<void>
  back: () => void
  goToIndex: (index: number) => void
  submitLabel?: string
  backLabel?: string
  isPending?: boolean
  className?: string
}

function DefaultContent({
  description,
  steps,
  currentStep,
  currentIndex,
  direction,
  completedSteps,
  isLast,
  next,
  back,
  goToIndex,
  submitLabel = "Submit",
  backLabel = "Back",
  isPending = false,
  className,
}: DefaultContentProps) {
  const isMobile = useMobile()

  const crumbs = useMemo(
    () => steps.map((step) => ({ key: step.id, title: step.crumb })),
    [steps],
  )

  const showHeader = description || steps.length > 1

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {showHeader && (
        <div className="flex flex-col items-start border-b border-accent p-4">
          {description && (
            <p className="flex items-center space-x-1 text-xs text-muted-foreground">
              {description}
            </p>
          )}

          {steps.length > 1 &&
            (isMobile ? (
              <div className="mt-2 w-full">
                <StepProgress
                  steps={crumbs.map((step) => ({
                    key: step.key,
                    label: step.title,
                  }))}
                  currentIndex={currentIndex}
                  completedSteps={completedSteps}
                  orientation="horizontal"
                />
              </div>
            ) : (
              <CollapsedBreadcrumb
                crumb={crumbs}
                step={currentIndex}
                goTo={goToIndex}
                className="mt-1"
              />
            ))}
        </div>
      )}

      <Motion.Slide direction={direction}>
        <ScrollArea
          key={currentStep?.id ?? "step"}
          className={cn(
            steps.length > 1 && "h-[calc(100vh-9.5rem)]",
            steps.length === 1 && "h-[calc(100vh-7.5rem)]",
            "flex flex-col justify-between md:h-[50vh] md:w-4xl",
            className,
          )}
        >
          {currentStep?.element}
        </ScrollArea>
      </Motion.Slide>

      <div className="flex flex-row justify-end gap-4 border-t border-accent p-4">
        <Button
          variant="outline"
          type="button"
          onClick={back}
          disabled={isPending}
          className="max-w-48 flex-1 basis-1/2"
        >
          {backLabel}
        </Button>

        <Button
          key={isLast ? "submit" : "next"}
          type="button"
          onClick={next}
          disabled={isPending}
          className="max-w-48 flex-1 basis-1/2"
        >
          {isPending ? (
            <Loading.Dots className="bg-background" />
          ) : isLast ? (
            submitLabel
          ) : (
            "Next step"
          )}
        </Button>
      </div>
    </form>
  )
}

interface SidebarContentProps {
  title: string
  steps: StepDefinition[]
  currentStep: StepDefinition | undefined
  currentIndex: number
  direction: 1 | -1
  completedSteps: Set<string>
  isFirst: boolean
  isLast: boolean
  next: () => Promise<void>
  back: () => void
  onCancel: () => void
  submitLabel?: string
  cancelLabel?: string
  backLabel?: string
  isPending?: boolean
  className?: string
}

function SidebarContent({
  title,
  steps,
  currentStep,
  currentIndex,
  direction,
  completedSteps,
  isFirst,
  isLast,
  next,
  back,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  backLabel = "Back",
  isPending = false,
  className,
}: SidebarContentProps) {
  const isMobile = useMobile()

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-end pt-3 md:border-b md:border-accent md:p-3">
        {!isMobile && (
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
        )}
        <h2 className="mr-auto ml-4 text-sm text-content-normal">{title}</h2>
        {!isMobile && (
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isFirst || isPending}
              onClick={back}
            >
              {backLabel}
            </Button>
            <Button
              type="button"
              onClick={next}
              disabled={isPending}
              className="z-10"
            >
              {isPending ? (
                <Loading.Dots className="bg-background" />
              ) : isLast ? (
                submitLabel
              ) : (
                "Next step"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="flex h-[calc(100vh-6.5rem)] flex-col md:h-[calc(100vh-3.25rem)] md:flex-row">
        <div className="border-b p-6 md:w-64 md:border-r md:border-accent md:p-3">
          <StepProgress
            steps={steps.map((step) => ({
              key: step.id,
              label: step.crumb,
            }))}
            currentIndex={currentIndex}
            completedSteps={completedSteps}
            orientation={isMobile ? "horizontal" : "vertical"}
            showLabels={!isMobile}
          />
        </div>

        <ScrollArea className={cn("h-1 flex-1 md:h-full", className)}>
          <Motion.Slide direction={direction} axis="y">
            <div
              key={currentStep?.id ?? "step"}
              className="flex w-full justify-center"
            >
              <div className="w-full p-6 md:w-auto">
                <h1 className="mb-4 font-owners-wide text-2xl font-medium text-content-muted">
                  {currentStep?.crumb}
                </h1>
                {currentStep?.element}
              </div>
            </div>
          </Motion.Slide>
        </ScrollArea>
      </div>

      {isMobile && (
        <div className="flex items-center justify-between border-t border-accent p-3">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isFirst || isPending}
              onClick={back}
            >
              {backLabel}
            </Button>
            <Button type="button" onClick={next} disabled={isPending}>
              {isPending ? (
                <Loading.Dots className="bg-background" />
              ) : isLast ? (
                submitLabel
              ) : (
                "Next step"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
