import { useState, useCallback } from "react"

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { Globe, GlobeLock } from "lucide-react"

import * as Forms from "@/forms"
import {
  Environment,
  EnvironmentMode,
  IsolationStrategy,
  EnvironmentErrorCode,
} from "@/types/environments"

import { useCreateEnvironment } from "@/queries/environments"
import { useSlide } from "@/hooks/use-slide"

import { toast } from "@/lib/toast"
import * as Motion from "@/components/motion"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"
import StrategyForm from "./strategy-form"
import AttributesForm from "./attributes-form"

interface EnvironmentsCreateModalProps {
  onSelectEnvironment: (env: Environment | null) => void
  onChangeMode: (mode: EnvironmentMode, env?: Environment) => void
}

export default function EnvironmentsCreateModal({
  onSelectEnvironment,
  onChangeMode,
}: EnvironmentsCreateModalProps) {
  const createEnvironment = useCreateEnvironment()

  const [step, direction, goTo] = useSlide([0, 1])

  const [isolationStrategy, setIsolationStrategy] = useState<IsolationStrategy>(
    IsolationStrategy.Isolated,
  )

  const [formError, setFormError] = useState<string | null>(null)

  const handleCreateEnvironment = useCallback(
    (values: Forms.Environments.CreatePayload) => {
      if (!values.name || !values.code) {
        toast({
          message: "Failed to create environment",
          description: "Missing required fields.",
          variant: "error",
        })
        return
      }

      const payload = {
        name: values.name,
        code: values.code,
        isolationStrategy: values.isolationStrategy,
      }

      createEnvironment.mutate(payload, {
        onSuccess: (environment) => {
          toast({ message: "Environment created", variant: "success" })
          onSelectEnvironment(environment)
          onChangeMode(EnvironmentMode.View, environment)
        },
        onError: (error) => {
          if (
            typeof error === "object" &&
            error &&
            "code" in error &&
            error.code === EnvironmentErrorCode.CodeTaken
          ) {
            setFormError("Code already exists")
          }
          toast({ message: "Failed to create environment", variant: "error" })
        },
      })
    },
    [createEnvironment, onSelectEnvironment, onChangeMode],
  )

  const handleCancelCreate = useCallback(() => {
    onChangeMode(EnvironmentMode.View)
  }, [onChangeMode])

  const handleStrategyChange = useCallback((newStrategy: IsolationStrategy) => {
    setIsolationStrategy(newStrategy)
  }, [])

  return (
    <>
      <DialogHeader className="h-fit border-b border-accent p-2">
        <DialogDescription className="flex h-5 items-center space-x-1 text-xs">
          <DialogDescription className="flex h-5 items-center text-xs">
            <BadgeGroup prefix="Creating a new" suffix="environment">
              <BadgeGroupItem>
                {isolationStrategy === IsolationStrategy.Isolated ? (
                  <>
                    <GlobeLock />
                    Isolated
                  </>
                ) : (
                  <>
                    <Globe />
                    Shared
                  </>
                )}
              </BadgeGroupItem>
            </BadgeGroup>
          </DialogDescription>
        </DialogDescription>
        <DialogTitle>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {step === 0 ? (
                  <BreadcrumbPage>Isolation strategy</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink onClick={() => goTo(0)}>
                    Isolation strategy
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {step === 1 ? (
                  <BreadcrumbPage>Attributes</BreadcrumbPage>
                ) : (
                  <span className="text-sm font-medium break-words text-muted-foreground">
                    Attributes
                  </span>
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </DialogTitle>
      </DialogHeader>
      <Motion.Slide direction={direction}>
        {step === 0 ? (
          <StrategyForm
            key="strategy"
            isolationStrategy={isolationStrategy}
            onStrategyChange={handleStrategyChange}
            onSubmit={() => goTo(1)}
            onCancel={handleCancelCreate}
          />
        ) : (
          <AttributesForm
            key="environment-attributes"
            isolationStrategy={isolationStrategy}
            loading={createEnvironment.isPending}
            error={formError}
            onSubmit={handleCreateEnvironment}
            onCancel={handleCancelCreate}
          />
        )}
      </Motion.Slide>
    </>
  )
}
