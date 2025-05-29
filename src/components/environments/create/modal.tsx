import { useState, useCallback } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
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

import { Environment } from "@/types/environments"
import { MODES, STRATEGIES, DESCRIPTIONS } from "@/constants/environments"

import StrategyForm from "./strategy-form"
import AdminForm from "./admin-form"
import AttributesForm from "./attributes-form"

interface EnvironmentsCreateModalProps {
  open: boolean
  onClose: () => void
  onSelectEnvironment: (env: Environment | null) => void
  onChangeMode: (mode: MODES, env?: Environment) => void
}

export default function EnvironmentsCreateModal({
  open,
  onClose,
  onSelectEnvironment,
  onChangeMode,
}: EnvironmentsCreateModalProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0)

  const [isolationStrategy, setIsolationStrategy] = useState<STRATEGIES>(
    STRATEGIES.ISOLATED,
  )
  const [admin, setAdmin] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)

  const [description, setDescription] = useState<DESCRIPTIONS>(
    DESCRIPTIONS.ISOLATED,
  )

  // TODO(cazden) - Implement API call
  const handleCreateEnvironment = useCallback(() => {
    const newEnvironment: Environment = {
      id: crypto.randomUUID(),
      name: name as string,
      code: code as string,
      isolationStrategy,
      admin: admin as string,
      created: new Date().toISOString(),
    }

    console.log("Creating environment:", newEnvironment)

    onSelectEnvironment(newEnvironment)
    onChangeMode(MODES.VIEW, newEnvironment)
  }, [name, code, isolationStrategy, admin, onSelectEnvironment, onChangeMode])

  const handleCancelCreate = useCallback(() => {
    onChangeMode(MODES.VIEW)
  }, [onChangeMode])

  const handleStrategySubmit = useCallback((strategy: STRATEGIES) => {
    setIsolationStrategy(strategy)

    if (strategy === STRATEGIES.SHARED) {
      setAdmin(null)
      setStep(2)
    } else {
      setStep(1)
    }
  }, [])

  const handleAdminSubmit = useCallback((admin: string) => {
    setAdmin(admin)
    setStep(2)
  }, [])

  const handleAttributesSubmit = useCallback(
    (values: { name: string; code: string }) => {
      setName(values.name)
      setCode(values.code)

      handleCreateEnvironment()
    },
    [handleCreateEnvironment],
  )

  const handleStrategyChange = useCallback((newStrategy: STRATEGIES) => {
    setIsolationStrategy(newStrategy)
  }, [])

  const handleAdminChange = useCallback((newAdmin: string) => {
    setAdmin(newAdmin)
  }, [])

  const handleNameChange = useCallback((newName: string) => {
    setName(newName)
  }, [])

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
  }, [])

  const handleDescriptionChange = useCallback(
    (newDescription: DESCRIPTIONS) => {
      setDescription(newDescription)
    },
    [],
  )

  const renderDescription = useCallback(() => {
    const words = description.split(" ")
    const tags = words.filter((word) =>
      Object.values(STRATEGIES).includes(word.toUpperCase() as STRATEGIES),
    )

    return words.map((word, index) => {
      if (tags.includes(word as STRATEGIES)) {
        return (
          <Badge key={index} variant="secondary">
            {(word as STRATEGIES) === STRATEGIES.ISOLATED ? (
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
                    <BreadcrumbPage>Administrator</BreadcrumbPage>
                  ) : isolationStrategy === STRATEGIES.ISOLATED && step > 1 ? (
                    <BreadcrumbLink onClick={() => setStep(1)}>
                      Administrator
                    </BreadcrumbLink>
                  ) : isolationStrategy === STRATEGIES.SHARED && step !== 0 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium break-words text-muted-foreground">
                          Administrator
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-80 bg-background-4 text-content-muted">
                        Shared environments do not require an administrator to
                        be configured.
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-sm font-medium break-words text-muted-foreground">
                      Administrator
                    </span>
                  )}
                </BreadcrumbItem>

                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {step === 2 ? (
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
            onSubmit={handleStrategySubmit}
            onCancel={handleCancelCreate}
          />
        )}

        {step === 1 && (
          <AdminForm
            adminEmail={admin}
            onAdminChange={handleAdminChange}
            onSubmit={handleAdminSubmit}
            onCancel={handleCancelCreate}
          />
        )}

        {step === 2 && (
          <AttributesForm
            name={name}
            code={code}
            onNameChange={handleNameChange}
            onCodeChange={handleCodeChange}
            onSubmit={handleAttributesSubmit}
            onCancel={handleCancelCreate}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
