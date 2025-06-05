import { useState, useEffect, useCallback } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
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

import {
  Environment,
  EnvironmentModes,
  IsolationStrategies,
  EnvironmentDescriptions,
} from "@/types/environments"

import * as keygen from "@/keygen"

import StrategyForm from "./strategy-form"
import AttributesForm from "./attributes-form"

interface EnvironmentsCreateModalProps {
  open: boolean
  onClose: () => void
  onSelectEnvironment: (env: Environment | null) => void
  onChangeMode: (mode: EnvironmentModes, env?: Environment) => void
}

export default function EnvironmentsCreateModal({
  open,
  onClose,
  onSelectEnvironment,
  onChangeMode,
}: EnvironmentsCreateModalProps) {
  const [step, setStep] = useState<0 | 1>(0)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const [name, setName] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [isolationStrategy, setIsolationStrategy] =
    useState<IsolationStrategies>(IsolationStrategies.ISOLATED)

  const [description, setDescription] = useState<EnvironmentDescriptions>(
    EnvironmentDescriptions.ISOLATED,
  )

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    } else {
      console.error("No Keygen token found in local or session storage.")
    }
  }, [])

  const handleCreateEnvironment = useCallback(async () => {
    if (!token || !name || !code) {
      console.warn("Missing required fields.")
      return
    }

    setLoading(true)

    try {
      const newEnvironment = (await keygen.environments.create({
        name: name,
        code: code,
        isolationStrategy,
      })) as Environment

      onSelectEnvironment(newEnvironment)
      onChangeMode(EnvironmentModes.VIEW, newEnvironment)
    } catch (error) {
      console.error("Error creating environment:", error)
    } finally {
      setLoading(false)
    }
  }, [name, code, isolationStrategy, onSelectEnvironment, onChangeMode])

  const handleCancelCreate = useCallback(() => {
    onChangeMode(EnvironmentModes.VIEW)
  }, [onChangeMode])

  const handleAttributesSubmit = useCallback(
    (values: { name: string; code: string }) => {
      setName(values.name)
      setCode(values.code)

      handleCreateEnvironment()
    },
    [handleCreateEnvironment],
  )

  const handleStrategyChange = useCallback(
    (newStrategy: IsolationStrategies) => {
      setIsolationStrategy(newStrategy)
    },
    [],
  )

  const handleNameChange = useCallback((newName: string) => {
    setName(newName)
  }, [])

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
  }, [])

  const handleDescriptionChange = useCallback(
    (newDescription: EnvironmentDescriptions) => {
      setDescription(newDescription)
    },
    [],
  )

  const renderDescription = useCallback(() => {
    const words = description.split(" ")
    const tags = words.filter((word) =>
      Object.values(IsolationStrategies).includes(
        word.toUpperCase() as IsolationStrategies,
      ),
    )

    return words.map((word, index) => {
      if (tags.includes(word as IsolationStrategies)) {
        return (
          <Badge key={index} variant="secondary">
            {(word as IsolationStrategies) === IsolationStrategies.ISOLATED ? (
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex min-w-[700px] flex-col justify-between p-0 transition-all duration-300">
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
                    <BreadcrumbLink onClick={() => setStep(0)}>
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

        {step === 0 && (
          <StrategyForm
            isolationStrategy={isolationStrategy}
            onStrategyChange={handleStrategyChange}
            onDescriptionChange={handleDescriptionChange}
            onSubmit={() => setStep(1)}
            onCancel={handleCancelCreate}
          />
        )}

        {step === 1 && (
          <AttributesForm
            name={name}
            code={code}
            onNameChange={handleNameChange}
            onCodeChange={handleCodeChange}
            onSubmit={handleAttributesSubmit}
            onCancel={handleCancelCreate}
            loading={loading}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
