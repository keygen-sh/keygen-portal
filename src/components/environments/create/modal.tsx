import { useState, useCallback } from "react"

import { Badge } from "@/components/ui/badge"
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

import { useSlide } from "@/hooks/use-slide"
import { useCreateEnvironment } from "@/hooks/use-query-environment"

import {
  Environment,
  EnvironmentMode,
  IsolationStrategy,
  EnvironmentDescription,
  EnvironmentErrorCode,
} from "@/types/environments"
import type { AttributesFormValues } from "./attributes-form"

import { toast } from "@/lib/toast"
import * as Motion from "@/components/motion"
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
    IsolationStrategy.ISOLATED,
  )
  const [description, setDescription] = useState<EnvironmentDescription>(
    EnvironmentDescription.ISOLATED,
  )

  const [formError, setFormError] = useState<string | null>(null)

  const handleCreateEnvironment = useCallback(
    (values: AttributesFormValues) => {
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
        isolationStrategy,
      }

      createEnvironment.mutate(payload, {
        onSuccess: (environment) => {
          toast({ message: "Environment created", variant: "success" })
          onSelectEnvironment(environment)
          onChangeMode(EnvironmentMode.VIEW, environment)
        },
        onError: (error) => {
          if (
            typeof error === "object" &&
            error &&
            "code" in error &&
            error.code === EnvironmentErrorCode.CODE_TAKEN
          ) {
            setFormError("Code already exists")
          }
          toast({ message: "Failed to create environment", variant: "error" })
        },
      })
    },
    [isolationStrategy, onSelectEnvironment, onChangeMode],
  )

  const handleCancelCreate = useCallback(() => {
    onChangeMode(EnvironmentMode.VIEW)
  }, [onChangeMode])

  const handleStrategyChange = useCallback((newStrategy: IsolationStrategy) => {
    setIsolationStrategy(newStrategy)
  }, [])

  const handleDescriptionChange = useCallback(
    (newDescription: EnvironmentDescription) => {
      setDescription(newDescription)
    },
    [],
  )

  const renderDescription = useCallback(() => {
    const words = description.split(" ")
    const tags = words.filter((word) =>
      Object.values(IsolationStrategy).includes(
        word.toUpperCase() as IsolationStrategy,
      ),
    )

    return words.map((word, index) => {
      if (tags.includes(word as IsolationStrategy)) {
        return (
          <Badge key={index} variant="secondary">
            {(word as IsolationStrategy) === IsolationStrategy.ISOLATED ? (
              <GlobeLock />
            ) : (
              <Globe />
            )}
            {word}
          </Badge>
        )
      }
      return <span key={index}>{word}</span>
    })
  }, [description])

  return (
    <>
      <DialogHeader className="h-fit border-b border-accent p-2">
        <DialogDescription className="flex h-5 items-center space-x-1 text-xs">
          {renderDescription()}
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
            onDescriptionChange={handleDescriptionChange}
            onSubmit={() => goTo(1)}
            onCancel={handleCancelCreate}
          />
        ) : (
          <AttributesForm
            key="environment-attributes"
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
