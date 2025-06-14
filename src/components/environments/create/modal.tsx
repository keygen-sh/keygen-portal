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

import {
  Environment,
  EnvironmentMode,
  IsolationStrategy,
  EnvironmentDescription,
  EnvironmentErrorCode,
} from "@/types/environments"

import * as keygen from "@/keygen"
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
  const [step, direction, goTo] = useSlide([0, 1])

  const [loading, setLoading] = useState(false)

  const [name, setName] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [isolationStrategy, setIsolationStrategy] = useState<IsolationStrategy>(
    IsolationStrategy.ISOLATED,
  )
  const [error, setError] = useState<string | null>(null)

  const [description, setDescription] = useState<EnvironmentDescription>(
    EnvironmentDescription.ISOLATED,
  )

  const handleCreateEnvironment = useCallback(async () => {
    if (!name || !code) {
      console.warn("Missing required fields.")
      return
    }

    setLoading(true)

    try {
      const result = await keygen.environments.create({
        name: name,
        code: code,
        isolationStrategy,
      })

      if (result.errors) {
        const errorCode = result.errors[0].code
        if (errorCode === EnvironmentErrorCode.CODE_TAKEN) {
          setError("Code already exists")
        }

        throw new Error(`${result.errors.map((e) => e.code).join(", ")}`)
      }

      const newEnvironment = result as Environment

      onSelectEnvironment(newEnvironment)
      onChangeMode(EnvironmentMode.VIEW, newEnvironment)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [name, code, isolationStrategy, onSelectEnvironment, onChangeMode])

  const handleCancelCreate = useCallback(() => {
    onChangeMode(EnvironmentMode.VIEW)
  }, [onChangeMode])

  const handleAttributesSubmit = useCallback(
    (values: { name: string; code: string }) => {
      setName(values.name)
      setCode(values.code)

      handleCreateEnvironment()
    },
    [handleCreateEnvironment],
  )

  const handleStrategyChange = useCallback((newStrategy: IsolationStrategy) => {
    setIsolationStrategy(newStrategy)
  }, [])

  const handleNameChange = useCallback((newName: string) => {
    setName(newName)
  }, [])

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
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
            key="attributes"
            name={name}
            code={code}
            error={error}
            onNameChange={handleNameChange}
            onCodeChange={handleCodeChange}
            onSubmit={handleAttributesSubmit}
            onCancel={handleCancelCreate}
            loading={loading}
          />
        )}
      </Motion.Slide>
    </>
  )
}
